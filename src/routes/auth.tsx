import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/app/Logo";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — GL Sites" },
      { name: "description", content: "Acesso da equipe GL Sites ao sistema de gestão." },
      { property: "og:title", content: "Entrar — GL Sites" },
      { property: "og:description", content: "Acesso da equipe GL Sites ao sistema de gestão." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(72),
});

type Mode = "login" | "forgot" | "first";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [hasUsers, setHasUsers] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/dashboard" }); });
    supabase.rpc("has_any_user").then(({ data }) => setHasUsers(data !== false));
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "forgot") {
      const r = z.string().trim().email().safeParse(email);
      if (!r.success) return setError("Informe um e-mail válido");
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(r.data, { redirectTo: `${window.location.origin}/reset-password` });
      setLoading(false);
      if (error) return setError(error.message);
      toast.success("Enviamos um link de redefinição para seu e-mail.");
      setMode("login");
      return;
    }
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    setLoading(true);
    if (mode === "first") {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name.trim() } },
      });
      setLoading(false);
      if (error) return setError(error.message);
      if (!data.session) {
        toast.success("Conta criada! Confirme seu e-mail para entrar.");
        setMode("login");
      } else navigate({ to: "/dashboard" });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return setError(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos" : error.message);
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
        <form onSubmit={submit} className="w-full max-w-sm animate-rise" noValidate>
          <Logo className="mb-10 lg:hidden" />
          <h2 className="text-2xl font-semibold text-foreground">
            {mode === "login" ? "Entrar" : mode === "forgot" ? "Recuperar senha" : "Criar primeiro acesso"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Use seu e-mail e senha da equipe." : mode === "forgot" ? "Enviaremos um link para redefinir sua senha." : "Esta conta será a administradora do sistema."}
          </p>

          <div className="mt-8 space-y-4">
            {mode === "first" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {mode === "login" && (
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => setMode("forgot")}>
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <Input id="password" type="password" autoComplete={mode === "first" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Entrar" : mode === "forgot" ? "Enviar link" : "Criar conta"}
            </Button>
            {mode !== "login" && (
              <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode("login")}>
                Voltar para o login
              </button>
            )}
            {mode === "login" && !hasUsers && (
              <button type="button" className="w-full text-center text-sm text-primary hover:underline" onClick={() => setMode("first")}>
                Primeira vez? Criar conta de administrador
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
