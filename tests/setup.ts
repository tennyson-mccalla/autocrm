import { config } from 'dotenv';
import { jest } from '@jest/globals';
import { createMockSupabaseClient, resetMockData } from './mocks/supabase';
import '@testing-library/jest-dom'

// Load environment variables from .env.test if it exists, otherwise from .env
config({ path: '.env.test' });
config();

// Set default timeout for async tests
jest.setTimeout(10000);

// Mock console.error to keep test output clean
console.error = jest.fn();

// Create a default mock client for tests
const mockSupabaseClient = createMockSupabaseClient();

// Mock the createClient function
jest.mock('../frontend/src/lib/supabase', () => ({
  createClient: () => mockSupabaseClient
}));

beforeEach(() => {
  resetMockData();
});

export { mockSupabaseClient };

// Clean up after tests
afterAll(async () => {
  // Add any global cleanup here
});
