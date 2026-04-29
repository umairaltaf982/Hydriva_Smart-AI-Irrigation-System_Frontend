'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import {
  AlertTriangle, Droplets, Thermometer, CheckCircle, Bell, Info,
  Leaf, Clock, Wifi, RefreshCw, Loader2, ChevronRight, XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'sensor' | 'plant' | 'irrigation' | 'reminder' | 'system';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  plantName?: string;
  actionLabel?: string;
  actionUrl?: string;
}

const TYPE_CONFIG = {
  critical: {
    border: 'border-l-red-500',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
    dot: 'bg-red-500',
  },
  warning: {
    border: 'border-l-orange-400',
    bg: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    dot: 'bg-orange-400',
  },
  info: {
    border: 'border-l-blue-400',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Info,
    iconColor: 'text-blue-500',
    dot: 'bg-blue-400',
  },
  success: {
    border: 'border-l-green-500',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    dot: 'bg-green-500',
  },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  sensor: Wifi,
  plant: Leaf,
  irrigation: Droplets,
  reminder: Clock,
  system: CheckCircle,
};

const CATEGORY_LABELS: Record<string, string> = {
  sensor: 'Sensor',
  plant: 'Plant',
  irrigation: 'Irrigation',
  reminder: 'Reminder',
  system: 'System',
};

function AlertCard({ alert }: { alert: Alert }) {
  const cfg = TYPE_CONFIG[alert.type];
  const TypeIcon = cfg.icon;
  const CatIcon = CATEGORY_ICONS[alert.category] || Bell;

  return (
    <div className={`flex gap-4 px-5 py-4 border-l-4 ${cfg.border} ${cfg.bg} transition-all`}>
      <div className="flex-shrink-0 mt-0.5">
        <TypeIcon className={`w-5 h-5 ${cfg.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800 text-sm">{alert.title}</p>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.badge}`}>
              <CatIcon className="w-3 h-3" />
              {CATEGORY_LABELS[alert.category]}
            </span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
            alert.resolved
              ? 'bg-gray-50 text-gray-500 border-gray-200'
              : 'bg-white text-gray-700 border-gray-300 font-medium'
          }`}>
            {alert.resolved ? 'Resolved' : 'Active'}
          </span>
        </div>

        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{alert.description}</p>

        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
            {alert.plantName && <span className="ml-2 text-green-600">· {alert.plantName}</span>}
          </p>
          {alert.actionLabel && alert.actionUrl && (
            <Link
              href={alert.actionUrl}
              className={`text-xs font-semibold flex items-center gap-1 hover:underline ${cfg.iconColor}`}
            >
              {alert.actionLabel} <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

const FILTERS = ['All', 'Active', 'Critical', 'Warning', 'Info', 'Resolved'] as const;
type Filter = (typeof FILTERS)[number];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('All');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Alert[]>('/alerts');
      setAlerts(data);
      setLastRefresh(new Date());
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const filtered = alerts.filter((a) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return !a.resolved;
    if (filter === 'Resolved') return a.resolved;
    return a.type === filter.toLowerCase();
  });

  const critical = alerts.filter((a) => a.type === 'critical' && !a.resolved).length;
  const warning  = alerts.filter((a) => a.type === 'warning'  && !a.resolved).length;
  const active   = alerts.filter((a) => !a.resolved).length;
  const total    = alerts.length;

  return (
    <AppLayout>
      <Header title="Alerts" subtitle="Live system notifications from sensors, plants & reminders" />
      <div className="p-6 space-y-6 max-w-4xl">

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Alerts',    value: total,    color: 'text-gray-800',  bg: 'bg-white',      border: 'border-gray-100' },
            { label: 'Active',          value: active,   color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-100' },
            { label: 'Critical',        value: critical, color: 'text-red-600',   bg: 'bg-red-50',     border: 'border-red-100' },
            { label: 'Warnings',        value: warning,  color: 'text-yellow-600',bg: 'bg-yellow-50',  border: 'border-yellow-100' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 shadow-sm`}>
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Critical banner */}
        {!loading && critical > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-700 text-sm">
                {critical} critical alert{critical > 1 ? 's' : ''} require immediate attention
              </p>
              <p className="text-red-500 text-xs">Check sensor readings and plant health below</p>
            </div>
            <button
              onClick={() => setFilter('Critical')}
              className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-xl hover:bg-red-200 transition-colors flex-shrink-0"
            >
              View Critical
            </button>
          </div>
        )}

        {/* Warnings banner */}
        {!loading && critical === 0 && warning > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
            <Bell className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="text-orange-700 font-medium text-sm">
              {warning} warning{warning > 1 ? 's' : ''} need your attention.
            </p>
          </div>
        )}

        {/* All clear */}
        {!loading && active === 0 && total > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700 font-semibold text-sm">All systems normal — no active alerts</p>
          </div>
        )}

        {/* Alert list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                    filter === f
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                  {f === 'Critical' && critical > 0 && (
                    <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{critical}</span>
                  )}
                  {f === 'Active' && active > 0 && (
                    <span className="ml-1.5 bg-orange-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">{active}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                Updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
              </span>
              <button
                onClick={fetchAlerts}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <p className="text-sm">Loading alerts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <CheckCircle className="w-10 h-10 text-gray-200" />
              <p className="text-sm font-medium">No alerts in this category</p>
              <p className="text-xs">Try switching the filter above</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400 text-center">
              Showing {filtered.length} of {total} alerts · Auto-refreshes every 60 seconds
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
