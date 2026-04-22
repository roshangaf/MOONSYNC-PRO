
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Globe, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"

export default function CompanyPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Company Profile</h1>
        <p className="text-muted-foreground">Manage your organization's digital identity and corporate metadata.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-none overflow-hidden bg-white">
          <div className="h-1.5 bg-primary w-full" />
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-widest">General Information</CardTitle>
            <CardDescription>Core identity markers for MoonSync Pro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Entity Name</p>
                <p className="text-md font-bold text-slate-900">MoonSync Pro Terminal Systems</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Corporate Domain</p>
                <p className="text-md font-bold text-slate-900">moonsyncpro.io</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tax Identity (VAT)</p>
                <p className="text-md font-bold text-slate-900">VAT-601234567-NP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none overflow-hidden bg-white">
          <div className="h-1.5 bg-accent w-full" />
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-widest">Contact & Location</CardTitle>
            <CardDescription>Official communication nodes and headquarters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Registered Office</p>
                <p className="text-md font-bold text-slate-900">Level 4, Tech Plaza, Kathmandu, Nepal</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Official Support</p>
                <p className="text-md font-bold text-slate-900">+977 1 4567890</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Admin Email</p>
                <p className="text-md font-bold text-slate-900">hq@moonsyncpro.io</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
