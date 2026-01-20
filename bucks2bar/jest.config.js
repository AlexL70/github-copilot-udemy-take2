module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/*.test.js'],
    collectCoverageFrom: [
        'script.js',
        '!node_modules/**'
    ]
};
