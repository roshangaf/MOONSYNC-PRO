
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Globe, Mail, MapPin, Phone, ShieldCheck, Edit2, Save, X, Loader2, Key, ShieldAlert } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Role } from "@/lib/types"

const DEFAULT_DEPT_KEYS: Record<Role, string> = {
  'Admin': 'SUPER-ADMIN-2024',
  'Marketing': 'CREATIVE-HUB-55',
  'Technician': 'FIELD-OPS-88',
  'Finance': 'AUDIT-PRO-11',
};

export default function CompanyPage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [companyData, setCompanyData] = useState({
    name: "MoonSync Pro Terminal Systems",
    domain: "moonsyncpro.io",
    vat: "VAT-601234567-NP",
    address: "Level 4, Tech Plaza, Kathmandu, Nepal",
    phone: "+977 1 4567890",
    email: "hq@moonsyncpro.io"
  })

  const [deptKeys, setDeptKeys] = useState<Record<Role, string>>(DEFAULT_DEPT_KEYS)
  const [tempData, setTempData] = useState({ ...companyData })
  const [tempDeptKeys, setTempDeptKeys] = useState({ ...deptKeys })

  useEffect(() => {
    const savedKeys = localStorage.getItem('moonsync_dept_keys');
    if (savedKeys) {
      setDeptKeys(JSON.parse(savedKeys));
      setTempDeptKeys(JSON.parse(savedKeys));
    }
    const savedCompany = localStorage.getItem('moonsync_company_profile');
    if (savedCompany) {
      const parsed = JSON.parse(savedCompany);
      setCompanyData(parsed);
      setTempData(parsed);
    }
  }, []);

  const handleEdit = () => {
    setTempData({ ...companyData })
    setTempDeptKeys({ ...deptKeys })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API delay
    setTimeout(() => {
      setCompanyData({ ...tempData })
      setDeptKeys({ ...tempDeptKeys })
      localStorage.setItem('moonsync_company_profile', JSON.stringify(tempData));
      localStorage.setItem('moonsync_dept_keys', JSON.stringify(tempDeptKeys));
      setIsSaving(false)
      setIsEditing(false)
      toast({
        title: "Infrastructure Synchronized",
        description: "Corporate metadata and departmental security keys have been updated.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Company Control Center</h1>
          <p className="text-muted-foreground">Global administration of corporate identity and departmental security protocols.</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="bg-primary font-bold uppercase text-xs tracking-widest h-10 shadow-lg shadow-primary/20">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile & Security
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel} className="uppercase font-bold text-xs tracking-widest h-10 border-slate-300">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary font-bold uppercase text-xs tracking-widest h-10 shadow-lg shadow-primary/20">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save All Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-none overflow-hidden bg-white">
          <div className="h-1.5 bg-primary w-full" />
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-widest">General Information</CardTitle>
            <CardDescription>Core identity markers for MoonSync Pro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Entity Name</Label>
              {isEditing ? (
                <Input 
                  value={tempData.name} 
                  onChange={(e) => setTempData({...tempData, name: e.target.value})}
                  className="bg-slate-50 border-slate-200 font-bold h-12 rounded-xl"
                />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <p className="text-md font-bold text-slate-900">{companyData.name}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Corporate Domain</Label>
              {isEditing ? (
                <Input 
                  value={tempData.domain} 
                  onChange={(e) => setTempData({...tempData, domain: e.target.value})}
                  className="bg-slate-50 border-slate-200 font-bold h-12 rounded-xl"
                />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Globe className="h-5 w-5" />
                  </div>
                  <p className="text-md font-bold text-slate-900">{companyData.domain}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tax Identity (VAT)</Label>
              {isEditing ? (
                <Input 
                  value={tempData.vat} 
                  onChange={(e) => setTempData({...tempData, vat: e.target.value})}
                  className="bg-slate-50 border-slate-200 font-bold h-12 rounded-xl"
                />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <p className="text-md font-bold text-slate-900">{companyData.vat}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none overflow-hidden bg-white">
          <div className="h-1.5 bg-accent w-full" />
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-widest">Departmental Security Keys</CardTitle>
            <CardDescription>Unique access codes required for terminal login.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(deptKeys) as Role[]).map((role) => (
              <div key={role} className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">{role} Access Key</Label>
                {isEditing ? (
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={tempDeptKeys[role]} 
                      onChange={(e) => setTempDeptKeys({...tempDeptKeys, [role]: e.target.value})}
                      className="bg-slate-50 border-slate-200 font-mono text-xs pl-10 h-10 rounded-xl"
                      placeholder={`Key for ${role}`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-4 w-4 text-accent" />
                      <span className="text-xs font-mono font-bold text-white tracking-widest">••••••••••••</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-accent/20 text-accent font-black uppercase tracking-tighter">Encrypted</Badge>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-none overflow-hidden bg-white">
        <div className="h-1.5 bg-slate-900 w-full" />
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase tracking-widest">Official Contact Nodes</CardTitle>
          <CardDescription>Headquarters and administrative communication endpoints.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Registered Office</Label>
            {isEditing ? (
              <Input 
                value={tempData.address} 
                onChange={(e) => setTempData({...tempData, address: e.target.value})}
                className="bg-slate-50 border-slate-200 font-bold h-12 rounded-xl"
              />
            ) : (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <MapPin className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-bold text-slate-900">{companyData.address}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Support Line</Label>
            {isEditing ? (
              <Input 
                value={tempData.phone} 
                onChange={(e) => setTempData({...tempData, phone: e.target.value})}
                className="bg-slate-50 border-slate-200 font-bold h-12 rounded-xl"
              />
            ) : (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Phone className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-bold text-slate-900">{companyData.phone}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Admin Email</Label>
            {isEditing ? (
              <Input 
                value={tempData.email} 
                onChange={(e) => setTempData({...tempData, email: e.target.value})}
                className="bg-slate-50 border-slate-200 font-bold h-12 rounded-xl"
              />
            ) : (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Mail className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-bold text-slate-900">{companyData.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
