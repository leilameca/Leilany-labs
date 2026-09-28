
import { T, L } from "@/components/preferences";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ElectricityLab } from "./electricity-lab";
import styles from "./electricity.module.css";

export const metadata: Metadata = {
  title: "Electricity Consumption | LEILANY LABS",
  description: "Build a household load list and see how each appliance contributes to monthly electricity consumption.",
};

export default function ElectricityPage() {
  return (
    <div className={styles.page} id="top">
      <a className="skip-link" href="#electricity-main"><T>{"Skip to electricity lab"}</T></a>
      <SiteHeader activePage="experiment" />
      <main className={styles.main} id="electricity-main">
        <div className={styles.breadcrumb}><a href="/lab"><T>{"← Back to Lab"}</T></a><span><T>{"EXP.002 / ELECTRICAL FLOW"}</T></span></div>
        <header className={styles.intro}>
          <div><p><T>{"FOLLOW THE FLOW"}</T></p><h1><T>{"What is using"}</T><br /><T>{"your electricity?"}</T></h1></div>
          <p><T>{"Build the loads in your home. See each contribution connect to the energy you use every month."}</T></p>
        </header>
        <ElectricityLab />
      </main>
      <footer className="site-footer"><a className="footer-brand" href="/"><T>{"LEILANY LABS"}</T></a><span><T>{"Same family. Different personalities."}</T></span><a href="/lab"><T>{"Back to Lab →"}</T></a></footer>
    </div>
  );
}
