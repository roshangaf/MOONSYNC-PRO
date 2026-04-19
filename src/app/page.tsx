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
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-xl shadow-lg">
              <LayoutDashboard className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">MoonSync Pro</h1>
          <p className="text-muted-foreground text-lg">Next-generation IT Service ERP & Performance Management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona) => (
            <Card key={persona.role} className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/50 group" onClick={() => login(persona.role as any)}>
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-2">
                  <persona.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-xl">{persona.role}</CardTitle>
                <CardDescription className="text-xs">{persona.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Sign in as {persona.role}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
