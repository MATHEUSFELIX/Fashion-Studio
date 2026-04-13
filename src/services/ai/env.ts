export function envValue(name: string): string | undefined {
  const value = import.meta.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function withTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}
