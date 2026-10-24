// Fail closed until the explicitly verified MASHURA target is configured.
// This prevents inherited deployment variables from connecting to another business.
export function isMashuraTarget(
  url: string | undefined,
  key: string | undefined,
  projectRef: string | undefined,
): boolean {
  if (!url || !key) return false;
  try {
    const parsed = new URL(url);
    if (
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    )
      return false;
    if (["localhost", "127.0.0.1"].includes(parsed.hostname))
      return parsed.protocol === "http:" && parsed.port === "54321";
    return Boolean(
      projectRef &&
      /^[a-z0-9]{8,40}$/.test(projectRef) &&
      parsed.hostname === `${projectRef}.supabase.co` &&
      parsed.protocol === "https:" &&
      !parsed.port,
    );
  } catch {
    return false;
  }
}
export function hasMashuraConfig() {
  return isMashuraTarget(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.MASHURA_SUPABASE_PROJECT_REF,
  );
}
