import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  pgEnum,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";

export const dealStatusEnum = pgEnum("deal_status", [
  "sourcing",
  "evaluating",
  "listed",
  "matched",
  "in_progress",
  "completed",
  "cancelled",
]);

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  sourceUrl: text("source_url"),
  askingPrice: numeric("asking_price", { precision: 12, scale: 2 }),
  estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
  status: dealStatusEnum("status").notNull().default("sourcing"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const buyerProfiles = pgTable("buyer_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  name: text("name").notNull(),
  categories: jsonb("categories").$type<string[]>().notNull().default([]),
  maxBudget: numeric("max_budget", { precision: 12, scale: 2 }),
  minMarginPct: numeric("min_margin_pct", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id")
    .notNull()
    .references(() => deals.id, { onDelete: "cascade" }),
  buyerProfileId: uuid("buyer_profile_id").references(() => buyerProfiles.id, {
    onDelete: "set null",
  }),
  buyerInfo: text("buyer_info"),
  margin: numeric("margin", { precision: 5, scale: 2 }),
  matchScore: integer("match_score"),
  notes: text("notes"),
  source: text("source").notNull().default("manual"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
export type BuyerProfile = typeof buyerProfiles.$inferSelect;
export type NewBuyerProfile = typeof buyerProfiles.$inferInsert;
export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;
