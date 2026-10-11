"use client";

import { useId } from "react";
import { ResultBox, ToolForm } from "./fields";
import { evaluateShadowAi, SHADOW_ANSWER_LABELS, SHADOW_ANSWERS, SHADOW_QUESTIONS, type ShadowAnswers, type ShadowResult } from "./models";
import { focusFirst, useToolForm } from "./useToolForm";
import styles from "./tools.module.css";

const PREVIEW = SHADOW_QUESTIONS.map((q) => ({ label: q.theme, note: "Orientação após a resposta." }));

export function ShadowAiTool() {
  const p = `shadow${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const form = useToolForm<ShadowAnswers, Extract<ShadowResult, { complete: true }>>({});
  const { values, errors } = form;

  function submit() {
    const out = evaluateShadowAi(values);
    if (out.ok && out.result.complete) { form.submit({}, out.result); return; }
    const errs: Record<string, string> = out.ok
      ? Object.fromEntries((out.result.complete ? [] : out.result.pending).map((id) => [id, "Escolha uma resposta."]))
      : Object.fromEntries(out.errors.map((e) => [e.field, e.message]));
    form.submit(errs, null);
    setTimeout(() => focusFirst(p, errs, SHADOW_QUESTIONS.map((q) => q.id)), 0);
  }

  return (
    <div className={styles.layout}>
      <ToolForm label="Perguntas sobre o uso de IA" submitLabel="Ver orientações" onSubmit={submit} onClear={form.clear}
        formError={Object.keys(errors).length > 0 ? "Responda todas as perguntas para ver as orientações." : undefined}>
        {SHADOW_QUESTIONS.map((q) => (
          <fieldset key={q.id} className={styles.fieldset} aria-describedby={errors[q.id] ? `${p}-${q.id}-error` : undefined}>
            <legend>{q.theme}: {q.question}</legend>
            <div className={styles.radios}>
              {SHADOW_ANSWERS.map((a) => (
                <label key={a}>
                  <input type="radio" name={`${p}-${q.id}`} id={a === SHADOW_ANSWERS[0] ? `${p}-${q.id}` : `${p}-${q.id}-${a}`} checked={values[q.id] === a}
                    onChange={() => form.edit({ [q.id]: a }, q.id)} />
                  {SHADOW_ANSWER_LABELS[a]}
                </label>
              ))}
            </div>
            {errors[q.id] ? <p className={styles.error} id={`${p}-${q.id}-error`}>{errors[q.id]}</p> : null}
          </fieldset>
        ))}
      </ToolForm>

      <ResultBox active={form.result !== null} stale={form.stale} preview={PREVIEW}>
        <h2>Orientações</h2>
        {form.result ? (
          <>
            {form.result.allUnknown ? <p className={styles.warn}>Todas as respostas foram “Não sei”: isso não indica falta de controle, só que ainda é preciso confirmar cada ponto.</p> : null}
            {form.result.allDeclared ? <p className={styles.warn}>Todas as práticas foram declaradas. Isso não comprova segurança nem conformidade: implementação e eficácia não foram verificadas.</p> : null}
            <ul className={styles.guidance}>
              {form.result.items.map((item) => (
                <li key={item.id}>
                  <h3>{item.theme} — {SHADOW_ANSWER_LABELS[item.answer]}</h3>
                  <p className={styles.tag}>{item.statusLabel}</p>
                  <p>{item.action}</p>
                </li>
              ))}
            </ul>
            <p className={styles.note}>Sem nota, pontuação ou classificação de risco. As respostas são autodeclaradas.</p>
          </>
        ) : null}
      </ResultBox>
    </div>
  );
}
