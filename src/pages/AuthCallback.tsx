import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toUserAuthMessage } from "@/lib/auth";

/** Landing target for Supabase email links (verification + recovery).
 *  The supabase-js client exchanges `?code=` automatically on load
 *  (detectSessionInUrl); this page waits for that, then routes onward,
 *  and renders expired/invalid links honestly instead of a blank page.
 *  Lives at /auth/callback so refresh works via the Pages 404 fallback. */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, profileCompleted } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  const urlError = params.get("error_description") || params.get("error") || "";

  useEffect(() => {
    if (user) {
      navigate(profileCompleted ? "/" : "/complete-profile", { replace: true });
    }
  }, [user, profileCompleted, navigate]);

  useEffect(() => {
    if (user || urlError) return;
    const t = setTimeout(() => setTimedOut(true), 12_000);
    return () => clearTimeout(t);
  }, [user, urlError]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <span className="font-serif text-2xl font-semibold text-foreground">NutriVeda</span>
        </div>

        <Card className="border-border/50 shadow-elevated">
          <CardHeader>
            <CardTitle className="text-xl">
              {urlError ? "Link problem" : user ? "Verified!" : "Verifying…"}
            </CardTitle>
            <CardDescription>
              {urlError
                ? toUserAuthMessage(urlError, "callback")
                : user
                  ? "Your email is confirmed. Taking you in…"
                  : timedOut
                    ? "We couldn't find a session from this link."
                    : "Confirming your email — one moment."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {urlError ? (
              <XCircle className="w-10 h-10 text-destructive" />
            ) : user ? (
              <CheckCircle2 className="w-10 h-10 text-primary" />
            ) : (
              !timedOut && <Loader2 className="w-8 h-8 text-primary animate-spin" />
            )}
            {(urlError || timedOut) && !user && (
              <div className="flex gap-2">
                <Link to="/auth">
                  <Button variant="hero">Back to sign in</Button>
                </Link>
              </div>
            )}
            {(urlError || timedOut) && !user && (
              <p className="text-xs text-muted-foreground">
                Tip: expired links are normal if the email is old — sign in and use “Resend confirmation email”.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthCallback;
