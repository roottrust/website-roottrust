"use client";

import { useId } from "react";
import { emptyField, Metric, NumField, readField, ResultBox, ToolForm, type FieldState } from "./fields";
import { brl, exactText, num, pct } from "./format";
import {
  COST_AUX_LABELS, evaluateRosi, FREQUENCY_OPTIONS, LOSS_AUX_LABELS, resolveAux,
  type AuxTotals, type Calc, type Input, type RosiResult,
} from "./models";
import { focusFirst, useToolForm } from "./useToolForm";
import styles from "./tools.module.css";

const SCENARIOS = [
  { label: "Ransomware com interrupção", help: "Considere a interrupção, a recuperação e os efeitos sobre a operação." },
  { label: "Comprometimento de contas", help: "Considere fraude, acesso indevido e o tempo até conter o problema." },
  { label: "Vazamento de dados", help: "Considere resposta, notificações e efeitos comerciais, sem contar a mesma perda duas vezes." },
  { label: "Exploração de falha em aplicação", help: "Considere correção emergencial, indisponibilidade e impacto sobre clientes." },
  { label: "Outro", help: "Descreva o evento que você quer avaliar, sem dados sensíveis." },
] as const;
const SCENARIO_DEFAULT_HELP = "Escolha o evento que você quer avaliar. Serve só para organizar o seu raciocínio; não altera o cálculo.";
const FIELD_LABELS: Record<string, string> = {
  loss: "prejuízo por incidente", frequency: "frequência", cost: "custo adicional", delayMonths: "prazo até a proteção estar efetiva", reductionPercent: "redução esperada",
};
const ORDER = ["loss", "frequency", "frequency-custom", "cost", "delay", "delay-custom", "reduction"] as const;
const EMPTY_AUX = (): FieldState[] => [emptyField(), emptyField(), emptyField(), emptyField()];

interface State {
  scenario: string; other: string;
  loss: FieldState; cost: FieldState; reduction: FieldState;
  frequency: string; frequencyCustom: FieldState;
  delay: string; delayCustom: FieldState;
  lossAux: FieldState[]; costAux: FieldState[];
  auxMessage: { loss?: string; cost?: string };
  auxErrors: Record<string, string>;
}
const initial = (): State => ({
  scenario: "", other: "", loss: emptyField(), cost: emptyField(), reduction: emptyField(),
  frequency: "", frequencyCustom: emptyField(), delay: "", delayCustom: emptyField(),
  lossAux: EMPTY_AUX(), costAux: EMPTY_AUX(), auxMessage: {}, auxErrors: {},
});

function missingText(calc: Calc): string {
  if (calc.status !== "missing") return "";
  return `Falta ${calc.missing.map((m) => `${FIELD_LABELS[m.field] ?? m.field}${m.state === "unknown" ? " (Não sei)" : ""}`).join("; ")}.`;
}

function show(calc: Calc, fmt: (v: number) => string, undefinedText = "Indefinido"): string {
  if (calc.status === "value") return fmt(calc.value);
  if (calc.status === "overflow") return "Grande demais para calcular";
  if (calc.status === "undefined") return undefinedText;
  return "—";
}

