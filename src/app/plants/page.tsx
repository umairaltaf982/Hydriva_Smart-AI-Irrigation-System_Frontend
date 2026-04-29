'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { plantsApi } from '@/lib/api';
import { Plus, Leaf, Trash2, Edit, Microscope, Heart, Clock, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Plant {
  _id: string; name: string; scientificName?: string; type: string;
  location?: string; image?: string; healthStatus: string; healthScore: number;
  wateringFrequency?: string; lastAnalyzed?: string; createdAt: string;
}

const healthColor = (s: string) => ({ Excellent:'text-green-600 bg-green-50 border-green-200', Good:'text-green-500 bg-green-50 border-green-200', Fair:'text-yellow-600 bg-yellow-50 border-yellow-200', Poor:'text-orange-600 bg-orange-50 border-orange-200', Critical:'text-red-600 bg-red-50 border-red-200', Unknown:'text-gray-500 bg-gray-50 border-gray-200' }[s] || 'text-gray-500 bg-gray-50 border-gray-200');
const typeEmoji: Record<string,string> = { Vegetable:'🥬',Fruit:'🍎',Flower:'🌸',Herb:'🌿',Tree:'🌳',Succulent:'🌵',Other:'🪴' };

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string|null>(null);

  const fetch = async () => { try { setPlants(await plantsApi.getAll()); } catch { toast.error('Could not load plants.'); } finally { setLoading(false); } };
  useEffect(()=>{ fetch(); },[]);

  const del = async (id:string, name:string) => {
    if(!confirm(`Delete "${name}"? All history and chat will be removed.`)) return;
    setDeleting(id);
    try { await plantsApi.delete(id); setPlants(p=>p.filter(x=>x._id!==id)); toast.success(`"${name}" deleted.`); }
    catch { toast.error('Delete failed.'); } finally { setDeleting(null); }
  };

  return (
    <AppLayout>
      <Header title="My Plants" subtitle="Manage and monitor all your plants" onRefresh={fetch} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">{plants.length} plant{plants.length!==1?'s':''} registered</p>
          <Link href="/plants/new" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Add Plant
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div>
        ) : plants.length===0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4"><Leaf className="w-10 h-10 text-green-300" /></div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No plants yet</h3>
            <p className="text-gray-400 mb-6 max-w-xs">Add your first plant to start tracking its health with AI-powered care.</p>
            <Link href="/plants/new" className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700">Add My First Plant</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plants.map(p=>(
              <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm card-hover overflow-hidden">
                <div className="h-44 bg-gradient-to-br from-green-50 to-emerald-100 relative">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-6xl">{typeEmoji[p.type]||'🪴'}</div>}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${healthColor(p.healthStatus)}`}>{p.healthStatus}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div><h3 className="font-bold text-gray-800 text-lg">{p.name}</h3>
                      {p.scientificName&&<p className="text-gray-400 italic text-xs">{p.scientificName}</p>}</div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{p.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 my-2 text-xs text-gray-500">
                    {p.location&&<span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{p.location}</span>}
                    {p.wateringFrequency&&<span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{p.wateringFrequency}</span>}
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3"/>Health</span>
                      <span className="font-semibold">{p.healthScore}/100</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.healthScore>=70?'bg-green-500':p.healthScore>=40?'bg-yellow-500':'bg-red-500'}`} style={{width:`${p.healthScore}%`}}/>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/plants/${p._id}`} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg text-center flex items-center justify-center gap-1">
                      <Microscope className="w-3.5 h-3.5"/> View &amp; Analyze
                    </Link>
                    <Link href={`/plants/${p._id}/edit`} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><Edit className="w-4 h-4 text-gray-500"/></Link>
                    <button onClick={()=>del(p._id,p.name)} disabled={deleting===p._id} className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200">
                      {deleting===p._id?<Loader2 className="w-4 h-4 text-red-400 animate-spin"/>:<Trash2 className="w-4 h-4 text-red-400"/>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
