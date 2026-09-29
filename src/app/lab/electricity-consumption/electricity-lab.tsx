"use client";
import { T, L, usePreferences, translate } from "@/components/preferences";
import { PdfExport } from "@/components/pdf-export";


import { useId, useState } from "react";
import { calculateElectricity, exampleAppliances, type ApplianceDraft, type ApplianceField } from "@/experiments/electricity/model";
import styles from "./electricity.module.css";

const format = (value: number, digits = 1) => value.toLocaleString("en-US", { maximumFractionDigits: digits });

export function ElectricityLab() {
  const { language } = usePreferences();
  const t = (en: string, es: string) => language === "es" ? es : en;
  const idPrefix = useId().replace(/:/g, "");
  const [appliances, setAppliances] = useState<ApplianceDraft[]>(() => exampleAppliances.map(item => ({ ...item })));
  const [announcement, setAnnouncement] = useState("");
  const { result, errors, formError } = calculateElectricity(appliances);

  function update(id: string, field: ApplianceField, value: string) {
    setAppliances(current => current.map(item => item.id === id ? { ...item, [field]: value } : item));
  }

  function addAppliance() {
    const id = `${idPrefix}-${Date.now()}`;
    setAppliances(current => [...current, { id, name: "New appliance", quantity: "1", watts: "100", hours: "1", days: "30" }]);
    setAnnouncement("Appliance added.");
  }

  function removeAppliance(id: string) {
    setAppliances(current => current.filter(item => item.id !== id));
    setAnnouncement("Appliance removed.");
  }

  function reset() {
    setAppliances(exampleAppliances.map(item => ({ ...item })));
    setAnnouncement("Example loads restored.");
  }

  return (
    <div className={styles.workbench}>
      <section className={styles.builder} aria-labelledby="loads-title">
        <div className={styles.builderHeading}><div><span><T>{"01 / APPLIANCES"}</T></span><h2 id="loads-title"><T>{"Build your load list"}</T></h2></div><button type="button" onClick={reset}><T>{"Reset example"}</T></button></div>
        <p className={styles.helper}><T>{"Use rated watts and the time each appliance actively draws that power. Standby use and cycling vary by device."}</T></p>
        <div className={styles.columnLabels} aria-hidden="true"><span><T>{"Appliance"}</T></span><span><T>{"Qty"}</T></span><span><T>{"Watts"}</T></span><span><T>{"h/day"}</T></span><span><T>{"days"}</T></span><span /></div>
        <div className={styles.loadList}>
          <T>{appliances.map((appliance, index) => {
            const rowErrors = errors[appliance.id] ?? {};
            return (
              <fieldset className={styles.loadRow} key={appliance.id}>
                <legend><T>{"Load "}</T><T>{index + 1}</T></legend>
                <label className={styles.nameField}><span><T>{"Appliance"}</T></span><input value={translate(appliance.name, language)} onChange={event => update(appliance.id, "name", event.target.value)} aria-invalid={!!rowErrors.name} /></label>
                <T>{(["quantity", "watts", "hours", "days"] as const).map(field => <label key={field}><span><T>{field === "quantity" ? "Qty" : field === "hours" ? "h/day" : field}</T></span><L as="input" type="number" min={field === "hours" ? .1 : 1} step={field === "hours" ? .1 : 1} inputMode="decimal" value={appliance[field]} onChange={event => update(appliance.id, field, event.target.value)} aria-invalid={!!rowErrors[field]} title={rowErrors[field]} /></label>)}</T>
                <L as="button" className={styles.remove} type="button" onClick={() => removeAppliance(appliance.id)} aria-label={`Remove ${appliance.name || `load ${index + 1}`}`}><T>{"×"}</T></L>
                <T>{Object.values(rowErrors).length > 0 && <p className={styles.rowError}><T>{Object.values(rowErrors)[0]}</T></p>}</T>
              </fieldset>
            );
          })}</T>
        </div>
        <button className={styles.add} type="button" onClick={addAppliance}><span aria-hidden="true"><T>{"+"}</T></span><T>{" Add another appliance"}</T></button>
        <T>{formError && <p className={styles.formError}><T>{formError}</T></p>}</T>
      </section>

      <section className={styles.flow} aria-labelledby="flow-title">
        <div className="pdf-actions"><PdfExport filename="electricity-consumption-estimate" code="EXP.002 / ELECTRICITY" title={t("Electricity consumption","Consumo eléctrico")} summary={t("Energy estimated from your appliance list.","Energía estimada a partir de tu lista de equipos.")} disabled={!result} results={result ? [[t("Monthly consumption","Consumo mensual"),`${format(result.totalMonthlyKwh)} kWh`],[t("Typical active day","Día activo típico"),`${format(result.totalDailyKwh,2)} kWh`]] : []} tables={result ? [{title:t("Contribution by load","Aporte por carga"),head:[t("Appliance","Equipo"),"kWh", "%"],body:result.rows.map(row=>[translate(row.name,language),format(row.monthlyKwh),format(row.share)])}] : []} /></div>
        <div className={styles.flowTop}><div><span><T>{"02 / ENERGY FLOW"}</T></span><h2 id="flow-title"><T>{"Every load leaves a trace."}</T></h2></div><span className={styles.live}><i /><T>{" LIVE ESTIMATE"}</T></span></div>
        <T>{!result ? <div className={styles.paused}><strong><T>{"Flow paused."}</T></strong><p><T>{"Correct the marked load values to reconnect the estimate."}</T></p></div> : <>
          <div className={styles.circuit}>
            <div className={styles.bus}><span><T>{"HOME LOADS"}</T></span></div>
            <div className={styles.nodes}>
              <T>{result.rows.map(row => <div className={styles.node} key={row.id} style={{ "--share": `${Math.max(8, row.share)}%` } as React.CSSProperties}>
                <span className={styles.connector} aria-hidden="true" />
                <div><strong><T>{row.name}</T></strong><span><T>{format(row.quantity, 0)}</T><T>{" × "}</T><T>{format(row.watts, 0)}</T><T>{" W · "}</T><T>{format(row.hours)}</T><T>{" h/day"}</T></span></div>
                <p><strong><T>{format(row.monthlyKwh)}</T></strong><T>{" kWh"}</T></p>
              </div>)}</T>
            </div>
            <div className={styles.meter}>
              <span><T>{"ESTIMATED MONTHLY USE"}</T></span>
              <p><strong><T>{format(result.totalMonthlyKwh)}</T></strong><T>{" kWh"}</T></p>
              <small><T>{format(result.totalDailyKwh, 2)}</T><T>{" kWh across a typical active day*"}</T></small>
            </div>
          </div>
          <div className={styles.breakdown}>
            <div className={styles.breakdownHeading}><span><T>{"CONTRIBUTION BY LOAD"}</T></span><span><T>{"Monthly energy"}</T></span></div>
            <T>{result.rows.map(row => <div className={styles.barRow} key={row.id}>
              <div><strong><T>{row.name}</T></strong><span><T>{format(row.share)}</T><T>{"%"}</T></span></div>
              <L as="div" className={styles.bar} role="img" aria-label={`${row.name}: ${format(row.share)} percent of estimated monthly consumption`}><span style={{ width: `${row.share}%` }} /></L>
              <span><T>{format(row.monthlyKwh)}</T><T>{" kWh"}</T></span>
            </div>)}</T>
          </div>
          <p className={styles.note}><T>{"*Daily use is the sum of each appliance's active daily energy; monthly totals also account for the entered days per month. This is an appliance estimate, not a utility-meter forecast."}</T></p>
        </>}</T>
      </section>
      <p className={styles.srOnly} role="status" aria-live="polite"><T>{announcement}</T></p>
    </div>
  );
}
