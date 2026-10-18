import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accountsTable, categoriesTable, transactionsTable } from "@/db/schema";
import { convertAmountFromMiliunits, fillMissingDays, parseDateParam } from "@/lib/utils";

async function fetchFinancialData(
    userId: string,
    accountId: string | undefined,
    startDate: Date,
    endDate: Date,
) {
    const [result] = await db
        .select({
            income: sql<number>`COALESCE(SUM(CASE WHEN ${transactionsTable.amount} >= 0 THEN ${transactionsTable.amount} ELSE 0 END), 0)`.mapWith(Number),
            expenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactionsTable.amount} < 0 THEN ${transactionsTable.amount} ELSE 0 END), 0)`.mapWith(Number),
            remaining: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)`.mapWith(Number),
        })
        .from(transactionsTable)
        .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
        .where(
            and(
                eq(accountsTable.userId, userId),
                accountId ? eq(transactionsTable.accountId, accountId) : undefined,
                gte(transactionsTable.date, startDate),
                lte(transactionsTable.date, endDate),
            )
        );

    return result;
}

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        zValidator("query", z.object({
            from: z.string().optional(),
            to: z.string().optional(),
            accountId: z.string().optional(),
        })),
        async (c) => {
            const auth = getAuth(c);
            const { from, to, accountId } = c.req.valid("query");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            // Ranges are inclusive of both endpoints. The end date must be
            // pushed to the last moment of that day, otherwise it lands on
            // midnight and silently excludes everything recorded later in the
            // day the user actually selected.
            const startDate = startOfDay(from ? parseDateParam(from) : subDays(new Date(), 30));
            const endDate = endOfDay(to ? parseDateParam(to) : new Date());

            const currentPeriod = await fetchFinancialData(auth.userId, accountId, startDate, endDate);

            const category = await db
                .select({
                    id: categoriesTable.id,
                    name: categoriesTable.name,
                    value: sql<number>`SUM(ABS(${transactionsTable.amount}))`.mapWith(Number),
                })
                .from(transactionsTable)
                .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
                .innerJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
                .where(
                    and(
                        eq(accountsTable.userId, auth.userId),
                        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
                        sql`${transactionsTable.amount} < 0`,
                        gte(transactionsTable.date, startDate),
                        lte(transactionsTable.date, endDate),
                    )
                )
                .groupBy(categoriesTable.id, categoriesTable.name)
                .orderBy(desc(sql`SUM(ABS(${transactionsTable.amount}))`));

            // Each slice carries the category ids behind it so the UI can drill
            // through to the matching transactions. "Other" rolls up several
            // categories, hence a list rather than a single id.
            const finalCategories: { name: string; value: number; categoryIds: string[] }[] =
                category.slice(0, 3).map((item) => ({
                    name: item.name,
                    value: item.value,
                    categoryIds: [item.id],
                }));

            const otherCategories = category.slice(3);

            if (otherCategories.length > 0) {
                finalCategories.push({
                    name: "Other",
                    value: otherCategories.reduce((total, current) => total + current.value, 0),
                    categoryIds: otherCategories.map((item) => item.id),
                });
            }

            // Group by calendar day, not by raw timestamp: transactions on the
            // same day can carry different times (synced ones sit at midnight,
            // manually added ones carry their creation time) and would
            // otherwise produce several rows per day.
            const dayColumn = sql`DATE_TRUNC('day', ${transactionsTable.date})`;

            const activeDays = await db
                .select({
                    date: dayColumn.mapWith(transactionsTable.date),
                    income: sql<number>`COALESCE(SUM(CASE WHEN ${transactionsTable.amount} >= 0 THEN ${transactionsTable.amount} ELSE 0 END), 0)`.mapWith(Number),
                    expenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactionsTable.amount} < 0 THEN ABS(${transactionsTable.amount}) ELSE 0 END), 0)`.mapWith(Number),
                })
                .from(transactionsTable)
                .innerJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
                .where(
                    and(
                        eq(accountsTable.userId, auth.userId),
                        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
                        gte(transactionsTable.date, startDate),
                        lte(transactionsTable.date, endDate),
                    )
                )
                .groupBy(dayColumn)
                .orderBy(dayColumn);

            const days = fillMissingDays(activeDays, startDate, endDate).map((day) => ({
                ...day,
                income: convertAmountFromMiliunits(day.income),
                expenses: convertAmountFromMiliunits(day.expenses),
            }));

            const categories = finalCategories.map((category) => ({
                ...category,
                value: convertAmountFromMiliunits(category.value),
            }));

            return c.json({
                data: {
                    remainingAmount: convertAmountFromMiliunits(currentPeriod.remaining),
                    incomeAmount: convertAmountFromMiliunits(currentPeriod.income),
                    expensesAmount: convertAmountFromMiliunits(currentPeriod.expenses),
                    categories,
                    days,
                },
            });
        }
    );

export default app;
