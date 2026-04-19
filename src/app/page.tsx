
"use client"

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/components/auth-context";
import { 
  ShieldCheck, 
  Briefcase, 
  Wrench, 
  Wallet, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Users2, 
  Cpu,
  ChevronDown,
  Activity,
  Zap,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const { login } = useAuth();

  const features = [
    {
      title: "AI Task Architect",
      desc: "Gemini-powered logic transforms brief requests into precision technical blueprints.",
      icon: Cpu,
      imageId: 'feature-ai'
    },
    {
      title: "Real-time Analytics",
      desc: "Live KPI monitoring and efficiency scores across all departments.",
      icon: BarChart3,
      imageId: 'feature-stats'
    }
  ];

  const getImageUrl = (id: string) => {
    return PlaceHolderImages.find(img => img.id === id)?.imageUrl || `https://picsum.photos/seed/${id}/1200/800`;
  };

  const getImageHint = (id: string) => {
    return PlaceHolderImages.find(img => img.id === id)?.imageHint || "technology";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-slate-900 selection:bg-primary selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none -z-10" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center glass rounded-2xl px-6 py-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">MoonSync Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#" className="hover:text-primary transition-colors">Network</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
          </div>
          <Button onClick={() => login('Admin')} className="rounded-full px-8 font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            Admin Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-56 pb-32 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-12">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-primary text-xs font-bold uppercase tracking-widest">
              MOONSYNC PRO by JAGEER
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-slate-900">
              The Engine of <br />
              <span className="text-primary italic">Precision</span> IT.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Synchronize your entire infrastructure. From AI-driven technical blueprints to granular departmental analytics, MoonSync Pro is the ultimate terminal for modern service delivery.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => login('Admin')} className="h-16 px-10 text-lg rounded-2xl shadow-2xl shadow-primary/30 font-bold bg-primary group transition-all hover:-translate-y-1">
                Launch Command
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center gap-4 px-6 h-16 rounded-2xl border-2 border-slate-200 bg-white/50 backdrop-blur font-bold text-slate-700">
                <Activity className="w-5 h-5 text-emerald-500" />
                99.99% Uptime
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-4xl animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="relative z-10 p-4 glass rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">
               <Image 
                src={getImageUrl('hero-dashboard')} 
                alt="MoonSync Dashboard" 
                width={1200} 
                height={800}
                className="w-full rounded-[1.8rem] object-cover border border-slate-200/50"
                priority
                data-ai-hint={getImageHint('hero-dashboard')}
              />
            </div>
            
            {/* Abstract Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[120px] -z-10" />
            
            {/* Floating Stats */}
            <div className="absolute -top-12 -right-6 glass p-5 rounded-2xl shadow-2xl animate-float hidden xl:block">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sync Status</p>
                  <p className="text-sm font-black">All Systems Nominal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center gap-6 mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">Engineered for Scale</h2>
            <p className="text-lg text-slate-500 max-w-2xl">
              Custom-built architecture designed to eliminate friction between marketing capture and technical execution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group relative bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="flex justify-between items-start mb-10">
                  <div className="p-5 bg-slate-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <div className="text-4xl font-black text-slate-100 group-hover:text-primary/10 transition-colors">0{i+1}</div>
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 mb-10 text-lg leading-relaxed">
                  {feature.desc}
                </p>
                <div className="relative overflow-hidden rounded-2xl border border-slate-100">
                  <Image 
                    src={getImageUrl(feature.imageId)} 
                    alt={feature.title} 
                    width={600} 
                    height={400}
                    className="w-full object-cover aspect-video group-hover:scale-105 transition-transform duration-700"
                    data-ai-hint={getImageHint(feature.imageId)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">MoonSync Pro</span>
              </div>
              <p className="text-lg text-slate-500 max-w-sm leading-relaxed">
                Enterprise-grade IT Service Management. Built for teams that demand precision, performance, and synchronization.
              </p>
            </div>
            <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs text-slate-400">Company</h4>
              <ul className="space-y-4 font-bold text-slate-600">
                <li><a href="#" className="hover:text-primary transition-colors">Our Ethos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Architecture</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security Audit</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs text-slate-400">Legal</h4>
              <ul className="space-y-4 font-bold text-slate-600">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terminal Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">SLA Agreement</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-100 text-center space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.6em] text-primary/40">
              ROSHAN TAMANG
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
              &copy; 2024 MoonSync Pro Terminal. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
