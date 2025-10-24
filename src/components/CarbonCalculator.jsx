import React, { useMemo, useState, useEffect } from 'react';
import { Car, Plane, Bolt, Recycle, Gauge, Info } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const FACTORS = {
  carPerKmT: 0.0002, // tonnes CO2e per km
  airPerHourT: 0.09, // tonnes CO2e per hour
  electricityPerKWhT: 0.0007, // tonnes CO2e per kWh
  wastePerKgT: 0.0012, // tonnes CO2e per kg
  dietT: {
    vegan: 1.5,
    vegetarian: 2.0,
    light: 2.8,
    medium: 3.6,
    heavy: 5.0,
  },
};

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#60a5fa'];

const formatT = (n) => `${n.toFixed(2)} t CO₂e/yr`;

const loadHistory = () => {
  try {
    const raw = localStorage.getItem('ecotrack-calculations');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCalculation = (entry) => {
  const list = loadHistory();
  list.push(entry);
  localStorage.setItem('ecotrack-calculations', JSON.stringify(list));
};

export default function CarbonCalculator() {
  const [carKmYear, setCarKmYear] = useState('');
  const [airHoursYear, setAirHoursYear] = useState('');
  const [kwhMonth, setKwhMonth] = useState('');
  const [wasteKgMonth, setWasteKgMonth] = useState('');
  const [diet, setDiet] = useState('medium');
  const [result, setResult] = useState(null);

  const breakdown = useMemo(() => {
    const car = (Number(carKmYear) || 0) * FACTORS.carPerKmT;
    const air = (Number(airHoursYear) || 0) * FACTORS.airPerHourT;
    const energy = (Number(kwhMonth) || 0) * 12 * FACTORS.electricityPerKWhT;
    const waste = (Number(wasteKgMonth) || 0) * 12 * FACTORS.wastePerKgT;
    const dietT = FACTORS.dietT[diet] ?? FACTORS.dietT.medium;
    const total = car + air + energy + waste + dietT;
    return { total, car, air, energy, waste, diet: dietT };
  }, [carKmYear, airHoursYear, kwhMonth, wasteKgMonth, diet]);

  const data = [
    { name: 'Transportation (Car)', value: breakdown.car },
    { name: 'Air Travel', value: breakdown.air },
    { name: 'Household Energy', value: breakdown.energy },
    { name: 'Waste', value: breakdown.waste },
    { name: 'Diet', value: breakdown.diet },
  ];

  const onCalculate = (e) => {
    e.preventDefault();
    const entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      inputs: {
        carKmYear: Number(carKmYear) || 0,
        airHoursYear: Number(airHoursYear) || 0,
        kwhMonth: Number(kwhMonth) || 0,
        wasteKgMonth: Number(wasteKgMonth) || 0,
        diet,
      },
      results: breakdown,
    };
    saveCalculation(entry);
    setResult(entry);
  };

  useEffect(() => {
    const history = loadHistory();
    setResult(history[history.length - 1] || null);
  }, []);

  const globalAvg = 4.7;
  const diff = (breakdown.total - globalAvg).toFixed(2);
  const betterOrWorse = breakdown.total <= globalAvg ? 'below' : 'above';

  const recs = useMemo(() => {
    const arr = [];
    if (breakdown.car > 1) arr.push('Reduce solo car travel: carpool, public transport, or cycling for short trips.');
    if (breakdown.air > 1) arr.push('Cut a flight or choose trains for <1000 km routes when feasible.');
    if (breakdown.energy > 1) arr.push('Switch to LED lighting and set AC between 24–26°C to cut electricity use.');
    if (diet !== 'vegan' && breakdown.diet > 2.5) arr.push('Shift one or two days a week to plant-forward meals.');
    if (breakdown.waste > 0.5) arr.push('Start composting organics and improve recycling separation.');
    if (!arr.length) arr.push('Great job! Maintain habits and consider supporting verified carbon offset projects.');
    return arr;
  }, [breakdown, diet]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-semibold">Carbon Footprint Calculator</h2>
        </div>
        <div className="text-sm text-white/70">Factors aligned to described methodology</div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={onCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="flex items-center gap-2 text-sm text-white/80 mb-2"><Car className="w-4 h-4" /> Car travel (km/year)</span>
              <input value={carKmYear} onChange={(e) => setCarKmYear(e.target.value)} inputMode="numeric" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., 8000" />
            </label>
            <label className="block">
              <span className="flex items-center gap-2 text-sm text-white/80 mb-2"><Plane className="w-4 h-4" /> Air travel (hours/year)</span>
              <input value={airHoursYear} onChange={(e) => setAirHoursYear(e.target.value)} inputMode="numeric" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., 12" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="flex items-center gap-2 text-sm text-white/80 mb-2"><Bolt className="w-4 h-4" /> Electricity (kWh/month)</span>
              <input value={kwhMonth} onChange={(e) => setKwhMonth(e.target.value)} inputMode="numeric" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., 250" />
            </label>
            <label className="block">
              <span className="flex items-center gap-2 text-sm text-white/80 mb-2"><Recycle className="w-4 h-4" /> Waste (kg/month)</span>
              <input value={wasteKgMonth} onChange={(e) => setWasteKgMonth(e.target.value)} inputMode="numeric" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., 20" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm text-white/80 mb-2 block">Diet type</span>
            <select value={diet} onChange={(e) => setDiet(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="vegan">Vegan (1.5 t/yr)</option>
              <option value="vegetarian">Vegetarian (2.0 t/yr)</option>
              <option value="light">Light Meat (2.8 t/yr)</option>
              <option value="medium">Medium Meat (3.6 t/yr)</option>
              <option value="heavy">Heavy Meat (5.0 t/yr)</option>
            </select>
          </label>

          <button type="submit" className="w-full sm:w-auto inline-flex items-center gap-2 bg-emerald-500 text-black font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-400 transition">
            Calculate
          </button>

          <p className="flex items-start gap-2 text-xs text-white/60">
            <Info className="w-4 h-4 mt-0.5 shrink-0" /> Emission factors: Car 0.0002 t/km, Air 0.09 t/h, Electricity 0.0007 t/kWh, Waste 0.0012 t/kg.
          </p>
        </form>

        <div className="bg-black/30 border border-white/10 rounded-xl p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3">
              <h3 className="font-medium">Results</h3>
              <div className="rounded-lg bg-white/5 p-4">
                <div className="text-sm text-white/70">Total annual footprint</div>
                <div className="text-3xl font-semibold mt-1">{formatT(breakdown.total)}</div>
                <div className="text-xs text-white/60 mt-2">{`This is ${betterOrWorse} the global average of ${globalAvg} t/yr by ${Math.abs(Number(diff))} t.`}</div>
              </div>
              <ul className="text-sm text-white/80 space-y-1.5">
                <li>Transportation (Car): {formatT(breakdown.car)}</li>
                <li>Air Travel: {formatT(breakdown.air)}</li>
                <li>Household Energy: {formatT(breakdown.energy)}</li>
                <li>Waste: {formatT(breakdown.waste)}</li>
                <li>Diet: {formatT(breakdown.diet)}</li>
              </ul>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                  {recs.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="h-64 md:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v.toFixed(2)} t`} contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Legend wrapperStyle={{ color: 'white' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="px-6 pb-6">
          <div className="text-xs text-white/60">Saved calculation on {new Date(result.date).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
