import { describe, it, expect } from "vitest";
import { buildAppUrl, classifySignup, toUserAuthMessage } from "@/lib/auth";

describe("buildAppUrl", () => {
  it("keeps local dev at the domain root", () => {
    expect(buildAppUrl("http://localhost:8080", "/", "auth/callback")).toBe(
      "http://localhost:8080/auth/callback"
    );
  });

  it("preserves the /NurtiVeda/ subpath in production", () => {
    expect(buildAppUrl("https://bhatiadhrumil-lang.github.io", "/NurtiVeda/", "auth/callback")).toBe(
      "https://bhatiadhrumil-lang.github.io/NurtiVeda/auth/callback"
    );
  });

  it("tolerates stray slashes", () => {
    expect(buildAppUrl("https://x.github.io/", "NurtiVeda", "/auth/callback")).toBe(
      "https://x.github.io/NurtiVeda/auth/callback"
    );
    expect(buildAppUrl("http://localhost:8080", "/")).toBe("http://localhost:8080/");
  });
});

describe("classifySignup", () => {
  it("reports hard errors without claiming mail", () => {
    const out = classifySignup(null, { message: "User already registered" });
    expect(out.kind).toBe("error");
    if (out.kind === "error") expect(out.message).toMatch(/already registered/i);
  });

  it("detects already-registered via empty identities (no new email sent)", () => {
    expect(classifySignup({ user: { identities: [] }, session: null }, null)).toEqual({
      kind: "already-registered",
    });
  });

  it("detects instant confirmation via session", () => {
    expect(classifySignup({ user: { identities: [{}] }, session: { a: 1 } }, null)).toEqual({
      kind: "confirmed",
    });
  });

  it("detects needs-confirmation for a fresh user", () => {
    expect(classifySignup({ user: { identities: [{}] }, session: null }, null)).toEqual({
      kind: "needs-confirmation",
    });
  });
});

describe("toUserAuthMessage", () => {
  it("asks for verification on unconfirmed login", () => {
    expect(toUserAuthMessage("Email not confirmed", "login")).toMatch(/verify your email/i);
  });

  it("is honest about ambiguous credentials", () => {
    expect(toUserAuthMessage("Invalid login credentials", "login")).toMatch(/incorrect email or password/i);
  });

  it("explains expired links", () => {
    expect(toUserAuthMessage("Email link is invalid or has expired", "callback")).toMatch(/invalid or has expired/i);
  });

  it("passes unknown errors through untouched", () => {
    expect(toUserAuthMessage("Something odd happened", "login")).toBe("Something odd happened");
  });
});
