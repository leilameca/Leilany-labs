
import { T, L } from "@/components/preferences";
import { PreferenceControls } from "./preferences";
export function SiteHeader({ activePage = "home" }: { activePage?: "home" | "lab" | "experiment" }) {
  return (
    <L as="header" className="site-header" aria-label="Global navigation">
      <L as="a" className="brand-mark" href={activePage === "home" ? "#top" : "/"} aria-label="LEILANY LABS home">
        <span className="brand-mark__index"><T>{"LL"}</T></span>
        <span className="brand-mark__name"><T>{"LEILANY LABS"}</T></span>
      </L>
      <L as="nav" className="site-nav" aria-label="Secondary navigation">
        <a href={activePage === "home" ? "#projects" : "/#projects"}><T>{"Projects"}</T></a>
        <a href={activePage === "home" ? "#about" : "/#about"}><T>{"About"}</T></a>
        <a className="nav-lab" href="/lab" aria-current={activePage === "lab" ? "page" : undefined}><T>{"Enter the lab"}</T></a>
      </L>
      <PreferenceControls />
    </L>
  );
}
