
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-context";
import { ShieldCheck, LayoutDashboard, Briefcase, Wrench, Wallet } from "lucide-react";

export default function Home() {
  const { login } = useAuth();

  const personas = [
    { role: 'Admin', icon: ShieldCheck, desc: 'Manage users and assign tasks' },
    { role: 'Marketing', icon: Briefcase, desc: 'Create tasks and find new jobs' },
    { role: 'Technician', icon: Wrench, desc: 'Work on tasks and log time' },
    { role: 'Finance', icon: Wallet, desc: 'View performance and accounting' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-5xl w-full space-y-12 text-center py-12">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary rounded-2xl shadow-xl">
              <LayoutDashboard className="w-14 h-14 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight text-primary">MoonSync Pro</h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              The ultimate IT Service ERP & Performance Management system.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {personas.map((persona) => (
            <Card 
              key={persona.role} 
              className="flex flex-col h-full hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 group bg-card/50 backdrop-blur-sm" 
              onClick={() => login(persona.role as any)}
            >
              <CardHeader className="space-y-2 flex-1 flex flex-col items-center justify-center p-6">
                <div className="p-3 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors mb-2">
                  <persona.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-2xl font-bold">{persona.role}</CardTitle>
                <CardDescription className="text-sm text-center leading-relaxed px-2">
                  {persona.desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 mt-auto">
                <Button variant="outline" className="w-full font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Sign in as {persona.role}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground pt-8 uppercase tracking-widest font-medium opacity-50">
          Powered by Next-Gen ERP Infrastructure
        </p>
      </div>
    </div>
  );
}
