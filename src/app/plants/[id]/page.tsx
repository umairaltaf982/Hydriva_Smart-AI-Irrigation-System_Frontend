'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { plantsApi, chatApi, remindersApi, sensorApi } from '@/lib/api';
import {
  Upload, Send, Trash2, Clock, Leaf, Heart, Droplets,
  Bot, User, Loader2, Bell, CheckCircle, ChevronDown, ChevronUp, Edit, ArrowLeft, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Plant {
  _id: string; name: string; scientificName?: string; type: string;
  location?: string; image?: string; healthStatus: string; healthScore: number;
  wateringFrequency?: string; lastAnalyzed?: string; notes?: string;
  soilType?: string; sunlightNeeds?: string;
}
interface Analysis {
  _id: string; createdAt: string; soilMoisture: number; temperature: number;
  humidity: number; aiResult: { healthStatus?: string; healthScore?: number; diseases?: string[]; waterRequirement?: { currentNeed?: string }; urgentActions?: string[]; careInstructions?: string[] };
}
interface ChatMsg { _id: string; role: string; content: string; createdAt: string; }
interface Reminder { _id: string; type: string; message: string; scheduledAt: string; isCompleted: boolean; }

const REMINDER_TYPES = ['watering', 'fertilizing', 'pruning', 'repotting', 'custom'];

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [tab, setTab] = useState<'analyze' | 'chat' | 'history' | 'reminders'>('analyze');
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [analyzeFile, setAnalyzeFile] = useState<File | null>(null);
  const [analyzePreview, setAnalyzePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
  const [reminderForm, setReminderForm] = useState({ type: 'watering', message: '', scheduledAt: '', recurring: false, recurringDays: 7 });
  const [addingReminder, setAddingReminder] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadAll = useCallback(async () => {
    try {
      const [p, a, c, r] = await Promise.all([
        plantsApi.getOne(id), plantsApi.getAnalyses(id),
        chatApi.getHistory(id), remindersApi.getAll(),
      ]);
      setPlant(p); setAnalyses(a); setMessages(c);
      setReminders(r.filter((x: Reminder & { plantId: string }) => x.plantId === id));
    } catch { toast.error('Failed to load plant.'); router.push('/plants'); }
    finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleAnalyze = async () => {
    if (!analyzeFile) return;
    setAnalyzing(true);
    try {
      let sensor = null;
      try { sensor = await sensorApi.getCurrent(); } catch {}
      const result = await plantsApi.analyze(id, analyzeFile, sensor?.soilMoisture, sensor?.temperature, sensor?.humidity);
      setPlant(result.plant);
      setAnalyses((prev) => [result.analysis, ...prev]);
      setAnalyzeFile(null); setAnalyzePreview(null);
      toast.success('Analysis complete!');
      setTab('history');
    } catch { toast.error('Analysis failed. Check API key in backend .env'); }
    finally { setAnalyzing(false); }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const text = chatInput; setChatInput(''); setChatLoading(true);
    const temp: ChatMsg = { _id: Date.now().toString(), role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages((p) => [...p, temp]);
    try {
      const res = await chatApi.send(id, text);
      setMessages((p) => [...p, res.assistantReply]);
    } catch { toast.error('Chat failed.'); }
    finally { setChatLoading(false); }
  };

  const clearChat = async () => {
    if (!confirm('Clear all chat history for this plant?')) return;
    await chatApi.clear(id); setMessages([]); toast.success('Chat cleared.');
  };

  const addReminder = async () => {
    if (!reminderForm.message || !reminderForm.scheduledAt) { toast.error('Please fill all reminder fields.'); return; }
    setAddingReminder(true);
    try {
      const r = await remindersApi.create({ ...reminderForm, plantId: id, plantName: plant?.name || '' });
      setReminders((p) => [...p, r]); setShowReminderForm(false);
      setReminderForm({ type: 'watering', message: '', scheduledAt: '', recurring: false, recurringDays: 7 });
      toast.success('Reminder set!');
    } catch { toast.error('Failed to add reminder.'); }
    finally { setAddingReminder(false); }
  };

  const completeReminder = async (remId: string) => {
    await remindersApi.complete(remId);
    setReminders((p) => p.map((r) => r._id === remId ? { ...r, isCompleted: true } : r));
    toast.success('Reminder completed!');
  };

  const deleteReminder = async (remId: string) => {
    await remindersApi.delete(remId);
    setReminders((p) => p.filter((r) => r._id !== remId));
    toast.success('Reminder removed.');
  };

  if (loading) return (
    <AppLayout><div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 text-green-600 animate-spin" /></div></AppLayout>
  );
  if (!plant) return null;

  const tabs = [
    { key: 'analyze', label: 'Analyze', icon: Upload },
    { key: 'chat', label: 'AI Chat', icon: Bot },
    { key: 'history', label: `History (${analyses.length})`, icon: Clock },
    { key: 'reminders', label: `Reminders (${reminders.filter(r=>!r.isCompleted).length})`, icon: Bell },
  ] as const;

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/plants')} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-4 h-4 text-gray-500" /></button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{plant.name}</h1>
            {plant.scientificName && <p className="text-xs text-gray-400 italic">{plant.scientificName}</p>}
          </div>
        </div>
        <Link href={`/plants/${id}/edit`} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
          <Edit className="w-3.5 h-3.5" /> Edit
        </Link>
      </div>

      <div className="p-6 space-y-5">
        {/* Plant overview card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-5">
          <div className="w-28 h-28 rounded-xl overflow-hidden bg-green-50 flex-shrink-0 flex items-center justify-center text-5xl">
            {plant.image ? <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" /> : '🪴'}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${{ Excellent:'text-green-600 bg-green-50 border-green-200', Good:'text-green-500 bg-green-50 border-green-200', Fair:'text-yellow-600 bg-yellow-50 border-yellow-200', Poor:'text-orange-500 bg-orange-50 border-orange-200', Critical:'text-red-600 bg-red-50 border-red-200', Unknown:'text-gray-500 bg-gray-50 border-gray-200' }[plant.healthStatus] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>{plant.healthStatus || 'Not analyzed'}</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{plant.type}</span>
              {plant.location && <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{plant.location}</span>}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-green-500" />
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${plant.healthScore>=70?'bg-green-500':plant.healthScore>=40?'bg-yellow-500':'bg-red-500'}`} style={{width:`${plant.healthScore}%`}} />
              </div>
              <span className="text-sm font-semibold text-gray-600">{plant.healthScore}/100</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {plant.wateringFrequency && <span className="flex items-center gap-1"><Droplets className="w-3 h-3"/>{plant.wateringFrequency}</span>}
              {plant.soilType && <span className="flex items-center gap-1"><Leaf className="w-3 h-3"/>{plant.soilType} soil</span>}
              {plant.lastAnalyzed && <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>Analyzed {format(new Date(plant.lastAnalyzed), 'MMM d, yyyy')}</span>}
            </div>
            {plant.notes && <p className="text-xs text-gray-400 mt-2 italic">{plant.notes}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key as typeof tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-medium transition-colors ${tab===key ? 'text-green-700 border-b-2 border-green-600 bg-green-50/50' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ANALYZE TAB */}
            {tab === 'analyze' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Upload a photo of your plant to get AI-powered health assessment and irrigation schedule.</p>
                <div
                  onClick={() => !analyzePreview && fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl transition-colors ${analyzePreview ? 'border-green-300' : 'border-gray-200 hover:border-green-400 cursor-pointer'}`}>
                  {analyzePreview ? (
                    <div className="relative">
                      <img src={analyzePreview} alt="preview" className="w-full h-56 object-cover rounded-xl" />
                      <button type="button" onClick={() => { setAnalyzeFile(null); setAnalyzePreview(null); }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"><X className="w-4 h-4 text-gray-600" /></button>
                    </div>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-gray-400 gap-2">
                      <Upload className="w-8 h-8" />
                      <p className="text-sm font-medium">Upload plant photo</p>
                      <p className="text-xs">Clear photo with leaves and soil visible gives best results</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  setAnalyzeFile(f); setAnalyzePreview(URL.createObjectURL(f));
                }} />
                {analyzePreview && (
                  <button onClick={handleAnalyze} disabled={analyzing}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    {analyzing ? <><Loader2 className="w-4 h-4 animate-spin"/>Analyzing with AI...</> : <><Leaf className="w-4 h-4"/>Run AI Analysis</>}
                  </button>
                )}
                {!analyzePreview && (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4"/> Select Photo to Analyze
                  </button>
                )}
              </div>
            )}

            {/* CHAT TAB */}
            {tab === 'chat' && (
              <div className="flex flex-col h-[420px]">
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 scrollbar-hide">
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Ask me anything about {plant.name}!</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-3">
                        {['How often to water?', 'Why are leaves yellowing?', 'Best fertilizer?'].map(q => (
                          <button key={q} onClick={() => setChatInput(q)}
                            className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 hover:bg-green-100">
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((m) => (
                    <div key={m._id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.role === 'assistant' && <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><Bot className="w-4 h-4 text-green-600" /></div>}
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        <p className={`text-xs mt-1 ${m.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>{format(new Date(m.createdAt), 'h:mm a')}</p>
                      </div>
                      {m.role === 'user' && <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><User className="w-4 h-4 text-blue-600" /></div>}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center"><Bot className="w-4 h-4 text-green-600" /></div>
                      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3"><div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div></div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2 border-t border-gray-100 pt-3">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
                    placeholder={`Ask about ${plant.name}...`}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2.5 rounded-xl transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                  {messages.length > 0 && (
                    <button onClick={clearChat} className="border border-gray-200 hover:bg-red-50 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {tab === 'history' && (
              <div className="space-y-3">
                {analyses.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No analysis history yet. Run your first analysis!</p>
                  </div>
                ) : analyses.map((a) => (
                  <div key={a._id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedAnalysis(expandedAnalysis === a._id ? null : a._id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${(a.aiResult.healthScore||0)>=70?'bg-green-100 text-green-700':(a.aiResult.healthScore||0)>=40?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>
                          {a.aiResult.healthScore||'?'}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800 text-sm">{a.aiResult.healthStatus || 'Analysis'}</p>
                          <p className="text-xs text-gray-400">{format(new Date(a.createdAt), 'MMM d, yyyy · h:mm a')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2 text-xs text-gray-500">
                          {a.soilMoisture>0&&<span>💧{a.soilMoisture}%</span>}
                          {a.temperature>0&&<span>🌡️{a.temperature}°C</span>}
                        </div>
                        {expandedAnalysis===a._id ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                      </div>
                    </button>
                    {expandedAnalysis===a._id && (
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                        {a.aiResult.diseases && a.aiResult.diseases.length > 0 && (
                          <div><p className="text-xs font-semibold text-orange-600 mb-1">Issues Detected</p>
                            {a.aiResult.diseases.map((d,i)=><p key={i} className="text-xs text-gray-600">⚠ {d}</p>)}</div>
                        )}
                        {a.aiResult.urgentActions && a.aiResult.urgentActions.length > 0 && (
                          <div><p className="text-xs font-semibold text-red-600 mb-1">Urgent Actions</p>
                            {a.aiResult.urgentActions.map((u,i)=><p key={i} className="text-xs text-gray-600">• {u}</p>)}</div>
                        )}
                        {a.aiResult.careInstructions && (
                          <div><p className="text-xs font-semibold text-green-600 mb-1">Care Tips</p>
                            {a.aiResult.careInstructions.slice(0,3).map((c,i)=><p key={i} className="text-xs text-gray-600">✓ {c}</p>)}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* REMINDERS TAB */}
            {tab === 'reminders' && (
              <div className="space-y-4">
                <button onClick={() => setShowReminderForm(!showReminderForm)}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-green-400 text-gray-500 hover:text-green-600 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                  <Bell className="w-4 h-4" /> {showReminderForm ? 'Cancel' : 'Set New Reminder'}
                </button>

                {showReminderForm && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select value={reminderForm.type} onChange={(e) => setReminderForm(f=>({...f,type:e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                          {REMINDER_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">When</label>
                        <input type="datetime-local" value={reminderForm.scheduledAt}
                          onChange={(e) => setReminderForm(f=>({...f,scheduledAt:e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                      <input value={reminderForm.message} onChange={(e) => setReminderForm(f=>({...f,message:e.target.value}))}
                        placeholder="e.g. Time to water the tomatoes!"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={reminderForm.recurring}
                          onChange={(e) => setReminderForm(f=>({...f,recurring:e.target.checked}))}
                          className="rounded" /> Recurring every
                        <input type="number" value={reminderForm.recurringDays}
                          onChange={(e) => setReminderForm(f=>({...f,recurringDays:parseInt(e.target.value)||1}))}
                          className="w-14 border border-gray-200 rounded px-2 py-1 text-xs" /> days
                      </label>
                    </div>
                    <button onClick={addReminder} disabled={addingReminder}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                      {addingReminder?<Loader2 className="w-4 h-4 animate-spin"/>:<Bell className="w-4 h-4"/>} Save Reminder
                    </button>
                  </div>
                )}

                {reminders.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">No reminders set for this plant yet.</div>
                ) : (
                  <div className="space-y-2">
                    {reminders.map((r) => (
                      <div key={r._id} className={`flex items-center gap-3 p-3 rounded-xl border ${r.isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${r.isCompleted ? 'bg-gray-100' : 'bg-green-100'}`}>
                          {r.type==='watering'?'💧':r.type==='fertilizing'?'🌱':r.type==='pruning'?'✂️':r.type==='repotting'?'🪴':'⏰'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${r.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>{r.message}</p>
                          <p className="text-xs text-gray-400">{format(new Date(r.scheduledAt), 'MMM d, yyyy · h:mm a')}</p>
                        </div>
                        <div className="flex gap-1">
                          {!r.isCompleted && (
                            <button onClick={() => completeReminder(r._id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500"><CheckCircle className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => deleteReminder(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
