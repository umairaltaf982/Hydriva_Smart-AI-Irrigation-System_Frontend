'use client';
import Link from 'next/link';
import {
  Droplets,
  Thermometer,
  Wind,
  Brain,
  Smartphone,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Wifi,
  Leaf,
  Shield,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    desc: 'Advanced algorithms analyze soil moisture, temperature, and humidity to determine optimal watering schedules.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Droplets,
    title: 'Smart Irrigation Control',
    desc: 'Automatically delivers the precise amount of water needed — no more, no less. Save up to 40% water.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Leaf,
    title: 'Plant Health Monitoring',
    desc: 'Upload a photo of your plant and get instant AI diagnosis with tailored care recommendations.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Thermometer,
    title: 'Real-Time Sensor Data',
    desc: 'Live monitoring of soil moisture, temperature, humidity, and water levels from connected sensors.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile Dashboard',
    desc: 'Monitor and control your irrigation system from anywhere via our responsive web dashboard.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    desc: 'Detailed water usage history and trends to help you optimize resources and reduce costs.',
    color: 'bg-indigo-50 text-indigo-600',
  },
];

const stats = [
  { value: '40%', label: 'Water Saved' },
  { value: '99%', label: 'Uptime' },
  { value: '2x', label: 'Plant Health' },
  { value: '24/7', label: 'Monitoring' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl hydriva-gradient flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">
              HYD<span className="text-green-600">RIVA</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-green-600 transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-green-600 transition-colors">Why Hydriva</a>
          </div>
          <Link
            href="/dashboard"
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 hydriva-gradient text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-green-300 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-blue-300 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm mb-6">
                <Wifi className="w-4 h-4 text-green-300" />
                <span>AI-Powered Smart Irrigation</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Smart Watering.<br />
                <span className="text-green-300">Healthy Growth.</span>
              </h1>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Hydriva uses artificial intelligence to monitor your plants&apos; environment and
                automatically deliver the right amount of water at the right time —
                reducing waste and maximizing plant health.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="bg-white text-green-700 hover:bg-green-50 px-8 py-3.5 rounded-xl font-bold text-base transition-colors flex items-center gap-2 shadow-lg"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/plants"
                  className="border border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold text-base transition-colors flex items-center gap-2"
                >
                  <Leaf className="w-5 h-5" /> Analyze Plant
                </Link>
              </div>
            </div>

            {/* Mock dashboard card */}
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Good Morning!</p>
                    <p className="text-white font-bold text-lg">Your plants are healthy.</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/30 rounded-xl flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-300" />
                  </div>
                </div>
                <p className="text-white/60 text-xs mb-4">Live Monitor</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Soil Moisture', value: '42%', status: 'Optimal', icon: '💧', color: 'border-blue-400/30' },
                    { label: 'Temperature', value: '28°C', status: 'Normal', icon: '🌡️', color: 'border-orange-400/30' },
                    { label: 'Humidity', value: '65%', status: 'Normal', icon: '💧', color: 'border-blue-400/30' },
                    { label: 'Water Level', value: '78%', status: 'Sufficient', icon: '🪣', color: 'border-green-400/30' },
                  ].map((item) => (
                    <div key={item.label} className={`bg-white/10 border ${item.color} rounded-xl p-3`}>
                      <p className="text-white/60 text-xs">{item.label}</p>
                      <p className="text-white text-xl font-bold">{item.value}</p>
                      <p className="text-green-300 text-xs">{item.status}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">Auto Mode</p>
                    <p className="text-white/60 text-xs">Next Watering: Tomorrow, 7:00 AM</p>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end pr-1">
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">{s.value}</p>
                <p className="text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Everything You Need for <span className="gradient-text">Smart Irrigation</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From real-time sensor monitoring to AI-driven plant health analysis,
              Hydriva covers every aspect of intelligent irrigation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg card-hover bg-white">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How Hydriva Works</h2>
            <p className="text-gray-500 text-lg">Three simple steps to smarter irrigation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Sensors Collect Data',
                desc: 'IoT sensors continuously measure soil moisture, temperature, humidity, and water levels in real time.',
                icon: Wifi,
              },
              {
                step: '02',
                title: 'AI Analyzes Conditions',
                desc: 'Our AI engine processes sensor data along with weather forecasts to determine precise watering needs.',
                icon: Brain,
              },
              {
                step: '03',
                title: 'Smart Water Delivery',
                desc: 'The system automatically triggers irrigation at the optimal time with the exact amount of water needed.',
                icon: Droplets,
              },
            ].map((step) => (
              <div key={step.step} className="relative text-center">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-0 right-0 -mr-4 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs hidden md:flex">
                  {step.step}
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 hydriva-gradient text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="w-12 h-12 text-green-300 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to Grow Smarter?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Start monitoring your plants today. Connect your sensors, upload a plant photo,
            and let Hydriva&apos;s AI take care of the rest.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="bg-white text-green-700 hover:bg-green-50 px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center gap-2"
            >
              Open Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/plants"
              className="border-2 border-white/30 hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Analyze My Plant
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg hydriva-gradient flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              HYD<span className="text-green-400">RIVA</span>
            </span>
          </div>
          <p className="text-sm">Smart Watering. Healthy Growth. &mdash; &copy; {new Date().getFullYear()} Hydriva</p>
        </div>
      </footer>
    </div>
  );
}
