export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TRANSACTIONS: 10_000,
  MAX_FIELD_LENGTH: 200,
  UPLOAD_RATE_LIMIT: 10, // per 15 minutes
  GLOBAL_RATE_LIMIT: 100, // per 15 minutes
  PAGE_SIZE: 25,
} as const;

export const API_PORT = 3001;
export const WEB_PORT = 3000;
