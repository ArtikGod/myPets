module.exports = {
    testEnvironment: "node",
    collectCoverageFrom: [
        "**/*.js",
        "!node_modules/**",
        "!coverage/**",
        "!app.js",
        "!jest.config.js",
        "!tests/**",
    ],
    testMatch: ["**/tests/**/*.test.js"],
    setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
    verbose: true,
    collectCoverage: false,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
};
