"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { usePreferences } from "./preferences";
import styles from "./lab-primitives.module.css";

export function useCopy() {
  const { language } = usePreferences();
  return { language, t: (en: string, es: string) => language === "es" ? es : en,
    number: (value: number, digits = 2) => value.toLocaleString(language === "es" ? "es-DO" : "en-US", { maximumFractionDigits: digits }) };
}

export function LabPage({ code, title, intro, children, className = "" }: { code: string; title: string; intro: string; children: ReactNode; className?: string }) {
  const { t } = useCopy();
  return <div id="top" className={`${styles.page} ${className}`}>
    <a className="skip-link" href="#experiment-main">{t("Skip to calculator", "Saltar a la calculadora")}</a>
    <SiteHeader activePage="experiment" />
    <main id="experiment-main" className={styles.main}>
      <div className={styles.breadcrumb}><a href="/lab">{t("← Back to Lab", "← Volver al laboratorio")}</a><span>{code}</span></div>
      <header className={styles.intro}><h1>{title}</h1><p>{intro}</p></header>
      {children}
    </main>
    <footer className="site-footer"><a className="footer-brand" href="/">LEILANY LABS</a><a href="/lab">{t("Explore the lab →", "Explorar el laboratorio →")}</a></footer>
  </div>;
}

export function NumberField({ id, label, value, onChange, min = 0, max = 100000000, step = "any", unit }: { id: string; label: string; value: string; onChange: (value: string) => void; min?: number; max?: number; step?: number | "any"; unit?: string }) {
  const invalid = value.trim() === "" || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max || (step === 1 && !Number.isInteger(Number(value)));
  const { t } = useCopy();
  return <label className={styles.field} htmlFor={id}><span>{label} {unit && <small>({unit})</small>}</span><input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} value={value} onChange={event => onChange(event.target.value)} aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined} />{invalid && <small className={styles.error} id={`${id}-error`}>{t(`Enter ${min}–${max}${step === 1 ? " (whole number)" : ""}.`, `Introduce ${min}–${max}${step === 1 ? " (número entero)" : ""}.`)}</small>}</label>;
}

export function Paused() { const { t } = useCopy(); return <p role="status" className={styles.note}>{t("Correct the marked values to see your estimate.", "Corrige los valores marcados para ver la estimación.")}</p>; }
export { styles as labStyles };
