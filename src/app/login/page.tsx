
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ShieldCheck, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"
import { Role } from "@/lib/types"

export default function CompanyLoginPage() {
  const [domain, setDomain] = useState("")
  const [token, setToken] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const handleCompanyVerify = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated company verification
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
      toast({
        title: "Access Granted",
        description: "Company credentials verified. Please select your terminal role.",
      })
    }, 1500)
  }

  const handleRoleSelect = (role: Role) => {
    login(role)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-body">
       <div className="fixed inset-0 mesh-gradient -z-10" />
       
       <Card className="w-full max-w-md glass border-white/20 shadow-2xl animate-fade-in overflow-hidden">
         <div className="h-2 bg-primary animate-pulse-slow" />
         <CardHeader className="text-center space-y-4 pt-10">
           <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
             <Building2 className="w-10 h-10 text-white" />
           </div>
           <div>
             <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
               {step === 1 ? "Company Access" : "Identity Verification"}
             </CardTitle>
             <CardDescription className="text-slate-500">
               {step === 1 
                 ? "Establish a secure link with the MoonSync infrastructure." 
                 : "Select your departmental signature to establish a session."}
             </CardDescription>
           </div>
         </CardHeader>
         <CardContent className="pb-10">
            {step === 1 ? (
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
                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                  Encryption Layer Active
                </p>
              </form>
            ) : (
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
                    onClick={() => setStep(1)}
                >
                    Back to Handshake
                </Button>
              </div>
            )}
         </CardContent>
       </Card>
    </div>
  )
}
