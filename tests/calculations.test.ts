import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAge,
  calculateBmi,
  calculateCalories,
  imperialToMetric,
} from "../app/calculations.ts";

test("calculates metric and imperial BMI consistently", () => {
  assert.deepEqual(calculateBmi(70, 175), { value: 22.9, category: "Healthy weight" });
  const metric = imperialToMetric(5, 9, 154.324);
  assert.equal(calculateBmi(metric.weightKg, metric.heightCm).value, 22.8);
});

test("classifies BMI boundaries", () => {
  assert.equal(calculateBmi(50, 170).category, "Underweight");
  assert.equal(calculateBmi(72, 170).category, "Healthy weight");
  assert.equal(calculateBmi(80, 170).category, "Overweight");
  assert.equal(calculateBmi(90, 170).category, "Obesity");
});

test("uses the Mifflin–St Jeor equation and activity factor", () => {
  const male = calculateCalories("male", 30, 70, 175, 1.2);
  const female = calculateCalories("female", 30, 70, 175, 1.2);
  assert.equal(male.bmr, 1649);
  assert.equal(male.maintenance, 1979);
  assert.equal(female.bmr, 1483);
  assert.equal(female.maintenance, 1779);
});

test("calculates exact age across leap years and month ends", () => {
  assert.deepEqual(calculateAge("2000-02-29", "2025-02-28"), {
    years: 25,
    months: 0,
    days: 0,
    totalMonths: 300,
    totalWeeks: 1304,
    totalDays: 9131,
  });
  const monthEnd = calculateAge("2024-01-31", "2024-03-01");
  assert.deepEqual({ years: monthEnd.years, months: monthEnd.months, days: monthEnd.days }, { years: 0, months: 1, days: 1 });
});
