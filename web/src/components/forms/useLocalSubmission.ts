"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { submitLocalForm, type DemoOutcome, type FormMode, type FormRequest, type SubmissionResult } from "@/lib/forms";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function useLocalSubmission(mode: FormMode) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [status, setStatus] = useState<"idle" | "submitting" | SubmissionResult>("idle");
  const [outcome, setOutcome] = useState<DemoOutcome>("success");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function submit(request: FormRequest) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setStatus("submitting");
    try {
      const result = await submitLocalForm(request, mode, outcome, controller.signal);
      if (!controller.signal.aborted) setStatus(result);
    } catch {
      if (!controller.signal.aborted) {
        setStatus("error");
      }
    } finally {
      if (active.current === controller) active.current = null;
    }
  }

  return { ready, status, outcome, setOutcome, submit };
}
