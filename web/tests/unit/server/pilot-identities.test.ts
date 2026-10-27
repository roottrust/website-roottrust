import { describe, expect, it } from "vitest";
import { handleDiagnostic, handleReport } from "../../../src/lib/server/http";
import { postDiagnostic, postReport, setup } from "./helpers";

describe("pilot identity isolation", () => {
  it("rejects a valid outside phone before database and challenge access", async () => {
    const { deps, getStore, siteverify, store } = setup();
    const response = await handleDiagnostic(postDiagnostic({ name: "Piloto", company: "Teste", whatsapp: "11987654321" }), deps);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ code: "forbidden" });
    expect(getStore).not.toHaveBeenCalled();
    expect(siteverify).not.toHaveBeenCalled();
    expect(store.dump("diagnostics")).toEqual({});
    expect(store.dump("leads")).toEqual({});
    expect(store.dump("jobs")).toEqual({});
  });

  it("rejects an outside report email without database, challenge, or delivery", async () => {
    const { deps, getStore, siteverify, store, mailer } = setup();
    const response = await handleReport(postReport({ email: "outside@example.net", toolId: "rosi" }), deps);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ code: "forbidden" });
    expect(getStore).not.toHaveBeenCalled();
    expect(siteverify).not.toHaveBeenCalled();
    expect(mailer).not.toHaveBeenCalled();
    expect(store.dump("report_deliveries")).toEqual({});
    expect(store.dump("leads")).toEqual({});
    expect(store.dump("jobs")).toEqual({});
  });

  it("normalizes authorized identities before checking and preserves real challenge validation", async () => {
    const { deps, siteverify } = setup();
    const diagnostic = await handleDiagnostic(postDiagnostic({ name: "Piloto", company: "Teste", whatsapp: "+55 (11) 94008-4692" }), deps);
    const report = await handleReport(postReport({ email: " Leitor@Example.com ", toolId: "rosi" }), deps);
    expect(diagnostic.status).toBe(202);
    expect(report.status).toBe(202);
    expect(siteverify).toHaveBeenCalledTimes(2);
    const missingChallenge = await handleReport(postReport({ email: "leitor@example.com", toolId: "shadow-ai" }, { token: null }), deps);
    expect(missingChallenge.status).toBe(403);
    expect(await missingChallenge.json()).toEqual({ code: "challenge_failed" });
  });

  it("empty configured lists deny requests instead of opening access", async () => {
    const { deps, getStore } = setup();
    deps.diagnostic = { ...deps.diagnostic!, allowlist: [] };
    deps.report = { ...deps.report!, allowlist: [] };
    expect((await handleDiagnostic(postDiagnostic({ name: "Piloto", company: "Teste", whatsapp: "11940084692" }), deps)).status).toBe(403);
    expect((await handleReport(postReport({ email: "leitor@example.com", toolId: "rosi" }), deps)).status).toBe(403);
    expect(getStore).not.toHaveBeenCalled();
  });
});
