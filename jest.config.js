module.exports = {
  testEnvironment: "node",
  // Add Supabase environment setup
  setupFiles: ["<rootDir>/tests/setup.js"],
  // Optional: if we need to transform any files
  transform: {},
  // Optional: patterns to ignore
  testPathIgnorePatterns: ["/node_modules/"]
};
