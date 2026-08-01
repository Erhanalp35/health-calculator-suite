export type UnitSystem = "metric" | "imperial";
export type Sex = "male" | "female";
export type Goal = "lose" | "maintain" | "gain";

export function calculateBmi(weightKg: number, heightCm: number) {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  const category =
    bmi < 18.5
      ? "Underweight"
      : bmi < 25
        ? "Healthy weight"
        : bmi < 30
          ? "Overweight"
          : "Obesity";
  return { value: Math.round(bmi * 10) / 10, category };
}

export function imperialToMetric(feet: number, inches: number, pounds: number) {
  return {
    heightCm: (feet * 12 + inches) * 2.54,
    weightKg: pounds * 0.45359237,
  };
}

export function calculateCalories(
  sex: Sex,
  age: number,
  weightKg: number,
  heightCm: number,
  activity: number,
) {
  const bmr =
    10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
  const maintenance = Math.round(bmr * activity);
  return {
    bmr: Math.round(bmr),
    maintenance,
    lose: Math.max(1200, maintenance - 350),
    gain: maintenance + 300,
  };
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addYearsClamped(date: Date, years: number) {
  const year = date.getUTCFullYear() + years;
  const month = date.getUTCMonth();
  const day = Math.min(date.getUTCDate(), daysInMonth(year, month));
  return new Date(Date.UTC(year, month, day));
}

function addMonthsClamped(date: Date, months: number) {
  const target = date.getUTCMonth() + months;
  const year = date.getUTCFullYear() + Math.floor(target / 12);
  const month = ((target % 12) + 12) % 12;
  const day = Math.min(date.getUTCDate(), daysInMonth(year, month));
  return new Date(Date.UTC(year, month, day));
}

export function calculateAge(birthValue: string, endValue: string) {
  const birth = parseDate(birthValue);
  const end = parseDate(endValue);
  const millisecondsPerDay = 86_400_000;
  const totalDays = Math.floor((end.getTime() - birth.getTime()) / millisecondsPerDay);

  let years = end.getUTCFullYear() - birth.getUTCFullYear();
  if (addYearsClamped(birth, years) > end) years -= 1;
  const afterYears = addYearsClamped(birth, years);

  let months =
    (end.getUTCFullYear() - afterYears.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    afterYears.getUTCMonth();
  if (addMonthsClamped(afterYears, months) > end) months -= 1;
  const afterMonths = addMonthsClamped(afterYears, months);
  const days = Math.floor((end.getTime() - afterMonths.getTime()) / millisecondsPerDay);

  return {
    years,
    months,
    days,
    totalMonths: years * 12 + months,
    totalWeeks: Math.floor(totalDays / 7),
    totalDays,
  };
}
