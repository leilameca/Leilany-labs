"use client";
import { T, L } from "@/components/preferences";


import { useEffect, useRef, useState, type FormEvent } from "react";
import { estimateSolar, example, fieldRules, type Field, type SolarDraft } from "@/experiments/solarcalc/model";
import { RoofScene } from "./roof-scene";
import styles from "./solar.module.css";
import { usePreferences, translate } from "@/components/preferences";

const number = (value: number, digits = 1) => value.toLocaleString("en-US", { maximumFractionDigits: digits });
const panelPresets = [450, 550, 625];

type SolarLookup = {
  state: "idle" | "loading" | "success" | "error";
  message: string;
};

type CountryOption = { code: string; name: string; flag: string };
type CityOption = { id: string; name: string; latitude: number; longitude: number };

export function SolarCalculator() {
  const { language } = usePreferences();
  const [countrySearch, setCountrySearch] = useState("");
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const countryName = (code: string, fallback: string) => new Intl.DisplayNames([language], { type: "region" }).of(code) || fallback;
  const [draft, setDraft] = useState<SolarDraft>({ ...example });
  const [revealed, setRevealed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [cityId, setCityId] = useState("");
  const [locationsState, setLocationsState] = useState<"loading" | "ready" | "error">("loading");
  const [solarLookup, setSolarLookup] = useState<SolarLookup>({ state: "idle", message: "" });
  const resultsRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const { result, errors } = estimateSolar(draft);
  useEffect(() => {
    let active = true;
    fetch("/api/locations").then(response => { if (!response.ok) throw new Error(); return response.json(); }).then((data: { countries?: CountryOption[] }) => {
      if (!active || !data.countries) return;
      setCountries(data.countries);
      setLocationsState("ready");
    }).catch(() => { if (active) setLocationsState("error"); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!countryCode) { setCities([]); setCityId(""); return; }
    const controller = new AbortController();
    setLocationsState("loading");
    setCities([]);
    setCityId("");
    setSolarLookup({ state: "idle", message: "" });
    fetch(`/api/locations?country=${countryCode}`, { signal: controller.signal }).then(response => { if (!response.ok) throw new Error(); return response.json(); }).then((data: { cities?: CityOption[] }) => {
      if (!data.cities) throw new Error();
      setCities(data.cities);
      setLocationsState("ready");
    }).catch(error => { if (error.name !== "AbortError") setLocationsState("error"); });
    return () => controller.abort();
  }, [countryCode]);
  function update(field: Field, value: string) {
    setDraft(current => ({ ...current, [field]: value }));
  }
  function resetExample() {
    setDraft({ ...example });
    setRevealed(false);
    setSolarLookup({ state: "idle", message: "" });
    setAnnouncement("Example restored.");
  }
  function selectPanelWatts(watts: number) {
    update("panelWatts", String(watts));
    setAnnouncement(`Panel power set to ${watts} watts.`);
  }
  function announce() {
    setAnnouncement(result ? `Estimate updated: ${number(result.installed, 2)} kilowatts peak, ${number(result.panels, 0)} panels.` : "Estimate paused. Check the marked inputs.");
  }
  function field(key: Field, step: number, label?: string) {
    const rule = fieldRules[key];
    return (
      <div className={styles.field}>
        <label htmlFor={key}><T>{label ?? rule.label}</T><T>{key === "roofArea" && <span><T>{"Optional"}</T></span>}</T></label>
        <div className={styles.unitInput}><input id={key} name={key} type="number" inputMode="decimal" min={rule.min} max={rule.max} step={step} value={draft[key]} onChange={event => update(key, event.target.value)} onBlur={announce} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} /><span><T>{rule.unit}</T></span></div>
        <T>{errors[key] && <p className={styles.error} id={`${key}-error`}><T>{errors[key]}</T></p>}</T>
      </div>
    );
  }
  function calculate(event: FormEvent) {
    event.preventDefault();
    if (!result) {
      const first = Object.keys(errors)[0];
      const input = document.getElementById(first);
      const details = input?.closest("details");
      if (details) details.open = true;
      input?.focus();
      setAnnouncement("Estimate paused. Check the marked inputs.");
      return;
    }
    setRevealed(true);
    announce();
    requestAnimationFrame(() => {
      const destination = matchMedia("(max-width: 760px)").matches ? visualRef.current : resultsRef.current;
      destination?.focus({ preventScroll: true });
      destination?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    });
  }
  async function useLocation() {
    const selectedCountry = countries.find(item => item.code === countryCode);
    const selectedCity = cities.find(item => item.id === cityId);
    if (!selectedCountry || !selectedCity) {
      setSolarLookup({ state: "error", message: "Select a country and city first." });
      return;
    }
    setSolarLookup({ state: "loading", message: "Finding the long-term solar average..." });
    try {
      const query = new URLSearchParams({
        city: selectedCity.name,
        country: selectedCountry.name,
        latitude: String(selectedCity.latitude),
        longitude: String(selectedCity.longitude),
      });
      const response = await fetch(`/api/solar-resource?${query}`);
      const data = await response.json() as {
        error?: string;
        sunHours?: number;
        location?: { name: string; region?: string; country: string };
      };
      if (!response.ok || data.sunHours === undefined || !data.location) {
        throw new Error(data.error || "Solar data is unavailable.");
      }
      const rounded = Math.round(data.sunHours * 10) / 10;
      update("sunHours", String(rounded));
      const place = [data.location.name, data.location.region, data.location.country].filter(Boolean).join(", ");
      const message = `${number(rounded)} peak sun hours per day applied for ${place}.`;
      setSolarLookup({ state: "success", message });
      setAnnouncement(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Solar data is unavailable.";
      setSolarLookup({ state: "error", message });
      setAnnouncement(message);
    }
  }
  return (
    <>
      <div className={styles.workspace} data-revealed={revealed}>
        <form className={styles.controls} onSubmit={calculate} noValidate>
          <div className={styles.controlHeading}><h2><T>{"Make it yours"}</T></h2><button type="button" onClick={resetExample}><T>{"Reset example"}</T></button></div>
          <p className={styles.exampleNote}><T>{"Example values to get started. Use your own bill and site assumptions."}</T></p>
          <div className={styles.consumption}>
            <T>{field("consumption", 1)}</T>
            <L as="input" className={styles.slider} aria-label="Monthly energy slider" type="range" min="50" max="3000" step="50" value={Math.min(3000, Math.max(50, Number(draft.consumption) || 50))} onChange={event => update("consumption", event.target.value)} onPointerUp={announce} onKeyUp={announce} />
            <div className={styles.rangeLabels}><span><T>{"50 kWh"}</T></span><span><T>{"3,000 kWh"}</T></span></div>
            <p><T>{"Your bill tells us how much energy solar needs to replace. Larger values can be entered directly."}</T></p>
          </div>
          <div className={styles.mobilePeek} aria-hidden="true"><RoofScene panels={result?.panels ?? null} shortage={false} /><div><strong><T>{result ? number(result.panels, 0) : "--"}</T><T>{" panels"}</T></strong><span><T>{result ? number(result.installed, 2) : "--"}</T><T>{" kWp preview"}</T></span></div></div>
          <div className={styles.coverage}>
            <T>{field("coverage", 1)}</T>
            <L as="input" className={styles.slider} aria-label="Desired solar coverage slider" type="range" min="1" max="100" step="1" value={Number(draft.coverage) || 1} onChange={event => update("coverage", event.target.value)} onPointerUp={announce} onKeyUp={announce} />
          </div>
          <div className={styles.paired}><T>{field("sunHours", 0.1)}</T><T>{field("panelWatts", 1)}</T></div>
          <L as="div" className={styles.panelPresets} aria-label="Panel power presets">
            <span><T>{"Quick panel choices"}</T></span>
            <div><T>{panelPresets.map(watts => <button key={watts} type="button" aria-pressed={draft.panelWatts === String(watts)} onClick={() => selectPanelWatts(watts)}><T>{watts}</T><T>{" W"}</T></button>)}</T></div>
          </L>
          <details className={styles.explanation}><summary><T>{"What are peak sun hours? "}</T><span aria-hidden="true"><T>{"+"}</T></span></summary><p><T>{"Equivalent hours of full-strength sunlight per day, not daylight hours. Use a value appropriate to your location, season, and panel orientation; 5.2 is an example, not a local forecast."}</T></p></details>
          <div className={styles.locationLookup}>
            <div className={styles.locationHeading}><div><strong><T>{"Estimate from a location"}</T></strong><span><T>{"Use a long-term annual solar average, then adjust it if needed."}</T></span></div><span aria-hidden="true"><T>{"☀"}</T></span></div>
            <div className={styles.locationFields}>
              <label htmlFor="countrySearch"><span><T>{"Search countries"}</T></span><L as="input" id="countrySearch" type="search" autoComplete="off" placeholder={translate("Search by country name...", language)} value={countrySearch} onChange={event => setCountrySearch(event.target.value)} aria-controls="locationCountry" /></label>
              <label htmlFor="locationCountry"><span><T>{"Country"}</T></span><select id="locationCountry" size={countrySearch ? 5 : 1} value={countryCode} onChange={event => { setCountryCode(event.target.value); setCountrySearch(""); }} disabled={!countries.length}><option value=""><T>{locationsState === "loading" && !countries.length ? "Loading countries..." : "Select a country"}</T></option><T>{countries.filter(item => normalize(countryName(item.code, item.name)).startsWith(normalize(countrySearch))).sort((a,b) => countryName(a.code,a.name).localeCompare(countryName(b.code,b.name), language)).map(item => <option key={item.code} value={item.code}><T>{countryName(item.code, item.name)}</T></option>)}</T></select></label>
              <label htmlFor="locationCity"><span><T>{"City"}</T></span><select id="locationCity" value={cityId} onChange={event => { setCityId(event.target.value); setSolarLookup({ state: "idle", message: "" }); }} disabled={!countryCode || locationsState === "loading" || !cities.length}><option value=""><T>{!countryCode ? "Choose a country first" : locationsState === "loading" ? "Loading cities..." : "Select a city"}</T></option><T>{cities.map(item => <option key={item.id} value={item.id}><T>{item.name}</T></option>)}</T></select></label>
            </div>
            <button className={styles.locationButton} type="button" onClick={useLocation} disabled={!cityId || solarLookup.state === "loading"}><T>{solarLookup.state === "loading" ? "Checking solar data..." : "Use location estimate"}</T></button>
            <T>{solarLookup.message && <p className={solarLookup.state === "error" ? styles.locationError : styles.locationStatus} role="status"><T>{solarLookup.message}</T></p>}</T>
            <T>{locationsState === "error" && <p className={styles.locationError} role="status"><T>{"Location lists are unavailable. Enter peak sun hours manually."}</T></p>}</T>
            <p className={styles.sourceNote}><T>{"Average daily horizontal solar irradiation, used here as a peak-sun-hours approximation. Country and city data from GeoNames via countries.dev; solar climatology by NASA POWER. This is not a roof-specific forecast."}</T></p>
          </div>
          <details className={styles.assumptions}><summary><span><T>{"Solar & roof assumptions"}</T><small><T>{draft.performance || "--"}</T><T>{"% performance · "}</T><T>{draft.days || "--"}</T><T>{" days"}</T></small></span><span aria-hidden="true"><T>{"+"}</T></span></summary>
            <div className={styles.paired}><T>{field("performance", 1)}</T><T>{field("days", 1)}</T></div>
            <p><T>{"Performance ratio combines system losses into one factor. This simplified estimate applies it once."}</T></p>
            <div className={styles.paired}><T>{field("moduleArea", 0.1)}</T><T>{field("allowance", 1)}</T></div>
            <p><T>{"The example uses 3 m² per panel plus 20% layout allowance. Replace these with module dimensions and a site-specific allowance; wattage alone does not determine panel size."}</T></p>
          </details>
          <T>{field("roofArea", 0.1)}</T>
          <button className={styles.calculate} type="submit"><T>{"See my estimate "}</T><span aria-hidden="true"><T>{"→"}</T></span></button>
          <T>{!result && <p className={styles.error}><T>{"Check your inputs to continue. No current estimate is shown."}</T></p>}</T>
        </form>
        <L as="div" className={styles.visual} ref={visualRef} tabIndex={-1} aria-label="Your estimated solar system">
          <div className={styles.visualHeading}><span><T>{"YOUR SOLAR SYSTEM"}</T></span><span><T>{result ? `${number(result.sunHours)} peak sun hours / day` : "Waiting for valid inputs"}</T></span></div>
          <div className={styles.capacity}><span><T>{"Estimated installed capacity"}</T></span><p><strong><T>{result ? number(result.installed, 2) : "--"}</T></strong><T>{" kWp"}</T></p></div>
          <RoofScene panels={result?.panels ?? null} shortage={result?.roofShortfall ?? false} />
          <div className={styles.panelSummary}><div><strong><T>{result ? number(result.panels, 0) : "--"}</T></strong><span><T>{"solar panels"}</T></span></div><div><strong><T>{result ? number(result.panelWatts, 0) : "--"}</T> <small><T>{"W"}</T></small></strong><span><T>{"per panel"}</T></span></div><div><strong><T>{result ? number(result.target, 2) : "--"}</T> <small><T>{"kWp"}</T></small></strong><span><T>{"calculated target"}</T></span></div></div>
          <p className={styles.rounding}><T>{"Whole panels, a little extra possibility. Installed capacity rounds your target up to complete modules."}</T></p>
          <T>{result?.roofShortfall && <p className={styles.warning}><T>{"More roof space may be needed: about "}</T><T>{number(result.roofRequired)}</T><T>{" m² estimated versus "}</T><T>{number(result.roofArea)}</T><T>{" m² entered. Your requested system has not been reduced."}</T></p>}</T>
        </L>
      </div>
      <p className={styles.disclaimer}><T>{"Preliminary estimate, not a final engineering design. Weather, shading, orientation, equipment, and installation conditions affect real production."}</T></p>
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true"><T>{announcement}</T></p>
      <T>{revealed && <section className={styles.results} ref={resultsRef} tabIndex={-1} aria-labelledby="results-title">
        <div className={styles.resultsHeading}><div><span className={styles.kicker}><T>{"YOUR ESTIMATE"}</T></span><h2 id="results-title"><T>{"Sunlight, put into numbers."}</T></h2></div><button type="button" onClick={() => { document.getElementById("consumption")?.focus(); document.getElementById("consumption")?.scrollIntoView({ block: "center" }); }}><T>{"Adjust inputs ↑"}</T></button></div>
        <T>{!result ? <p className={styles.warning}><T>{"Estimate paused. Correct the marked inputs to see updated results."}</T></p> : <>
          <div className={styles.resultGrid}>
            <div className={styles.production}><span><T>{"Estimated monthly production"}</T></span><p><strong><T>{number(result.production, 0)}</T></strong><T>{" kWh"}</T></p><L as="div" className={styles.energyBar} role="img" aria-label={`Production ${number(result.production)} kWh compared with consumption ${number(result.consumption)} kWh. ${number(result.actualCoverage)} percent.`}><span style={{ width: `${Math.min(100, result.actualCoverage)}%` }} /></L><div className={styles.barLabels}><span><T>{"Solar: "}</T><T>{number(result.production, 0)}</T><T>{" kWh"}</T></span><span><T>{"Use: "}</T><T>{number(result.consumption, 0)}</T><T>{" kWh"}</T></span></div><p className={styles.coverageResult}><strong><T>{number(result.actualCoverage)}</T><T>{"%"}</T></strong><T>{" of monthly energy use"}</T><br /><span><T>{number(result.coverage)}</T><T>{"% requested. Panel rounding explains the difference."}</T></span></p><T>{result.actualCoverage > 100 && <p className={styles.smallNote}><T>{"Production exceeds monthly consumption in this model. The bar stops at 100%; the estimate above is uncapped."}</T></p>}</T><p className={styles.smallNote}><T>{"Energy comparison only. This does not predict self-consumption, bill savings, or backup power."}</T></p></div>
            <div className={styles.roofResult}><span><T>{"Estimated roof area"}</T></span><p><strong><T>{number(result.roofRequired)}</T></strong><T>{" m²"}</T></p><div className={styles.areaDiagram} aria-hidden="true"><span><T>{number(result.panels, 0)}</T><T>{" modules"}</T></span><span><T>{"+ "}</T><T>{number(result.allowance)}</T><T>{"% allowance"}</T></span></div><p><T>{number(result.panels, 0)}</T><T>{" panels × "}</T><T>{number(result.moduleArea)}</T><T>{" m² × "}</T><T>{number(1 + result.allowance / 100, 2)}</T></p><p className={styles.smallNote}><T>{result.roofProvided ? (result.roofShortfall ? `Exceeds the ${number(result.roofArea)} m² entered. Review available space or your coverage target.` : `Within the ${number(result.roofArea)} m² entered by area alone; this does not confirm roof fit.`) : "Add available roof area to compare it with this estimate."}</T><T>{" Actual layout, access, setbacks, shading, and structure need a site assessment."}</T></p></div>
          </div>
          <details className={styles.math}><summary><T>{"How this estimate works "}</T><span aria-hidden="true"><T>{"+"}</T></span></summary>
            <ol>
              <li><span><T>{"Daily energy"}</T></span><code><T>{number(result.consumption)}</T><T>{" kWh ÷ "}</T><T>{result.days}</T><T>{" days = "}</T><T>{number(result.daily, 2)}</T><T>{" kWh/day"}</T></code></li>
              <li><span><T>{"Capacity target"}</T></span><code><T>{"("}</T><T>{number(result.daily, 2)}</T><T>{" × "}</T><T>{number(result.coverage / 100, 2)}</T><T>{") ÷ ("}</T><T>{result.sunHours}</T><T>{" × "}</T><T>{number(result.performance / 100, 2)}</T><T>{") = "}</T><T>{number(result.target, 2)}</T><T>{" kWp"}</T></code></li>
              <li><span><T>{"Whole panels"}</T></span><code><T>{"Round up("}</T><T>{number(result.target, 2)}</T><T>{" × 1,000 ÷ "}</T><T>{result.panelWatts}</T><T>{") = "}</T><T>{number(result.panels, 0)}</T><T>{" panels"}</T></code></li>
              <li><span><T>{"Installed capacity"}</T></span><code><T>{number(result.panels, 0)}</T><T>{" × "}</T><T>{result.panelWatts}</T><T>{" ÷ 1,000 = "}</T><T>{number(result.installed, 3)}</T><T>{" kWp"}</T></code></li>
              <li><span><T>{"Monthly production"}</T></span><code><T>{number(result.installed, 3)}</T><T>{" × "}</T><T>{result.sunHours}</T><T>{" × "}</T><T>{number(result.performance / 100, 2)}</T><T>{" × "}</T><T>{result.days}</T><T>{" = "}</T><T>{number(result.production, 1)}</T><T>{" kWh"}</T></code></li>
              <li><span><T>{"Energy coverage"}</T></span><code><T>{number(result.production, 1)}</T><T>{" ÷ "}</T><T>{number(result.consumption)}</T><T>{" × 100 = "}</T><T>{number(result.actualCoverage)}</T><T>{"%"}</T></code></li>
            </ol>
            <p><T>{"Calculations use full precision; displayed values are rounded. This is a simple energy-balance model for an assumed "}</T><T>{result.days}</T><T>{"-day month, not an hourly simulation or a seasonal forecast."}</T></p>
          </details>
        </>}</T>
      </section>}</T>
    </>
  );
}
