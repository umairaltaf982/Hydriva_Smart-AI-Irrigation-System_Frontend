'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { plantsApi, irrigationApi } from '@/lib/api';
import { Droplets, CheckCircle, XCircle, Clock, BarChart2, Leaf, Heart, Loader2, CalendarDays, FlaskConical } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface Plant { _id: string; name: string; type: string; healthScore: number; healthStatus: string; }
interface Analysis { _id: string; plantId: string; createdAt: string; soilMoisture: number; temperature: number; humidity: number; aiResult: { healthStatus?: string; healthScore?: number; waterRequirement?: { currentNeed?: string }; diseases?: string[] }; }
interface IrrigationRecord { id: string; date: string; time: string; duration: number; amount: string; status: 'completed'|'scheduled'|'skipped'; reason: string; }

export default function HistoryPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [allAnalyses, setAllAnalyses] = useState<Analysis[]>([]);
  const [irrigationRecords, setIrrigationRecords] = useState<IrrigationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'irrigation'|'analysis'|'health'>('irrigation');
  const [plantMap, setPlantMap] = useState<Record<string,string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pts, irr] = await Promise.all([plantsApi.getAll(), irrigationApi.getHistory(50)]);
      setPlants(pts); setIrrigationRecords(irr);
      const map: Record<string,string> = {};
      pts.forEach((p: Plant) => { map[p._id] = p.name; });
      setPlantMap(map);
      const analyses: Analysis[] = [];
      await Promise.all(pts.map(async (p: Plant) => {
        try { const a = await plantsApi.getAnalyses(p._id); analyses.push(...a.map((x: Analysis) => ({...x, plantId: p._id}))); } catch {}
      }));
      analyses.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllAnalyses(analyses);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const waterChart = Array.from({length:7},(_,i) => {
    const d = subDays(new Date(), 6-i);
    const dateStr = format(d,'MMM d');
    const amt = irrigationRecords.filter(r => r.date===dateStr && r.status==='completed').reduce((s,r)=>s+(parseInt(r.amount)||0),0);
    return { day: format(d,'EEE'), amount: amt };
  });

  const healthTrend = allAnalyses.slice(0,7).reverse().map(a => ({
    date: format(new Date(a.createdAt),'MMM d'),
    health: a.aiResult.healthScore||0, moisture: a.soilMoisture,
  }));

  const statusIcon = { completed: <CheckCircle className="w-4 h-4 text-green-500"/>, skipped: <XCircle className="w-4 h-4 text-gray-400"/>, scheduled: <Clock className="w-4 h-4 text-blue-400"/> };
  const statusBadge = { completed:'bg-green-50 text-green-700 border-green-200', skipped:'bg-gray-50 text-gray-500 border-gray-200', scheduled:'bg-blue-50 text-blue-700 border-blue-200' };
  const healthBadge = (s:string) => ({Excellent:'text-green-600 bg-green-50 border-green-200',Good:'text-green-500 bg-green-50 border-green-200',Fair:'text-yellow-600 bg-yellow-50 border-yellow-200',Poor:'text-orange-500 bg-orange-50 border-orange-200',Critical:'text-red-600 bg-red-50 border-red-200'}[s]||'text-gray-500 bg-gray-50 border-gray-200');
  const typeEmoji = (t:string) => ({Vegetable:'🥬',Fruit:'🍎',Flower:'🌸',Herb:'🌿',Tree:'🌳',Succulent:'🌵'}[t]||'🪴');
  const totalWater = irrigationRecords.filter(r=>r.status==='completed').reduce((s,r)=>s+(parseInt(r.amount)||0),0);
  const avgHealth = plants.length ? Math.round(plants.reduce((s,p)=>s+p.healthScore,0)/plants.length) : 0;

  return (
    <AppLayout>
      <Header title="History" subtitle="Your complete plant care and irrigation timeline" onRefresh={load}/>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:'Total Water Used', value:`${(totalWater/1000).toFixed(1)}L`, icon:Droplets, color:'bg-blue-50 text-blue-600', sub:'this week' },
            { label:'Irrigations Done', value:irrigationRecords.filter(r=>r.status==='completed').length, icon:CheckCircle, color:'bg-green-50 text-green-600', sub:'completed' },
            { label:'Plants Tracked', value:plants.length, icon:Leaf, color:'bg-emerald-50 text-emerald-600', sub:'registered' },
            { label:'Avg Plant Health', value:`${avgHealth}%`, icon:Heart, color:'bg-pink-50 text-pink-600', sub:'overall' },
          ].map(s=>(
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}><s.icon className="w-5 h-5"/></div>
              <div><p className="text-xl font-bold text-gray-800">{loading?'—':s.value}</p><p className="text-xs text-gray-500">{s.label}</p><p className="text-xs text-gray-400">{s.sub}</p></div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-green-600"/>Weekly Water Usage (ml)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={waterChart}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="day" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip formatter={(v)=>[`${v}ml`,'Water Used']}/><Bar dataKey="amount" fill="#16a34a" radius={[6,6,0,0]}/></BarChart>
            </ResponsiveContainer>
          </div>
          {healthTrend.length > 1 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-500"/>Plant Health Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={healthTrend}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="date" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} domain={[0,100]}/><Tooltip/><Legend/><Line type="monotone" dataKey="health" stroke="#22c55e" strokeWidth={2} dot={{r:4}} name="Health %"/><Line type="monotone" dataKey="moisture" stroke="#3b82f6" strokeWidth={2} dot={{r:4}} name="Soil %"/></LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-center">
              <div className="text-center text-gray-400"><FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-30"/><p className="text-sm">Analyze plants to see health trends</p></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[{key:'irrigation',label:`Irrigation Log (${irrigationRecords.length})`,icon:Droplets},{key:'analysis',label:`Plant Analyses (${allAnalyses.length})`,icon:FlaskConical},{key:'health',label:`Plant Health (${plants.length})`,icon:Heart}].map(({key,label,icon:Icon})=>(
              <button key={key} onClick={()=>setActiveTab(key as typeof activeTab)} className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-medium transition-colors ${activeTab===key?'text-green-700 border-b-2 border-green-600 bg-green-50/50':'text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-4 h-4"/>{label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 text-green-600 animate-spin"/></div>
          ) : (
            <div>
              {activeTab==='irrigation' && (irrigationRecords.length===0 ? (
                <div className="py-12 text-center text-gray-400"><Droplets className="w-8 h-8 mx-auto mb-2 opacity-30"/><p>No irrigation events yet</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {irrigationRecords.map(r=>(
                    <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      {statusIcon[r.status]}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap"><p className="font-medium text-gray-700 text-sm">{r.date} · {r.time}</p><span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge[r.status]}`}>{r.status}</span></div>
                        <p className="text-xs text-gray-400 mt-0.5">{r.reason}</p>
                      </div>
                      <div className="text-right text-sm flex-shrink-0"><p className="font-bold text-gray-700">{r.amount}</p><p className="text-xs text-gray-400">{r.duration} min</p></div>
                    </div>
                  ))}
                </div>
              ))}

              {activeTab==='analysis' && (allAnalyses.length===0 ? (
                <div className="py-12 text-center text-gray-400"><FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-30"/><p>No plant analyses yet. Open a plant and run an analysis.</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {allAnalyses.map(a=>(
                    <div key={a._id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${(a.aiResult.healthScore||0)>=70?'bg-green-100 text-green-700':(a.aiResult.healthScore||0)>=40?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{a.aiResult.healthScore||'?'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap"><p className="font-semibold text-gray-800 text-sm">{plantMap[a.plantId]||'Plant'}</p><span className={`text-xs px-2 py-0.5 rounded-full border ${healthBadge(a.aiResult.healthStatus||'Unknown')}`}>{a.aiResult.healthStatus||'Unknown'}</span></div>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><CalendarDays className="w-3 h-3"/>{format(new Date(a.createdAt),'MMM d, yyyy · h:mm a')}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-500">
                            {a.soilMoisture>0&&<span>💧{a.soilMoisture}%</span>}{a.temperature>0&&<span>🌡️{a.temperature}°C</span>}{a.humidity>0&&<span>💨{a.humidity}%</span>}
                          </div>
                          {a.aiResult.diseases&&a.aiResult.diseases.length>0&&<p className="text-xs text-orange-500 mt-1">⚠ {a.aiResult.diseases[0]}</p>}
                        </div>
                        {a.aiResult.waterRequirement?.currentNeed&&<span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200 flex-shrink-0">{a.aiResult.waterRequirement.currentNeed}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {activeTab==='health' && (plants.length===0 ? (
                <div className="py-12 text-center text-gray-400"><Leaf className="w-8 h-8 mx-auto mb-2 opacity-30"/><p>No plants added yet</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {[...plants].sort((a,b)=>b.healthScore-a.healthScore).map(p=>(
                    <div key={p._id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{typeEmoji(p.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1"><p className="font-semibold text-gray-800 text-sm">{p.name}</p><span className={`text-xs px-2 py-0.5 rounded-full border ${healthBadge(p.healthStatus)}`}>{p.healthStatus}</span></div>
                          <div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${p.healthScore>=70?'bg-green-500':p.healthScore>=40?'bg-yellow-500':'bg-red-500'}`} style={{width:`${p.healthScore}%`}}/></div><span className="text-xs font-bold text-gray-600 w-8 text-right">{p.healthScore}%</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
