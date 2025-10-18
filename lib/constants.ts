export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD =
  '$2b$10$CwTycUXWue0Thq9StjUM0uJ8zQp1r5r5r5r5r5r5r5r5r5r5r5r5r'; // bcrypt hash for 'dummy-password'
