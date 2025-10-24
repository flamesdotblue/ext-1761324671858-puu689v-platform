import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Activity, Info } from 'lucide-react';

// AQI breakpoints (US EPA) for PM2.5 and PM10
const PM25_BREAKPOINTS = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
];

const PM10_BREAKPOINTS = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
];

function calcAQI(value, bps) {
  for (const bp of bps) {
    if (value >= bp.cLow && value <= bp.cHigh) {
      // AQI = (Ihi - Ilo)/(Chi - Clo) * (C - Clo) + Ilo
      return ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (value - bp.cLow) + bp.iLow;
    }
  }
  if (value < bps[0].cLow) return bps[0].iLow;
  return bps[bps.length - 1].iHigh;
}

function levelFromAQI(aqi) {
  if (aqi <= 50) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10', ring: 'ring-yellow-500/30' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-400', bg: 'bg-orange-500/10', ring: 'ring-orange-500/30' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-400', bg: 'bg-red-500/10', ring: 'ring-red-500/30' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-400', bg: 'bg-purple-500/10', ring: 'ring-purple-500/30' };
  return { label: 'Hazardous', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', ring: 'ring-fuchsia-500/30' };
}

export default function AirQualityMonitor() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setError('Location permission denied. Showing no data.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!coords) return;
      try {
        setLoading(true);
        setError('');
        const url = `https://api.openaq.org/v2/latest?coordinates=${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}&radius=10000&limit=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch air quality');
        const json = await res.json();
        const loc = json?.results?.[0];
        if (!loc) throw new Error('No nearby monitoring data');
        const measurements = {};
        for (const m of loc.measurements || []) {
          measurements[m.parameter] = m.value; // µg/m3 typical for PM
        }
        setData({
          location: loc.name,
          city: loc.city,
          country: loc.country,
          coordinates: loc.coordinates,
          measurements,
        });
      } catch (e) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [coords]);

  const aqiCalc = useMemo(() => {
    if (!data) return null;
    const pm25 = data.measurements.pm25;
    const pm10 = data.measurements.pm10;
    const aqiPM25 = pm25 != null ? Math.round(calcAQI(pm25, PM25_BREAKPOINTS)) : null;
    const aqiPM10 = pm10 != null ? Math.round(calcAQI(pm10, PM10_BREAKPOINTS)) : null;
    const aqi = Math.max(aqiPM25 || 0, aqiPM10 || 0);
    const main = aqi === aqiPM25 ? 'PM2.5' : aqi === aqiPM10 ? 'PM10' : 'N/A';
    return { aqi, main, pm25, pm10 };
  }, [data]);

  const lvl = aqiCalc ? levelFromAQI(aqiCalc.aqi) : null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-semibold">Air Quality Monitor</h2>
        </div>
        <div className="text-sm text-white/70">Live, location-based AQI</div>
      </div>

      <div className="p-6 space-y-6">
        {!coords && !error && (
          <div className="text-white/70 text-sm">Requesting location…</div>
        )}
        {error && (
          <div className="text-red-300 text-sm">{error}</div>
        )}

        {data && aqiCalc && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-xl border border-white/10 p-4 ${lvl.bg} ring-1 ${lvl.ring}`}>
              <div className="text-sm text-white/70">AQI</div>
              <div className={`text-4xl font-semibold mt-1 ${lvl.color}`}>{aqiCalc.aqi}</div>
              <div className="text-xs text-white/70 mt-1">Level: {lvl.label} • Main pollutant: {aqiCalc.main}</div>
            </div>
            <div className="rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 text-sm text-white/70"><MapPin className="w-4 h-4" /> Location</div>
              <div className="mt-1 font-medium">{data.city || data.location || 'Unknown'}, {data.country || ''}</div>
              <div className="text-xs text-white/60">{data.location}</div>
            </div>
            <div className="rounded-xl border border-white/10 p-4">
              <div className="text-sm text-white/70">Pollutants (µg/m³)</div>
              <div className="text-sm mt-1 space-y-1">
                <div>PM2.5: <span className="text-white/80">{aqiCalc.pm25 != null ? aqiCalc.pm25 : '—'}</span></div>
                <div>PM10: <span className="text-white/80">{aqiCalc.pm10 != null ? aqiCalc.pm10 : '—'}</span></div>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-white/60 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5" /> AQI levels: 0-50 Good, 51-100 Moderate, 101-150 Unhealthy for Sensitive, 151-200 Unhealthy, 201-300 Very Unhealthy, 300+ Hazardous.
        </div>
      </div>
    </div>
  );
}
