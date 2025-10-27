// App-wide configuration values

// Safely access window object (only available in browser)
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).APP_API_BASE_URL) {
    return (window as any).APP_API_BASE_URL;
  }
  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();
