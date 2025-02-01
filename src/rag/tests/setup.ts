import { jest, beforeEach, afterAll } from '@jest/globals';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.OPENAI_API_KEY = 'test-openai-key';

// Mock console.error to keep test output clean
console.error = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.resetAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});
