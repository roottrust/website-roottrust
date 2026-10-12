import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "../../../scripts/ops/csv";

describe("csv", () => {
  it.each(["=1+1", "+cmd", "-2+3", "@SUM(A1)", '  =HYPERLINK("x")', "\t=1", "\r=1", "\n@x", "\u0000=1"])("neutraliza %j", (value) => {
    const cell = csvCell(value);
    expect(cell).toMatch(/^"'/);
    expect(cell.replace(/^"'/, "")).toContain(value.replace(/[\u0000-\u001f]/g, " ").replace(/"/g, '""').trim());
  });

  it("não altera texto comum e escapa aspas (RFC 4180)", () => {
    expect(csvCell('Ana "A", Silva')).toBe('"Ana ""A"", Silva"');
    expect(csvCell("a-b")).toBe('"a-b"');
    expect(csvCell(undefined)).toBe('""');
  });

  it("usa CRLF, BOM e nenhuma quebra interna de linha", () => {
    expect(toCsv(["a", "b"], [["x\ny", "=1"]])).toBe(`﻿"a","b"\r\n"x y","'=1"\r\n`);
  });

  it("neutraliza também o cabeçalho", () => {
    expect(toCsv(["=x"], [])).toContain(`"'=x"`);
  });
});
