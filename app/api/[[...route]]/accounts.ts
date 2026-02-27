import { zValidator } from '@hono/zod-validator';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { accountsTable, insertAccountSchema } from "@/db/schema";
import { eq, and, inArray } from 'drizzle-orm';
import { createId }  from "@paralleldrive/cuid2";
import { z } from 'zod';

const app = new Hono()
    .get(
        "/", 
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            
            const data = await db
                .select({
                    id: accountsTable.id,
                    name: accountsTable.name,
                })
                .from(accountsTable)
                .where(eq(accountsTable.userId, auth.userId));

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
                    id: accountsTable.id,
                    name: accountsTable.name,
                })
                .from(accountsTable)
                .where(
                    and(
                        eq(accountsTable.userId, auth.userId),
                        eq(accountsTable.id, id)
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
        zValidator("json", insertAccountSchema.pick({
            name: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [data] = await db.insert(accountsTable).values({
                id: createId(),
                userId: auth.userId,
                ...values,
            }).returning();

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

            const data = await db
                .delete(accountsTable)
                .where(
                    and(
                        eq(accountsTable.userId, auth.userId),
                        inArray(accountsTable.id, values.ids)
                    )
                )
                .returning({
                    id: accountsTable.id,
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
            insertAccountSchema.pick({
                name: true,
            })
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

            const [data] = await db
                .update(accountsTable)
                .set(values)
                .where(
                    and(
                        eq(accountsTable.userId, auth.userId),
                        eq(accountsTable.id, id)
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

            const [data] = await db
                .delete(accountsTable)
                .where(
                    and(
                        eq(accountsTable.userId, auth.userId),
                        eq(accountsTable.id, id)
                    )
                )
                .returning({
                    id: accountsTable.id,
                });

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    );

export default app;