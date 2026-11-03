import { createFileRoute } from "@tanstack/react-router";
import { Users, FolderKanban, Wallet, CheckSquare } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/ui";
import { Logo } from "@/components/app/Logo";
import { CrudSection } from "@/components/app/CrudSection";
import type { Field } from "@/components/app/EntityForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useList, type Client, type Project, type Payment, type Task } from "@/lib/data";
import { useRefOptions } from "@/lib/options";
import { money, date } from "@/lib/format";
import {
  CLIENT_STATUS, CLIENT_PAYMENT_STATUS, PROJECT_TYPES, PROJECT_STATUS, PRIORITIES, TASK_STATUS, PAYMENT_STATUS,
} from "@/lib/constants";

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

const lbl = (opts: { value: string; label: string }[], v: unknown) => opts.find((o) => o.value === v)?.label ?? "";

function Dashboard() {
  const clients = useList<Client>("clients").data ?? [];
  const projects = useList<Project>("projects").data ?? [];
  const payments = useList<Payment>("payments").data ?? [];
  const tasks = useList<Task>("tasks").data ?? [];
  const ref = useRefOptions();
  const received = payments.filter((p) => p.status === "pago").reduce((s, p) => s + Number(p.amount), 0);

  const clientFields: Field[] = [
    { name: "name", label: "Nome", required: true },
    { name: "company", label: "Empresa" },
    { name: "email", label: "E-mail", type: "email" },
    { name: "phone", label: "Telefone" },
    { name: "instagram", label: "Instagram" },
    { name: "website", label: "Site" },
    { name: "segment", label: "Segmento" },
    { name: "document", label: "CPF/CNPJ" },
    { name: "city", label: "Cidade" },
    { name: "state", label: "Estado" },
    { name: "address", label: "Endereço", full: true },
    { name: "status", label: "Status", type: "select", options: CLIENT_STATUS, required: true },
    { name: "payment_status", label: "Pagamento", type: "select", options: CLIENT_PAYMENT_STATUS, required: true },
    { name: "contract_value", label: "Valor do contrato", type: "number" },
    { name: "payment_method", label: "Forma de pagamento" },
    { name: "lead_source", label: "Origem" },
    { name: "notes", label: "Observações", type: "textarea" },
  ];
  const projectFields: Field[] = [
    { name: "name", label: "Nome", required: true },
    { name: "client_id", label: "Cliente", type: "select", options: ref.clients, required: true },
    { name: "type", label: "Tipo", type: "select", options: PROJECT_TYPES, required: true },
    { name: "status", label: "Status", type: "select", options: PROJECT_STATUS, required: true },
    { name: "priority", label: "Prioridade", type: "select", options: PRIORITIES, required: true },
    { name: "value", label: "Valor", type: "number" },
    { name: "start_date", label: "Início", type: "date" },
    { name: "due_date", label: "Prazo", type: "date" },
    { name: "domain", label: "Domínio" },
    { name: "hosting", label: "Hospedagem" },
    { name: "project_url", label: "Link do projeto", type: "url", full: true },
    { name: "description", label: "Descrição", type: "textarea" },
    { name: "notes", label: "Observações", type: "textarea" },
  ];
  const taskFields: Field[] = [
    { name: "title", label: "Título", required: true, full: true },
    { name: "client_id", label: "Cliente", type: "select", options: ref.clients },
    { name: "project_id", label: "Projeto", type: "select", options: ref.projects },
    { name: "status", label: "Status", type: "select", options: TASK_STATUS, required: true },
    { name: "priority", label: "Prioridade", type: "select", options: PRIORITIES, required: true },
    { name: "due_date", label: "Prazo", type: "date" },
    { name: "description", label: "Descrição", type: "textarea" },
  ];
  const paymentFields: Field[] = [
    { name: "client_id", label: "Cliente", type: "select", options: ref.clients, required: true },
    { name: "project_id", label: "Projeto", type: "select", options: ref.projects },
    { name: "amount", label: "Valor", type: "number", required: true },
    { name: "status", label: "Status", type: "select", options: PAYMENT_STATUS, required: true },
    { name: "due_date", label: "Vencimento", type: "date", required: true },
    { name: "paid_date", label: "Pago em", type: "date" },
    { name: "method", label: "Forma de pagamento", required: true },
    { name: "description", label: "Descrição", type: "textarea" },
  ];

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

      <Tabs defaultValue="clients" className="mt-8">
        <TabsList>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>
        <TabsContent value="clients">
          <CrudSection table="clients" label="Cliente" fields={clientFields}
            title={(r) => String(r["name"])}
            subtitle={(r) => [r["company"], lbl(CLIENT_STATUS, r["status"])].filter(Boolean).join(" · ")} />
        </TabsContent>
        <TabsContent value="projects">
          <CrudSection table="projects" label="Projeto" fields={projectFields}
            title={(r) => String(r["name"])}
            subtitle={(r) => [(r as unknown as Project).clients?.name, lbl(PROJECT_STATUS, r["status"]), money(r["value"] as number)].filter(Boolean).join(" · ")} />
        </TabsContent>
        <TabsContent value="tasks">
          <CrudSection table="tasks" label="Tarefa" fields={taskFields}
            title={(r) => String(r["title"])}
            subtitle={(r) => [lbl(TASK_STATUS, r["status"]), r["due_date"] ? `Prazo ${date(r["due_date"] as string)}` : ""].filter(Boolean).join(" · ")} />
        </TabsContent>
        <TabsContent value="payments">
          <CrudSection table="payments" label="Pagamento" fields={paymentFields}
            title={(r) => `${money(r["amount"] as number)} — ${(r as unknown as Payment).clients?.name ?? ""}`}
            subtitle={(r) => [lbl(PAYMENT_STATUS, r["status"]), `Vence ${date(r["due_date"] as string)}`].join(" · ")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
