
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, FileText, Download, Edit2, ShieldCheck, History, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Bill } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function FinancePage() {
  const { toast } = useToast()
  const db = useFirestore()

  const billsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'bills'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: bills = [] } = useCollection<Bill>(billsQuery);

  const updateSyncedBillStatus = (id: string, newStatus: any) => {
    if (!db) return;
    const billRef = doc(db, 'bills', id);
    const data = { status: newStatus };
    
    setDoc(billRef, data, { merge: true })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: billRef.path,
          operation: 'update',
          requestResourceData: data
        }));
      });
    
    toast({
      title: "E-Bill Status Updated",
      description: `Ref: ${id} marked as ${newStatus} in shared NRS ledger.`,
    });
  }

  const deleteSyncedBill = (id: string) => {
    if (!db) return;
    const billRef = doc(db, 'bills', id);
    deleteDoc(billRef)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: billRef.path,
          operation: 'delete'
        }));
      });

    toast({
      title: "E-Bill Purged",
      description: `Document ${id} permanently removed from NRS infrastructure.`,
      variant: "destructive"
    });
  };

  const activeBills = bills.filter(b => b.status !== 'Void');

  const totalRevenue = activeBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

  const outstandingValue = activeBills
    .filter((b) => b.status === 'Pending' || b.status === 'Overdue')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Accounting Terminal</h1>
          <p className="text-muted-foreground">Unified financial control panel for NRS transaction synchronization and audit logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 h-10 font-black text-xs uppercase tracking-widest">
            <Download className="mr-2 h-4 w-4" />
            Export Audit Ledger
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-2xl border-none bg-white overflow-hidden">
          <div className="h-1.5 bg-emerald-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Consolidated Revenue (NRS)</CardTitle>
            <Wallet className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">NRS {totalRevenue.toLocaleString()}.00</div>
            <div className="flex items-center text-xs text-emerald-500 font-black mt-2 uppercase tracking-widest">
              <ArrowUpRight className="h-4 w-4 mr-1" /> Verified Cloud Data
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-2xl border-none bg-white overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Efficiency Index</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">94.2%</div>
            <div className="flex items-center text-xs text-primary font-black mt-2 uppercase tracking-widest">
              Automated Resource Sync Active
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-none bg-white overflow-hidden">
          <div className="h-1.5 bg-orange-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Accounts Receivable</CardTitle>
            <FileText className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">NRS {outstandingValue.toLocaleString()}.00</div>
            <div className="flex items-center text-xs text-orange-500 font-black mt-2 uppercase tracking-widest">
              {bills.filter(b => b.status === 'Pending' || b.status === 'Overdue').length} Pending Documents
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-widest">Transaction Synchronization Ledger</CardTitle>
            <CardDescription className="text-xs font-medium">Monitoring encrypted E-Bills and financial data synchronized across all devices.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <History className="h-6 w-6 text-primary opacity-20" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b-2">
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Reference</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Entity / Client</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Verification / Category</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Total Value (NRS)</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Ledger Status</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id} className={`hover:bg-emerald-50/30 transition-colors ${bill.status === 'Void' ? 'opacity-40 grayscale' : ''}`}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-black text-primary">{bill.id}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-sm text-slate-800">{bill.clientName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-emerald-50/50 border-emerald-100 text-emerald-700">
                        E-BILL ({bill.type})
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className={`font-mono font-black text-sm ${bill.status === 'Void' ? 'line-through text-muted-foreground' : 'text-emerald-700'}`}>
                    NRS {bill.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-fit p-0 group">
                          <Badge 
                            variant={bill.status === 'Void' ? 'destructive' : 'secondary'} 
                            className="text-[9px] font-black uppercase cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all flex items-center gap-1.5"
                          >
                            {bill.status || 'Paid'}
                            <Edit2 className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest">Update Bill Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateSyncedBillStatus(bill.id, 'Paid')} className="text-xs font-bold">Mark as PAID</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateSyncedBillStatus(bill.id, 'Pending')} className="text-xs font-bold">Mark as PENDING</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateSyncedBillStatus(bill.id, 'Overdue')} className="text-xs font-bold text-orange-600">Mark as OVERDUE</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateSyncedBillStatus(bill.id, 'Void')} className="text-xs font-bold text-destructive">VOID BILL</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteSyncedBill(bill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {bills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center font-black uppercase tracking-[0.5em] text-slate-300">
                    No Sync Data Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="bg-slate-50 border-t p-4 flex justify-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">
             Financial Intelligence Terminal • MoonSync Pro Cloud Ledger
           </p>
        </div>
      </Card>
    </div>
  )
}
