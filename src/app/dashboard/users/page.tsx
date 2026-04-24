'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, MoreHorizontal, Shield, Edit2, UserX, UserCheck, Loader2, Key } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Role, Department } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function UsersPage() {
  const db = useFirestore();
  const usersRef = useMemoFirebase(() => db ? collection(db, 'users') : null, [db]);
  const { data: users = [], loading } = useCollection<User>(usersRef);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAdminAction = (action: string, userName: string) => {
    toast({
      title: `${action} Executed`,
      description: `Security protocol performed for ${userName}. Ledger synced.`,
    });
  };

  const openEditDialog = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser || !db) return;

    setIsSaving(true);
    const userRef = doc(db, 'users', editingUser.id);
    
    setDoc(userRef, editingUser, { merge: true })
      .then(() => {
        setIsEditDialogOpen(false);
        setIsSaving(false);
        toast({
          title: "Profile Synchronized",
          description: `Identity records for ${editingUser.name} have been updated in the MoonSync cloud.`,
        });
      })
      .catch(async (error) => {
        setIsSaving(false);
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: editingUser,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (!db) return;
    const userRef = doc(db, 'users', userId);
    deleteDoc(userRef)
      .then(() => {
        toast({
          title: "Node Deactivated",
          description: `${userName} has been removed from the organizational directory.`,
          variant: "destructive"
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handlePasswordReset = (user: User) => {
    toast({
      title: "Credential Reset Initiated",
      description: `A secure link to reset PIN/Password has been dispatched to ${user.email}.`,
    });
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-black uppercase tracking-widest text-primary">Synchronizing Cloud Directory...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
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
          <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-800">Organization Directory</CardTitle>
          <CardDescription className="text-xs font-medium">Monitoring {users.length} active personnel in the MoonSync infrastructure.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px] font-black text-[10px] uppercase tracking-widest py-5">Employee / Identity</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Role Signature</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Org Department</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Sync Status</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest py-5">Terminal Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-primary/5 transition-all duration-300">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 shadow-sm">
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
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest">Security Terminal</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handlePasswordReset(user)} className="text-xs font-bold py-2">
                          <Key className="mr-2 h-4 w-4 text-primary" /> Change PIN / Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(user)} className="text-xs font-bold py-2">
                          <Edit2 className="mr-2 h-4 w-4 text-primary" /> Modify Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id, user.name)} className="text-xs font-bold text-destructive py-2">
                          <UserX className="mr-2 h-4 w-4" /> Deactivate Node
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center font-black uppercase tracking-[0.5em] text-slate-300">
                    Directory Offline
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="bg-slate-50 border-t p-4 flex justify-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">
             Personnel Integrity Terminal • Cloud Synchronized
           </p>
        </div>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
          <DialogHeader className="pt-4">
            <DialogTitle className="uppercase tracking-widest text-primary font-black flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Edit Personnel Profile
            </DialogTitle>
            <DialogDescription className="text-xs">
              Synchronize departmental roles and identity metadata.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <Input
                  id="name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="h-11 bg-slate-50 border-slate-200 focus:ring-primary/20 rounded-xl font-bold"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <Input
                  id="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="h-11 bg-slate-50 border-slate-200 focus:ring-primary/20 rounded-xl font-bold"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Terminal Role</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(v: Role) => {
                    const dept: Department = v === 'Admin' ? 'Administration' : v as Department;
                    setEditingUser({ ...editingUser, role: v, department: dept });
                  }}
                >
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Technician">Technician</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="uppercase font-bold text-[10px] tracking-widest rounded-xl h-11 px-6">
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={isSaving} className="uppercase font-bold text-[10px] tracking-widest bg-primary rounded-xl h-11 px-6 shadow-lg shadow-primary/20 transition-all active:scale-95">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isSaving ? "Syncing..." : "Apply Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
