"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { submitDiagnostic, submitLocalForm, submitReport, type ContactMode, type DemoOutcome, type FormMode, type FormRequest, type SubmissionResult } from "@/lib/forms";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export type SubmissionStatus = "idle" | "submitting" | SubmissionResult;

export function useLocalSubmission(mode: ContactMode) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [outcome, setOutcome] = useState<DemoOutcome>("success");
  const [reference, setReference] = useState<string | undefined>();
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  // `token` is only used by the real (pilot) transports; demo/unavailable never touch the network.
  async function submit(request: FormRequest, token?: string) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setStatus("submitting");
    setReference(undefined);
    try {
      if (mode === "pilot") {
        if (!token || (request.kind !== "contact" && request.kind !== "report")) throw new Error("Missing challenge token");
        const result = request.kind === "contact"
          ? await submitDiagnostic(request.values, token, controller.signal)
          : await submitReport(request.email, request.toolId, request.commercialConsent === true, token, controller.signal);
        if (!controller.signal.aborted) {
          setReference(result.reference);
          setStatus(result.result);
        }
      } else {
        const result = await submitLocalForm(request, mode as FormMode, outcome, controller.signal);
        if (!controller.signal.aborted) setStatus(result);
      }
    } catch {
      if (!controller.signal.aborted) setStatus("error");
    } finally {
      if (active.current === controller) active.current = null;
    }
  }

  return { ready, status, outcome, reference, setOutcome, submit };
}
