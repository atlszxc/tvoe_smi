import type { Config } from 'jest'

const config: Config = {
    clearMocks: true,
    collectCoverage: true,
    testEnvironment: 'node',
    collectCoverageFrom: ['./**/*.ts'],
    coverageDirectory: '<rootDir>/tests/coverage',
    testMatch: ['**/*.test.ts'],
    preset: 'ts-jest',
    forceExit: true
}

export default config