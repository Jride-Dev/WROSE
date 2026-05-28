const PREFIX_RE = /^t[0-9]_/i;

export function normalizeThingId(
  id: string,
  expectedPrefix: string = "t3",
): string {
  const bare = id.replace(PREFIX_RE, "");
  return `${expectedPrefix}_${bare}`;
}
