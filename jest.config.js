module.exports = {
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/**/*.test.[jt]s',
        '<rootDir>/tests/api/**/*.test.[jt]s',
        '<rootDir>/tests/auth.test.[jt]s'
      ],
      moduleNameMapper: {
        '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@frontend/(.*)$': '<rootDir>/frontend/src/$1'
      },
      setupFilesAfterEnv: [
        '<rootDir>/src/rag/tests/setup.ts'
      ]
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/frontend/**/*.test.[jt]sx?',
        '<rootDir>/tests/features/**/*.test.[jt]sx?'
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/frontend/src/$1'
      },
      setupFilesAfterEnv: [
        '@testing-library/jest-dom'
      ]
    }
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'frontend/app/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageReporters: ['text', 'lcov'],
  injectGlobals: true
};
