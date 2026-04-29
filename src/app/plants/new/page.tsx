'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { plantsApi, plantApi } from '@/lib/api';
import {
  Upload, Leaf, X, Loader2, Sparkles, CheckCircle, AlertTriangle,
  Camera, FlipHorizontal, ZoomIn, ImagePlus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES    = ['Vegetable', 'Fruit', 'Flower', 'Herb', 'Tree', 'Succulent', 'Other'];
const SUNLIGHT = ['Full Sun', 'Partial Shade', 'Full Shade'];
const SOILS    = ['Loamy', 'Sandy', 'Clay', 'Chalky', 'Peaty', 'Silty', 'Mixed'];

interface AIResult {
  plantName?: string;
  scientificName?: string;
  sunlightNeeds?: string;
  soilRecommendation?: string;
  careInstructions?: string[];
  healthStatus?: string;
  waterRequirement?: { frequency?: string; bestTime?: string; dailyAmount?: string };
}

// ─── Camera Modal ──────────────────────────────────────────────────────────────
function CameraModal({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode]   = useState<'environment' | 'user'>('environment');
  const [ready, setReady]             = useState(false);
  const [captured, setCaptured]       = useState<string | null>(null);
  const [error, setError]             = useState('');
  const [hasMultipleCams, setHasMultipleCams] = useState(false);

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    // Stop any existing stream first
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setReady(false);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }

      // Check if device has multiple cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCams(cams.length > 1);
    } catch {
      setError('Camera access denied. Please allow camera permissions in your browser settings.');
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
    setCaptured(null);
  };

  const capture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL('image/jpeg', 0.92));
  };

  const retake = () => setCaptured(null);

  const confirm = () => {
    if (!captured) return;
    // Convert base64 to File
    const byteString = atob(captured.split(',')[1]);
    const arr = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) arr[i] = byteString.charCodeAt(i);
    const file = new File([arr], `plant-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
    onCapture(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
              <Camera className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-bold text-gray-800">Take Plant Photo</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative bg-black aspect-[4/3] overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <Camera className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-white text-sm font-medium">{error}</p>
            </div>
          ) : captured ? (
            /* Captured preview */
            <img src={captured} alt="captured" className="w-full h-full object-cover" />
          ) : (
            /* Live viewfinder */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
              {/* Corner guides */}
              {ready && (
                <>
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-3 border-l-3 border-white rounded-tl-lg opacity-70" />
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-3 border-r-3 border-white rounded-tr-lg opacity-70" />
                  <div className="absolute bottom-16 left-4 w-10 h-10 border-b-3 border-l-3 border-white rounded-bl-lg opacity-70" />
                  <div className="absolute bottom-16 right-4 w-10 h-10 border-b-3 border-r-3 border-white rounded-br-lg opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <ZoomIn className="w-5 h-5 text-white/40" />
                  </div>
                </>
              )}
              {!ready && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </>
          )}

          {/* Flip button (top-right overlay) */}
          {!captured && !error && hasMultipleCams && (
            <button
              onClick={flipCamera}
              className="absolute top-3 right-3 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-black/60 transition-colors"
            >
              <FlipHorizontal className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Facing label */}
          {!captured && ready && (
            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full border border-white/20">
              {facingMode === 'environment' ? '📷 Back camera' : '🤳 Front camera'}
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Actions */}
        <div className="p-5">
          {!captured ? (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-2xl font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={capture}
                disabled={!ready || !!error}
                className="w-16 h-16 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-full flex items-center justify-center shadow-lg shadow-green-600/30 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-white rounded-full" />
              </button>
              {hasMultipleCams ? (
                <button
                  onClick={flipCamera}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <FlipHorizontal className="w-4 h-4" /> Flip
                </button>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={retake}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-2xl font-semibold text-sm transition-colors"
              >
                Retake
              </button>
              <button
                onClick={confirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <CheckCircle className="w-4 h-4" /> Use This Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NewPlantPage() {
  const router  = useRouter();
  const imgRef  = useRef<HTMLInputElement>(null);
  const [saving, setSaving]         = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [aiResult, setAiResult]     = useState<AIResult | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [form, setForm] = useState({
    name: '', scientificName: '', type: 'Other', location: '',
    notes: '', soilType: '', sunlightNeeds: 'Full Sun', image: '',
  });

  const runAIIdentify = async (file: File) => {
    setIdentifying(true);
    toast.loading('🔍 Identifying your plant with AI...', { id: 'identify' });
    try {
      const result: AIResult = await plantApi.analyze(file);
      setAiResult(result);
      toast.success('Plant identified! Form pre-filled.', { id: 'identify' });
      setForm((f) => ({
        ...f,
        name:          result.plantName              || f.name,
        scientificName: result.scientificName        || f.scientificName,
        type:           detectType(result.plantName  || '') || f.type,
        sunlightNeeds:  result.sunlightNeeds         || f.sunlightNeeds,
        soilType:       extractSoilType(result.soilRecommendation || '') || f.soilType,
        notes:          result.careInstructions?.slice(0, 3).join('. ') || f.notes,
      }));
    } catch {
      toast.error('Could not identify plant. Please fill in details manually.', { id: 'identify' });
    } finally {
      setIdentifying(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 8 * 1024 * 1024)    { toast.error('Image too large (max 8MB)'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setForm((f) => ({ ...f, image: result }));
    };
    reader.readAsDataURL(file);
    await runAIIdentify(file);
  };

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    handleFile(file);
  };

  const clearPhoto = () => {
    setPreview(null);
    setAiResult(null);
    setForm((f) => ({ ...f, image: '' }));
    if (imgRef.current) imgRef.current.value = '';
  };

  const detectType = (name: string): string => {
    const n = name.toLowerCase();
    if (/tomato|pepper|spinach|lettuce|carrot|cabbage|potato|onion|garlic|cucumber|bean|pea/.test(n)) return 'Vegetable';
    if (/apple|mango|banana|orange|grape|strawberry|lemon|papaya|guava/.test(n))                      return 'Fruit';
    if (/rose|tulip|daisy|sunflower|lily|orchid|jasmine|hibiscus/.test(n))                            return 'Flower';
    if (/mint|basil|coriander|thyme|lavender|parsley|sage/.test(n))                                   return 'Herb';
    if (/cactus|aloe|succulent|jade|echeveria/.test(n))                                               return 'Succulent';
    if (/oak|pine|mango tree|banana tree|palm/.test(n))                                               return 'Tree';
    return '';
  };

  const extractSoilType = (soilRec: string): string => {
    const s = soilRec.toLowerCase();
    if (s.includes('loam')) return 'Loamy';
    if (s.includes('sand')) return 'Sandy';
    if (s.includes('clay')) return 'Clay';
    if (s.includes('peat')) return 'Peaty';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Plant name is required'); return; }
    setSaving(true);
    try {
      const plant = await plantsApi.create(form as Record<string, unknown>);
      toast.success(`"${plant.name}" added successfully! 🌱`);
      router.push(`/plants/${plant._id}`);
    } catch {
      toast.error('Failed to add plant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      {showCamera && (
        <CameraModal onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}

      <Header title="Add New Plant" subtitle="Take a photo or upload — AI identifies your plant automatically" />
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Photo Section ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Plant Photo</h3>
              <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                <Sparkles className="w-3 h-3" /> AI Auto-Identify
              </div>
            </div>

            {preview ? (
              /* ── Preview state ── */
              <div className="relative rounded-2xl overflow-hidden border-2 border-green-300">
                <img src={preview} alt="preview" className="w-full h-60 object-cover" />
                {identifying && (
                  <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                    <p className="text-white font-semibold text-sm tracking-wide">Identifying with AI…</p>
                  </div>
                )}
                {!identifying && (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                )}
              </div>
            ) : (
              /* ── Empty state ── */
              <div className="border-2 border-dashed border-gray-200 rounded-2xl h-52 flex flex-col items-center justify-center gap-3 p-6 bg-gray-50/50">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                  <ImagePlus className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700 text-sm">Add a plant photo</p>
                  <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP · max 8 MB</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI will auto-fill the form for you
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* Take Photo */}
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>

              {/* Upload from Device */}
              <button
                type="button"
                onClick={() => imgRef.current?.click()}
                className="flex items-center justify-center gap-2 border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
            </div>

            {/* Change photo row (shown after capture) */}
            {preview && !identifying && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm py-2 rounded-xl transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" /> Retake
                </button>
                <button
                  type="button"
                  onClick={() => imgRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm py-2 rounded-xl transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" /> Change File
                </button>
              </div>
            )}

            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          {/* ── AI Result Banner ── */}
          {aiResult && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-800 text-sm">AI Identified: {aiResult.plantName}</p>
                  {aiResult.scientificName && (
                    <p className="text-green-600 text-xs italic">{aiResult.scientificName}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {aiResult.waterRequirement?.frequency && (
                      <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                        💧 {aiResult.waterRequirement.frequency}
                      </span>
                    )}
                    {aiResult.sunlightNeeds && (
                      <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                        ☀️ {aiResult.sunlightNeeds}
                      </span>
                    )}
                    {aiResult.healthStatus && (
                      <span className="text-xs bg-green-100 text-green-700 border border-green-300 px-2 py-0.5 rounded-full">
                        ❤️ {aiResult.healthStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-green-600/70 text-xs mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Review and edit the pre-filled details below
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Plant Details Form ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Plant Details</h3>
              {aiResult && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  AI pre-filled
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Plant Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Tomato"
                  required
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${aiResult?.plantName ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Scientific Name</label>
                <input
                  value={form.scientificName}
                  onChange={(e) => setForm((f) => ({ ...f, scientificName: e.target.value }))}
                  placeholder="e.g. Solanum lycopersicum"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${aiResult?.scientificName ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Plant Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Backyard, Balcony, Greenhouse"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Soil Type</label>
                <select
                  value={form.soilType}
                  onChange={(e) => setForm((f) => ({ ...f, soilType: e.target.value }))}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${aiResult?.soilRecommendation && form.soilType ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
                >
                  <option value="">Not sure</option>
                  {SOILS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sunlight Needs</label>
                <select
                  value={form.sunlightNeeds}
                  onChange={(e) => setForm((f) => ({ ...f, sunlightNeeds: e.target.value }))}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${aiResult?.sunlightNeeds ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
                >
                  {SUNLIGHT.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Care Notes
                {aiResult?.careInstructions && (
                  <span className="text-xs text-green-500 ml-1">(AI generated)</span>
                )}
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any special notes about this plant..."
                rows={3}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${aiResult?.careInstructions ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
              />
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || identifying}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Plant…</>
                : identifying
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Image…</>
                : <><Leaf className="w-4 h-4" /> Add Plant</>}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
