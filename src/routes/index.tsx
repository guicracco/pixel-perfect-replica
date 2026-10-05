import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "GL Sites — Gestão de clientes e projetos" },
      { name: "description", content: "Sistema interno da GL Sites para organizar clientes, projetos, tarefas e pagamentos." },
      { property: "og:title", content: "GL Sites — Gestão de clientes e projetos" },
      { property: "og:description", content: "Sistema interno da GL Sites para organizar clientes, projetos, tarefas e pagamentos." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/dashboard" : "/auth" });
  },
  component: () => null,
});
