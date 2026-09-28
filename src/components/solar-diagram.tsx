
import { T, L } from "@/components/preferences";
export function SolarDiagram() {
  return (
    <L as="div" className="solar-diagram" aria-label="Abstract solar energy diagram">
      <div className="solar-diagram__sun" aria-hidden="true" />
      <div className="solar-diagram__ray solar-diagram__ray--one" />
      <div className="solar-diagram__ray solar-diagram__ray--two" />
      <div className="solar-diagram__ray solar-diagram__ray--three" />
      <div className="solar-diagram__panel" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="solar-diagram__formula">
        <span><T>{"kWh/day"}</T></span>
        <span><T>{"panel W"}</T></span>
        <span><T>{"roof area"}</T></span>
      </div>
    </L>
  );
}
