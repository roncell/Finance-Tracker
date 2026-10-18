import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { config } from "dotenv";
import { createId } from "@paralleldrive/cuid2";

config({ path: ".env.local" });

import { accountsTable, categoriesTable, transactionsTable, connectedBanksTable } from "../db/schema";
import { decrypt } from "../lib/encryption";
import { syncTransactions, PlaidTransaction } from "../lib/plaid";
import { convertAmountToMiliunits } from "../lib/utils";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, {
    schema: { accountsTable, categoriesTable, transactionsTable, connectedBanksTable },
});

function titleCaseCategory(rawName: string) {
    return rawName
        .toLowerCase()
        .split("_")
        .map((word) => word[0]?.toUpperCase() + word.slice(1))
        .join(" ");
}

function categoryNameFromPlaid(pfc: PlaidTransaction["personal_finance_category"]) {
    if (!pfc) return null;

    const specific = pfc.detailed.startsWith(`${pfc.primary}_`)
        ? pfc.detailed.slice(pfc.primary.length + 1)
        : pfc.detailed;

    return titleCaseCategory(specific || pfc.primary);
}

async function main() {
    const banks = await db.select().from(connectedBanksTable);

    if (banks.length === 0) {
        console.log("No connected banks found.");
        return;
    }

    for (const bank of banks) {
        console.log(`Re-syncing categories for bank ${bank.id}...`);

        const accessToken = await decrypt(bank.accessToken);

        const { added, modified, nextCursor } = await syncTransactions(accessToken, null);
        const allTransactions = [...added, ...modified];

        console.log(`Fetched ${allTransactions.length} transactions from Plaid history.`);

        const userAccounts = await db
            .select({ id: accountsTable.id, plaidId: accountsTable.plaidId })
            .from(accountsTable)
            .where(eq(accountsTable.userId, bank.userId));

        const accountIdByPlaidId = new Map(
            userAccounts.filter((a) => a.plaidId).map((a) => [a.plaidId as string, a.id]),
        );

        const userCategories = await db
            .select({ id: categoriesTable.id, name: categoriesTable.name })
            .from(categoriesTable)
            .where(eq(categoriesTable.userId, bank.userId));

        const categoryIdByName = new Map(
            userCategories.map((c) => [c.name.toLowerCase(), c.id]),
        );

        async function resolveCategoryId(transaction: PlaidTransaction) {
            const name = categoryNameFromPlaid(transaction.personal_finance_category);
            if (!name) return null;

            const existing = categoryIdByName.get(name.toLowerCase());
            if (existing) return existing;

            const [created] = await db.insert(categoriesTable).values({
                id: createId(),
                userId: bank.userId,
                name,
            }).returning();

            categoryIdByName.set(name.toLowerCase(), created.id);
            return created.id;
        }

        let updated = 0;
        let skipped = 0;

        for (const transaction of allTransactions) {
            const accountId = accountIdByPlaidId.get(transaction.account_id);
            if (!accountId) {
                skipped++;
                continue;
            }

            const categoryId = await resolveCategoryId(transaction);

            const [existing] = await db
                .select({ id: transactionsTable.id })
                .from(transactionsTable)
                .where(eq(transactionsTable.plaidId, transaction.transaction_id));

            if (existing) {
                await db
                    .update(transactionsTable)
                    .set({ categoryId })
                    .where(eq(transactionsTable.id, existing.id));
                updated++;
            } else {
                await db.insert(transactionsTable).values({
                    id: createId(),
                    accountId,
                    categoryId,
                    payee: transaction.merchant_name || transaction.name,
                    notes: null,
                    date: new Date(transaction.date),
                    amount: convertAmountToMiliunits(-transaction.amount),
                    plaidId: transaction.transaction_id,
                });
                updated++;
            }
        }

        await db
            .update(connectedBanksTable)
            .set({ cursor: nextCursor })
            .where(eq(connectedBanksTable.id, bank.id));

        console.log(`Bank ${bank.id}: updated ${updated}, skipped ${skipped} (no matching local account).`);
    }

    console.log("Done. You may want to delete now-unused categories on the Categories page.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
