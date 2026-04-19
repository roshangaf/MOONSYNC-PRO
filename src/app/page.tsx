
"use client"

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-context";
import { 
  ShieldCheck, 
  Briefcase, 
  Wrench, 
  Wallet, 
  Lock, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  BarChart3, 
  Users2, 
  Cpu,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const { login } = useAuth();
  const loginSectionRef = useRef<HTMLDivElement>(null);

  const scrollToLogin = () => {
    loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const personas = [
    { role: 'Admin', icon: ShieldCheck, desc: 'Complete organizational oversight, user provisioning, and high-level task delegation.' },
    { role: 'Marketing', icon: Briefcase, desc: 'Seamlessly capture client requirements and use AI to transform them into technical blueprints.' },
    { role: 'Technician', icon: Wrench, desc: 'Execution-focused workspace with integrated time tracking and step-by-step implementation guides.' },
    { role: 'Finance', icon: Wallet, desc: 'Deep-dive into billable hours, departmental efficiency, and resource allocation analytics.' },
  ];

  const features = [
    {
      title: "AI Task Architect",
      desc: "Transform vague client requests into detailed technical specifications using advanced Gemini-powered logic.",
      icon: Cpu,
      imageId: 'feature-ai'
    },
    {
      title: "Real-time Analytics",
      desc: "Monitor departmental KPIs and staff performance with dynamic charts and efficiency scoring.",
      icon: BarChart3,
      imageId: 'feature-stats'
    }
  ];

  const getImageUrl = (id: string) => {
    return PlaceHolderImages.find(img => img.id === id)?.imageUrl || `https://picsum.photos/seed/${id}/600/400`;
  };

  const getImageHint = (id: string) => {
    return PlaceHolderImages.find(img => img.id === id)?.imageHint || "technology";
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-border/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">MoonSync Pro</span>
        </div>
        <Button variant="default" onClick={scrollToLogin} className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20">
          Enter Portal
        </Button>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Next-Gen IT Service Management
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Synchronize Your <span className="text-primary">Enterprise</span> <br />
            with Precision.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            MoonSync Pro is the ultimate ERP infrastructure for modern IT service firms. 
            From AI-driven task refinement to granular performance analytics, we bridge the gap between marketing and execution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" onClick={scrollToLogin} className="h-14 px-8 text-lg rounded-xl shadow-xl shadow-primary/20 font-bold group">
              Launch Command Center
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl border-2 font-semibold">
              View Capabilities
            </Button>
          </div>
          
          <div className="relative pt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden border-4 border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] relative">
               <Image 
                src={getImageUrl('hero-dashboard')} 
                alt="MoonSync Dashboard" 
                width={1200} 
                height={800}
                className="w-full object-cover"
                priority
                data-ai-hint={getImageHint('hero-dashboard')}
              />
            </div>
            {/* Floating Stats Card Placeholder */}
            <div className="absolute -bottom-6 -right-6 md:bottom-12 md:-right-12 bg-white p-6 rounded-2xl shadow-2xl border border-border/50 animate-bounce-slow hidden sm:block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Output</p>
                  <p className="text-2xl font-bold text-slate-900">+142% Tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Engineered for Performance</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive suite of tools designed to optimize every aspect of your service delivery lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-border/50 shadow-sm hover:shadow-xl transition-all group">
                <div className="mb-6 inline-block p-4 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  {feature.desc}
                </p>
                <div className="rounded-2xl overflow-hidden border border-border/30">
                  <Image 
                    src={getImageUrl(feature.imageId)} 
                    alt={feature.title} 
                    width={600} 
                    height={400}
                    className="w-full object-cover aspect-video"
                    data-ai-hint={getImageHint(feature.imageId)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Organizations", value: "500+", icon: Building2 },
              { label: "Successful Deployments", value: "12k+", icon: CheckCircle2 },
              { label: "Satisfied Personnel", value: "45k+", icon: Users2 },
              { label: "Uptime SLA", value: "99.99%", icon: ShieldCheck },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-primary/60" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Access Section (Direct Persona Selection) */}
      <section ref={loginSectionRef} className="py-24 px-6 relative overflow-hidden bg-primary/5">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-5 bg-primary rounded-3xl shadow-2xl animate-pulse ring-8 ring-primary/5">
                  <ShieldCheck className="w-16 h-16 text-white" />
                </div>
              </div>
              <h2 className="text-5xl font-extrabold text-slate-900 pt-4">Direct Terminal Access</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Select your departmental persona to initialize your specialized terminal workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {personas.map((persona, idx) => (
                <Card 
                  key={persona.role} 
                  className={cn(
                    "flex flex-col h-full hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-primary group bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden",
                    "animate-in slide-in-from-bottom-12 duration-700 fill-mode-both"
                  )}
                  style={{ animationDelay: `${idx * 150}ms` }}
                  onClick={() => login(persona.role as any)}
                >
                  <CardHeader className="space-y-4 flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="p-4 rounded-2xl bg-primary/5 group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-2">
                      <persona.icon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">{persona.role}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {persona.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-8 pt-0 mt-auto">
                    <Button variant="outline" className="w-full h-12 font-bold rounded-xl group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                      Access Hub
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border/50 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-10">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">MoonSync Pro</span>
            </div>
            <p className="text-muted-foreground max-w-lg">
              Enterprise-grade IT Service Management for teams that demand absolute synchronization and performance.
            </p>
          </div>
          
          <div className="pt-8 border-t border-border/30 space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.4em] text-primary/40">
              ROSHAN TAMANG
            </p>
            <p className="text-xs text-muted-foreground/40 uppercase tracking-widest font-medium">
              &copy; 2024 MoonSync Pro Infrastructure. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
