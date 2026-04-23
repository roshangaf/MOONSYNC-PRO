
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Globe, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Edit2, 
  Save, 
  X, 
  Loader2, 
  Key, 
  ShieldAlert,
  Download,
  Database,
  FileSpreadsheet,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Role } from "@/lib/types"
import * as XLSX from 'xlsx'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  const [isBackingUp, setIsBackingUp] = useState(false)
  
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

  const handleBackup = () => {
    setIsBackingUp(true);
    
    setTimeout(() => {
      try {
        const tasks = JSON.parse(localStorage.getItem('moonsync_tasks') || '[]');
        const bills = JSON.parse(localStorage.getItem('moonsync_bills') || '[]');
        const attendance = JSON.parse(localStorage.getItem('moonsync_attendance') || '[]');

        const wb = XLSX.utils.book_new();

        // Tasks Sheet
        const wsTasks = XLSX.utils.json_to_sheet(tasks);
        XLSX.utils.book_append_sheet(wb, wsTasks, "Tasks");

        // Bills Sheet
        const wsBills = XLSX.utils.json_to_sheet(bills.map((b: any) => ({
          ...b,
          items: JSON.stringify(b.items) // Flatten items for sheet view
        })));
        XLSX.utils.book_append_sheet(wb, wsBills, "Financials");

        // Attendance Sheet
        const wsAttendance = XLSX.utils.json_to_sheet(attendance);
        XLSX.utils.book_append_sheet(wb, wsAttendance, "Attendance");

        // Export file
        const fileName = `MoonSync_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast({
          title: "System Backup Successful",
          description: `Full organization data exported to ${fileName}.`,
        });
      } catch (error) {
        toast({
          title: "Backup Error",
          description: "Failed to extract local data for backup.",
          variant: "destructive"
        });
      } finally {
        setIsBackingUp(false);
      }
    }, 1500);
  }

  const handleResetInfrastructure = () => {
    localStorage.removeItem('moonsync_tasks');
    localStorage.removeItem('moonsync_bills');
    localStorage.removeItem('moonsync_attendance');
    localStorage.removeItem('moonsync_company_profile');
    localStorage.removeItem('moonsync_dept_keys');
    localStorage.removeItem('company_verified');
    localStorage.removeItem('performa_user');
    localStorage.removeItem('moonsync_last_company');
    localStorage.setItem('moonsync_was_reset', 'true');
    
    toast({
      title: "Infrastructure Purged",
      description: "All organizational records, ledgers, and profile metadata have been permanently removed.",
      variant: "destructive",
    });

    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Company Control Center</h1>
          <p className="text-muted-foreground">Global administration of corporate identity and departmental security protocols.</p>
        </div>
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBackup} disabled={isBackingUp} className="font-bold uppercase text-xs tracking-widest h-10 border-slate-300">
              {isBackingUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Backup System (.xlsx)
            </Button>
            <Button onClick={handleEdit} className="bg-primary font-bold uppercase text-xs tracking-widest h-10 shadow-lg shadow-primary/20">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile & Security
            </Button>
          </div>
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-lg border-none overflow-hidden bg-white h-full">
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

        <div className="space-y-6">
          <Card className="shadow-lg border-none overflow-hidden bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Data Integrity
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">Offline archival and disaster recovery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] leading-relaxed text-slate-300">
                Generate an immutable snapshot of all terminal data, including task ledgers, financial records, and personnel logs.
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 font-black uppercase text-[10px] tracking-[0.2em] h-12"
                onClick={handleBackup}
                disabled={isBackingUp}
              >
                {isBackingUp ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                )}
                {isBackingUp ? "Compiling..." : "Full System Export"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-2 border-destructive/50 overflow-hidden bg-white">
            <CardHeader className="bg-destructive/5 border-b border-destructive/10">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-destructive/80 text-xs font-medium">Irreversible administrative actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-[11px] leading-relaxed text-destructive/80 font-bold">
                Executing a factory reset will permanently purge all tasks, financial ledgers, and organizational identity metadata.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full font-black uppercase text-[10px] tracking-[0.2em] h-12 shadow-lg shadow-destructive/20">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset Infrastructure
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-black uppercase tracking-widest text-destructive">Confirm Infrastructure Purge?</AlertDialogTitle>
                    <AlertDialogDescription className="font-medium">
                      This action is irreversible. All task records (jobs done), financial documents, and organizational settings will be permanently deleted from the terminal.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-bold uppercase text-xs">Abort</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetInfrastructure}
                      className="bg-destructive hover:bg-destructive/90 font-bold uppercase text-xs"
                    >
                      Confirm Factory Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
