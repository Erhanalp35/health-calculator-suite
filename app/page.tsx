"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  calculateAge,
  calculateBmi,
  calculateCalories,
  Goal,
  imperialToMetric,
  Sex,
  UnitSystem,
} from "./calculations";

const today = () => new Date().toLocaleDateString("en-CA");
const activities = [
  ["Mostly seated", 1.2],
  ["Lightly active", 1.375],
  ["Moderately active", 1.55],
  ["Very active", 1.725],
  ["Extra active", 1.9],
] as const;

function NumberField({
  label,
  value,
  onChange,
  suffix,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  min: number;
  max: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <span className="input-wrap">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step="any"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <small>{suffix}</small>
      </span>
    </label>
  );
}

function UnitToggle({ value, onChange }: { value: UnitSystem; onChange: (unit: UnitSystem) => void }) {
  return (
    <div className="segmented" aria-label="Measurement system">
      {(["metric", "imperial"] as const).map((unit) => (
        <button
          type="button"
          className={value === unit ? "active" : ""}
          aria-pressed={value === unit}
          onClick={() => onChange(unit)}
          key={unit}
        >
          {unit === "metric" ? "Metric" : "Imperial"}
        </button>
      ))}
    </div>
  );
}

function BmiCalculator() {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [height, setHeight] = useState("170");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("7");
  const [weight, setWeight] = useState("70");
  const [result, setResult] = useState<{ value: number; category: string } | null>(null);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const h = Number(height);
    const f = Number(feet);
    const i = Number(inches);
    const w = Number(weight);
    if (unit === "metric" && (h < 80 || h > 250 || w < 20 || w > 400)) {
      setError("Enter a height from 80–250 cm and weight from 20–400 kg.");
      return;
    }
    if (unit === "imperial" && (f < 2 || f > 8 || i < 0 || i >= 12 || w < 45 || w > 880)) {
      setError("Enter a valid height and weight from 45–880 lb.");
      return;
    }
    const metric = unit === "metric" ? { heightCm: h, weightKg: w } : imperialToMetric(f, i, w);
    setResult(calculateBmi(metric.weightKg, metric.heightCm));
    setError("");
  }

  function reset() {
    setHeight("170"); setFeet("5"); setInches("7"); setWeight(unit === "metric" ? "70" : "154");
    setResult(null); setError("");
  }

  return (
    <section className="calculator-section" id="bmi">
      <div className="section-copy">
        <span className="eyebrow">01 · Body composition</span>
        <h2>Know your healthy range.</h2>
        <p>BMI is a quick screening measure that compares your weight with your height. It is useful as a starting point, not a diagnosis.</p>
        <div className="insight"><span>Good to know</span><p>A BMI between 18.5 and 24.9 is generally considered a healthy range for adults.</p></div>
      </div>
      <div className="calculator-card">
        <div className="card-heading"><div><p className="card-kicker">BMI CALCULATOR</p><h3>Your body mass index</h3></div><UnitToggle value={unit} onChange={(u) => { setUnit(u); setWeight(u === "metric" ? "70" : "154"); setResult(null); }} /></div>
        <form onSubmit={submit} noValidate>
          <div className="fields-grid">
            {unit === "metric" ? <NumberField label="Height" value={height} onChange={setHeight} suffix="cm" min={80} max={250} /> : <><NumberField label="Height" value={feet} onChange={setFeet} suffix="ft" min={2} max={8} /><NumberField label="Inches" value={inches} onChange={setInches} suffix="in" min={0} max={11} /></>}
            <NumberField label="Weight" value={weight} onChange={setWeight} suffix={unit === "metric" ? "kg" : "lb"} min={1} max={880} />
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="actions"><button className="primary" type="submit">Calculate BMI <span>→</span></button><button className="text-button" type="button" onClick={reset}>Reset</button></div>
        </form>
        {result && <div className="result-panel" aria-live="polite"><div className="result-top"><div><span>Your BMI</span><strong>{result.value}</strong></div><span className="status-pill">{result.category}</span></div><div className="bmi-scale"><i /><i /><i /><i /><b style={{ left: `${Math.min(96, Math.max(3, ((result.value - 15) / 25) * 100))}%` }} /></div><div className="scale-labels"><span>Underweight</span><span>Healthy</span><span>Overweight</span><span>Obesity</span></div></div>}
      </div>
    </section>
  );
}

