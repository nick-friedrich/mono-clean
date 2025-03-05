import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { DbConfig, getDefaultDbConfig, createDbClient } from '../src';

// Mock the pg Pool
vi.mock('pg', () => {
  const mockPool = vi.fn(() => ({
    connect: vi.fn(),
    query: vi.fn(),
    end: vi.fn(),
  }));
  return { Pool: mockPool };
});

// Mock drizzle
vi.mock('drizzle-orm/node-postgres', () => {
  return {
    drizzle: vi.fn(() => ({ __mocked_drizzle_instance: true })),
  };
});

describe('Database Client', () => {
  // Save original environment
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment variables for each test
    vi.resetModules();

    // Setup mock environment variables
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
    process.env.DATABASE_SSL = 'false';
    process.env.DATABASE_MAX_CONNECTIONS = '5';
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };

    // Clear mocks
    vi.clearAllMocks();
  });

  describe('getDefaultDbConfig', () => {
    it('should return config from environment variables', () => {
      const config = getDefaultDbConfig();

      expect(config).toEqual({
        connectionString: 'postgresql://test:test@localhost:5432/testdb',
        ssl: false,
        maxConnections: 5
      });
    });

    it('should handle missing DATABASE_MAX_CONNECTIONS', () => {
      delete process.env.DATABASE_MAX_CONNECTIONS;

      const config = getDefaultDbConfig();

      expect(config.maxConnections).toBe(10); // Default value
    });

    it('should handle SSL flag correctly', () => {
      process.env.DATABASE_SSL = 'true';

      const config = getDefaultDbConfig();

      expect(config.ssl).toBe(true);
    });
  });

  describe('createDbClient', () => {
    it('should create a database client with default config', () => {
      const client = createDbClient();

      expect(client).toEqual({ __mocked_drizzle_instance: true });
    });

    it('should create a database client with custom config', () => {
      const customConfig: DbConfig = {
        connectionString: 'postgresql://custom:custom@localhost:5432/customdb',
        ssl: true,
        maxConnections: 20
      };

      const client = createDbClient(customConfig);

      expect(client).toEqual({ __mocked_drizzle_instance: true });

      // We could add more specific tests if we had better access to the mocked internals
      // but this at least verifies that the function runs without errors
    });
  });
}); 