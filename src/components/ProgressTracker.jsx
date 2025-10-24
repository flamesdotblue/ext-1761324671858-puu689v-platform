import React, { useEffect, useMemo, useState } from 'react';
import { LineChart as LineChartIcon, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const loadHistory = () => {
  try {
    const raw = localStorage.getItem('ecotrack-calculations');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export default function ProgressTracker() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(loadHistory());
    const onStorage = () => setHistory(loadHistory());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const chartData = useMemo(() => {
    return history.map((h) => ({
      date: new Date(h.date).toLocaleDateString(),
      total: Number(h.results?.total?.toFixed(2)) || 0,
      transport: Number((h.results?.car + h.results?.air).toFixed(2)) || 0,
      energy: Number(h.results?.energy?.toFixed(2)) || 0,
      diet: Number(h.results?.diet?.toFixed(2)) || 0,
      waste: Number(h.results?.waste?.toFixed(2)) || 0,
    }));
  }, [history]);

  const first = history[0]?.results?.total || null;
  const latest = history[history.length - 1]?.results?.total || null;
  const changePct = first && latest ? (((latest - first) / first) * 100).toFixed(1) : null;
  const goal = 2.0;
  const toGoal = latest ? (latest - goal).toFixed(2) : null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LineChartIcon className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-semibold">Progress Tracking</h2>
        </div>
        <div className="text-sm text-white/70">Paris goal: 2.0 t CO₂e/yr</div>
      </div>

      <div className="p-6 space-y-6">
        {history.length < 2 ? (
          <div className="text-white/70 text-sm">Add at least 2 calculations to visualize your progress over time.</div>
        ) : (
          <div className="h-72 w-full bg-black/30 border border-white/10 rounded-xl p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} domain={[0, 'auto']} />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend wrapperStyle={{ color: 'white' }} />
                <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} dot={false} name="Total" />
                <Line type="monotone" dataKey="transport" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Transport" />
                <Line type="monotone" dataKey="energy" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="Energy" />
                <Line type="monotone" dataKey="diet" stroke="#a78bfa" strokeWidth={1.5} dot={false} name="Diet" />
                <Line type="monotone" dataKey="waste" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Waste" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 p-4">
            <div className="text-sm text-white/70">Current Footprint</div>
            <div className="text-2xl font-semibold mt-1">{latest ? `${latest.toFixed(2)} t/yr` : '—'}</div>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <div className="text-sm text-white/70">Total Change</div>
            <div className="text-2xl font-semibold mt-1">{changePct ? `${changePct}%` : '—'}</div>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 text-sm text-white/70"><Target className="w-4 h-4" /> Paris Goal Progress</div>
            <div className="text-2xl font-semibold mt-1">{toGoal ? (toGoal <= 0 ? 'Met' : `${toGoal} t to go`) : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
