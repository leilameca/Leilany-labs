export type ApplianceDraft = {
  id: string;
  name: string;
  quantity: string;
  watts: string;
  hours: string;
  days: string;
};

export type ApplianceField = Exclude<keyof ApplianceDraft, "id">;

export const applianceRules = {
  quantity: { min: 1, max: 100, label: "quantity" },
  watts: { min: 1, max: 100_000, label: "watts" },
  hours: { min: 0.1, max: 24, label: "hours per day" },
  days: { min: 1, max: 31, label: "days per month" },
} as const;

export const exampleAppliances: ApplianceDraft[] = [
  { id: "refrigerator", name: "Refrigerator", quantity: "1", watts: "150", hours: "8", days: "30" },
  { id: "air-conditioner", name: "Air conditioner", quantity: "1", watts: "1200", hours: "6", days: "25" },
  { id: "lighting", name: "LED lighting", quantity: "8", watts: "10", hours: "5", days: "30" },
];

export function calculateElectricity(appliances: ApplianceDraft[]) {
  const errors: Record<string, Partial<Record<ApplianceField, string>>> = {};

  if (!appliances.length) {
    return { errors, formError: "Add at least one appliance.", result: null };
  }

  const rows = appliances.map(appliance => {
    const rowErrors: Partial<Record<ApplianceField, string>> = {};
    if (!appliance.name.trim()) rowErrors.name = "Enter a name.";

    const values = {} as Record<keyof typeof applianceRules, number>;
    for (const field of Object.keys(applianceRules) as Array<keyof typeof applianceRules>) {
      const rule = applianceRules[field];
      const raw = appliance[field];
      const value = Number(raw);
      if (!raw.trim() || !Number.isFinite(value) || value < rule.min || value > rule.max) {
        rowErrors[field] = `Use ${rule.min}–${rule.max.toLocaleString("en-US")}.`;
      }
      values[field] = value;
    }
    if (Object.keys(rowErrors).length) errors[appliance.id] = rowErrors;

    const dailyKwh = values.quantity * values.watts * values.hours / 1000;
    const monthlyKwh = dailyKwh * values.days;
    return { ...appliance, ...values, dailyKwh, monthlyKwh };
  });

  if (Object.keys(errors).length) return { errors, formError: "", result: null };

  const totalDailyKwh = rows.reduce((sum, row) => sum + row.dailyKwh, 0);
  const totalMonthlyKwh = rows.reduce((sum, row) => sum + row.monthlyKwh, 0);
  const ranked = [...rows].sort((a, b) => b.monthlyKwh - a.monthlyKwh);
  return {
    errors,
    formError: "",
    result: {
      rows: rows.map(row => ({
        ...row,
        share: totalMonthlyKwh ? row.monthlyKwh / totalMonthlyKwh * 100 : 0,
      })),
      totalDailyKwh,
      totalMonthlyKwh,
      topLoadId: ranked[0]?.id ?? "",
    },
  };
}

export type ElectricityResult = NonNullable<ReturnType<typeof calculateElectricity>["result"]>;
