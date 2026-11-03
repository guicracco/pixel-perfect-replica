import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GL Sites — Gestão de clientes e projetos" },
      { name: "description", content: "Sistema interno da GL Sites para organizar clientes, projetos, tarefas e pagamentos." },
      { property: "og:title", content: "GL Sites — Gestão de clientes e projetos" },
      { property: "og:description", content: "Sistema interno da GL Sites para organizar clientes, projetos, tarefas e pagamentos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
