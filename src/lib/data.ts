import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type TableName = "clients" | "projects" | "tasks" | "payments" | "services" | "client_events" | "profiles";
export type Row<T extends TableName> = Tables[T]["Row"];

export type Client = Row<"clients">;
export type Project = Row<"projects"> & { clients?: { name: string; company: string | null } | null; profiles?: { full_name: string } | null };
export type Task = Row<"tasks"> & { clients?: { name: string } | null; projects?: { name: string } | null; profiles?: { full_name: string } | null };
export type Payment = Row<"payments"> & { clients?: { name: string } | null; projects?: { name: string } | null };
export type Service = Row<"services">;
export type ClientEvent = Row<"client_events"> & { profiles?: { full_name: string } | null };
export type Profile = Row<"profiles">;

const SELECTS: Record<TableName, string> = {
  clients: "*",
  projects: "*, clients(name, company), profiles(full_name)",
  tasks: "*, clients(name), projects(name), profiles(full_name)",
  payments: "*, clients(name), projects(name)",
  services: "*",
  client_events: "*, profiles(full_name)",
  profiles: "*",
};
const ORDER: Record<TableName, { col: string; asc: boolean }> = {
  clients: { col: "created_at", asc: false },
  projects: { col: "created_at", asc: false },
  tasks: { col: "due_date", asc: true },
  payments: { col: "due_date", asc: false },
  services: { col: "name", asc: true },
  client_events: { col: "happened_at", asc: false },
  profiles: { col: "full_name", asc: true },
};

export function useList<T = unknown>(table: TableName, filter?: { col: string; value: string }) {
  return useQuery({
    queryKey: [table, filter?.col, filter?.value],
    queryFn: async () => {
      let q = supabase.from(table).select(SELECTS[table]);
      if (filter) q = q.eq(filter.col, filter.value);
      const { data, error } = await q.order(ORDER[table].col, { ascending: ORDER[table].asc, nullsFirst: false });
      if (error) throw error;
      return data as T[];
    },
  });
}

export function useSave(table: TableName, label = "Registro") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
      const q = id
        ? supabase.from(table).update(values as never).eq("id", id).select().single()
        : supabase.from(table).insert(values as never).select().single();
      const { data, error } = await q;
      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: (_d, v) => {
      toast.success(v.id ? `${label} atualizado` : `${label} criado`);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Não foi possível salvar", { description: e.message }),
  });
}

export function useRemove(table: TableName, label = "Registro") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${label} excluído`);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Não foi possível excluir", { description: e.message }),
  });
}

export async function logEvent(client_id: string, title: string, kind = "evento") {
  const { data } = await supabase.auth.getUser();
  await supabase.from("client_events").insert({ client_id, title, kind, author_id: data.user?.id ?? null });
}
