
import { T, L } from "@/components/preferences";
type ArtworkKind = "solar" | "power" | "battery" | "construction" | "paint" | "climate" | "finance" | "quote" | "furniture" | "work";

export function ToolArtwork({ kind }: { kind: ArtworkKind }) {
  return (
    <div className={`tool-artwork illustration-${kind}`} aria-hidden="true">
      <T>{kind === "solar" && <><div className="sun-disc" /><div className="solar-cloud" /><div className="panel-stand" /><div className="solar-panel"><T>{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</T></div></>}</T>
      <T>{kind === "power" && <><div className="power-cable" /><div className="power-plug"><i /><i /></div><div className="power-readout"><span><T>{"DAILY ENERGY"}</T></span><strong><T>{"kWh"}</T></strong><div className="usage-bars"><T>{[30, 55, 42, 85, 65, 100, 75].map((height, i) => <i style={{ height: `${height}%` }} key={i} />)}</T></div></div></>}</T>
      <T>{kind === "battery" && <><div className="battery-unit"><i /><i /><i /><i /></div><div className="battery-reading"><strong><T>{"100"}</T><span><T>{"%"}</T></span></strong><span><T>{"READY FOR WHAT'S NEXT"}</T></span></div><div className="battery-caption"><T>{"V × Ah = Wh"}</T></div></>}</T>
      <T>{kind === "construction" && <><div className="build-dimension"><T>{"4.20 m"}</T></div><div className="brick-stack"><T>{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</T></div><div className="build-ruler"><T>{"cm "}</T><span><T>{"10"}</T></span><span><T>{"20"}</T></span><span><T>{"30"}</T></span></div></>}</T>
      <T>{kind === "paint" && <><div className="paint-wall"><div className="paint-window" /><div className="paint-color" /></div><div className="paint-roller"><i /></div><div className="paint-swatches"><i /><i /><i /><i /></div></>}</T>
      <T>{kind === "climate" && <><div className="ac-unit"><span><T>{"22°"}</T></span><i /></div><div className="airflow"><i /><i /><i /></div><div className="temperature"><T>{"22"}</T><span><T>{"°C"}</T></span></div><span className="climate-caption"><T>{"JUST RIGHT."}</T></span></>}</T>
      <T>{kind === "finance" && <><div className="finance-axis"><span><T>{"NOW"}</T></span><span><T>{"LATER"}</T></span></div><div className="finance-chart"><T>{[24, 38, 53, 69, 87].map((height, i) => <i style={{ height: `${height}%` }} key={i} />)}</T></div><div className="finance-coin"><T>{"$"}</T></div><span className="finance-caption"><T>{"Time is part of the equation."}</T></span></>}</T>
      <T>{kind === "quote" && <><div className="quote-sheet"><span><T>{"ESTIMATE / 001"}</T></span><strong><T>{"Good work."}</T><br /><T>{"On paper."}</T></strong><i /><i /><i /><div><T>{"TOTAL "}</T><b><T>{"$"}</T></b></div></div><div className="quote-seal"><T>{"OK"}</T></div></>}</T>
      <T>{kind === "furniture" && <><div className="desk"><div className="desk-top" /><div className="desk-leg leg-left" /><div className="desk-leg leg-right" /><div className="desk-drawer" /></div><div className="wood-samples"><i /><i /><i /></div><span className="furniture-caption"><T>{"MATERIAL + CRAFT + CARE"}</T></span></>}</T>
      <T>{kind === "work" && <><div className="work-calendar"><span><T>{"YOUR TIME COUNTS"}</T></span><div><T>{Array.from({ length: 21 }, (_, i) => <i key={i}><T>{i + 1}</T></i>)}</T></div></div><div className="work-tab"><T>{"RD"}</T></div><span className="work-caption"><T>{"Every day adds up."}</T></span></>}</T>
    </div>
  );
}