function CalorieCalculator() {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState("30");
  const [height, setHeight] = useState("165");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("5");
  const [weight, setWeight] = useState("65");
  const [activity, setActivity] = useState("1.55");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [result, setResult] = useState<ReturnType<typeof calculateCalories> | null>(null);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const a = Number(age), h = Number(height), f = Number(feet), i = Number(inches), w = Number(weight);
    const invalidBase = a < 18 || a > 100;
    const invalidMetric = h < 100 || h > 250 || w < 30 || w > 400;
    const invalidImperial = f < 3 || f > 8 || i < 0 || i >= 12 || w < 66 || w > 880;
    if (invalidBase || (unit === "metric" ? invalidMetric : invalidImperial)) {
      setError("Enter an age from 18–100 and realistic height and weight values.");
      return;
    }
    const metric = unit === "metric" ? { heightCm: h, weightKg: w } : imperialToMetric(f, i, w);
    setResult(calculateCalories(sex, a, metric.weightKg, metric.heightCm, Number(activity)));
    setError("");
  }

  const goals: { key: Goal; label: string; note: string }[] = [
    { key: "lose", label: "Lose", note: "gentle deficit" },
    { key: "maintain", label: "Maintain", note: "stay steady" },
    { key: "gain", label: "Gain", note: "gentle surplus" },
  ];

  return (
    <section className="calculator-section reverse" id="calories">
      <div className="section-copy"><span className="eyebrow">02 · Daily energy</span><h2>Fuel your day with intention.</h2><p>Estimate how many calories your body uses each day based on the Mifflin–St Jeor equation and your activity level.</p><div className="insight"><span>Built for balance</span><p>Our goal targets use modest adjustments designed for gradual, sustainable change.</p></div></div>
      <div className="calculator-card wide-card">
        <div className="card-heading"><div><p className="card-kicker">CALORIE CALCULATOR</p><h3>Your daily energy needs</h3></div><UnitToggle value={unit} onChange={(u) => { setUnit(u); setWeight(u === "metric" ? "65" : "143"); setResult(null); }} /></div>
        <form onSubmit={submit} noValidate>
          <div className="fields-grid three">
            <label className="field"><span>Biological sex</span><select value={sex} onChange={(e) => setSex(e.target.value as Sex)}><option value="female">Female</option><option value="male">Male</option></select></label>
            <NumberField label="Age" value={age} onChange={setAge} suffix="years" min={18} max={100} />
            {unit === "metric" ? <NumberField label="Height" value={height} onChange={setHeight} suffix="cm" min={100} max={250} /> : <><NumberField label="Height" value={feet} onChange={setFeet} suffix="ft" min={3} max={8} /><NumberField label="Inches" value={inches} onChange={setInches} suffix="in" min={0} max={11} /></>}
            <NumberField label="Weight" value={weight} onChange={setWeight} suffix={unit === "metric" ? "kg" : "lb"} min={1} max={880} />
            <label className="field"><span>Activity level</span><select value={activity} onChange={(e) => setActivity(e.target.value)}>{activities.map(([label, value]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          <fieldset className="goal-picker"><legend>Your goal</legend><div>{goals.map((item) => <label className={goal === item.key ? "selected" : ""} key={item.key}><input type="radio" name="goal" value={item.key} checked={goal === item.key} onChange={() => setGoal(item.key)} /><strong>{item.label}</strong><small>{item.note}</small></label>)}</div></fieldset>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="actions"><button className="primary" type="submit">Calculate calories <span>→</span></button><button className="text-button" type="button" onClick={() => { setResult(null); setError(""); }}>Reset result</button></div>
        </form>
        {result && <div className="result-panel calories-result" aria-live="polite"><p>Estimated daily calories</p><div className="calorie-options"><div className={goal === "lose" ? "featured" : ""}><span>Lose gently</span><strong>{result.lose.toLocaleString()}</strong><small>kcal / day</small></div><div className={goal === "maintain" ? "featured" : ""}><span>Maintain</span><strong>{result.maintenance.toLocaleString()}</strong><small>kcal / day</small></div><div className={goal === "gain" ? "featured" : ""}><span>Gain gently</span><strong>{result.gain.toLocaleString()}</strong><small>kcal / day</small></div></div><p className="result-note">Your estimated resting energy is {result.bmr.toLocaleString()} kcal/day. These are general estimates, not medical advice.</p></div>}
      </div>
    </section>
  );
}

function AgeCalculator() {
  const [birth, setBirth] = useState("1995-06-15");
  const [end, setEnd] = useState(today());
  const [result, setResult] = useState<ReturnType<typeof calculateAge> | null>(null);
  const [error, setError] = useState("");
  const maxDate = useMemo(today, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!birth || !end) { setError("Choose both a birth date and comparison date."); return; }
    if (birth > end) { setError("The comparison date must be after the birth date."); return; }
    if (end > maxDate) { setError("The comparison date cannot be in the future."); return; }
    setResult(calculateAge(birth, end)); setError("");
  }

  return (
    <section className="calculator-section" id="age">
      <div className="section-copy"><span className="eyebrow">03 · Time well lived</span><h2>Count every meaningful day.</h2><p>Discover your exact age on any date, measured in years, months, days, and a few delightful totals.</p><div className="insight"><span>Calendar smart</span><p>The calculation accounts for varying month lengths and leap years.</p></div></div>
      <div className="calculator-card">
        <div className="card-heading"><div><p className="card-kicker">AGE CALCULATOR</p><h3>Your age, precisely</h3></div><span className="mini-icon">✦</span></div>
        <form onSubmit={submit} noValidate><div className="fields-grid"><label className="field"><span>Date of birth</span><input type="date" value={birth} max={end} onChange={(e) => setBirth(e.target.value)} required /></label><label className="field"><span>Age on</span><input type="date" value={end} max={maxDate} onChange={(e) => setEnd(e.target.value)} required /></label></div>{error && <p className="error" role="alert">{error}</p>}<div className="actions"><button className="primary" type="submit">Calculate age <span>→</span></button><button className="text-button" type="button" onClick={() => { setEnd(today()); setResult(null); setError(""); }}>Reset</button></div></form>
        {result && <div className="result-panel age-result" aria-live="polite"><p>Your exact age</p><div className="age-main"><div><strong>{result.years}</strong><span>years</span></div><i>:</i><div><strong>{result.months}</strong><span>months</span></div><i>:</i><div><strong>{result.days}</strong><span>days</span></div></div><div className="age-totals"><span><strong>{result.totalMonths.toLocaleString()}</strong> months</span><span><strong>{result.totalWeeks.toLocaleString()}</strong> weeks</span><span><strong>{result.totalDays.toLocaleString()}</strong> days</span></div></div>}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <nav className="nav"><a href="#top" className="brand"><span>V</span>VitaCalc</a><div className="nav-links"><a href="#bmi">BMI</a><a href="#calories">Calories</a><a href="#age">Age</a></div><a href="#bmi" className="nav-cta">Start calculating</a></nav>
      <header className="hero" id="top"><div className="hero-badge"><span>●</span> Simple tools for everyday health</div><h1>Understand your body.<br /><em>Live with clarity.</em></h1><p>Three thoughtful calculators to help you make sense of your health—private, instant, and completely free.</p><div className="hero-actions"><a className="primary" href="#bmi">Explore calculators <span>↓</span></a><span>No sign-up · No data stored</span></div><div className="hero-orbit" aria-hidden="true"><div className="orbit-card card-one"><span>BMI</span><strong>22.4</strong><small>Healthy range</small></div><div className="orbit-card card-two"><span>DAILY ENERGY</span><strong>2,140</strong><small>kcal / day</small></div><div className="orbit-dot dot-one" /><div className="orbit-dot dot-two" /></div></header>
      <div className="trust-strip"><span>PRIVATE BY DESIGN</span><span>•</span><span>SCIENCE-BASED FORMULAS</span><span>•</span><span>INSTANT RESULTS</span></div>
      <BmiCalculator />
      <CalorieCalculator />
      <AgeCalculator />
      <section className="privacy"><div><span>✦</span><h2>Your numbers stay yours.</h2><p>Every calculation happens right here in your browser. Nothing is saved, shared, or sent anywhere.</p></div><a href="#top">Back to top ↑</a></section>
      <footer><a href="#top" className="brand"><span>V</span>VitaCalc</a><p>Simple tools for a healthier perspective.</p><p>© {new Date().getFullYear()} VitaCalc · For informational purposes only.</p></footer>
    </main>
  );
}