function Cards({ r }: { r: RosiResult }) {
  const rosi = r.rosiPercent;
  const net = r.netBenefit;
  const be = r.breakevenPercent;
  const rosiNote = rosi.status === "value"
    ? rosi.value < 0 ? "Retorno negativo nas premissas informadas."
      : rosi.value === 0 ? "Equilíbrio: o benefício esperado é igual ao custo."
      : `O benefício bruto equivale a ${num(rosi.value / 100 + 1)}× o custo.`
    : rosi.status === "undefined" ? "Custo zero: a razão ROSI não é definida."
    : rosi.status === "overflow" ? "Algum valor é grande demais para calcular. Revise os números informados."
    : missingText(rosi);
  const netNote = net.status === "value"
    ? net.value < 0 ? "O custo supera o benefício esperado nos 12 meses." : "Benefício esperado menos o custo adicional."
    : net.status === "overflow" ? "Algum valor é grande demais para calcular. Revise os números informados." : missingText(net);
  const beNote = be.status === "value"
    ? r.breakevenExceedsLimit ? "A redução necessária excede as perdas incluídas neste cenário. Com estas premissas, essa redução não cobre o custo no período."
      : "Redução mínima das perdas, durante o período ativo, para cobrir o custo."
    : be.status === "undefined"
      ? be.reason === "no_active_period" ? "Sem período ativo no horizonte: o equilíbrio não é definido." : "Perda de referência zero: não há o que reduzir."
    : be.status === "overflow" ? "Algum valor é grande demais para calcular. Revise os números informados." : missingText(be);
  return (
    <>
      <div className={styles.metrics}>
        <Metric label="ROSI estimado" value={show(rosi, pct)} note={rosiNote} />
        <Metric label="Benefício líquido" value={show(net, brl)} note={netNote} />
        <Metric label="Redução de equilíbrio" value={show(be, pct)} note={beNote} />
      </div>
      <details className={styles.details}>
        <summary>Ver detalhes do cálculo</summary>
        <dl>
          <dt>Perda esperada de referência (12 meses)</dt><dd>{show(r.referenceLoss, brl, "—")}</dd>
          <dt>Fração do ano com proteção efetiva</dt><dd>{show(r.activeFraction, (v) => pct(v * 100), "—")}</dd>
          <dt>Benefício esperado bruto</dt><dd>{show(r.benefit, brl, "—")}</dd>
          <dt>Perda residual no horizonte</dt><dd>{show(r.residualLoss, brl, "—")}</dd>
        </dl>
      </details>
    </>
  );
}

const example = evaluateRosi({ loss: { direct: 200000 }, frequency: 0.5, cost: { direct: 30000 }, delayMonths: 3, reductionPercent: 60 });

