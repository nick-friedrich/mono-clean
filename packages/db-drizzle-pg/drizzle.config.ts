import dotenv from 'dotenv';
import { defineConfig } from "drizzle-kit";

// Drizzle config
dotenv.config({ path: '../../.env' });

export default defineConfig({
  dialect: 'postgresql', // 'mysql' | 'sqlite' | 'turso'
  out: './drizzle',
  schema: './src/schema',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
})