import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { useMethodSlot } from "./method-slot";
import { parsePtBR } from "./models";
import type { Input, ParseOptions } from "./models";
import styles from "./tools.module.css";

export interface FieldState { text: string; unknown: boolean }
export const emptyField = (): FieldState => ({ text: "", unknown: false });

/** Texto → entrada do modelo: vazio = `undefined`, "Não sei" = `null`, zero é valor. */
export function readField(f: FieldState, options?: ParseOptions): { input: Input; error?: string } {
  if (f.unknown) return { input: null };
  const p = parsePtBR(f.text, options);
  if (p.kind === "empty") return { input: undefined };
  if (p.kind === "error") return { input: undefined, error: p.message };
  return { input: p.value };
}

export function NumField({ id, label, unit, help, value, onChange, error, allowUnknown = true }: {
  id: string; label: string; unit: string; help?: string; value: FieldState; onChange: (next: FieldState) => void; error?: string; allowUnknown?: boolean;
}) {
  const describedBy = [help ? `${id}-help` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label} <span className={styles.unit}>({unit})</span></label>
      <input id={id} type="text" inputMode="decimal" autoComplete="off" value={value.text} disabled={value.unknown}
        aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={(e) => onChange({ text: e.target.value, unknown: false })} />
      {help ? <p className={styles.help} id={`${id}-help`}>{help}</p> : null}
      {error ? <p className={styles.error} id={`${id}-error`}>{error}</p> : null}
      {allowUnknown ? (
        <label className={styles.check}>
          <input id={`${id}-unknown`} type="checkbox" checked={value.unknown} onChange={(e) => onChange({ text: "", unknown: e.target.checked })} />
          Não sei<span className={styles.sr}> — {label}</span>
        </label>
      ) : null}
    </div>
  );
}

export function ToolForm({ label, onSubmit, formError, submitLabel, onClear, children }: {
  label: string; onSubmit: () => void; formError?: string; submitLabel: string; onClear: () => void; children: ReactNode;
}) {
  return (
    <form className={styles.panel} noValidate autoComplete="off" aria-label={label} onSubmit={(e: FormEvent) => { e.preventDefault(); onSubmit(); }}>
      {children}
      {formError ? <p className={styles.error} role="alert">{formError}</p> : null}
      <div className={styles.actions}>
        <button className="button" type="submit">{submitLabel}</button>
        <button className={styles.secondary} type="button" onClick={onClear}>Limpar respostas</button>
      </div>
    </form>
  );
}

export function ResultBox({ active, stale, children }: { active: boolean; stale: boolean; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const method = useMethodSlot();
  useEffect(() => { if (active) ref.current?.focus(); }, [active]);
  return (
    <aside className={styles.aside} aria-label="Resultado">
      <div className={styles.eyebrowRow}><span className={styles.eyebrow}>Resultado</span><span className={styles.eyebrowRule} /></div>
      <div id="resultado" ref={ref} tabIndex={-1} className={styles.result} aria-live="polite">
        {active ? children : stale
          ? <p className={styles.stale}>As respostas mudaram depois do último cálculo. O resultado anterior foi descartado: calcule de novo.</p>
          : (
            <>
              <p className={styles.muted}>Preencha os campos e calcule para ver o resultado. Nada é enviado ou guardado.</p>
              <div className={styles.placeholders} aria-hidden="true"><span /><span /><span /></div>
            </>
          )}
      </div>
      {method}
    </aside>
  );
}

export function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricText}>
        <h3>{label}</h3>
        {note ? <p className={styles.note}>{note}</p> : null}
      </div>
      <p className={styles.value}>{value}</p>
    </div>
  );
}
