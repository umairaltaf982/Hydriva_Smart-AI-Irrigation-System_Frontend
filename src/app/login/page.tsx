'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, AlertCircle, Droplets, Leaf, Brain, BarChart3, Wifi, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
  { icon: Brain, text: 'AI-powered plant health analysis' },
  { icon: Droplets, text: 'Smart automated irrigation' },
  { icon: BarChart3, text: 'Real-time sensor monitoring' },
  { icon: Wifi, text: 'Live weather & soil data' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🌱');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 hydriva-gradient relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              HYD<span className="text-green-300">RIVA</span>
            </span>
          </div>
          <p className="text-white/60 text-sm ml-1">Smart Watering. Healthy Growth.</p>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Grow smarter,<br />
              <span className="text-green-300">not harder.</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Hydriva uses AI to monitor your plants in real-time and automatically deliver the right amount of water at the perfect moment.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-green-300" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: '40%', label: 'Water Saved' },
              { val: '24/7', label: 'Monitoring' },
              { val: '99%', label: 'Accuracy' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 text-center">
                <p className="text-xl font-bold text-white">{s.val}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <blockquote className="border-l-2 border-green-400 pl-4">
            <p className="text-white/70 text-sm italic">"Hydriva transformed how I manage my farm. Water usage dropped by 42% in the first month."</p>
            <footer className="text-green-300 text-xs mt-1 font-medium">— Ahmed K., Farmer</footer>
          </blockquote>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 hydriva-gradient rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">HYD<span className="text-green-600">RIVA</span></span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back 👋</h1>
              <p className="text-gray-500 text-sm">Sign in to your Hydriva account</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl p-3.5 mb-5 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-green-400 transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" required
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-green-400 transition-all"
                  />
                  <button type="button" onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-green-400 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 mt-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                ) : (
                  <><Leaf className="w-4 h-4" />Sign In<ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">New to Hydriva?</span></div>
            </div>

            <Link href="/signup"
              className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700 hover:text-green-700 py-3 rounded-xl font-semibold text-sm transition-all duration-200">
              Create a free account
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to Hydriva&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
