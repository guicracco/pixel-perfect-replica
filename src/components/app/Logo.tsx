import { cn } from "@/lib/utils";

export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand font-display text-sm font-bold text-primary-foreground shadow-card">
        GL
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-sm font-semibold text-foreground">GL Sites</div>
          <div className="text-[11px] text-muted-foreground">Gestão interna</div>
        </div>
      )}
    </div>
  );
}
