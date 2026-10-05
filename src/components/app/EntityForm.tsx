import { useEffect, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Option } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "textarea" | "select" | "url";
  options?: Option[];
  required?: boolean;
  full?: boolean;
  placeholder?: string;
  section?: string;
};

type Values = Record<string, unknown>;

const NONE = "__none__";

export function validate(fields: Field[], values: Values) {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = values[f.name];
    const empty = v === undefined || v === null || String(v).trim() === "";
    if (f.required && empty) errors[f.name] = "Campo obrigatório";
    else if (!empty && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v))) errors[f.name] = "E-mail inválido";
    else if (!empty && f.type === "number" && (isNaN(Number(v)) || Number(v) < 0)) errors[f.name] = "Valor inválido";
    else if (!empty && String(v).length > 2000) errors[f.name] = "Texto muito longo";
  }
  return errors;
}

/** Converts form strings to DB values: empty -> null, numbers parsed. */
export function normalize(fields: Field[], values: Values) {
  const out: Values = {};
  for (const f of fields) {
    const v = values[f.name];
    if (v === undefined || v === null || String(v).trim() === "") out[f.name] = f.type === "number" ? 0 : null;
    else if (f.type === "number") out[f.name] = Number(v);
    else out[f.name] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}

export function EntityForm({
  open, onOpenChange, title, description, fields, initial, onSubmit, saving, submitLabel = "Salvar", extra,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  fields: Field[];
  initial?: Values;
  onSubmit: (values: Values) => Promise<unknown> | void;
  saving?: boolean;
  submitLabel?: string;
  extra?: ReactNode;
}) {
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const v: Values = {};
      for (const f of fields) v[f.name] = initial?.[f.name] ?? "";
      setValues(v);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = (k: string, v: unknown) => setValues((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    await onSubmit(normalize(fields, values));
  }

  let lastSection: string | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
          {fields.map((f) => {
            const header = f.section && f.section !== lastSection;
            lastSection = f.section ?? lastSection;
            const v = values[f.name];
            return (
              <div key={f.name} className={cn("contents")}>
                {header && <p className="col-span-full mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.section}</p>}
                <div className={cn("space-y-1.5", (f.full || f.type === "textarea") && "sm:col-span-2")}>
                  <Label htmlFor={f.name} className="text-xs">
                    {f.label}{f.required && <span className="text-primary"> *</span>}
                  </Label>
                  {f.type === "textarea" ? (
                    <Textarea id={f.name} rows={3} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
                  ) : f.type === "select" ? (
                    <Select value={v ? String(v) : NONE} onValueChange={(x) => set(f.name, x === NONE ? "" : x)}>
                      <SelectTrigger id={f.name}><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {!f.required && <SelectItem value={NONE}>—</SelectItem>}
                        {f.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={f.name}
                      type={f.type === "number" ? "number" : f.type ?? "text"}
                      step={f.type === "number" ? "0.01" : undefined}
                      value={String(v ?? "")}
                      onChange={(e) => set(f.name, e.target.value)}
                      placeholder={f.placeholder}
                    />
                  )}
                  {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]}</p>}
                </div>
              </div>
            );
          })}
          {extra}
          <DialogFooter className="col-span-full mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
