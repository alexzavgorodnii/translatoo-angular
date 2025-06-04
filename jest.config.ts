import presets from 'jest-preset-angular/presets';
import type { Config } from 'jest';
import 'jest-environment-jsdom';

const presetConfig = presets.createCjsPreset();

const config: Config = {
  ...presetConfig,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/node_modules/', '<rootDir>/dist/'],
  moduleDirectories: ['node_modules', 'tests'],
  moduleNameMapper: {
    '^tests/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
