
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Globe, Mail, MapPin, Phone, ShieldCheck, Edit2, Save, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

  const [tempData, setTempData] = useState({ ...companyData })

  const handleEdit = () => {
    setTempData({ ...companyData })
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
      setIsSaving(false)
      setIsEditing(false)
      toast({
        title: "Company Profile Updated",
        description: "Corporate metadata has been successfully synchronized with the central ledger.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Company Profile</h1>
          <p className="text-muted-foreground">Manage your organization's digital identity and corporate metadata.</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="bg-primary font-bold uppercase text-xs tracking-widest h-10 shadow-lg shadow-primary/20">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel} className="uppercase font-bold text-xs tracking-widest h-10 border-slate-300">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary font-bold uppercase text-xs tracking-widest h-10 shadow-lg shadow-primary/20">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
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
            <CardTitle className="text-lg font-black uppercase tracking-widest">Contact & Location</CardTitle>
            <CardDescription>Official communication nodes and headquarters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Registered Office</Label>
              {isEditing ? (
                <Input 
                  value={tempData.address} 
                  onChange={(e) => setTempData({...tempData, address: e.target.value})}
                  className="bg-slate-50 border-slate-200 font-bold h-12 rounded-xl"
                />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <p className="text-md font-bold text-slate-900">{companyData.address}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Official Support</Label>
              {isEditing ? (
                <Input 
                  value={tempData.phone} 
                  onChange={(e) => setTempData({...tempData, phone: e.target.value})}
                  className="bg-slate-50 border-slate-200 font-bold h-12 rounded-xl"
                />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Phone className="h-5 w-5" />
                  </div>
                  <p className="text-md font-bold text-slate-900">{companyData.phone}</p>
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
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Mail className="h-5 w-5" />
                  </div>
                  <p className="text-md font-bold text-slate-900">{companyData.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
