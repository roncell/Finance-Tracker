import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod";

export const accountsTable = pgTable("accounts", {
    id: text("id").primaryKey(),
    plaidId: text("plaid_id"),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
});

export const insertAccountSchema = createInsertSchema(accountsTable);

export const categoriesTable = pgTable("categories", {
    id: text("id").primaryKey(),
    plaidId: text("plaid_id"),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable);

export const transactionsTable = pgTable("transactions", {
    id: text("id").primaryKey(),
    amount: integer("amount").notNull(),
    payee: text("payee").notNull(),
    notes: text("notes"),
    date: timestamp("date", { mode: "date" }).notNull(),
    accountId: text("account_id")
        .references(() => accountsTable.id, { onDelete: "cascade" })
        .notNull(),
    categoryId: text("category_id")
        .references(() => categoriesTable.id, { onDelete: "set null" }),
    plaidId: text("plaid_id").unique(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable, {
    date: z.coerce.date(),
});

export const connectedBanksTable = pgTable("connected_banks", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token").notNull(),
    plaidItemId: text("plaid_item_id").notNull().unique(),
    cursor: text("cursor"),
    institutionName: text("institution_name"),
});