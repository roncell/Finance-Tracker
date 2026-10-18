const PLAID_HOSTS: Record<string, string> = {
    sandbox: "https://sandbox.plaid.com",
    development: "https://development.plaid.com",
    production: "https://production.plaid.com",
};

function getBaseUrl() {
    const env = process.env.PLAID_ENV || "sandbox";
    return PLAID_HOSTS[env] ?? PLAID_HOSTS.sandbox;
}

async function plaidFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Plaid-Version": "2020-09-14",
        },
        body: JSON.stringify({
            client_id: process.env.PLAID_CLIENT_ID,
            secret: process.env.PLAID_SECRET,
            ...body,
        }),
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.error_message || "Plaid request failed");
    }

    return json as T;
}

export type PlaidAccount = {
    account_id: string;
    name: string;
    official_name: string | null;
    mask: string | null;
    subtype: string | null;
};

export type PlaidTransaction = {
    transaction_id: string;
    account_id: string;
    amount: number;
    date: string;
    name: string;
    merchant_name: string | null;
    pending: boolean;
    personal_finance_category: {
        primary: string;
        detailed: string;
    } | null;
};

export async function createLinkToken(userId: string) {
    const data = await plaidFetch<{ link_token: string }>("/link/token/create", {
        client_name: "Finance Tracker",
        user: { client_user_id: userId },
        products: ["transactions"],
        country_codes: ["US"],
        language: "en",
    });

    return data.link_token;
}

/**
 * Best-effort lookup of the bank's display name ("Chase") so connected banks
 * can be labelled properly. Never throws: a naming failure must not break the
 * far more important token exchange.
 */
export async function getInstitutionName(accessToken: string): Promise<string | null> {
    try {
        const item = await plaidFetch<{ item: { institution_id: string | null } }>(
            "/item/get",
            { access_token: accessToken },
        );

        const institutionId = item.item.institution_id;
        if (!institutionId) return null;

        const institution = await plaidFetch<{ institution: { name: string } }>(
            "/institutions/get_by_id",
            { institution_id: institutionId, country_codes: ["US"] },
        );

        return institution.institution.name ?? null;
    } catch {
        return null;
    }
}

export async function exchangePublicToken(publicToken: string) {
    const data = await plaidFetch<{ access_token: string; item_id: string }>(
        "/item/public_token/exchange",
        { public_token: publicToken },
    );

    return { accessToken: data.access_token, itemId: data.item_id };
}

export async function getPlaidAccounts(accessToken: string) {
    const data = await plaidFetch<{ accounts: PlaidAccount[] }>("/accounts/get", {
        access_token: accessToken,
    });

    return data.accounts;
}

export async function syncTransactions(accessToken: string, cursor: string | null) {
    let added: PlaidTransaction[] = [];
    let modified: PlaidTransaction[] = [];
    let removed: { transaction_id: string }[] = [];
    let nextCursor = cursor ?? undefined;
    let hasMore = true;

    while (hasMore) {
        const data = await plaidFetch<{
            added: PlaidTransaction[];
            modified: PlaidTransaction[];
            removed: { transaction_id: string }[];
            next_cursor: string;
            has_more: boolean;
        }>("/transactions/sync", {
            access_token: accessToken,
            cursor: nextCursor,
        });

        added = added.concat(data.added);
        modified = modified.concat(data.modified);
        removed = removed.concat(data.removed);
        nextCursor = data.next_cursor;
        hasMore = data.has_more;
    }

    return { added, modified, removed, nextCursor: nextCursor! };
}
