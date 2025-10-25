// App-wide configuration values

export const API_BASE_URL = (globalThis as { APP_API_BASE_URL?: string }).APP_API_BASE_URL ?? 'http://localhost:3000';
