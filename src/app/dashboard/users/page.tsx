"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MOCK_USERS } from "@/lib/store"
import { UserPlus, MoreHorizontal, Mail, Shield, Edit2, UserX, UserCheck } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const [users] = useState(MOCK_USERS);
  const { toast } = useToast();

  const handleAdminAction = (action: string, userName: string) => {
    toast({
      title: `${action} Executed`,
      description: `Security protocol performed for ${userName}. Ledger synced.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">User Management</h1>
          <p className="text-muted-foreground">Administer roles, departments and account access levels across MoonSync Pro.</p>
        </div>
        <Button className="bg-primary font-bold uppercase text-xs tracking-widest h-10 shadow-lg shadow-primary/20" onClick={() => handleAdminAction("Add User Interface", "Terminal")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Personnel
        </Button>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden bg-white">
        <div className="h-1.5 bg-primary w-full" />
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg font-black uppercase tracking-widest">Organization Directory</CardTitle>
          <CardDescription className="text-xs font-medium">A total of {users.length} active personnel authenticated in MoonSync Pro infrastructure.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px] font-black text-[10px] uppercase tracking-widest">Employee / Identity</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Role Signature</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Org Department</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Sync Status</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">Terminal Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">{user.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-primary opacity-50" />
                      <span className="text-xs font-bold uppercase tracking-tighter text-slate-600">{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-black uppercase text-slate-500">{user.department}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3 w-3 text-emerald-500" />
                      <Badge variant="outline" className="text-[9px] font-black uppercase text-emerald-600 border-emerald-200 bg-emerald-50 tracking-widest">Active</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest">Security Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAdminAction("Password Reset", user.name)} className="text-xs font-bold">
                          <Mail className="mr-2 h-4 w-4" /> Reset Credentials
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAdminAction("Profile Edit", user.name)} className="text-xs font-bold">
                          <Edit2 className="mr-2 h-4 w-4" /> Modify Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAdminAction("Deactivation", user.name)} className="text-xs font-bold text-destructive">
                          <UserX className="mr-2 h-4 w-4" /> Deactivate Node
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="bg-slate-50 border-t p-4 flex justify-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">
             Personnel Integrity Terminal • MoonSync Pro ERP Node
           </p>
        </div>
      </Card>
    </div>
  )
}
