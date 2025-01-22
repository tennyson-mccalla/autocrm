import { config } from 'dotenv';

// Load environment variables from .env.test if it exists, otherwise from .env
config({ path: '.env.test' });
config();

// Set default timeout for async tests
jest.setTimeout(10000);

// Mock console.error to keep test output clean
console.error = jest.fn();

// Clean up after tests
afterAll(async () => {
  // Add any global cleanup here
});
