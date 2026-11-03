import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app/Logo";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — GL Sites" },
      { name: "description", content: "Acesso da equipe GL Sites ao sistema de gestão." },
      { property: "og:title", content: "Entrar — GL Sites" },
      { property: "og:description", content: "Acesso da equipe GL Sites ao sistema de gestão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/dashboard" }); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function signIn() {
    setError(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setLoading(false);
      setError("Não foi possível entrar com o Google. Tente novamente.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <Logo className="relative" />
        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight text-foreground">
            Clientes, projetos e financeiro.<br />
            <span className="text-primary">Tudo em um só lugar.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">O painel de operação da GL Sites — feito para a equipe acompanhar cada site do briefing à entrega.</p>
        </div>
        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} GL Sites</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-rise">
          <Logo className="mb-10 lg:hidden" />
          <h2 className="text-2xl font-semibold text-foreground">Entrar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use sua conta Google da equipe.</p>
          <div className="mt-8 space-y-4">
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="button" className="w-full" onClick={signIn} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : (
                <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.7 3.72 14.56 2.8 12 2.8 6.92 2.8 2.8 6.92 2.8 12s4.12 9.2 9.2 9.2c5.31 0 8.83-3.73 8.83-8.99 0-.6-.07-1.06-.15-1.51z" /></svg>
              )}
              Entrar com Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
