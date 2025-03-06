import { pgEnum, text } from "drizzle-orm/pg-core";
import { uuid, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./common";
import { sessionsTable } from "./sessions";
import { relations } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["admin", "user", "guest", "banned", "moderator"]);

/**
 * Users table
 */
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text(),
  userRole: userRole("user_role").default("user"),
  ...timestamps
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
}));
