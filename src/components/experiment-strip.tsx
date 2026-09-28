
import { T, L } from "@/components/preferences";
import type { ExperimentDefinition } from "@/experiments/types";

type ExperimentStripProps = {
  experiments: ExperimentDefinition[];
};

export function ExperimentStrip({ experiments }: ExperimentStripProps) {
  return (
    <L as="div" className="experiment-strip" aria-label="Experiment index">
      <T>{experiments.map((experiment) => (
        <a
          className="experiment-strip__item"
          href={`#${experiment.slug}`}
          key={experiment.number}
          style={
            {
              "--exp-primary": experiment.palette.primary,
              "--exp-secondary": experiment.palette.secondary,
            } as React.CSSProperties
          }
        >
          <span><T>{experiment.number}</T></span>
          <strong><T>{experiment.shortName}</T></strong>
        </a>
      ))}</T>
    </L>
  );
}
