interface EnvironmentConfig {
  similarityThreshold: number;
  timeoutMs: number;
  maxRetries: number;
  maxConcurrentRequests: number;
  chunkSizeLimits: {
    min: number;
    max: number;
  };
}

const configs: Record<string, EnvironmentConfig> = {
  test: {
    similarityThreshold: 0.5,
    timeoutMs: 1000,
    maxRetries: 1,
    maxConcurrentRequests: 5,
    chunkSizeLimits: {
      min: 50,
      max: 1000,
    },
  },
  development: {
    similarityThreshold: 0.7,
    timeoutMs: 2000,
    maxRetries: 2,
    maxConcurrentRequests: 10,
    chunkSizeLimits: {
      min: 100,
      max: 2000,
    },
  },
  production: {
    similarityThreshold: 0.8,
    timeoutMs: 5000,
    maxRetries: 3,
    maxConcurrentRequests: 20,
    chunkSizeLimits: {
      min: 200,
      max: 3000,
    },
  },
};

export const config = configs[process.env.NODE_ENV || 'test'];

export function calculateStringSimilarity(str1: string, str2: string): number {
  // Simple Jaccard similarity for demonstration
  // In production, you might want to use a more sophisticated algorithm
  const set1 = new Set(str1.toLowerCase().split(/\s+/));
  const set2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

export const testQueries = {
  simple: [
    'What is your refund policy?',
    'How do I reset my password?',
    'What are the API rate limits?',
  ],
  edge: [
    '',                              // Empty query
    '?'.repeat(1000),               // Very long nonsense
    'こんにちは',                    // Non-English
    '<script>alert(1)</script>',    // Injection attempt
    'the the the the the',          // Repetitive/nonsense
    '   ',                          // Just whitespace
    '!@#$%^&*()',                   // Special characters
  ],
  conversation: [
    'What is your refund policy?',
    'What if the item is damaged?',
    'How long do I have to return it?',
    'Where do I send the return?',
  ],
};
