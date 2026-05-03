export const GREEN_PORTS = {
  mobile: 17100,
  adminWeb: 17110,
  api: 17120,
  postgres: 17130,
  redis: 17140
} as const;

export const DEFAULT_API_BASE_URL = `http://localhost:${GREEN_PORTS.api}`;

export function getApiBaseUrl(env: Record<string, string | undefined> = {}): string {
  return env.NEXT_PUBLIC_API_URL || env.EXPO_PUBLIC_API_URL || env.API_URL || DEFAULT_API_BASE_URL;
}

export const REVIEW_ACTIVATION_THRESHOLD = 3;
export const DAILY_REVIEW_LIMIT = 30;
export const MATCH_EXPIRY_HOURS = 24;
