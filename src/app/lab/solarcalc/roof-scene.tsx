
import { T, L } from "@/components/preferences";
import styles from "./solar.module.css";

export function RoofScene({ panels, shortage }: { panels: number | null; shortage: boolean }) {
  const shown = Math.min(panels ?? 0, 36);
  const columns = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(shown * 1.4))));
  const rows = Math.ceil(shown / columns);
  const scale = Math.min(1, 270 / (columns * 59), 240 / (Math.max(rows, 1) * 45));
  const width = columns * 59 - 6;
  const depth = Math.max(rows, 1) * 45 - 7;
  const originX = 360 - (.8 * width + .9 * depth) * scale / 2;
  const originY = 246 - (-.28 * width + .291 * depth) * scale / 2;
  return (
    <figure className={styles.roofFigure}>
      <L as="svg" className={styles.roofSvg} viewBox="0 0 720 490" role="img" aria-label={panels === null ? "Rooftop waiting for valid inputs" : `Schematic rooftop: ${panels} panels${panels > 36 ? ", represented by 36 module symbols" : ""}. Not an installation layout.`}>
        <path className={styles.sunPath} d="M100 172 Q360 -65 625 172" />
        <circle className={styles.sun} cx="558" cy="94" r="48" />
        <path className={styles.sunRays} d="M558 27V16 M558 161v11 M491 94h-11 M625 94h11 M510 46l-8-8 M606 142l8 8 M510 142l-8 8 M606 46l8-8" />
        <ellipse className={styles.ground} cx="360" cy="425" rx="268" ry="28" />
        <polygon className={styles.wallFront} points="102,258 365,353 365,448 102,353" />
        <polygon className={styles.wallSide} points="365,353 618,259 618,354 365,448" />
        <polygon className={styles.roofEdge} points="86,246 348,143 635,246 365,350" />
        <polygon className={shortage ? styles.roofShort : styles.roofSurface} points="102,245 348,159 617,246 365,335" />
        <path className={styles.parapet} d="M102 245v-12l246-86 269 87v12 M348 147v12" />
        <path className={styles.window} d="M136 293l50 18v45l-50-18z M215 322l50 18v45l-50-18z M415 354l58-21v43l-58 21z M515 318l58-21v43l-58 21z" />
        <path className={styles.windowLine} d="M160 302v43 M240 331v43 M444 344v42 M544 308v42" />
        <g transform={`matrix(.8 -.28 .9 .291 ${originX} ${originY}) scale(${scale})`}>
          <T>{Array.from({ length: shown }, (_, index) => (
            <g key={index} transform={`translate(${index % columns * 59} ${Math.floor(index / columns) * 45})`} data-panel="">
              <g className={styles.module}>
                <rect className={styles.moduleEdge} x="0" y="3" width="53" height="38" rx="2" />
                <rect className={styles.moduleFace} width="53" height="36" rx="2" />
                <path className={styles.moduleLines} d="M17.7 1v34 M35.3 1v34 M1 12h51 M1 24h51" />
              </g>
            </g>
          ))}</T>
        </g>
      </L>
      <figcaption><T>{panels !== null && panels > 36 ? `36 module symbols represent ${panels.toLocaleString("en-US")} panels. ` : ""}</T><T>{"Schematic rooftop. Not an installation layout."}</T></figcaption>
    </figure>
  );
}