export function RosiTool() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = `rosi${uid}`;
  const form = useToolForm<State, RosiResult | { insufficient: string }>(initial());
  const { values: v, errors } = form;

  function setAux(kind: "lossAux" | "costAux", index: number, next: FieldState) {
    const list = v[kind].map((item, i) => (i === index ? next : item));
    const auxErrors = { ...v.auxErrors };
    delete auxErrors[`${kind === "lossAux" ? "loss" : "cost"}-aux-${index}`];
    form.edit({ [kind]: list, auxErrors, auxMessage: { ...v.auxMessage, [kind === "lossAux" ? "loss" : "cost"]: undefined } });
  }

  function transfer(kind: "loss" | "cost") {
    const auxKey = kind === "loss" ? "lossAux" : "costAux";
    const items = v[auxKey].map((f) => readField(f));
    const auxErrors = Object.fromEntries(Object.entries(v.auxErrors).filter(([key]) => !key.startsWith(`${kind}-aux-`)));
    items.forEach((item, i) => { if (item.error) auxErrors[`${kind}-aux-${i}`] = item.error; });
    let message: string;
    let patch: Partial<State> = { auxErrors };
    if (Object.keys(auxErrors).some((key) => key.startsWith(`${kind}-aux-`))) {
      message = "Corrija os valores destacados antes de usar o total.";
      setTimeout(() => focusFirst(p, auxErrors, items.map((_, i) => `${kind}-aux-${i}`)), 0);
    } else {
      const res = resolveAux(items.map((i) => i.input) as unknown as AuxTotals);
      if (res.status === "complete") {
        message = `Total de ${brl(res.total)} aplicado ao campo principal. Ele substitui o valor anterior.`;
        patch = { ...patch, [kind]: { text: exactText(res.total), unknown: false } };
      } else if (res.status === "overflow") message = "Algum valor é grande demais para calcular. Revise os números informados.";
      else {
        const labels = kind === "loss" ? LOSS_AUX_LABELS : COST_AUX_LABELS;
        message = `Subtotal incompleto${res.subtotal === null ? "" : `: ${brl(res.subtotal)}`}. Faltam ${res.missing.map((i) => labels[i]).join("; ")}. Ele não substitui o campo principal.`;
      }
    }
    form.edit({ ...patch, auxMessage: { ...v.auxMessage, [kind]: message } }, kind);
  }

  function submit() {
    const errs: Record<string, string> = {};
    const loss = readField(v.loss); if (loss.error) errs.loss = loss.error;
    const cost = readField(v.cost); if (cost.error) errs.cost = cost.error;
    const reduction = readField(v.reduction, { percent: true }); if (reduction.error) errs.reduction = reduction.error;

    let frequency: Input;
    if (v.frequency === "") frequency = undefined;
    else if (v.frequency === "nao-sei") frequency = null;
    else if (v.frequency === "custom") {
      const f = readField(v.frequencyCustom);
      frequency = f.input;
      if (f.error) errs["frequency-custom"] = f.error;
    } else frequency = FREQUENCY_OPTIONS.find((o) => o.id === v.frequency)?.perYear;

    let delay: Input;
    if (v.delay === "") delay = undefined;
    else if (v.delay === "nao-sei") delay = null;
    else if (v.delay === "imediato") delay = 0;
    else {
      const d = readField(v.delayCustom);
      delay = d.input;
      if (d.error) errs["delay-custom"] = d.error;
    }

    if (Object.keys(errs).length === 0) {
      const out = evaluateRosi({ loss: { direct: loss.input }, frequency, cost: { direct: cost.input }, delayMonths: delay, reductionPercent: reduction.input });
      if (!out.ok) {
        for (const e of out.errors) {
          const head = e.field.split(".")[0];
          const key = head === "frequency" ? (v.frequency === "custom" ? "frequency-custom" : "frequency")
            : head === "delayMonths" ? (v.delay === "custom" ? "delay-custom" : "delay")
            : head === "reductionPercent" ? "reduction" : head;
          errs[key] = e.message;
        }
      } else if (out.result.mode === "insufficient") {
        form.submit({}, { insufficient: out.result.missingInputs.map((m) => `${FIELD_LABELS[m.field] ?? m.field}${m.state === "unknown" ? " (Não sei)" : ""}`).join("; ") });
        return;
      } else {
        form.submit({}, out.result);
        return;
      }
    }
    form.submit(errs, null);
    setTimeout(() => focusFirst(p, errs, ORDER), 0);
  }

  const result = form.result;
  const hasErrors = Object.keys(errors).length > 0;
  const auxBlock = (kind: "loss" | "cost") => {
    const key = kind === "loss" ? "lossAux" : "costAux";
    const labels = kind === "loss" ? LOSS_AUX_LABELS : COST_AUX_LABELS;
    const msg = v.auxMessage[kind];
    return (
      <details className={styles.aux}>
        <summary>{kind === "loss" ? "Compor o prejuízo por partes (opcional)" : "Compor o custo por partes (opcional)"}</summary>
        <div>
          {labels.map((label, i) => (
            <NumField key={label} id={`${p}-${kind}-aux-${i}`} label={label} unit="R$" value={v[key][i]} allowUnknown={false} error={v.auxErrors[`${kind}-aux-${i}`]}
              onChange={(next) => setAux(key, i, next)} />
          ))}
          <button type="button" className={styles.secondary} onClick={() => transfer(kind)}>Usar este total</button>
          {msg ? <p className={styles.auxMsg} role="status">{msg}</p> : null}
        </div>
      </details>
    );
  };

  return (
    <div className={styles.layout}>
      <ToolForm label="Simulador de ROSI" submitLabel="Calcular cenário" onSubmit={submit} onClear={form.clear}
        formError={hasErrors ? "Corrija os campos destacados para calcular." : undefined}>
        <div className={styles.select}>
          <label htmlFor={`${p}-scenario`}>Cenário de referência (opcional)</label>
          <select id={`${p}-scenario`} aria-describedby={`${p}-scenario-help`} value={v.scenario} onChange={(e) => form.edit({ scenario: e.target.value })}>
            <option value="">Selecione</option>
            {SCENARIOS.map((s) => <option key={s.label} value={s.label}>{s.label}</option>)}
          </select>
          {v.scenario === "Outro" ? (
            <input className={styles.other} type="text" maxLength={120} autoComplete="off" aria-label="Descreva o cenário, sem dados sensíveis"
              placeholder="Descreva, sem dados sensíveis" value={v.other} onChange={(e) => form.edit({ other: e.target.value })} />
          ) : null}
          <p className={styles.help} id={`${p}-scenario-help`}>{SCENARIOS.find((s) => s.label === v.scenario)?.help ?? SCENARIO_DEFAULT_HELP}</p>
        </div>

        <NumField id={`${p}-loss`} label="Prejuízo por incidente" unit="R$" value={v.loss} error={errors.loss}
          help="Estime efeitos não sobrepostos; perda comercial não é automaticamente receita bruta." onChange={(next) => form.edit({ loss: next }, "loss")} />
        {auxBlock("loss")}

        <div className={styles.select}>
          <label htmlFor={`${p}-frequency`}>Frequência de incidentes com prejuízo</label>
          <select id={`${p}-frequency`} value={v.frequency} aria-invalid={Boolean(errors.frequency)} aria-describedby={errors.frequency ? `${p}-frequency-error` : undefined}
            onChange={(e) => form.edit({ frequency: e.target.value }, "frequency", "frequency-custom")}>
            <option value="">Selecione</option>
            {FREQUENCY_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            <option value="custom">Personalizar</option>
            <option value="nao-sei">Não sei</option>
          </select>
          {errors.frequency ? <p className={styles.error} id={`${p}-frequency-error`}>{errors.frequency}</p> : null}
        </div>
        {v.frequency === "custom" ? (
          <NumField id={`${p}-frequency-custom`} label="Incidentes com prejuízo por ano" unit="por ano" allowUnknown={false} value={v.frequencyCustom}
            error={errors["frequency-custom"]} onChange={(next) => form.edit({ frequencyCustom: next }, "frequency-custom")} />
        ) : null}

        <NumField id={`${p}-cost`} label="Custo adicional nos primeiros 12 meses" unit="R$" value={v.cost} error={errors.cost}
          onChange={(next) => form.edit({ cost: next }, "cost")} />
        {auxBlock("cost")}

        <div className={styles.select}>
          <label htmlFor={`${p}-delay`}>Prazo até a proteção estar efetiva</label>
          <select id={`${p}-delay`} value={v.delay} aria-invalid={Boolean(errors.delay)} aria-describedby={errors.delay ? `${p}-delay-error` : undefined}
            onChange={(e) => form.edit({ delay: e.target.value }, "delay", "delay-custom")}>
            <option value="">Selecione</option>
            <option value="imediato">Imediatamente</option>
            <option value="custom">Informar prazo</option>
            <option value="nao-sei">Não sei</option>
          </select>
          {errors.delay ? <p className={styles.error} id={`${p}-delay-error`}>{errors.delay}</p> : null}
        </div>
        {v.delay === "custom" ? (
          <NumField id={`${p}-delay-custom`} label="Meses até a proteção estar efetiva" unit="meses" allowUnknown={false} value={v.delayCustom}
            error={errors["delay-custom"]} onChange={(next) => form.edit({ delayCustom: next }, "delay-custom")} />
        ) : null}

        <NumField id={`${p}-reduction`} label="Redução esperada da perda" unit="%" value={v.reduction} error={errors.reduction}
          help="Marque “Não sei” para ver a redução necessária para cobrir o custo."
          onChange={(next) => form.edit({ reduction: next }, "reduction")} />
      </ToolForm>

      <div>
        <ResultBox active={result !== null} stale={form.stale}>
          <h2>Resultado</h2>
          {result && "insufficient" in result ? (
            <>
              <p className={styles.warn}>Não há informações suficientes para produzir este resultado.</p>
              <p className={styles.muted}>Faltam: {result.insufficient}.</p>
            </>
          ) : result ? (
            <>
              {result.mode !== "full" ? (
                <p className={styles.warn}>
                  {result.mode === "breakeven" ? "Resultado parcial: sem a redução esperada, só é possível mostrar a redução de equilíbrio."
                    : `Resultado parcial. Faltam: ${result.missingInputs.map((m) => `${FIELD_LABELS[m.field] ?? m.field}${m.state === "unknown" ? " (Não sei)" : ""}`).join("; ")}.`}
                </p>
              ) : null}
              <Cards r={result} />
              <p className={styles.note}>Este resultado depende das estimativas informadas; não representa economia realizada.</p>
            </>
          ) : null}
        </ResultBox>
        {example.ok && example.result.mode === "full" ? (
          <details className={`${styles.details} ${styles.example}`}>
            <summary>Ver exemplo fictício (não preenche os seus dados)</summary>
            <p className={styles.help}>Perda de R$ 200.000 por incidente, um incidente a cada 2 anos, custo adicional de R$ 30.000, proteção efetiva após 3 meses e redução esperada de 60%.</p>
            <Cards r={example.result} />
          </details>
        ) : null}
      </div>
    </div>
  );
}
