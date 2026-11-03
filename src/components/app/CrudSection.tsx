import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityForm, type Field } from "./EntityForm";
import { ConfirmDelete, EmptyState, ListSkeleton, Panel } from "./ui";
import { useList, useRemove, useSave, type TableName } from "@/lib/data";
import { Inbox } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Rec = { id: string; [k: string]: any };

export function CrudSection({
  table, label, fields, title, subtitle,
}: {
  table: TableName;
  label: string;
  fields: Field[];
  title: (r: Rec) => string;
  subtitle?: (r: Rec) => string;
}) {
  const list = useList<Rec>(table);
  const save = useSave(table, label);
  const remove = useRemove(table, label);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Rec | null>(null);

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (r: Rec) => { setEditing(r); setOpen(true); };

  return (
    <Panel
      action={<Button size="sm" onClick={openNew}><Plus className="size-4" /> Novo</Button>}
    >
      {list.isLoading ? <ListSkeleton /> : !list.data?.length ? (
        <EmptyState icon={Inbox} title="Nada cadastrado ainda" description={`Clique em "Novo" para adicionar.`} />
      ) : (
        <ul className="divide-y divide-border">
          {list.data.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{title(r)}</p>
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle(r)}</p>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => openEdit(r)} aria-label="Editar">
                <Pencil className="size-4" /> Editar
              </Button>
              <ConfirmDelete what={label.toLowerCase()} onConfirm={() => remove.mutate(r.id)}>
                <Button size="icon" variant="ghost" aria-label="Excluir"><Trash2 className="size-4 text-destructive" /></Button>
              </ConfirmDelete>
            </li>
          ))}
        </ul>
      )}
      <EntityForm
        open={open}
        onOpenChange={setOpen}
        title={editing ? `Editar ${label.toLowerCase()}` : `Novo ${label.toLowerCase()}`}
        fields={fields}
        {...(editing ? { initial: editing } : {})}
        saving={save.isPending}
        onSubmit={async (values) => {
          await save.mutateAsync(editing ? { id: editing.id, values } : { values });
          setOpen(false);
        }}
      />
    </Panel>
  );
}
