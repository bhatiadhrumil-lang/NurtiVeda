// Authentication helpers: subpath-aware URLs, Supabase result
// classification, and honest user-facing messages. Pure functions (except
// getAppUrl/getBasename which read the Vite/browser environment) so the
// logic is unit-testable without touching Supabase or email delivery.

export type SignupOutcome =
  | { kind: "error"; message: string }
  | { kind: "already-registered" }
  | { kind: "confirmed" }
  | { kind: "needs-confirmation" };

interface SignupData {
  user?: {
    identities?: unknown[] | null;
  } | null;
  session?: unknown | null;
}

/** Join origin + Vite base + path without producing `//` or dropping the
 *  subpath (critical on GitHub Pages, where the app lives under /NurtiVeda/).
 *  Examples:
 *    buildAppUrl("https://x.github.io", "/", "auth/callback")
 *      -> "https://x.github.io/auth/callback"
 *    buildAppUrl("https://x.github.io", "/NurtiVeda/", "auth/callback")
 *      -> "https://x.github.io/NurtiVeda/auth/callback" */
export function buildAppUrl(origin: string, base: string, path = ""): string {
  const cleanOrigin = origin.replace(/\/+$/, "");
  const cleanBase = `/${base.replace(/^\/+|\/+$/g, "")}`;
  const root = cleanBase === "/" ? cleanOrigin : `${cleanOrigin}${cleanBase}`;
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${root}/${cleanPath}` : `${root}/`;
}

/** Absolute URL of a route inside this app, correct in both
 *  `npm run dev` (base "/") and GitHub Pages (base "/NurtiVeda/"). */
export function getAppUrl(path = ""): string {
  const base = import.meta.env.BASE_URL ?? "/";
  return buildAppUrl(window.location.origin, base, path);
}

/** React Router basename derived from the same Vite base. */
export function getBasename(): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const trimmed = base.replace(/\/+$/g, "");
  return trimmed === "" ? "/" : trimmed;
}

/** Map a raw Supabase auth error to an honest user-facing message.
 *  Never invents distinctions the backend doesn't provide. */
export function toUserAuthMessage(rawMessage: string, context: "login" | "signup" | "reset" | "resend" | "callback"): string {
  const msg = rawMessage || "";
  if (/email not confirmed/i.test(msg)) {
    return "Please verify your email before signing in. Check your inbox (and spam) for the confirmation link, or use “Resend confirmation email”.";
  }
  if (/invalid login credentials/i.test(msg)) {
    return context === "login"
      ? "Incorrect email or password. If you just signed up, verify your email first — unverified accounts cannot sign in."
      : msg;
  }
  if (/user already registered/i.test(msg)) {
    return "This email is already registered. Try signing in — or resend the confirmation email if you never verified.";
  }
  if (/password should be at least/i.test(msg)) {
    return msg;
  }
  if (/unable to validate email|invalid.*email/i.test(msg)) {
    return "That email address looks invalid. Double-check it and try again.";
  }
  if (/email link is invalid|expired|token/i.test(msg)) {
    return "This email link is invalid or has expired. Request a fresh one below.";
  }
  if (/over.*request|rate limit|too many/i.test(msg)) {
    return "Too many attempts — please wait a minute and try again.";
  }
  if (/email.*not.*sent|error sending/i.test(msg)) {
    return "We couldn't send that email. Check the address and try again — if it persists, the mail service needs attention.";
  }
  return msg || "Something went wrong. Please try again.";
}

/** Classify a Supabase signUp() result without guessing:
 *  - error: surface it, claim nothing was sent
 *  - already-registered: Supabase returns success with zero identities when
 *    confirmation is on and the address exists — no new email is sent
 *  - confirmed: session present (confirmation off) — proceed to the app
 *  - needs-confirmation: ask the user to verify, and only then claim mail */
export function classifySignup(
  data: SignupData | null,
  error: { message: string } | null,
): SignupOutcome {
  if (error) return { kind: "error", message: toUserAuthMessage(error.message, "signup") };
  const identities = data?.user?.identities;
  if (data?.user && Array.isArray(identities) && identities.length === 0) {
    return { kind: "already-registered" };
  }
  if (data?.session) return { kind: "confirmed" };
  if (data?.user) return { kind: "needs-confirmation" };
  return { kind: "error", message: toUserAuthMessage("", "signup") };
}
