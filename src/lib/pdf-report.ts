import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { PdfReport } from "../components/pdf-export";
// Normalize mathematical punctuation outside Helvetica's WinAnsi repertoire.
const text = (s: string) => s.replace(/\u202f|\u00a0/g, " ").replace(/[−–—‑]/g, "-").replace(/→|↗/g, "->").replace(/⁻ⁿ/g, "^(-n)");
export async function createReport(report: PdfReport, language: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const blue: [number, number, number] = [40, 86, 232];
  const ink: [number, number, number] = [37, 39, 37];
  const margin = 16;
  doc.setProperties({ title: report.title, author: "LEILANY LABS", subject: report.summary });
  doc.setLanguage(language === "es" ? "es" : "en");
  doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  const title = doc.splitTextToSize(text(report.title), 178);
  doc.setTextColor(...ink); doc.text(title, margin, 32);
  let y = 32 + title.length * 8;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  const summary = doc.splitTextToSize(text(report.summary), 178);
  doc.text(summary, margin, y); y += summary.length * 5 + 9;
  function section(heading: string, rows: string[][], head?: string[]) {
    if (!rows.length) return;
    if (y > 245) { doc.addPage(); y = 30; }
    autoTable(doc, {
      startY: y,
      head: [[{content: text(heading), colSpan: rows[0].length, styles: {fillColor: [255,255,255], textColor: ink, fontSize: 12, cellPadding: {top: 0, bottom: 4, left: 0, right: 0}}}], ...(head ? [head.map(text)] : [])],
      body: rows.map(row => row.map(text)),
      theme: head ? "striped" : "plain", margin: { top: 30, bottom: 22, left: margin, right: margin },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2.5, textColor: ink, overflow: "linebreak" },
      headStyles: { fillColor: blue, textColor: [255, 255, 255] },
      columnStyles: !head && rows[0]?.length === 2 ? { 0: { fontStyle: "bold", cellWidth: 72 } } : {},
      rowPageBreak: rows[0].length === 1 ? "auto" : "avoid",
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }
  section(language === "es" ? "Datos usados" : "Inputs used", report.inputs ?? []);
  section(language === "es" ? "Resultado" : "Result", report.results);
  for (const table of report.tables ?? []) section(table.title, table.body, table.head);
  section(language === "es" ? "Notas y supuestos" : "Notes and assumptions", (report.notes ?? []).filter(Boolean).map(note => [note]));
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page); doc.setFillColor(...blue); doc.rect(0, 0, 210, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setTextColor(...blue); doc.setFontSize(9);
    doc.text(report.code, margin, 20);
    doc.setFont("helvetica", "normal"); doc.setTextColor(97, 99, 95); doc.setFontSize(8);
    doc.text("LEILANY LABS · leilanylabs.vercel.app", margin, 287);
    doc.text(`${page} / ${pages}`, 194, 287, { align: "right" });
  }
  return doc;
}
