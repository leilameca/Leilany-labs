import { numeric } from "../numbers.ts";
export const batteryExample = { voltage: "12.8", capacity: "100", series: "1", parallel: "2", depth: "80", efficiency: "90", load: "300" };
export function calculateBattery(input: typeof batteryExample) {
  const voltage = numeric(input.voltage, 1, 1000), capacity = numeric(input.capacity, .1, 100000);
  const series = numeric(input.series, 1, 100, true), parallel = numeric(input.parallel, 1, 100, true);
  const depth = numeric(input.depth, 1, 100), efficiency = numeric(input.efficiency, 1, 100), load = numeric(input.load, 1, 10000000);
  const bankVoltage = voltage * series, bankAh = capacity * parallel, storedWh = bankVoltage * bankAh;
  const usableWh = storedWh * depth / 100 * efficiency / 100;
  return { bankVoltage, bankAh, storedWh, usableWh, runtime: usableWh / load, depth, series, parallel };
}
