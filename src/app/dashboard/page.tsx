'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import {
  Droplets,
  Thermometer,
  Wind,
  Container,
  Zap,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { sensorApi, irrigationApi, weatherApi } from '@/lib/api';
import { getStatusColor } from '@/lib/utils';

interface SensorData {
  soilMoisture: number;
  soilStatus: { label: string; color: string };
  temperature: number;
  temperatureStatus: { label: string; color: string };
  humidity: number;
  humidityStatus: { label: string; color: string };
  waterLevel: number;
  waterStatus: { label: string; color: string };
  timestamp: string;
}

interface IrrigationStatus {
  autoMode: boolean;
  nextWateringFormatted: string;
  dailyWaterUsage: string;
  weeklyWaterUsage: string;
  waterSaved: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  city: string;
  windSpeed: number;
  isDemo?: boolean;
}

interface HistoryPoint {
  label: string;
  soilMoisture: number;
  temperature: number;
  humidity: number;
}

const recentActivity = [
  { icon: CheckCircle, color: 'text-green-500', text: 'Irrigation Started', time: '07:55 AM' },
  { icon: CheckCircle, color: 'text-green-500', text: 'Irrigation Completed', time: '07:22 AM' },
  { icon: Clock, color: 'text-blue-500', text: 'Next Irrigation', time: '7:00 AM Tomorrow' },
];

export default function DashboardPage() {
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [irrigation, setIrrigation] = useState<IrrigationStatus | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [autoMode, setAutoMode] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [sensorData, irrigationData, historyData] = await Promise.all([
        sensorApi.getCurrent(),
        irrigationApi.getStatus(),
        sensorApi.getHistory(12),
      ]);
      setSensor(sensorData);
      setIrrigation(irrigationData);
      setAutoMode(irrigationData.autoMode);
      setHistory(historyData);
    } catch {
      // use demo data if backend not running
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const data = await weatherApi.getByCoords(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        setWeather(data);
      } catch {}
    });
  }, []);

  useEffect(() => {
    fetchData();
    fetchWeather();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData, fetchWeather]);

  const handleToggleAutoMode = async () => {
    try {
      const result = await irrigationApi.toggleAutoMode(!autoMode);
      setAutoMode(result.autoMode);
    } catch {
      setAutoMode((prev) => !prev);
    }
  };

  // Fallback demo values
  const s = sensor ?? {
    soilMoisture: 42,
    soilStatus: { label: 'Optimal', color: 'green' },
    temperature: 28,
    temperatureStatus: { label: 'Normal', color: 'green' },
    humidity: 65,
    humidityStatus: { label: 'Normal', color: 'green' },
    waterLevel: 78,
    waterStatus: { label: 'Sufficient', color: 'green' },
    timestamp: new Date().toISOString(),
  };

  const sensorCards = [
    {
      label: 'Soil Moisture',
      value: `${s.soilMoisture}%`,
      status: s.soilStatus,
      icon: Droplets,
      iconColor: 'text-blue-500',
      bg: 'from-blue-50 to-white',
      bar: 'bg-blue-500',
      barPct: s.soilMoisture,
    },
    {
      label: 'Temperature',
      value: `${s.temperature}°C`,
      status: s.temperatureStatus,
      icon: Thermometer,
      iconColor: 'text-orange-500',
      bg: 'from-orange-50 to-white',
      bar: 'bg-orange-500',
      barPct: Math.min(100, (s.temperature / 50) * 100),
    },
    {
      label: 'Humidity',
      value: `${s.humidity}%`,
      status: s.humidityStatus,
      icon: Wind,
      iconColor: 'text-sky-500',
      bg: 'from-sky-50 to-white',
      bar: 'bg-sky-500',
      barPct: s.humidity,
    },
    {
      label: 'Water Level',
      value: `${s.waterLevel}%`,
      status: s.waterStatus,
      icon: Container,
      iconColor: 'text-green-500',
      bg: 'from-green-50 to-white',
      bar: 'bg-green-500',
      barPct: s.waterLevel,
    },
  ];

  return (
    <AppLayout>
      <Header
        title="Hydriva Dashboard"
        subtitle={`Last updated: ${new Date().toLocaleTimeString()}`}
        onRefresh={fetchData}
        city={weather?.city}
      />
      <div className="p-6 space-y-6">

        {/* Greeting Banner */}
        <div className="hydriva-gradient rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {new Date().getHours() < 12 ? 'Good Morning!' :
               new Date().getHours() < 17 ? 'Good Afternoon!' : 'Good Evening!'}
            </h2>
            <p className="text-white/80">
              {s.soilStatus.label === 'Optimal'
                ? 'Your plants are healthy and well hydrated.'
                : s.soilStatus.color === 'red'
                ? 'Alert: Plants need water soon!'
                : 'Monitoring conditions — all looks good.'}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-right">
            {weather && (
              <div>
                <p className="text-3xl font-bold">{weather.temperature}°C</p>
                <p className="text-white/70 text-sm capitalize">{weather.description}</p>
                {weather.isDemo && <p className="text-white/50 text-xs">Demo data</p>}
              </div>
            )}
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
              🌱
            </div>
          </div>
        </div>

        {/* Live Monitor */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" /> Live Monitor
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {sensorCards.map((card) => (
              <div
                key={card.label}
                className={`bg-gradient-to-br ${card.bg} rounded-2xl p-5 border border-gray-100 shadow-sm card-hover`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <p className="text-3xl font-bold text-gray-800 mb-1">{card.value}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(card.status.color)}`}>
                    {card.status.label}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${card.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, card.barPct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" /> Sensor Trends (12h)
              </h3>
            </div>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="soilMoisture" stroke="#3b82f6" strokeWidth={2} dot={false} name="Soil %" />
                  <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} name="Temp °C" />
                  <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} dot={false} name="Humidity %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Loading sensor history...</p>
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Irrigation Status */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-green-600" /> Irrigation Status
              </h3>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-700">Auto Mode</p>
                  <p className="text-xs text-gray-400">AI-powered scheduling</p>
                </div>
                <button
                  onClick={handleToggleAutoMode}
                  className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                    autoMode ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 ${
                      autoMode ? 'left-7' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">Next Watering</p>
                <p className="font-bold text-gray-800">
                  {irrigation?.nextWateringFormatted ?? 'Tomorrow, 7:00 AM'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-blue-700">{irrigation?.dailyWaterUsage ?? '2.4L'}</p>
                  <p className="text-xs text-blue-500">Today</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-green-700">{irrigation?.waterSaved ?? '35%'}</p>
                  <p className="text-xs text-green-500">Saved</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{item.text}</p>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alert banner if dry */}
        {s.soilStatus.color === 'red' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Soil moisture critically low!</p>
              <p className="text-sm text-red-500">Soil moisture is at {s.soilMoisture}%. Immediate watering recommended.</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
