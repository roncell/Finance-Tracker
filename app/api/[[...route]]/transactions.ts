import { zValidator } from '@hono/zod-validator';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
    transactionsTable,
    insertTransactionSchema,
    accountsTable,
    categoriesTable,
} from "@/db/schema";
import { eq, and, inArray, gte, lte, desc, sql } from 'drizzle-orm';
import { createId } from "@paralleldrive/cuid2";
import { z } from 'zod';
import { subDays, startOfDay, endOfDay } from "date-fns";
import { parseDateParam } from "@/lib/utils";

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        zValidator("query", z.object({
            from: z.string().optional(),
            to: z.string().optional(),
            accountId: z.string().optional(),
            categoryId: z.string().optional(),
        })),
        async (c) => {
            const auth = getAuth(c);
            const { from, to, accountId, categoryId } = c.req.valid("query");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            // Inclusive of both endpoints — see the matching note in summary.ts:
            // a bare end date lands on midnight and drops that day's later rows.
            const startDate = startOfDay(from ? parseDateParam(from) : subDays(new Date(), 30));
            const endDate = endOfDay(to ? parseDateParam(to) : new Date());

            // Comma separated so drilling into the chart's "Other" slice — which
            // rolls several categories together — stays a single filter value.
            const categoryIds = categoryId
                ? categoryId.split(",").filter(Boolean)
                : [];

            const data = await db
                .select({
                    id: transactionsTable.id,
                    date: transactionsTable.date,
                    category: categoriesTable.name,
                    categoryId: transactionsTable.categoryId,
                    payee: transactionsTable.payee,
                    amount: transactionsTable.amount,
                    notes: transactionsTable.notes,
                    account: accountsTable.name,
                    accountId: transactionsTable.accountId,
                })
                .from(transactionsTable)
                .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
                .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
                .where(
                    and(
                        eq(accountsTable.userId, auth.userId),
                        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
                        categoryIds.length
                            ? inArray(transactionsTable.categoryId, categoryIds)
                            : undefined,
                        gte(transactionsTable.date, startDate),
                        lte(transactionsTable.date, endDate),
                    )
                )
                .orderBy(desc(transactionsTable.date));

            return c.json({ data });
        }
    )
    .get(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({
            id: z.string().optional(),
        })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [data] = await db
                .select({
                    id: transactionsTable.id,
                    date: transactionsTable.date,
                    categoryId: transactionsTable.categoryId,
                    payee: transactionsTable.payee,
                    amount: transactionsTable.amount,
                    notes: transactionsTable.notes,
                    accountId: transactionsTable.accountId,
                })
                .from(transactionsTable)
                .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
                .where(
                    and(
                        eq(transactionsTable.id, id),
                        eq(accountsTable.userId, auth.userId),
                    )
                );

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    )
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", insertTransactionSchema.omit({ id: true })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [account] = await db
                .select({ id: accountsTable.id })
                .from(accountsTable)
                .where(
                    and(
                        eq(accountsTable.id, values.accountId),
                        eq(accountsTable.userId, auth.userId),
                    )
                );

            if (!account) {
                return c.json({ error: "Account not found" }, 404);
            }

            const [data] = await db.insert(transactionsTable).values({
                id: createId(),
                ...values,
            }).returning();

            return c.json({ data });
        }
    )
    .post(
        "/bulk-create",
        clerkMiddleware(),
        zValidator("json", z.array(insertTransactionSchema.omit({ id: true }))),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const accountIds = Array.from(new Set(values.map((value) => value.accountId)));

            const ownedAccounts = await db
                .select({ id: accountsTable.id })
                .from(accountsTable)
                .where(
                    and(
                        inArray(accountsTable.id, accountIds),
                        eq(accountsTable.userId, auth.userId),
                    )
                );

            if (ownedAccounts.length !== accountIds.length) {
                return c.json({ error: "Account not found" }, 404);
            }

            const data = await db.insert(transactionsTable).values(
                values.map((value) => ({
                    id: createId(),
                    ...value,
                }))
            ).returning();

            return c.json({ data });
        }
    )
    .post(
        "/bulk-delete",
        clerkMiddleware(),
        zValidator(
            "json",
            z.object({
                ids: z.array(z.string()),
            }),
        ),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const transactionsToDelete = db.$with("transactions_to_delete").as(
                db.select({ id: transactionsTable.id })
                    .from(transactionsTable)
                    .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
                    .where(
                        and(
                            inArray(transactionsTable.id, values.ids),
                            eq(accountsTable.userId, auth.userId),
                        )
                    )
            );

            const data = await db
                .with(transactionsToDelete)
                .delete(transactionsTable)
                .where(
                    inArray(
                        transactionsTable.id,
                        sql`(select id from ${transactionsToDelete})`
                    )
                )
                .returning({
                    id: transactionsTable.id,
                });

            return c.json({ data });
        }
    )
    .patch(
        "/:id",
        clerkMiddleware(),
        zValidator(
            "param",
            z.object({
                id: z.string().optional(),
            }),
        ),
        zValidator(
            "json",
            insertTransactionSchema.omit({ id: true })
        ),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [account] = await db
                .select({ id: accountsTable.id })
                .from(accountsTable)
                .where(
                    and(
                        eq(accountsTable.id, values.accountId),
                        eq(accountsTable.userId, auth.userId),
                    )
                );

            if (!account) {
                return c.json({ error: "Account not found" }, 404);
            }

            const transactionsToUpdate = db.$with("transactions_to_update").as(
                db.select({ id: transactionsTable.id })
                    .from(transactionsTable)
                    .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
                    .where(
                        and(
                            eq(transactionsTable.id, id),
                            eq(accountsTable.userId, auth.userId),
                        )
                    )
            );

            const [data] = await db
                .with(transactionsToUpdate)
                .update(transactionsTable)
                .set(values)
                .where(
                    inArray(
                        transactionsTable.id,
                        sql`(select id from ${transactionsToUpdate})`
                    )
                )
                .returning();

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    )
    .delete(
        "/:id",
        clerkMiddleware(),
        zValidator(
            "param",
            z.object({
                id: z.string().optional(),
            }),
        ),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const transactionsToDelete = db.$with("transactions_to_delete").as(
                db.select({ id: transactionsTable.id })
                    .from(transactionsTable)
                    .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
                    .where(
                        and(
                            eq(transactionsTable.id, id),
                            eq(accountsTable.userId, auth.userId),
                        )
                    )
            );

            const [data] = await db
                .with(transactionsToDelete)
                .delete(transactionsTable)
                .where(
                    inArray(
                        transactionsTable.id,
                        sql`(select id from ${transactionsToDelete})`
                    )
                )
                .returning({
                    id: transactionsTable.id,
                });

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    );

export default app;
