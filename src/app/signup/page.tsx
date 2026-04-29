'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, AlertCircle, Droplets, Sprout, Home, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = [
  {
    value: 'farmer',
    label: 'Farmer',
    emoji: '🌾',
    desc: 'Managing crops, fields & large-scale irrigation',
    perks: ['Multi-field monitoring', 'Crop-specific schedules', 'Yield optimization'],
    icon: Sprout,
  },
  {
    value: 'customer',
    label: 'Home Gardener',
    emoji: '🏡',
    desc: 'Indoor plants, gardens & personal spaces',
    perks: ['Plant health tracking', 'Reminder system', 'AI plant advisor'],
    icon: Home,
  },
];

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role || 'farmer');
      toast.success('Account created! Welcome to Hydriva 🌱');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-5/12 hydriva-gradient relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">HYD<span className="text-green-300">RIVA</span></span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Join thousands of<br />
              <span className="text-green-300">smart growers.</span>
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Whether you&apos;re a large-scale farmer or a home gardener, Hydriva AI keeps your plants healthy and your water bills low.
            </p>
          </div>

          {/* Illustration - mock dashboard */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
            <p className="text-white/60 text-xs mb-3 font-medium">LIVE PLANT MONITOR</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Soil Moisture', val: '64%', icon: '💧', ok: true },
                { label: 'Temperature', val: '26°C', icon: '🌡️', ok: true },
                { label: 'Humidity', val: '71%', icon: '💨', ok: true },
                { label: 'Water Level', val: '85%', icon: '🪣', ok: true },
              ].map((m) => (
                <div key={m.label} className="bg-white/10 rounded-xl p-2.5">
                  <p className="text-white/50 text-xs">{m.label}</p>
                  <p className="text-white font-bold text-lg">{m.val}</p>
                  <p className="text-green-300 text-xs">✓ Optimal</p>
                </div>
              ))}
            </div>
            <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
              <div><p className="text-white text-sm font-semibold">Auto-Irrigation</p><p className="text-white/50 text-xs">Next: Tomorrow 7:00 AM</p></div>
              <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end pr-1 shadow-inner">
                <div className="w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['🧑‍🌾','👩‍🌾','🧑‍🌾'].map((e, i) => (
              <div key={i} className="w-8 h-8 bg-green-600 rounded-full border-2 border-green-800 flex items-center justify-center text-sm">{e}</div>
            ))}
          </div>
          <p className="text-white/60 text-sm"><span className="text-white font-semibold">2,400+ growers</span> already using Hydriva</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 hydriva-gradient rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">HYD<span className="text-green-600">RIVA</span></span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 w-12 rounded transition-all ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
            <p className="ml-2 text-xs text-gray-400">{step === 1 ? 'Choose your role' : 'Create account'}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            {step === 1 ? (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">How do you grow? 🌱</h1>
                  <p className="text-gray-500 text-sm">Choose your profile so we can personalize your experience</p>
                </div>
                <div className="space-y-4">
                  {roles.map((r) => (
                    <button key={r.value} type="button"
                      onClick={() => { setForm((f) => ({ ...f, role: r.value })); setStep(2); }}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md group ${form.role === r.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}>
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{r.emoji}</div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-base mb-0.5">{r.label}</p>
                          <p className="text-gray-400 text-sm mb-3">{r.desc}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {r.perks.map((p) => (
                              <span key={p} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">✓ {p}</span>
                            ))}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-gray-400 mt-5">You can change this later in settings</p>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <button onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1">← Back</button>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {form.role === 'farmer' ? 'Farmer' : 'Home Gardener'} account
                  </h1>
                  <p className="text-gray-500 text-sm">Fill in your details to get started</p>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl p-3.5 mb-5 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="John Doe" required
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com" required
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder="Min. 6 characters" required
                        className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all" />
                      <button type="button" onClick={() => setShowPw((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${form.password.length >= i*2 ? i<=2?'bg-red-400':i===3?'bg-yellow-400':'bg-green-500' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 mt-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
                    ) : (
                      <>Create My Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
