import { pgTable, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { timestamps } from "./common";
import { relations } from "drizzle-orm";

/**
 * Sessions table
 */
export const sessionsTable = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  refreshToken: text("refresh_token").notNull(),
  userAgent: varchar("user_agent", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(), // Supports IPv6
  expiresAt: timestamp("expires_at").notNull(),
  isValid: boolean("is_valid").notNull().default(true),
  lastUsedAt: timestamp("last_used_at").notNull().defaultNow(),
  ...timestamps
});

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));
