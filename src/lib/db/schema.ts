import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  pgEnum,
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

export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id")
    .notNull()
    .references(() => deals.id, { onDelete: "cascade" }),
  buyerInfo: text("buyer_info"),
  margin: numeric("margin", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;
