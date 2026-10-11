"use client";

import { useId } from "react";
import { emptyField, Metric, NumField, readField, ResultBox, ToolForm, type FieldState } from "./fields";
import { brl, pct } from "./format";
import { DEFAULT_MIGRATION_HORIZON, evaluateMigration, MIGRATION_HORIZONS, type MigrationHorizon, type MigrationResult } from "./models";
import { focusFirst, useToolForm } from "./useToolForm";
import styles from "./tools.module.css";

const LABELS: Record<string, string> = { keep: "manter o ambiente atual", operate: "operar com migração", transition: "transição adicional" };
const KEYS = ["keep", "operate", "transition"] as const;
interface Values { horizon: MigrationHorizon; totalsHorizon: MigrationHorizon; keep: FieldState; operate: FieldState; transition: FieldState }
const initial = (): Values => ({ horizon: DEFAULT_MIGRATION_HORIZON, totalsHorizon: DEFAULT_MIGRATION_HORIZON, keep: emptyField(), operate: emptyField(), transition: emptyField() });

export function MigrationTool() {
  const p = `mig${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const form = useToolForm<Values, MigrationResult>(initial());
  const { values: v, errors } = form;
  const needsReview = v.horizon !== v.totalsHorizon;

  function submit() {
    const errs: Record<string, string> = {};
    const parsed = { keep: readField(v.keep), operate: readField(v.operate), transition: readField(v.transition) };
    for (const k of KEYS) if (parsed[k].error) errs[k] = parsed[k].error as string;
    if (Object.keys(errs).length === 0) {
      const out = evaluateMigration({ horizon: v.horizon, totalsHorizon: v.totalsHorizon, keep: parsed.keep.input, operate: parsed.operate.input, transition: parsed.transition.input });
      if (out.ok) { form.submit({}, out.result); return; }
      for (const e of out.errors) errs[e.field] = e.message;
    }
    form.submit(errs, null);
    setTimeout(() => focusFirst(p, errs, KEYS), 0);
  }

  const r = form.result;
  const h = v.horizon;
  return (
    <div className={styles.layout}>
      <ToolForm label="Comparação de custos de migração" submitLabel="Comparar custos" onSubmit={submit} onClear={form.clear}
        formError={Object.keys(errors).length > 0 ? "Corrija os campos destacados para comparar." : undefined}>
        <fieldset className={styles.fieldset}>
          <legend>Horizonte da comparação</legend>
          <div className={styles.radios}>
            {MIGRATION_HORIZONS.map((m) => (
              <label key={m}>
                <input type="radio" name={`${p}-horizon`} checked={v.horizon === m} onChange={() => form.edit({ horizon: m })} />
                {m} meses
              </label>
            ))}
          </div>
        </fieldset>
        {needsReview ? (
          <div className={styles.review} role="status">
            <p>Você mudou o horizonte para {h} meses. Os totais abaixo foram informados para {v.totalsHorizon} meses e não são convertidos nem multiplicados. Revise cada valor para {h} meses e confirme.</p>
            <button type="button" className={styles.secondary} onClick={() => form.edit({ totalsHorizon: v.horizon })}>
              Confirmar totais para {h} meses
            </button>
          </div>
        ) : null}
        <NumField id={`${p}-keep`} label={`Manter o ambiente atual em ${v.totalsHorizon} meses`} unit="R$" value={v.keep} error={errors.keep} onChange={(n) => form.edit({ keep: n }, "keep")} />
        <NumField id={`${p}-operate`} label={`Operar o cenário com migração em ${v.totalsHorizon} meses`} unit="R$" value={v.operate} error={errors.operate} onChange={(n) => form.edit({ operate: n }, "operate")} />
        <NumField id={`${p}-transition`} label="Transição adicional (não incluída na operação)" unit="R$" value={v.transition} error={errors.transition} onChange={(n) => form.edit({ transition: n }, "transition")} />
      </ToolForm>

      <ResultBox active={r !== null} stale={form.stale}>
        <h2>Resultado</h2>
        {r?.status === "review-required" ? (
          <p className={styles.warn}>Revisão necessária: o horizonte é {r.horizon} meses, mas os totais foram informados para {r.totalsHorizon}. Revise os valores e confirme os totais antes de comparar.</p>
        ) : null}
        {r?.status === "insufficient" ? (
          <>
            <p className={styles.warn}>Não há informações suficientes para produzir este resultado.</p>
            <p className={styles.muted}>Faltam: {r.missing.map((m) => `${LABELS[m.field] ?? m.field}${m.state === "unknown" ? " (Não sei)" : ""}`).join("; ")}.</p>
          </>
        ) : null}
        {r?.status === "overflow" ? <p className={styles.warn}>Algum valor é grande demais para calcular. Revise os números informados.</p> : null}
        {r?.status === "value" ? (
          <>
            <p className={styles.warn}>
              {r.direction === "cheaper" ? `Migrar e operar custa ${brl(Math.abs(r.difference))} a menos nas premissas informadas`
                : r.direction === "costlier" ? `Migrar e operar custa ${brl(Math.abs(r.difference))} a mais nas premissas informadas`
                : "Totais iguais nas premissas informadas"}{` (${r.horizon} meses).`}
            </p>
            <div className={styles.metrics}>
              <Metric label="Manter o ambiente atual" value={brl(r.keep)} />
              <Metric label="Migrar e operar (operação + transição)" value={brl(r.migrate)} />
              <Metric label="Diferença estimada" value={brl(r.difference)}
                note={r.percent.status === "value" ? `${pct(r.percent.value)} em relação a manter o ambiente atual.`
                  : r.percent.status === "undefined" ? "Comparação percentual indisponível: o custo de manter informado é zero."
                  : "Percentual grande demais para calcular."} />
            </div>
            <p className={styles.note}>Comparação aritmética dos totais informados; não é economia realizada nem recomendação.</p>
          </>
        ) : null}
      </ResultBox>
    </div>
  );
}
