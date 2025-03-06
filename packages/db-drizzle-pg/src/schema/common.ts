import { Table } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

/**
 * Adds createdAt and updatedAt columns to a table
 * @param table - The table to add the columns to
 * @returns The table with the added columns
 */
export const timestamps = (table: Table) => ({
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})