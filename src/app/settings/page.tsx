'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Settings, Key, Bell, Thermometer, Droplets, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    openrouterKey: '',
    openweatherKey: '',
    city: '',
    moistureThresholdLow: '30',
    moistureThresholdHigh: '70',
    tempAlert: '38',
    waterLevelAlert: '20',
    emailNotifications: true,
    pushNotifications: false,
    irrigationAlerts: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggle = (key: string) =>
    setForm((f) => ({ ...f, [key]: !f[key as keyof typeof f] }));

  return (
    <AppLayout>
      <Header title="Settings" subtitle="Configure your Hydriva system" />
      <div className="p-6 space-y-6 max-w-3xl">

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" /> Settings saved successfully.
          </div>
        )}

        {/* API Keys */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-500" /> API Keys
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OpenRouter API Key</label>
              <input
                type="password"
                value={form.openrouterKey}
                onChange={(e) => setForm((f) => ({ ...f, openrouterKey: e.target.value }))}
                placeholder="sk-or-..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Required for AI plant analysis and irrigation recommendations.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OpenWeatherMap API Key</label>
              <input
                type="password"
                value={form.openweatherKey}
                onChange={(e) => setForm((f) => ({ ...f, openweatherKey: e.target.value }))}
                placeholder="Your OpenWeather key"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Required for real-time weather data based on your location.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default City (fallback)</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="e.g. Lahore, Karachi, Islamabad"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Sensor Thresholds */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" /> Sensor Thresholds
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Soil Moisture Min (%)', key: 'moistureThresholdLow', icon: Droplets },
              { label: 'Soil Moisture Max (%)', key: 'moistureThresholdHigh', icon: Droplets },
              { label: 'Temperature Alert (°C)', key: 'tempAlert', icon: Thermometer },
              { label: 'Water Level Alert (%)', key: 'waterLevelAlert', icon: Droplets },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <field.icon className="w-3.5 h-3.5 text-gray-400" /> {field.label}
                </label>
                <input
                  type="number"
                  value={form[field.key as keyof typeof form] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" /> Notifications
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', sub: 'Receive alerts via email', key: 'emailNotifications' },
              { label: 'Push Notifications', sub: 'Browser push notifications', key: 'pushNotifications' },
              { label: 'Irrigation Alerts', sub: 'Alerts before and after watering events', key: 'irrigationAlerts' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-700 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${form[item.key as keyof typeof form] ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${form[item.key as keyof typeof form] ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-5 h-5" /> Save Settings
        </button>
      </div>
    </AppLayout>
  );
}
