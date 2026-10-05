import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const money = (v: number | string | null | undefined) => brl.format(Number(v ?? 0));

export function date(v?: string | null) {
  if (!v) return "—";
  return format(parseISO(v), "dd/MM/yyyy", { locale: ptBR });
}
export function dateTime(v?: string | null) {
  if (!v) return "—";
  return format(parseISO(v), "dd 'de' MMM, HH:mm", { locale: ptBR });
}
export const todayISO = () => format(new Date(), "yyyy-MM-dd");

/** A due date is overdue when it is strictly before today and the item is not finished. */
export function isOverdue(due: string | null | undefined, done: boolean, today = todayISO()) {
  return !!due && !done && due < today;
}

/** Payment shown as "atrasado" when pending and past due. */
export function effectivePaymentStatus(p: { status: string; due_date: string }, today = todayISO()) {
  if (p.status === "pendente" && p.due_date < today) return "atrasado";
  return p.status;
}

export function initials(name?: string | null) {
  return (name ?? "?").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
}
