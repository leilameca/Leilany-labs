export const fieldRules = {
  consumption: { label: "Monthly energy", min: 1, max: 100000, unit: "kWh" },
  coverage: { label: "Desired coverage", min: 1, max: 100, unit: "%" },
  sunHours: { label: "Peak sun hours", min: 0.1, max: 12, unit: "h/day" },
  performance: { label: "Performance ratio", min: 10, max: 100, unit: "%" },
  panelWatts: { label: "Panel power", min: 50, max: 1000, unit: "W" },
  days: { label: "Days per month", min: 28, max: 31, unit: "days" },
  moduleArea: { label: "Module footprint", min: 0.5, max: 10, unit: "m²" },
  allowance: { label: "Layout allowance", min: 0, max: 100, unit: "%" },
  roofArea: { label: "Available roof area", min: 0.1, max: 100000, unit: "m²" },
} as const;

export type Field = keyof typeof fieldRules;
export type SolarDraft = Record<Field, string>;
export const example: SolarDraft = {
  consumption: "900", coverage: "90", sunHours: "5.2", performance: "80",
  panelWatts: "625", days: "30", moduleArea: "3", allowance: "20", roofArea: "",
};

export function estimateSolar(draft: SolarDraft) {
  const errors: Partial<Record<Field, string>> = {};
  const values = { roofArea: 0 } as Record<Field, number>;
  for (const key of Object.keys(fieldRules) as Field[]) {
    const rule = fieldRules[key];
    if (key === "roofArea" && draft[key].trim() === "") continue;
    const value = Number(draft[key]);
    if (!draft[key].trim() || !Number.isFinite(value) || value < rule.min || value > rule.max) {
      errors[key] = `Enter ${rule.min} to ${rule.max.toLocaleString("en-US")} ${rule.unit}.`;
    } else if (key === "days" && !Number.isInteger(value)) {
      errors[key] = "Enter a whole number of days.";
    }
    values[key] = value;
  }
  if (Object.keys(errors).length) return { errors, result: null };
  const daily = values.consumption / values.days;
  const target = daily * (values.coverage / 100) / (values.sunHours * values.performance / 100);
  const rawPanels = target * 1000 / values.panelWatts;
  // Avoid an extra panel when floating-point noise lands just above an integer.
  const panels = Math.ceil(rawPanels - Number.EPSILON * Math.max(1, rawPanels) * 4);
  const installed = panels * values.panelWatts / 1000;
  const production = installed * values.sunHours * values.performance / 100 * values.days;
  const roofRequired = panels * values.moduleArea * (1 + values.allowance / 100);
  return {
    errors,
    result: {
      ...values, daily, target, panels, installed, production, roofRequired,
      actualCoverage: production / values.consumption * 100,
      roofProvided: draft.roofArea.trim() !== "",
      roofShortfall: draft.roofArea.trim() !== "" && roofRequired > values.roofArea,
    },
  };
}

export type SolarResult = NonNullable<ReturnType<typeof estimateSolar>["result"]>;
