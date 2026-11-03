import { createFileRoute } from "@tanstack/react-router";
import { Users, FolderKanban, Wallet, CheckSquare } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/ui";
import { Logo } from "@/components/app/Logo";
import { useList, type Client, type Project, type Payment, type Task } from "@/lib/data";
import { money } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GL Sites" },
      { name: "description", content: "Visão geral da operação da GL Sites." },
      { property: "og:title", content: "Dashboard — GL Sites" },
      { property: "og:description", content: "Visão geral da operação da GL Sites." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const clients = useList<Client>("clients").data ?? [];
  const projects = useList<Project>("projects").data ?? [];
  const payments = useList<Payment>("payments").data ?? [];
  const tasks = useList<Task>("tasks").data ?? [];
  const received = payments.filter((p) => p.status === "pago").reduce((s, p) => s + Number(p.amount), 0);
  return (
    <div className="mx-auto max-w-6xl p-6">
      <Logo className="mb-8" />
      <PageHeader title="Dashboard" description="Visão geral da operação" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Clientes" value={clients.length} icon={Users} />
        <StatCard label="Projetos" value={projects.length} icon={FolderKanban} />
        <StatCard label="Recebido" value={money(received)} icon={Wallet} tone="success" />
        <StatCard label="Tarefas abertas" value={tasks.filter((t) => t.status !== "concluida").length} icon={CheckSquare} tone="warning" />
      </div>
    </div>
  );
}
