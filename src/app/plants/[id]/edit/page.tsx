'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { plantsApi } from '@/lib/api';
import { Upload, Save, ArrowLeft, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = ['Vegetable', 'Fruit', 'Flower', 'Herb', 'Tree', 'Succulent', 'Other'];
const SUNLIGHT = ['Full Sun', 'Partial Shade', 'Full Shade'];
const SOILS = ['Loamy', 'Sandy', 'Clay', 'Chalky', 'Peaty', 'Silty', 'Mixed'];

export default function EditPlantPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const imgRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', scientificName: '', type: 'Other', location: '', notes: '', soilType: '', sunlightNeeds: 'Full Sun', image: '' });

  useEffect(() => {
    plantsApi.getOne(id).then((p) => {
      setForm({ name: p.name || '', scientificName: p.scientificName || '', type: p.type || 'Other', location: p.location || '', notes: p.notes || '', soilType: p.soilType || '', sunlightNeeds: p.sunlightNeeds || 'Full Sun', image: p.image || '' });
    }).catch(() => { toast.error('Plant not found'); router.push('/plants'); })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleImg = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setForm((f) => ({ ...f, image: e.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await plantsApi.update(id, form as Record<string, unknown>);
      toast.success('Plant updated!');
      router.push(`/plants/${id}`);
    } catch { toast.error('Update failed.'); } finally { setSaving(false); }
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push(`/plants/${id}`)} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-4 h-4 text-gray-500" /></button>
        <h1 className="text-lg font-bold text-gray-800">Edit Plant</h1>
      </div>
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Plant Photo</h3>
            <div onClick={() => !form.image && imgRef.current?.click()}
              className={`border-2 border-dashed rounded-xl overflow-hidden ${form.image ? 'border-green-300' : 'border-gray-200 hover:border-green-400 cursor-pointer'}`}>
              {form.image ? (
                <div className="relative">
                  <img src={form.image} alt="plant" className="w-full h-48 object-cover" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, image: '' }))} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"><X className="w-4 h-4 text-gray-600" /></button>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Upload className="w-8 h-8" /><p className="text-sm">Click to upload</p>
                </div>
              )}
            </div>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImg(e.target.files[0])} />
            {form.image && <button type="button" onClick={() => imgRef.current?.click()} className="mt-2 text-sm text-green-600 hover:underline">Change photo</button>}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-800">Plant Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Plant Name *', key: 'name', placeholder: 'e.g. Tomato', required: true },
                { label: 'Scientific Name', key: 'scientificName', placeholder: 'e.g. Solanum lycopersicum' },
                { label: 'Location', key: 'location', placeholder: 'e.g. Backyard' },
              ].map(({ label, key, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} required={required}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
              {[
                { label: 'Plant Type', key: 'type', opts: TYPES },
                { label: 'Soil Type', key: 'soilType', opts: ['', ...SOILS] },
                { label: 'Sunlight', key: 'sunlightNeeds', opts: SUNLIGHT },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <select value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {opts.map((o) => <option key={o} value={o}>{o || 'Not sure'}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any special notes..." rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => router.push(`/plants/${id}`)} className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 py-3 rounded-xl font-semibold">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin"/>Saving...</> : <><Save className="w-4 h-4"/>Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
