
import { T, L } from "@/components/preferences";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SolarCalculator } from "./solar-calculator";
import styles from "./solar.module.css";

export const metadata: Metadata = {
  title: "SolarCalc | LEILANY LABS",
  description: "Shape a preliminary solar system estimate with energy use, sunlight, and a rooftop that grows with your panel count.",
};

export default function SolarPage() {
  return (
    <div className={styles.page} id="top">
      <a className="skip-link" href="#solar-main"><T>{"Skip to calculator"}</T></a>
      <SiteHeader activePage="experiment" />
      <main className={styles.main} id="solar-main">
        <div className={styles.breadcrumb}><a href="/lab"><T>{"← Back to Lab"}</T></a><span><T>{"EXP.001 / ENERGY & ENGINEERING"}</T></span></div>
        <header className={styles.intro}><div><h1><T>{"SolarCalc"}</T><span><T>{"."}</T></span></h1><p><T>{"Your roof. A brighter possibility."}</T></p></div><p><T>{"Start with the energy you use."}</T><br /><T>{" See what the sun could help you build."}</T></p></header>
        <SolarCalculator />
      </main>
      <footer className="site-footer"><a className="footer-brand" href="/"><T>{"LEILANY LABS"}</T></a><span><T>{"Same brand. Different worlds."}</T></span><a href="/lab"><T>{"Back to Lab →"}</T></a></footer>
    </div>
  );
}
