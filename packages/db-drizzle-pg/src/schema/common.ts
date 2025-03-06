import { timestamp } from "drizzle-orm/pg-core";

/**
 * Adds createdAt and updatedAt columns to a table
 * @param table - The table to add the columns to
 * @returns The table with the added columns
 */
export const timestamps = {
  updated_at: timestamp().defaultNow().notNull(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp()
}