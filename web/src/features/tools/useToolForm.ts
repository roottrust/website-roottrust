import { useState } from "react";

export type FieldErrors = Record<string, string>;

interface Core<S, R> {
  values: S;
  result: R | null;
  stale: boolean;
  errors: FieldErrors;
}

/** Estado em memória de uma ferramenta: toda edição descarta o resultado e marca como desatualizado. */
export function useToolForm<S, R>(initial: S) {
  const [core, setCore] = useState<Core<S, R>>({ values: initial, result: null, stale: false, errors: {} });
  const edit = (patch: Partial<S>, ...fields: string[]) =>
    setCore((p) => {
      const errors = { ...p.errors };
      for (const f of fields) delete errors[f];
      return { values: { ...p.values, ...patch }, result: null, stale: p.stale || p.result !== null, errors };
    });
  const submit = (errors: FieldErrors, result: R | null) => setCore((p) => ({ ...p, errors, result, stale: false }));
  const clear = () => setCore({ values: initial, result: null, stale: false, errors: {} });
  return { ...core, edit, submit, clear };
}

export function focusFirst(prefix: string, errors: FieldErrors, order: readonly string[]) {
  const first = order.find((key) => errors[key]);
  if (first) document.getElementById(`${prefix}-${first}`)?.focus();
}
