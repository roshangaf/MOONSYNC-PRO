
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, ShieldCheck, Lock, ArrowRight, Loader2, Sparkles, User as UserIcon, Fingerprint, ShieldAlert } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"
import { Role, User } from "@/lib/types"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
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
  const [dynamicDeptKeys, setDynamicDeptKeys] = useState<Record<Role, string>>(DEFAULT_DEPT_KEYS)
  
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const db = useFirestore()

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
    
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setStep(2)
      localStorage.setItem('company_verified', 'true');
      toast({
        title: "Access Granted",
        description: "Cloud handshake successful. Welcome to the terminal.",
      })
    }, 800)
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setStep(3)
  }

  const handleDeptVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return;

    if (deptKey !== dynamicDeptKeys[selectedRole]) {
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
      description: "Verify your personnel identity to continue.",
    })
  }

  const handlePersonalLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const foundUser = users.find(u => u.id === selectedUserId);

    if (!foundUser || personalPin !== foundUser.pin) {
      toast({
        title: "Verification Failed",
        description: "Invalid PIN for the selected identity.",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    login(foundUser); 
    toast({
      title: "Session Authorized",
      description: `Terminal active for ${foundUser.name}.`,
    })
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
    try {
      await setDoc(userRef, adminData);
      toast({
        title: "Admin Initialized",
        description: "Roshan Admin created with PIN 0000. Use this to login.",
      });
    } catch (e) {
      toast({
        title: "Initialization Error",
        description: "Failed to seed admin user.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
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
         <div className="h-2 bg-primary animate-pulse-slow" />
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
                 ? "Establish a secure cloud link with the organization infrastructure." 
                 : step === 2 
                 ? "Select your departmental terminal signature."
                 : step === 3
                 ? `Enter the unique access key for the ${selectedRole} node.`
                 : "Select your identity and verify your security PIN."}
             </CardDescription>
           </div>
         </CardHeader>
         <CardContent className="pb-10">
            {step === 1 && (
              <form onSubmit={handleCompanyVerify} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Company Name
                  </label>
                  <Input 
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
                  {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Establish Handshake
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
                        <span className="text-[9px] opacity-70 font-bold uppercase tracking-[0.2em]">Cloud Node</span>
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
                    Initialize First Admin
                  </Button>
                )}

                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-primary transition-colors"
                    onClick={handleReset}
                >
                    Reset Connection
                </Button>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleDeptVerify} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Department Access Key
                  </label>
                  <Input 
                    type="password"
                    placeholder={`${selectedRole} Primary Key`} 
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
                    Unlock Hub
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                    onClick={() => setStep(2)}
                  >
                    Back to Terminals
                  </Button>
                </div>
              </form>
            )}

            {step === 4 && (
              <form onSubmit={handlePersonalLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <UserIcon className="w-3 h-3" />
                      Terminal User
                    </label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="h-12 bg-white/50 border-slate-200 rounded-xl font-bold">
                        <SelectValue placeholder="Select Personnel" />
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
                      Security PIN
                    </label>
                    <Input 
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
                    {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authorize Terminal"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                    onClick={() => setStep(3)}
                  >
                    Back to Security Key
                  </Button>
                </div>
              </form>
            )}
            
            <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <p className="text-[8px] text-center text-slate-400 uppercase tracking-[0.4em] font-black">
                End-to-End Encryption Active
              </p>
            </div>
         </CardContent>
       </Card>
    </div>
  )
}
