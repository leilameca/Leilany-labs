"use client";
import { useState } from "react";
import { LabPage, NumberField, Paused, useCopy, labStyles as s } from "@/components/lab-primitives";
import { batteryExample, calculateBattery } from "@/experiments/battery/model";
import { estimate } from "@/experiments/numbers";
import styles from "./battery.module.css";

export function BatteryLab() {
  const { t, number } = useCopy();
  const [input, setInput] = useState(batteryExample);
  const result = estimate(() => calculateBattery(input));
  const field = (key: keyof typeof input, label: string, unit: string, min: number, max: number, step: number | "any" = "any") => <NumberField id={key} label={label} unit={unit} value={input[key]} onChange={value => setInput({ ...input, [key]: value })} min={min} max={max} step={step} />;
  return <LabPage code="EXP.003 / BATTERY LAB" title={t("A little more staying power.", "Energía que se queda contigo.")} intro={t("Build a battery bank. Follow its energy from stored capacity to useful backup time.", "Configura un banco de baterías. Sigue su energía desde la capacidad almacenada hasta el tiempo de respaldo.")} className={styles.page}>
    <div className={styles.bench}>
      <section className={s.panel}><h2>{t("01 / Your battery bank", "01 / Tu banco de baterías")}</h2><div className={s.fields}>
        {field("voltage", t("Unit voltage", "Voltaje por batería"), "V", 1, 1000)}{field("capacity", t("Unit capacity", "Capacidad por batería"), "Ah", .1, 100000)}
        {field("series", t("Units in series", "Baterías en serie"), t("units", "unidades"), 1, 100, 1)}{field("parallel", t("Parallel strings", "Ramas en paralelo"), t("strings", "ramas"), 1, 100, 1)}
        {field("depth", t("Usable depth of discharge", "Profundidad de descarga útil"), "%", 1, 100)}{field("efficiency", t("Conversion efficiency", "Eficiencia de conversión"), "%", 1, 100)}
        {field("load", t("Constant connected load", "Carga constante conectada"), "W", 1, 10000000)}
      </div><div className={s.actions}><button onClick={() => setInput(batteryExample)}>{t("Reset example", "Restablecer ejemplo")}</button></div><p className={s.note}>{t("Use the manufacturer's allowed discharge and efficiency. Example values are not battery recommendations.", "Usa la descarga permitida y eficiencia del fabricante. Los valores de ejemplo no son recomendaciones de baterías.")}</p></section>
      <section className={styles.instrument} aria-labelledby="battery-result"><span>02 / {t("ENERGY RESERVE", "RESERVA DE ENERGÍA")}</span><h2 id="battery-result">{t("Full of potential.", "Llena de posibilidades.")}</h2>
        {!result ? <Paused /> : <><div className={styles.battery} role="img" aria-label={t(`${result.depth}% usable discharge`, `${result.depth}% de descarga útil`)}><div style={{ height: `${result.depth}%` }} /><strong>{number(result.depth, 0)}%</strong></div><div className={styles.runtime}><strong data-testid="runtime">{number(result.runtime)}</strong><span>{t("hours of estimated backup", "horas estimadas de respaldo")}</span></div>
        <div className={styles.readouts}><div><span>{t("Nominal energy", "Energía nominal")}</span><strong>{number(result.storedWh / 1000)} kWh</strong></div><div><span>{t("Useful energy", "Energía útil")}</span><strong>{number(result.usableWh / 1000)} kWh</strong></div><div><span>{t("Bank configuration", "Configuración del banco")}</span><strong>{number(result.bankVoltage)} V · {number(result.bankAh)} Ah</strong></div></div></>}
      </section>
    </div>
    <details><summary>{t("What is behind the estimate?", "¿Cómo se calcula?")}</summary><p>Wh = V × Ah × {t("series × parallel", "serie × paralelo")}<br />{t("Runtime = Wh × discharge fraction × efficiency ÷ load watts.", "Duración = Wh × fracción de descarga × eficiencia ÷ carga en vatios.")}</p><p className={s.note}>{t("A constant-load estimate, not a wiring guide. Aging, temperature, discharge rate, inverter idle draw and startup surges are excluded. Verify equipment compatibility and protection with a qualified installer.", "Estimación de carga constante, no una guía de cableado. No incluye envejecimiento, temperatura, tasa de descarga, consumo en reposo del inversor ni picos de arranque. Verifica compatibilidad y protecciones con un instalador calificado.")}</p></details>
  </LabPage>;
}
