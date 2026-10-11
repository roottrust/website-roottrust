"use client";

import { useId } from "react";
import { emptyField, Metric, NumField, readField, ResultBox, ToolForm, type FieldState } from "./fields";
import { brl } from "./format";
import { evaluateTechDebt, type TechDebtResult } from "./models";
import { focusFirst, useToolForm } from "./useToolForm";
import styles from "./tools.module.css";

const LABELS: Record<string, string> = { team: "profissionais na equipe", monthlyCost: "custo médio mensal", maintenancePercent: "tempo de manutenção", debtSharePercent: "parcela atribuída à dívida" };
const KEYS = ["team", "monthlyCost", "maintenancePercent", "debtSharePercent"] as const;
type Values = Record<(typeof KEYS)[number], FieldState>;
const initial = (): Values => ({ team: emptyField(), monthlyCost: emptyField(), maintenancePercent: emptyField(), debtSharePercent: emptyField() });

export function TechDebtTool() {
  const p = `debt${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const form = useToolForm<Values, TechDebtResult>(initial());
  const { values: v, errors } = form;

  function submit() {
    const errs: Record<string, string> = {};
    const team = readField(v.team, { integer: true });
    const monthlyCost = readField(v.monthlyCost);
    const maintenancePercent = readField(v.maintenancePercent, { percent: true });
    const debtSharePercent = readField(v.debtSharePercent, { percent: true });
    const parsed = { team, monthlyCost, maintenancePercent, debtSharePercent };
    for (const k of KEYS) if (parsed[k].error) errs[k] = parsed[k].error as string;
    if (Object.keys(errs).length === 0) {
      const out = evaluateTechDebt({ team: team.input, monthlyCost: monthlyCost.input, maintenancePercent: maintenancePercent.input, debtSharePercent: debtSharePercent.input });
      if (out.ok) { form.submit({}, out.result); return; }
      for (const e of out.errors) errs[e.field] = e.message;
    }
    form.submit(errs, null);
    setTimeout(() => focusFirst(p, errs, KEYS), 0);
  }

  const r = form.result;
  return (
    <div className={styles.layout}>
      <ToolForm label="Estimativa de dívida técnica" submitLabel="Estimar custo" onSubmit={submit} onClear={form.clear}
        formError={Object.keys(errors).length > 0 ? "Corrija os campos destacados para calcular." : undefined}>
        <NumField id={`${p}-team`} label="Profissionais na equipe" unit="pessoas" value={v.team} error={errors.team} onChange={(n) => form.edit({ team: n }, "team")} />
        <NumField id={`${p}-monthlyCost`} label="Custo médio mensal por profissional" unit="R$/mês" value={v.monthlyCost} error={errors.monthlyCost} onChange={(n) => form.edit({ monthlyCost: n }, "monthlyCost")} />
        <NumField id={`${p}-maintenancePercent`} label="Tempo total dedicado à manutenção" unit="%" value={v.maintenancePercent} error={errors.maintenancePercent} onChange={(n) => form.edit({ maintenancePercent: n }, "maintenancePercent")} />
        <NumField id={`${p}-debtSharePercent`} label="Parcela dessa manutenção atribuída à dívida técnica" unit="%" value={v.debtSharePercent} error={errors.debtSharePercent} onChange={(n) => form.edit({ debtSharePercent: n }, "debtSharePercent")} />
      </ToolForm>

      <ResultBox active={r !== null} stale={form.stale}>
        <h2>Resultado</h2>
        {r?.status === "insufficient" ? (
          <>
            <p className={styles.warn}>Não há informações suficientes para produzir este resultado.</p>
            <p className={styles.muted}>Faltam: {r.missing.map((m) => `${LABELS[m.field] ?? m.field}${m.state === "unknown" ? " (Não sei)" : ""}`).join("; ")}.</p>
          </>
        ) : null}
        {r?.status === "overflow" ? <p className={styles.warn}>Algum valor é grande demais para calcular. Revise os números informados.</p> : null}
        {r?.status === "value" ? (
          <>
            <div className={styles.metrics}>
              <Metric label="Custo mensal estimado" value={brl(r.monthly)} />
              <Metric label="Projeção de 12 meses" value={brl(r.annual)} note="Mantendo equipe, custo e percentuais informados." />
            </div>
            {r.zeroDeclared ? <p className={styles.warn}>Algum valor foi declarado como zero. Isso não prova ausência de dívida técnica.</p> : null}
            <p className={styles.note}>Valide a alocação e identifique itens concretos de dívida. Esta estimativa não mede o valor total da dívida nem é economia garantida.</p>
          </>
        ) : null}
      </ResultBox>
    </div>
  );
}
