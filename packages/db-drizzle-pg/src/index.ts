import dotenv from 'dotenv';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as UserSchema from './schema/users';
import * as SessionSchema from './schema/sessions';

// Root .env
dotenv.config({ path: '../../.env' });

const schema = {
  ...UserSchema,
  ...SessionSchema,
};

// Configuration type
export interface DbConfig {
  connectionString: string;
  ssl?: boolean;
  maxConnections?: number;
}

// Default configuration from environment variables
export function getDefaultDbConfig(): DbConfig {
  return {
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.DATABASE_SSL === 'true',
    maxConnections: process.env.DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS)
      : 10
  };
}

// Singleton function to ensure only one db instance is created
function singleton<Value>(name: string, value: () => Value): Value {
  const globalAny: any = global;
  globalAny.__singletons = globalAny.__singletons || {};

  if (!globalAny.__singletons[name]) {
    globalAny.__singletons[name] = value();
  }

  return globalAny.__singletons[name];
}

// Factory function to create and configure the database client
export function createDbClient(config: DbConfig = getDefaultDbConfig()) {
  const pool = new Pool({
    connectionString: config.connectionString,
    ssl: config.ssl,
    max: config.maxConnections
  });

  return drizzle(pool, {
    logger: true,
    schema: schema
  }
  );
}

// Get a singleton instance of the database client
export const db = singleton('drizzle-pg-db', () => createDbClient());
