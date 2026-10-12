const FORMULA_TRIGGER = /^[=+\-@]/;

// Every cell is neutralized: spreadsheets evaluate formulas in any text cell, and quoting does not stop that.
export function csvCell(value: unknown): string {
  const text = value === undefined || value === null ? "" : String(value).replace(/\r\n|\r|\n/g, " ");
  const safe = FORMULA_TRIGGER.test(text.trimStart()) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

// UTF-8 BOM so spreadsheets read accented names correctly; RFC 4180 line endings.
export function toCsv(header: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const lines = [header, ...rows].map((cells) => cells.map(csvCell).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
