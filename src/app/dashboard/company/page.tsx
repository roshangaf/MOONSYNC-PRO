'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  Edit2, 
  Save, 
  X, 
  Loader2, 
  Key, 
  ShieldAlert,
  Download,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/lib/types';
import * as XLSX from 'xlsx';
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
} from '@/components/ui/alert-dialog';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const DEFAULT_DEPT_KEYS: Record<Role, string> = {
  'Admin': 'SUPER-ADMIN-2024',
  'Marketing': 'CREATIVE-HUB-55',
  'Technician': 'FIELD-OPS-88',
  'Finance': 'AUDIT-PRO-11',
};

export default function CompanyPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const companyRef = useMemoFirebase(() => db ? doc(db, 'settings', 'company') : null, [db]);
  const { data: companyProfile, loading } = useDoc<any>(companyRef);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  
  const [tempData, setTempData] = useState<any>(null);

  useEffect(() => {
    if (companyProfile) {
      setTempData({ ...companyProfile });
    } else if (!loading) {
      setTempData({
        name: "MoonSync Pro Terminal Systems",
        domain: "moonsyncpro.io",
        vat: "VAT-601234567-NP",
        address: "Level 4, Tech Plaza, Kathmandu, Nepal",
        phone: "+977 1 4567890",
        email: "hq@moonsyncpro.io",
        deptKeys: DEFAULT_DEPT_KEYS
      });
    }
  }, [companyProfile, loading]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setTempData(companyProfile || tempData);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!db || !tempData || !companyRef) return;
    setIsSaving(true);
    
    setDoc(companyRef, tempData, { merge: true })
      .then(() => {
        setIsSaving(false);
        setIsEditing(false);
        toast({
          title: "Infrastructure Synchronized",
          description: "Corporate metadata and cloud security keys have been updated.",
        });
      })
      .catch(async (error) => {
        setIsSaving(false);
        const permissionError = new FirestorePermissionError({
          path: companyRef.path,
          operation: 'update',
          requestResourceData: tempData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleBackup = async () => {
    if (!db) return;
    setIsBackingUp(true);
    
    try {
      const wb = XLSX.utils.book_new();

      const collections = ['tasks', 'bills', 'attendance'];
      for (const colName of collections) {
        const snapshot = await getDocs(collection(db, colName));
        const data = snapshot.docs.map(doc => doc.data());
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, colName.charAt(0).toUpperCase() + colName.slice(1));
      }

      const fileName = `MoonSync_Cloud_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Cloud Backup Successful",
        description: `Full organizational audit log exported to ${fileName}.`,
      });
    } catch (error) {
      toast({
        title: "Backup Error",
        description: "Failed to extract cloud data for archival.",
        variant: "destructive"
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleResetInfrastructure = async () => {
    if (!db) return;
    
    const collections = ['tasks', 'bills', 'attendance', 'users'];
    const batch = writeBatch(db);

    for (const colName of collections) {
      const snapshot = await getDocs(collection(db, colName));
      snapshot.docs.forEach(d => batch.delete(d.ref));
    }
    
    batch.commit()
      .then(() => {
        toast({
          title: "Infrastructure Purged",
          description: "All cloud records and ledgers have been permanently removed.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = '/login', 1000);
      });
  };

  if (loading || !tempData) return <div className="p-10 text-center animate-pulse font-black uppercase tracking-widest text-primary">Handshaking with Cloud Node...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Company Control Center</h1>
          <p className="text-muted-foreground">Global administration of corporate identity and cloud security protocols.</p>
        </div>
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBackup} disabled={isBackingUp} className="font-bold uppercase text-xs tracking-widest h-10 border-slate-300">
              {isBackingUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Backup Cloud System
            </Button>
            <Button onClick={handleEdit} className="bg-primary font-bold uppercase text-xs tracking-widest h-10 shadow-lg shadow-primary/20">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
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
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Entity Name</Label>
              {isEditing ? (
                <Input value={tempData.name} onChange={(e) => setTempData({...tempData, name: e.target.value})} className="h-12 bg-slate-50 rounded-xl" />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <Building2 className="h-5 w-5 text-primary" />
                  <p className="text-md font-bold text-slate-900">{tempData.name}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Corporate Domain</Label>
              {isEditing ? (
                <Input value={tempData.domain} onChange={(e) => setTempData({...tempData, domain: e.target.value})} className="h-12 bg-slate-50 rounded-xl" />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <Globe className="h-5 w-5 text-primary" />
                  <p className="text-md font-bold text-slate-900">{tempData.domain}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tax Identity (VAT)</Label>
              {isEditing ? (
                <Input value={tempData.vat} onChange={(e) => setTempData({...tempData, vat: e.target.value})} className="h-12 bg-slate-50 rounded-xl" />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="text-md font-bold text-slate-900">{tempData.vat}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none overflow-hidden bg-white">
          <div className="h-1.5 bg-accent w-full" />
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-widest">Departmental Security Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(tempData.deptKeys || DEFAULT_DEPT_KEYS) as Role[]).map((role) => (
              <div key={role} className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">{role} Access Key</Label>
                {isEditing ? (
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={tempData.deptKeys?.[role] || ""} 
                      onChange={(e) => setTempData({...tempData, deptKeys: {...tempData.deptKeys, [role]: e.target.value}})}
                      className="bg-slate-50 border-slate-200 font-mono text-xs pl-10 h-10 rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-4 w-4 text-accent" />
                      <span className="text-xs font-mono font-bold text-white tracking-widest">••••••••••••</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-accent uppercase font-black">Encrypted</Badge>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="shadow-lg border-none overflow-hidden bg-white">
            <div className="h-1.5 bg-slate-900 w-full" />
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-widest">Danger Zone</CardTitle>
              <CardDescription className="text-destructive font-bold">Irreversible administrative actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-[11px] leading-relaxed text-destructive/80 font-bold">
                Executing a cloud reset will permanently purge all tasks, financial ledgers, and organizational identity metadata from MoonSync infrastructure.
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
                    <AlertDialogTitle className="font-black uppercase tracking-widest text-destructive">Confirm Cloud Infrastructure Purge?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is irreversible. All cloud task records, financial documents, and organizational settings will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abort</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetInfrastructure} className="bg-destructive hover:bg-destructive/90">Confirm Factory Reset</AlertDialogAction>
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
