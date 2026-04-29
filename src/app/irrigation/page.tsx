'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Droplets, Brain, CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react';
import { irrigationApi, sensorApi } from '@/lib/api';

interface Recommendation {
  shouldWaterNow: boolean;
  urgency: string;
  recommendedAmount: string;
  recommendedDuration: string;
  reason: string;
  nextSchedule: string;
  tips: string[];
  isDemo?: boolean;
}

export default function IrrigationPage() {
  const [autoMode, setAutoMode] = useState(true);
  const [status, setStatus] = useState<{
    nextWateringFormatted: string;
    dailyWaterUsage: string;
    weeklyWaterUsage: string;
    waterSaved: string;
  } | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    irrigationApi.getStatus().then(setStatus).catch(() => {});
  }, []);

  const handleGetRecommendation = async () => {
    setLoadingRec(true);
    try {
      const sensor = await sensorApi.getCurrent();
      const rec = await irrigationApi.getRecommendation(
        sensor.soilMoisture,
        sensor.temperature,
        sensor.humidity,
      );
      setRecommendation(rec);
    } catch {
      setRecommendation({
        shouldWaterNow: false,
        urgency: 'Monitor',
        recommendedAmount: '0ml',
        recommendedDuration: '0 minutes',
        reason: 'Could not connect to backend. Please ensure the backend is running.',
        nextSchedule: 'Tomorrow, 7:00 AM',
        tips: ['Ensure backend is running at http://localhost:4000'],
        isDemo: true,
      });
    } finally {
      setLoadingRec(false);
    }
  };

  const toggleAuto = async () => {
    try {
      const result = await irrigationApi.toggleAutoMode(!autoMode);
      setAutoMode(result.autoMode);
    } catch { setAutoMode((p) => !p); }
  };

  const urgencyColor = {
    Immediate: 'bg-red-50 border-red-200 text-red-700',
    Soon: 'bg-orange-50 border-orange-200 text-orange-700',
    Monitor: 'bg-blue-50 border-blue-200 text-blue-700',
    Skip: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    <AppLayout>
      <Header title="Irrigation Control" subtitle="Manage and schedule your irrigation system" />
      <div className="p-6 space-y-6">
        {/* Control cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Today Usage', value: status?.dailyWaterUsage ?? '2.4L', icon: Droplets, color: 'bg-blue-50 text-blue-600' },
            { label: 'Week Usage', value: status?.weeklyWaterUsage ?? '16.8L', icon: Droplets, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Water Saved', value: status?.waterSaved ?? '35%', icon: Zap, color: 'bg-green-50 text-green-600' },
            { label: 'Next Watering', value: status?.nextWateringFormatted ?? 'Tomorrow 7AM', icon: Clock, color: 'bg-purple-50 text-purple-600' },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Auto Mode control */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-green-600" /> Irrigation Mode
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
              <div>
                <p className="font-semibold text-gray-700">Auto Mode</p>
                <p className="text-sm text-gray-400">AI determines optimal watering schedule</p>
              </div>
              <button
                onClick={toggleAuto}
                className={`w-16 h-8 rounded-full transition-all duration-300 relative ${autoMode ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 ${autoMode ? 'left-9' : 'left-1'}`} />
              </button>
            </div>
            <div className={`p-4 rounded-xl border-2 ${autoMode ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              {autoMode ? (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">Auto Mode Active</p>
                    <p className="text-sm text-green-600">System will water plants automatically based on AI analysis of soil, weather, and plant needs.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-700">Manual Mode</p>
                    <p className="text-sm text-gray-500">Irrigation is disabled. Enable Auto Mode or water manually.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" /> AI Recommendation
            </h3>
            <button
              onClick={handleGetRecommendation}
              disabled={loadingRec}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-3 rounded-xl font-semibold mb-4 flex items-center justify-center gap-2 transition-colors"
            >
              {loadingRec ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
              ) : (
                <><Brain className="w-4 h-4" /> Get AI Recommendation</>
              )}
            </button>

            {recommendation && (
              <div className="space-y-3">
                <div className={`p-3 rounded-xl border ${urgencyColor[recommendation.urgency as keyof typeof urgencyColor] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">Urgency: {recommendation.urgency}</span>
                    {recommendation.shouldWaterNow && <Droplets className="w-4 h-4" />}
                  </div>
                  <p className="text-sm">{recommendation.reason}</p>
                </div>
                {recommendation.shouldWaterNow && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="font-bold text-blue-700">{recommendation.recommendedAmount}</p>
                      <p className="text-xs text-blue-500">Amount</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="font-bold text-green-700">{recommendation.recommendedDuration}</p>
                      <p className="text-xs text-green-500">Duration</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Tips</p>
                  {recommendation.tips.map((t, i) => (
                    <p key={i} className="text-sm text-gray-600 flex items-start gap-1">
                      <span className="text-green-500">•</span> {t}
                    </p>
                  ))}
                </div>
                {recommendation.isDemo && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Demo data — add API keys for live AI</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
