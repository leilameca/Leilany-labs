"use client";
import { useState } from "react";
import { usePreferences } from "./preferences";
type Row = [string, string];
export type PdfReport = {
  filename: string; code: string; title: string; summary: string;
  inputs?: Row[]; results: Row[];
  tables?: { title: string; head: string[]; body: string[][] }[];
  notes?: string[];
};
// Read localized labels/units and current values, including closed assumptions.
// Range controls duplicate numeric inputs and are deliberately omitted.
function currentInputs(root: Element, language: string): Row[] {
  return Array.from(root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea"))
    .filter(el => !["range", "search", "hidden", "button", "submit"].includes(el.type) && !el.disabled)
    .map(el => {
      const label = el.labels?.[0]?.cloneNode(true) as HTMLElement | undefined;
      label?.querySelectorAll("input,select,textarea,[role=alert]").forEach(node => node.remove());
      label?.querySelectorAll("span,small").forEach(node => node.prepend(" "));
      const group = el.closest("fieldset")?.querySelector("legend")?.textContent?.trim();
      const unit = el.parentElement?.querySelector(":scope > input + span")?.textContent;
      const name = [group, label?.textContent?.trim() || el.getAttribute("aria-label") || el.name || el.id].filter(Boolean).join(" / ");
      const value = el instanceof HTMLSelectElement ? el.selectedOptions[0]?.textContent || ""
        : el instanceof HTMLInputElement && el.type === "checkbox" ? (el.checked ? (language === "es" ? "Sí" : "Yes") : "No")
        : el.value || "-";
      return [name, `${value}${unit ? ` ${unit}` : ""}`];
    });
}
export function PdfExport({ disabled = false, ...report }: PdfReport & { disabled?: boolean }) {
  const { language } = usePreferences();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function download(event: React.MouseEvent<HTMLButtonElement>) {
    if (busy || disabled) return;
    const root = event.currentTarget.closest("main");
    // Snapshot before asynchronous imports so edits cannot mix two estimates.
    const methodNotes = root ? Array.from(root.querySelectorAll("details p, p[class*='note'], p[class*='Note'], [class*='note'] > p, [class*='Note'] > p, p[class*='caveat'], [class*='scope'] > p"))
      .map(node => {
        const copy = node.cloneNode(true) as HTMLElement;
        copy.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
        copy.querySelectorAll<HTMLAnchorElement>("a[href^='http']").forEach(link => link.append(` (${link.href})`));
        return copy.textContent?.trim() || "";
      }).filter(Boolean) : [];
    const snapshot = { ...report, inputs: report.inputs ?? (root ? currentInputs(root, language) : []),
      notes: [...new Set([...(report.notes ?? []), ...methodNotes])] };
    setBusy(true); setError(false);
    try {
      const { createReport } = await import("@/lib/pdf-report");
      const doc = await createReport(snapshot, language);
      doc.save(`${report.filename}.pdf`);
    } catch { setError(true); }
    finally { setBusy(false); }
  }
  return <span className="pdf-export"><button type="button" data-testid="pdf-export" onClick={download} disabled={disabled || busy} aria-busy={busy}>
    {busy ? (language === "es" ? "Preparando PDF…" : "Preparing PDF…") : (language === "es" ? "Descargar PDF" : "Download PDF")}
  </button>{error && <span role="alert">{language === "es" ? "No se pudo crear el PDF. Inténtalo de nuevo." : "Could not create the PDF. Please try again."}</span>}</span>;
}
