const ACCESS_TOKEN_KEY = "shadowtrack_access_token";
const REFRESH_TOKEN_KEY = "shadowtrack_refresh_token";

export const authStorage = {
  setTokens(access: string, refresh: string): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },

  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  clearTokens(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  },
  logout(): void {
    if (typeof window === "undefined") return;

    this.clearTokens();
  },
};
