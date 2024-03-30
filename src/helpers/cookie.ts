export function getCookie(name: string): string | null {
  const cookies = document.cookie.split("; ");
  const value = cookies.find((c) => c.startsWith(name + "="))?.split("=")[1];
  if (value === undefined) {
    return null;
  }
  return decodeURIComponent(value);
}

export function getCookieBoolean(name: string): boolean | null {
  const value = getCookie(name);
  if (value === null) {
    return null;
  }
  return value === "true";
}

// Set cookie with sameSite=None and Secure flags
export function setCookie(
  name: string,
  value: string,
  expires: number = 365
): void {
  const date = new Date();
  date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
  const expiresString = date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expiresString}; SameSite=Strict; Secure`;
}
