
import { T, L } from "@/components/preferences";
import { SiteHeader } from "@/components/site-header";
import { ToolArtwork } from "@/components/tool-artwork";
import { experiments } from "@/experiments/registry";

const previews = [
  { title: "SolarCalc", description: "A little sunlight. A lot of possibility.", detail: "Explore the relationship between household energy use, solar panels, and the space on your roof.", kind: "solar" },
  { title: "Power", description: "Know where your energy goes.", detail: "Turn appliance wattage and hours of use into a clearer picture of your electricity consumption.", kind: "power" },
  { title: "Battery Lab", description: "Make every charge count.", detail: "Explore voltage, capacity, and the energy stored in a battery system.", kind: "battery" },
  { title: "Construction", description: "Big plans. Precise quantities.", detail: "Translate dimensions into material quantities for your next construction project.", kind: "construction" },
  { title: "Paint", description: "Your next room, figured out.", detail: "Plan paint coverage from wall area, coats, and the colors you have in mind.", kind: "paint" },
  { title: "Climate", description: "Find your comfort zone.", detail: "Understand the cooling capacity your room needs, with its size and conditions in mind.", kind: "climate" },
  { title: "Finance", description: "Give your numbers a future.", detail: "See how principal, interest, and time shape payments and long-term costs.", kind: "finance" },
  { title: "Quote", description: "Good work deserves a clear quote.", detail: "Bring services, quantities, pricing, and terms together in a considered client estimate.", kind: "quote" },
  { title: "Furniture", description: "From a sketch to a sensible budget.", detail: "Break a furniture project into materials, labor, and finishing costs.", kind: "furniture" },
  { title: "Work RD", description: "Your time. Your work. Your clarity.", detail: "Explore employment benefits in the Dominican Republic through salary and time worked.", kind: "work" },
] as const;

export default function Home() {
  return (
    <div id="top" className="home-shell">
      <a className="skip-link" href="#main"><T>{"Skip to content"}</T></a>
      <SiteHeader />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 className="eyebrow" id="hero-title"><T>{"LEILANY LABS "}</T><span><T>{"/"}</T></span><T>{" A DIGITAL ENGINEERING LAB"}</T></h1>
            <p className="hero-statement"><T>{"TINY TOOLS."}</T><br /><T>{"REAL PROBLEMS."}</T><br /><span><T>{"SMART SOLUTIONS."}</T></span></p>
            <p className="hero-description"><T>{"Everyday problems, meet useful software."}</T><br /><T>{" A playful collection of tools, built by a software engineer."}</T></p>
            <a className="primary-link" href="/lab"><T>{"Enter the lab "}</T><span aria-hidden="true"><T>{"→"}</T></span></a>
          </div>
          <L as="div" className="ecosystem" aria-label="A glimpse of the solar, paint, finance, and battery experiments">
            <L as="a" className="ecosystem-item ecosystem-solar" href="/lab/solarcalc" aria-label="Open SolarCalc"><span className="mini-label"><T>{"SUNLIGHT TO POSSIBILITY"}</T></span><ToolArtwork kind="solar" /><strong><T>{"SolarCalc"}</T></strong><span className="mini-index"><T>{"01"}</T></span></L>
            <L as="a" className="ecosystem-item ecosystem-paint" href="/lab/paint-calculator" aria-label="Explore the Paint concept"><ToolArtwork kind="paint" /><strong><T>{"A fresh coat."}</T></strong></L>
            <L as="a" className="ecosystem-item ecosystem-finance" href="/lab/finance-calculator" aria-label="Explore the Finance concept"><span className="mini-label"><T>{"A LITTLE LONG-TERM THINKING"}</T></span><ToolArtwork kind="finance" /><strong><T>{"Make it add up."}</T></strong></L>
            <L as="a" className="ecosystem-item ecosystem-battery" href="/lab/battery-lab" aria-label="Explore the Battery Lab concept"><ToolArtwork kind="battery" /><strong><T>{"Full of potential."}</T></strong></L>
          </L>
          <div className="hero-footnote"><span><T>{"Curiosity, put to work."}</T></span><span><T>{"10 experiments. Endless everyday possibilities."}</T></span></div>
        </section>
        <section id="lab" className="lab-section" aria-labelledby="projects-title">
          <div id="projects" className="section-heading">
            <div><p className="eyebrow"><T>{"SELECTED EXPERIMENTS"}</T></p><h2 id="projects-title"><T>{"Small tools."}</T><br /><T>{"Their own little worlds."}</T></h2></div>
            <p><T>{"Energy, spaces, money, and everything in between."}</T><br /><T>{"Different questions. The same curiosity."}</T></p>
          </div>
          <div className="project-gallery">
            <T>{previews.map((preview, index) => {
              const experiment = experiments[index];
              return (
                <article className={`project project-${preview.kind}`} key={experiment.number} id={experiment.slug}>
                  <T>{experiment.href ? <L as="a" className={`project-art project-art-link art-${preview.kind}`} href={experiment.href} aria-label={`Open ${experiment.name}`}>
                    <span className="experiment-number"><T>{experiment.number}</T></span>
                    <T>{index === 0 && <span className="featured-label"><T>{"FIRST UP IN THE LAB"}</T></span>}</T>
                    <ToolArtwork kind={preview.kind} />
                    <T>{index === 0 && <div className="solar-art-caption"><span><T>{"Made for brighter decisions."}</T></span><strong><T>{"Hello, sunshine."}</T></strong></div>}</T>
                  </L> : <div className={`project-art art-${preview.kind}`}>
                    <span className="experiment-number"><T>{experiment.number}</T></span>
                    <ToolArtwork kind={preview.kind} />
                  </div>}</T>
                  <div className="project-copy">
                    <div className="project-title"><h3><T>{experiment.href ? <a href={experiment.href}><T>{preview.title}</T></a> : preview.title}</T></h3><span className="project-status"><T>{experiment.href ? "Available" : "Planned"}</T></span></div>
                    <p><T>{preview.description}</T></p>
                    <details><summary><T>{"About this experiment "}</T><span aria-hidden="true"><T>{"+"}</T></span></summary><p><T>{preview.detail}</T> <span className="concept-note"><T>{experiment.href ? <a className="project-open-link" href={experiment.href}><T>{"Open working tool →"}</T></a> : "Concept preview. Tool coming in a future build."}</T></span></p></details>
                  </div>
                </article>
              );
            })}</T>
          </div>
        </section>
        <section id="about" className="about-section" aria-labelledby="about-title">
          <div className="about-symbol" aria-hidden="true"><span><T>{"{"}</T></span><i /><span><T>{"}"}</T></span></div>
          <div><p className="eyebrow"><T>{"THE ENGINEER BEHIND THE EXPERIMENTS"}</T></p><h2 id="about-title"><T>{"Thoughtfully designed."}</T><br /><T>{"Carefully engineered."}</T></h2><p><T>{"LEILANY LABS is my software engineering portfolio and a place to follow my curiosity. I turn everyday questions into small, useful applications, giving each problem the care and personality it deserves."}</T></p></div>
          <span className="about-signoff"><T>{"Same family."}</T><br /><strong><T>{"Different personalities."}</T></strong></span>
        </section>
      </main>
      <footer className="site-footer"><a className="footer-brand" href="#top"><T>{"LEILANY LABS"}</T></a><span><T>{"Built with logic. Made with personality."}</T></span><a href="#top"><T>{"Back to top "}</T><span aria-hidden="true"><T>{"↑"}</T></span></a></footer>
    </div>
  );
}
