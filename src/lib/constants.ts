export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";
export type Option = { value: string; label: string; tone?: Tone };

export const CLIENT_STATUS: Option[] = [
  { value: "lead", label: "Lead", tone: "neutral" },
  { value: "em_negociacao", label: "Em negociação", tone: "warning" },
  { value: "cliente_ativo", label: "Cliente ativo", tone: "success" },
  { value: "projeto_andamento", label: "Projeto em andamento", tone: "primary" },
  { value: "projeto_concluido", label: "Projeto concluído", tone: "info" },
  { value: "manutencao", label: "Manutenção", tone: "info" },
  { value: "inativo", label: "Inativo", tone: "danger" },
];

export const PROJECT_TYPES: Option[] = [
  { value: "landing_page", label: "Landing Page" },
  { value: "site_institucional", label: "Site institucional" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "pagina_profissional", label: "Página profissional" },
  { value: "redesign", label: "Redesign" },
  { value: "manutencao", label: "Manutenção" },
  { value: "outro", label: "Outro" },
];

export const PROJECT_STATUS: Option[] = [
  { value: "briefing", label: "Briefing", tone: "neutral" },
  { value: "em_desenvolvimento", label: "Em desenvolvimento", tone: "primary" },
  { value: "aguardando_cliente", label: "Aguardando cliente", tone: "warning" },
  { value: "em_revisao", label: "Em revisão", tone: "info" },
  { value: "ajustes", label: "Ajustes", tone: "warning" },
  { value: "finalizacao", label: "Finalização", tone: "primary" },
  { value: "concluido", label: "Concluído", tone: "success" },
  { value: "pausado", label: "Pausado", tone: "danger" },
];

export const PRIORITIES: Option[] = [
  { value: "baixa", label: "Baixa", tone: "neutral" },
  { value: "media", label: "Média", tone: "info" },
  { value: "alta", label: "Alta", tone: "warning" },
  { value: "urgente", label: "Urgente", tone: "danger" },
];

export const TASK_STATUS: Option[] = [
  { value: "a_fazer", label: "A fazer", tone: "neutral" },
  { value: "em_andamento", label: "Em andamento", tone: "primary" },
  { value: "concluida", label: "Concluída", tone: "success" },
];

export const PAYMENT_STATUS: Option[] = [
  { value: "pendente", label: "Pendente", tone: "warning" },
  { value: "pago", label: "Pago", tone: "success" },
  { value: "atrasado", label: "Atrasado", tone: "danger" },
  { value: "cancelado", label: "Cancelado", tone: "neutral" },
];

export const CLIENT_PAYMENT_STATUS: Option[] = [
  { value: "pendente", label: "Pendente", tone: "warning" },
  { value: "parcial", label: "Parcial", tone: "info" },
  { value: "pago", label: "Pago", tone: "success" },
  { value: "atrasado", label: "Atrasado", tone: "danger" },
];

export const PAYMENT_METHODS: Option[] = [
  { value: "pix", label: "PIX" },
  { value: "cartao", label: "Cartão" },
  { value: "transferencia", label: "Transferência" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "outro", label: "Outro" },
];

export const EVENT_KINDS: Option[] = [
  { value: "evento", label: "Evento" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "E-mail" },
  { value: "ligacao", label: "Ligação" },
  { value: "reuniao", label: "Reunião" },
  { value: "mensagem", label: "Mensagem" },
  { value: "observacao", label: "Observação" },
  { value: "pagamento", label: "Pagamento" },
];

export function findOption(list: Option[], value?: string | null) {
  return list.find((o) => o.value === value);
}
export function labelOf(list: Option[], value?: string | null) {
  return findOption(list, value)?.label ?? value ?? "—";
}
