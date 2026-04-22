
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, ShieldCheck, Lock, ArrowRight, Loader2, Sparkles, User, Fingerprint } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"
import { Role, User as UserType } from "@/lib/types"
import { MOCK_USERS } from "@/lib/store"

// Unique Department Keys
const DEPT_KEYS: Record<Role, string> = {
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

  useEffect(() => {
    const companyVerified = localStorage.getItem('company_verified') === 'true';
    if (companyVerified) {
      setStep(2);
    }
  }, []);

  const handleCompanyVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.toLowerCase().includes("moonsync")) {
      toast({
        title: "Invalid Company",
        description: "Please enter your registered company name (e.g. MoonSync Pro).",
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
        description: "Company credentials verified. Please select your terminal role.",
      })
    }, 1200)
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setStep(3)
  }

  const handleDeptVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return;

    if (deptKey !== DEPT_KEYS[selectedRole]) {
      toast({
        title: "Invalid Department Signature",
        description: `The access key for ${selectedRole} is incorrect.`,
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setStep(4)
      toast({
        title: "Department Unlocked",
        description: "Please verify your personal identity to establish a session.",
      })
    }, 800)
  }

  const handlePersonalLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const foundUser = MOCK_USERS.find(u => u.id === selectedUserId);

    if (!foundUser || personalPin !== foundUser.pin) {
      toast({
        title: "Identity Verification Failed",
        description: "The personal PIN provided does not match our records.",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      if (selectedRole) {
        // Use the specific user from the store
        login(selectedRole); 
        toast({
          title: "Session Initialized",
          description: `Authorized as ${foundUser.name} in ${selectedRole} Department.`,
        })
      }
    }, 1000)
  }

  const handleReset = () => {
    setStep(1);
    localStorage.removeItem('company_verified');
    setSelectedRole(null);
    setDeptKey("");
    setPersonalPin("");
    setSelectedUserId("");
  };

  const filteredUsers = selectedRole 
    ? MOCK_USERS.filter(u => u.role === selectedRole)
    : [];

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
             <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
               {step === 1 ? "Company Access" : step === 2 ? "Terminal Selection" : step === 3 ? `${selectedRole} Access` : "Identity Verification"}
             </CardTitle>
             <CardDescription className="text-slate-500">
               {step === 1 
                 ? "Establish a secure link with the MoonSync infrastructure." 
                 : step === 2 
                 ? "Select your departmental signature to continue."
                 : step === 3
                 ? `Enter the unique access key for the ${selectedRole} hub.`
                 : "Select your name and enter your personal security PIN."}
             </CardDescription>
           </div>
         </CardHeader>
         <CardContent className="pb-10">
            {step === 1 && (
              <form onSubmit={handleCompanyVerify} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Company Name
                  </label>
                  <Input 
                    placeholder="MoonSync Pro" 
                    className="h-12 bg-white/50 border-slate-200 focus:ring-primary/20 rounded-xl"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Security Token
                  </label>
                  <Input 
                    type="password"
                    placeholder="••••••••••••" 
                    className="h-12 bg-white/50 border-slate-200 focus:ring-primary/20 rounded-xl"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isVerifying}
                >
                  {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Initialize Handshake
                </Button>
              </form>
            )}

            {step === 2 && (
              <div className="grid gap-3">
                {(['Admin', 'Marketing', 'Technician', 'Finance'] as Role[]).map((role) => (
                  <Button 
                    key={role}
                    variant="outline" 
                    className="h-16 justify-between px-6 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 border-slate-200 bg-white/50 group rounded-xl"
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className="flex flex-col items-start text-left">
                        <span className="font-black text-sm uppercase tracking-tighter">{role}</span>
                        <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Departmental Signature</span>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Button>
                ))}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
                    onClick={handleReset}
                >
                    Reset Handshake
                </Button>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleDeptVerify} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Departmental Access Key
                  </label>
                  <Input 
                    type="password"
                    placeholder={`${selectedRole} Primary Key`} 
                    className="h-12 bg-white/50 border-slate-200 focus:ring-primary/20 rounded-xl font-mono"
                    value={deptKey}
                    onChange={(e) => setDeptKey(e.target.value)}
                    autoFocus
                    required
                  />
                  <p className="text-[9px] text-muted-foreground font-medium italic">High-entropy verification required for {selectedRole} nodes.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 rounded-xl"
                    disabled={isVerifying}
                  >
                    {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Unlock Department"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    className="text-xs font-bold uppercase tracking-widest text-slate-400"
                    onClick={() => setStep(2)}
                  >
                    Back to Terminal List
                  </Button>
                </div>
              </form>
            )}

            {step === 4 && (
              <form onSubmit={handlePersonalLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <User className="w-3 h-3" />
                      Logged in as
                    </label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="h-12 bg-white/50 border-slate-200 rounded-xl">
                        <SelectValue placeholder="Select Personnel Identity" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredUsers.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Fingerprint className="w-3 h-3" />
                      Personal Identity PIN
                    </label>
                    <Input 
                      type="password"
                      placeholder="Enter 4-digit PIN" 
                      className="h-12 bg-white/50 border-slate-200 focus:ring-primary/20 rounded-xl tracking-[1em] text-center"
                      value={personalPin}
                      onChange={(e) => setPersonalPin(e.target.value)}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 rounded-xl"
                    disabled={isVerifying || !selectedUserId}
                  >
                    {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authorize Identity"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    className="text-xs font-bold uppercase tracking-widest text-slate-400"
                    onClick={() => setStep(3)}
                  >
                    Back to Security Key
                  </Button>
                </div>
              </form>
            )}
            
            <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold mt-6">
              {step >= 3 ? "Active Departmental Shield Engaged" : "Encryption Layer Active"}
            </p>
         </CardContent>
       </Card>
    </div>
  )
}
