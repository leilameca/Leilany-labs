import test from "node:test";
import assert from "node:assert/strict";
import { calculateElectricity, exampleAppliances } from "../src/experiments/electricity/model.ts";

test("example totals appliance energy and identifies the largest load", () => {
  const { result, errors } = calculateElectricity(exampleAppliances);
  assert.deepEqual(errors, {});
  assert.ok(Math.abs(result.totalDailyKwh - 8.8) < 1e-9);
  assert.ok(Math.abs(result.totalMonthlyKwh - 228) < 1e-9);
  assert.equal(result.topLoadId, "air-conditioner");
});

test("quantity, watts, hours, and active days all affect monthly energy", () => {
  const { result } = calculateElectricity([{ id: "test", name: "Test", quantity: "2", watts: "100", hours: "3", days: "10" }]);
  assert.equal(result.totalDailyKwh, .6);
  assert.equal(result.totalMonthlyKwh, 6);
});

test("invalid and empty loads never produce a result", () => {
  for (const item of [
    { id: "x", name: "", quantity: "1", watts: "100", hours: "1", days: "30" },
    { id: "x", name: "Load", quantity: "0", watts: "100", hours: "1", days: "30" },
    { id: "x", name: "Load", quantity: "1", watts: "NaN", hours: "1", days: "30" },
    { id: "x", name: "Load", quantity: "1", watts: "100", hours: "25", days: "30" },
  ]) assert.equal(calculateElectricity([item]).result, null);
  assert.equal(calculateElectricity([]).result, null);
});
