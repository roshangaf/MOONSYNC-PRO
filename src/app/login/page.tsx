
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, ShieldCheck, Lock, ArrowRight, Loader2, User as UserIcon, Fingerprint, ShieldAlert } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"
import { Role, User } from "@/lib/types"
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, where, doc, setDoc } from "firebase/firestore"

const DEFAULT_DEPT_KEYS: Record<Role, string> = {
  'Admin': 'SUPER-ADMIN-2024',
  'Marketing': 'CREATIVE-HUB-55',
  'Technician': 'FIELD-OPS-88',
  'Finance': 'AUDIT-PRO-11',
};

export default function CompanyLoginPage() {
  const [domain, setDomain] = useState("")
  const [token, setToken] = useState("")
  const [deptKey, setDeptKey] = useState("")
  const [personalPin, setPersonalPin] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const db = useFirestore()

  const companyRef = useMemoFirebase(() => db ? doc(db, 'settings', 'company') : null, [db]);
  const { data: companySettings } = useDoc<any>(companyRef);

  const allUsersQuery = useMemoFirebase(() => db ? collection(db, 'users') : null, [db]);
  const { data: allUsers = [] } = useCollection<User>(allUsersQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!db || !selectedRole) return null;
    return query(collection(db, 'users'), where('role', '==', selectedRole));
  }, [db, selectedRole]);

  const { data: users = [] } = useCollection<User>(usersQuery);

  useEffect(() => {
    const companyVerified = localStorage.getItem('company_verified') === 'true';
    if (companyVerified) {
      setStep(2);
    }
  }, []);

  const handleCompanyVerify = (e: React.FormEvent) => {
    e.preventDefault()
    const currentDomain = domain.trim().toLowerCase();

    const isValidMoonSync = currentDomain.includes("moonsync") && token === "0621";
    const isValidMansa = currentDomain.includes("mansa") && token === "6767";

    if (!isValidMoonSync && !isValidMansa) {
      toast({
        title: "Security Violation",
        description: "Invalid company domain or security token.",
        variant: "destructive"
      })
      return
    }
    
    setStep(2)
    localStorage.setItem('company_verified', 'true');
    toast({
      title: "Access Granted",
      description: "Cloud handshake successful.",
    })
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setStep(3)
  }

  const handleDeptVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return;

    const cloudKeys = companySettings?.deptKeys || DEFAULT_DEPT_KEYS;
    const expectedKey = cloudKeys[selectedRole] || DEFAULT_DEPT_KEYS[selectedRole];

    if (deptKey !== expectedKey) {
      toast({
        title: "Invalid Department Signature",
        description: `Incorrect key for the ${selectedRole} hub.`,
        variant: "destructive"
      })
      return
    }

    setStep(4)
    toast({
      title: "Department Unlocked",
      description: "Identity verification required.",
    })
  }

  const handlePersonalLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const foundUser = users.find(u => u.id === selectedUserId);

    if (!foundUser || personalPin !== foundUser.pin) {
      toast({
        title: "Verification Failed",
        description: "Invalid security PIN.",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    login(foundUser); 
  }

  const handleSeedAdmin = async () => {
    if (!db) return;
    setIsVerifying(true);
    const adminId = 'ADMIN-ROSHAN';
    const adminData: User = {
      id: adminId,
      name: 'Roshan Admin',
      email: 'roshan@moonsyncpro.io',
      role: 'Admin',
      department: 'Administration',
      pin: '0000'
    };
    
    const userRef = doc(db, 'users', adminId);
    setDoc(userRef, adminData).then(() => {
      toast({
        title: "Admin Initialized",
        description: "Roshan Admin created with PIN 0000.",
      });
      setIsVerifying(false);
    });
  };

  const handleReset = () => {
    setStep(1);
    localStorage.removeItem('company_verified');
    setSelectedRole(null);
    setDeptKey("");
    setPersonalPin("");
    setSelectedUserId("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-body">
       <div className="fixed inset-0 mesh-gradient -z-10" />
       
       <Card className="w-full max-w-md glass border-white/20 shadow-2xl animate-fade-in overflow-hidden">
         <div className="h-2 bg-primary" />
         <CardHeader className="text-center space-y-4 pt-10">
           <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
             {step >= 3 ? <ShieldCheck className="w-10 h-10 text-white" /> : <Building2 className="w-10 h-10 text-white" />}
           </div>
           <div>
             <CardTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">
               {step === 1 ? "Company Access" : step === 2 ? "Terminal Selection" : step === 3 ? `${selectedRole} HUB` : "Identity Sync"}
             </CardTitle>
             <CardDescription className="text-slate-500 font-medium">
               {step === 1 
                 ? "Establish cloud handshake." 
                 : step === 2 
                 ? "Select terminal signature."
                 : step === 3
                 ? `Enter ${selectedRole} access key.`
                 : "Verify identity and PIN."}
             </CardDescription>
           </div>
         </CardHeader>
         <CardContent className="pb-10">
            {step === 1 && (
              <form onSubmit={handleCompanyVerify} className="space-y-6" autoComplete="off">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Infrastructure Domain
                  </label>
                  <Input 
                    name="org-node-domain"
                    placeholder="Mansa Tech / MoonSync Pro" 
                    className="h-12 bg-white/50 border-slate-200 focus:ring-primary/20 rounded-xl font-bold"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Security Token
                  </label>
                  <Input 
                    name="org-node-token"
                    type="password"
                    placeholder="Enter Token" 
                    className="h-12 bg-white/50 border-slate-200 focus:ring-primary/20 rounded-xl font-mono"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest shadow-xl shadow-primary/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isVerifying}
                >
                  {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Establish Handshake"}
                </Button>
              </form>
            )}

            {step === 2 && (
              <div className="grid gap-3">
                {(['Admin', 'Marketing', 'Technician', 'Finance'] as Role[]).map((role) => (
                  <Button 
                    key={role}
                    variant="outline" 
                    className="h-20 justify-between px-6 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 border-slate-200 bg-white/50 group rounded-xl"
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className="flex flex-col items-start text-left">
                        <span className="font-black text-sm uppercase tracking-tighter">{role}</span>
                        <span className="text-[9px] opacity-70 font-bold uppercase tracking-[0.2em]">Node Terminal</span>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Button>
                ))}
                
                {allUsers.length === 0 && (
                  <Button 
                    variant="outline" 
                    className="mt-6 border-dashed border-accent text-accent hover:bg-accent hover:text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-xl"
                    onClick={handleSeedAdmin}
                    disabled={isVerifying}
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Deploy Initial Admin
                  </Button>
                )}

                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-primary transition-colors"
                    onClick={handleReset}
                >
                    Reset Terminal Link
                </Button>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleDeptVerify} className="space-y-6" autoComplete="off">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Department Node Key
                  </label>
                  <Input 
                    name="dept-node-security-key"
                    type="password"
                    placeholder={`${selectedRole} Access Key`} 
                    className="h-12 bg-white/50 border-slate-200 focus:ring-primary/20 rounded-xl font-mono"
                    value={deptKey}
                    onChange={(e) => setDeptKey(e.target.value)}
                    autoFocus
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-primary font-black uppercase tracking-widest shadow-xl rounded-xl"
                  >
                    Unlock Terminal
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                    onClick={() => setStep(2)}
                  >
                    Back to Selection
                  </Button>
                </div>
              </form>
            )}

            {step === 4 && (
              <form onSubmit={handlePersonalLogin} className="space-y-6" autoComplete="off">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <UserIcon className="w-3 h-3" />
                      Personnel Identity
                    </label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="h-12 bg-white/50 border-slate-200 rounded-xl font-bold">
                        <SelectValue placeholder="Select User" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Fingerprint className="w-3 h-3" />
                      Security PIN (4-Digits)
                    </label>
                    <Input 
                      name="personnel-pin-node-sync"
                      type="password"
                      placeholder="••••" 
                      className="h-12 bg-white/50 border-slate-200 focus:ring-primary/20 rounded-xl tracking-[1.5em] text-center font-black"
                      value={personalPin}
                      onChange={(e) => setPersonalPin(e.target.value)}
                      maxLength={4}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-primary font-black uppercase tracking-widest shadow-xl rounded-xl"
                    disabled={isVerifying || !selectedUserId}
                  >
                    {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authorize Node"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                    onClick={() => setStep(3)}
                  >
                    Back to Node Key
                  </Button>
                </div>
              </form>
            )}
            
            <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <p className="text-[8px] text-center text-slate-400 uppercase tracking-[0.4em] font-black">
                Encrypted Cloud Link Active
              </p>
            </div>
         </CardContent>
       </Card>
    </div>
  )
}
