
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-context";
import { ShieldCheck, LayoutDashboard, Briefcase, Wrench, Wallet, Lock, Building2, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const { login } = useAuth();
  const [isCompanyAuthenticated, setIsCompanyAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const personas = [
    { role: 'Admin', icon: ShieldCheck, desc: 'Manage users and assign tasks' },
    { role: 'Marketing', icon: Briefcase, desc: 'Create tasks and find new jobs' },
    { role: 'Technician', icon: Wrench, desc: 'Work on tasks and log time' },
    { role: 'Finance', icon: Wallet, desc: 'View performance and accounting' },
  ];

  const handleCompanyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    // Simulate a secure handshake
    setTimeout(() => {
      setIsCompanyAuthenticated(true);
      setIsAuthenticating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-5xl w-full space-y-12 text-center py-12 px-4 relative z-10">
        {!isCompanyAuthenticated ? (
          <div className="max-w-md mx-auto animate-fade-in space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary rounded-2xl shadow-2xl animate-bounce-slow">
                  <Building2 className="w-14 h-14 text-primary-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary">MoonSync Pro</h1>
                <p className="text-muted-foreground text-lg italic">Enterprise Portal Access</p>
              </div>
            </div>

            <Card className="border-2 border-primary/20 shadow-2xl bg-card/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Lock className="w-4 h-4 text-accent" />
                  Secure Handshake
                </CardTitle>
                <CardDescription>Enter company credentials to unlock the ERP infrastructure.</CardDescription>
              </CardHeader>
              <form onSubmit={handleCompanyLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Domain ID</label>
                    <Input 
                      placeholder="e.g. MOON-CORP-01" 
                      className="bg-background/50"
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Access Token</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="bg-background/50"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full h-12 text-lg font-bold group relative overflow-hidden" 
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Initialize Sync
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary rounded-2xl shadow-xl animate-pulse ring-4 ring-primary/20">
                  <ShieldCheck className="w-14 h-14 text-primary-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-500 font-bold text-sm uppercase tracking-widest mb-2">
                  <Sparkles className="w-4 h-4" />
                  Secure Link Established
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight text-primary">Secure Access Portal</h1>
                <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                  Credentials verified. Select your departmental role to proceed to the command center.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {personas.map((persona, idx) => (
                <Card 
                  key={persona.role} 
                  className={cn(
                    "flex flex-col h-full hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-primary group bg-card/50 backdrop-blur-sm",
                    "animate-in slide-in-from-bottom-8 duration-500 fill-mode-both"
                  )}
                  style={{ animationDelay: `${idx * 150}ms` }}
                  onClick={() => login(persona.role as any)}
                >
                  <CardHeader className="space-y-2 flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="p-3 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors mb-2">
                      <persona.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{persona.role}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed px-2 flex-grow">
                      {persona.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 mt-auto">
                    <Button variant="outline" className="w-full font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      Access Workspace
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              variant="link" 
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsCompanyAuthenticated(false)}
            >
              Sign out from {companyId || "Enterprise"}
            </Button>
          </div>
        )}

        <div className="pt-8 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-bold opacity-50 animate-pulse">
            ROSHAN TAMANG
          </p>
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-medium">
            Powered by Next-Gen ERP Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}
