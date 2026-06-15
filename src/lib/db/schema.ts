import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";

// ─── Raffles ────────────────────────────────────────────────────────────────
export const raffles = pgTable(
  "raffle",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    numberCount: integer("number_count").notNull(),
    pricePerNumber: numeric("price_per_number", { precision: 12, scale: 2 }).notNull(),
    prize1: text("prize_1").notNull(),
    prize2: text("prize_2"),
    prize3: text("prize_3"),
    prize1Image: text("prize_1_image"),
    prize2Image: text("prize_2_image"),
    prize3Image: text("prize_3_image"),
    drawDate: timestamp("draw_date").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("raffle_status_idx").on(table.status)],
);

// ─── Tickets ────────────────────────────────────────────────────────────────
export const tickets = pgTable(
  "ticket",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    raffleId: uuid("raffle_id")
      .notNull()
      .references(() => raffles.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("available"),
    buyerName: varchar("buyer_name", { length: 255 }),
    buyerPhone: varchar("buyer_phone", { length: 50 }),
    paymentProofUrl: text("payment_proof_url"),
    paymentMethod: varchar("payment_method", { length: 20 }),
    purchasedAt: timestamp("purchased_at"),
    reservedAt: timestamp("reserved_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ticket_raffle_idx").on(table.raffleId),
    index("ticket_status_idx").on(table.status),
    unique("ticket_raffle_number_unique").on(table.raffleId, table.number),
  ],
);

// ─── Settings ───────────────────────────────────────────────────────────────
export const settings = pgTable("setting", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Types ──────────────────────────────────────────────────────────────────
export type Raffle = typeof raffles.$inferSelect;
export type NewRaffle = typeof raffles.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type Setting = typeof settings.$inferSelect;

export type TicketStatus = "available" | "reserved" | "paid";
export type RaffleStatus = "active" | "finished" | "cancelled";
export type PaymentMethod = "mp" | "transfer" | "cash";
