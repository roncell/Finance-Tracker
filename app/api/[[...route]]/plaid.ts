import { zValidator } from '@hono/zod-validator';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { Hono } from "hono";
import { z } from 'zod';
import { eq, and, inArray } from 'drizzle-orm';
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/db/drizzle";
import { accountsTable, categoriesTable, transactionsTable, connectedBanksTable } from "@/db/schema";
import {
    createLinkToken,
    exchangePublicToken,
    getPlaidAccounts,
    getInstitutionName,
    syncTransactions,
    PlaidTransaction,
} from "@/lib/plaid";
import { encrypt, decrypt } from "@/lib/encryption";
import { convertAmountToMiliunits } from "@/lib/utils";

function titleCaseCategory(rawName: string) {
    return rawName
        .toLowerCase()
        .split("_")
        .map((word) => word[0]?.toUpperCase() + word.slice(1))
        .join(" ");
}

function categoryNameFromPlaid(pfc: PlaidTransaction["personal_finance_category"]) {
    if (!pfc) return null;

    // Plaid's "detailed" taxonomy is always "<primary>_<specific>" (e.g.
    // RENT_AND_UTILITIES_RENT, FOOD_AND_DRINK_GROCERIES). The primary alone
    // is too coarse ("Loan Payments", "Transfer Out") to be useful, so strip
    // the primary prefix off detailed to get the specific label ("Rent",
    // "Groceries") and fall back to primary if detailed doesn't follow that
    // pattern.
    const specific = pfc.detailed.startsWith(`${pfc.primary}_`)
        ? pfc.detailed.slice(pfc.primary.length + 1)
        : pfc.detailed;

    return titleCaseCategory(specific || pfc.primary);
}

const app = new Hono()
    .post(
        "/connect",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const linkToken = await createLinkToken(auth.userId);

            return c.json({ data: { linkToken } });
        }
    )
    .post(
        "/exchange",
        clerkMiddleware(),
        zValidator("json", z.object({ publicToken: z.string() })),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const { publicToken } = c.req.valid("json");

            const { accessToken, itemId } = await exchangePublicToken(publicToken);
            const plaidAccounts = await getPlaidAccounts(accessToken);
            const institutionName = await getInstitutionName(accessToken);
            const encryptedAccessToken = await encrypt(accessToken);

            await db.insert(connectedBanksTable).values({
                id: createId(),
                userId: auth.userId,
                accessToken: encryptedAccessToken,
                plaidItemId: itemId,
                institutionName,
            });

            const existingAccounts = await db
                .select({ plaidId: accountsTable.plaidId })
                .from(accountsTable)
                .where(eq(accountsTable.userId, auth.userId));

            const existingPlaidIds = new Set(
                existingAccounts.map((account) => account.plaidId).filter(Boolean),
            );

            const newPlaidAccounts = plaidAccounts.filter(
                (account) => !existingPlaidIds.has(account.account_id),
            );

            const createdAccounts = newPlaidAccounts.length > 0
                ? await db.insert(accountsTable).values(
                    newPlaidAccounts.map((account) => ({
                        id: createId(),
                        userId: auth.userId,
                        plaidId: account.account_id,
                        name: account.official_name || account.name,
                    }))
                ).returning()
                : [];

            return c.json({ data: createdAccounts });
        }
    )
    .get(
        "/banks",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const data = await db
                .select({
                    id: connectedBanksTable.id,
                    plaidItemId: connectedBanksTable.plaidItemId,
                    institutionName: connectedBanksTable.institutionName,
                })
                .from(connectedBanksTable)
                .where(eq(connectedBanksTable.userId, auth.userId));

            return c.json({ data });
        }
    )
    .post(
        "/sync/:bankId",
        clerkMiddleware(),
        zValidator("param", z.object({ bankId: z.string() })),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const userId = auth.userId;

            const { bankId } = c.req.valid("param");

            const [bank] = await db
                .select()
                .from(connectedBanksTable)
                .where(
                    and(
                        eq(connectedBanksTable.id, bankId),
                        eq(connectedBanksTable.userId, userId),
                    )
                );

            if (!bank) {
                return c.json({ error: "Bank not found" }, 404);
            }

            const accessToken = await decrypt(bank.accessToken);
            const { added, modified, removed, nextCursor } = await syncTransactions(
                accessToken,
                bank.cursor,
            );

            const userAccounts = await db
                .select({ id: accountsTable.id, plaidId: accountsTable.plaidId })
                .from(accountsTable)
                .where(eq(accountsTable.userId, userId));

            const accountIdByPlaidId = new Map(
                userAccounts
                    .filter((account) => account.plaidId)
                    .map((account) => [account.plaidId as string, account.id]),
            );

            const userCategories = await db
                .select({ id: categoriesTable.id, name: categoriesTable.name })
                .from(categoriesTable)
                .where(eq(categoriesTable.userId, userId));

            const categoryIdByName = new Map(
                userCategories.map((category) => [category.name.toLowerCase(), category.id]),
            );

            async function resolveCategoryId(transaction: PlaidTransaction) {
                const name = categoryNameFromPlaid(transaction.personal_finance_category);

                if (!name) return null;

                const existing = categoryIdByName.get(name.toLowerCase());

                if (existing) return existing;

                const [created] = await db.insert(categoriesTable).values({
                    id: createId(),
                    userId,
                    name,
                }).returning();

                categoryIdByName.set(name.toLowerCase(), created.id);
                return created.id;
            }

            let createdCount = 0;
            let updatedCount = 0;

            for (const transaction of [...added, ...modified]) {
                const accountId = accountIdByPlaidId.get(transaction.account_id);
                if (!accountId) continue;

                const categoryId = await resolveCategoryId(transaction);

                const values = {
                    accountId,
                    categoryId,
                    payee: transaction.merchant_name || transaction.name,
                    notes: null,
                    date: new Date(transaction.date),
                    amount: convertAmountToMiliunits(-transaction.amount),
                    plaidId: transaction.transaction_id,
                };

                const [existing] = await db
                    .select({ id: transactionsTable.id })
                    .from(transactionsTable)
                    .where(eq(transactionsTable.plaidId, transaction.transaction_id));

                if (existing) {
                    await db
                        .update(transactionsTable)
                        .set(values)
                        .where(eq(transactionsTable.id, existing.id));
                    updatedCount++;
                } else {
                    await db.insert(transactionsTable).values({ id: createId(), ...values });
                    createdCount++;
                }
            }

            if (removed.length > 0) {
                await db.delete(transactionsTable).where(
                    inArray(transactionsTable.plaidId, removed.map((r) => r.transaction_id)),
                );
            }

            await db
                .update(connectedBanksTable)
                .set({ cursor: nextCursor })
                .where(eq(connectedBanksTable.id, bank.id));

            return c.json({
                data: {
                    created: createdCount,
                    updated: updatedCount,
                    removed: removed.length,
                },
            });
        }
    )
    .delete(
        "/:bankId",
        clerkMiddleware(),
        zValidator("param", z.object({ bankId: z.string() })),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const { bankId } = c.req.valid("param");

            const [data] = await db
                .delete(connectedBanksTable)
                .where(
                    and(
                        eq(connectedBanksTable.id, bankId),
                        eq(connectedBanksTable.userId, auth.userId),
                    )
                )
                .returning({ id: connectedBanksTable.id });

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    );

export default app;
