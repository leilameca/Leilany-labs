import test from "node:test";
import assert from "node:assert/strict";
import { estimateSolar, example } from "../src/experiments/solarcalc/model.ts";

test("approved 900 kWh example distinguishes target from whole-panel capacity", () => {
  const { result, errors } = estimateSolar(example);
  assert.deepEqual(errors, {});
  assert.equal(result.panels, 11);
  assert.ok(Math.abs(result.target - 6.490384615384615) < 1e-10);
  assert.equal(result.installed, 6.875);
  assert.ok(Math.abs(result.production - 858) < 1e-9);
  assert.ok(Math.abs(result.roofRequired - 39.6) < 1e-9);
  assert.ok(Math.abs(result.actualCoverage - 95.33333333333333) < 1e-9);
  assert.equal(result.roofProvided, false);
});
test("exact panel boundary does not round up an extra module", () => {
  const { result } = estimateSolar({ ...example, consumption: "780", coverage: "100" });
  assert.equal(result.panels, 10);
  assert.equal(result.installed, 6.25);
});
test("roof shortage reports mismatch without shrinking the target", () => {
  const { result } = estimateSolar({ ...example, roofArea: "20" });
  assert.equal(result.roofShortfall, true);
  assert.equal(result.panels, 11);
});
test("zero, blank, nonfinite, and invalid assumptions produce no result", () => {
  for (const patch of [{ sunHours: "0" }, { consumption: "" }, { performance: "NaN" }, { panelWatts: "Infinity" }, { coverage: "101" }, { roofArea: "-2" }, { days: "30.5" }]) {
    const output = estimateSolar({ ...example, ...patch });
    assert.equal(output.result, null);
    assert.ok(Object.keys(output.errors).length);
  }
});
test("production coverage may exceed 100 percent and is not clamped", () => {
  const { result } = estimateSolar({ ...example, consumption: "1", coverage: "100" });
  assert.equal(result.panels, 1);
  assert.ok(result.actualCoverage > 100);
});
test("more sunlight needs fewer panels; greater demand needs more", () => {
  const base = estimateSolar(example).result;
  assert.ok(estimateSolar({ ...example, sunHours: "7" }).result.panels < base.panels);
  assert.ok(estimateSolar({ ...example, consumption: "1800" }).result.panels > base.panels);
});
