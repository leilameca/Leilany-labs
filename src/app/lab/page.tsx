
import { T, L } from "@/components/preferences";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ToolsLibrary } from "./tools-library";
import styles from "./lab.module.css";

export const metadata: Metadata = {
  title: "The Lab | LEILANY LABS",
  description: "Explore ten small worlds of useful software: energy, spaces, money, and work. A collection of experiments by LEILANY LABS.",
};

export default function LabPage() {
  return (
    <div id="top" className={styles.page}>
      <a className="skip-link" href="#lab-main"><T>{"Skip to tools"}</T></a>
      <SiteHeader activePage="lab" />
      <main id="lab-main" className={styles.main}>
        <header className={styles.intro}>
          <div>
            <p className={styles.eyebrow}><T>{"CURIOSITY, PUT TO WORK"}</T></p>
            <h1><T>{"The Lab"}</T><span><T>{"."}</T></span></h1>
          </div>
          <div className={styles.introCopy}>
            <p><T>{"Small tools. A world of possibilities."}</T></p>
            <span><T>{"For the things you want to figure out, build, or make a little better."}</T></span>
          </div>
        </header>
        <ToolsLibrary />
      </main>
      <footer className="site-footer">
        <a className="footer-brand" href="/"><T>{"LEILANY LABS"}</T></a>
        <span><T>{"Same brand. Different worlds."}</T></span>
        <a href="#top"><T>{"Back to top "}</T><span aria-hidden="true"><T>{"↑"}</T></span></a>
      </footer>
    </div>
  );
}
