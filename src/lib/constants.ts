export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const UI_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  TOTP_CODE_LENGTH: 6,
  TOAST_DURATION: 3000,
} as const;

export const ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  SIGNUP_COMPLETE: "/signup/complete",
  DASHBOARD: "/dashboard",
} as const;

export function getLocalePath(locale: string, path: string): string {
  return `/${locale}${path}`;
}
