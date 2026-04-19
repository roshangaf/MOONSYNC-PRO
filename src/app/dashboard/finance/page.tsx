
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, FileText, Download, Edit2, ShieldCheck, History, XCircle, Trash2 } from "lucide-react"
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

export default function FinancePage() {
  const { toast } = useToast()
  const [bills, setBills] = useState<Bill[]>([])
  const [legacyTransactions, setLegacyTransactions] = useState([
    { id: 'TX-801', client: 'CloudTech Solutions', service: 'Infra Deployment', amount: 85000, status: 'Paid', date: '2024-03-01' },
    { id: 'TX-802', client: 'Global Systems', service: 'Security Audit', amount: 42000, status: 'Pending', date: '2024-03-05' },
    { id: 'TX-803', client: 'Vertex Media', service: 'Hardware Sync', amount: 12500, status: 'Overdue', date: '2024-02-15' },
  ]);

  useEffect(() => {
    const savedBills = localStorage.getItem('moonsync_bills');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }
  }, []);

  const updateStatus = (id: string, newStatus: string) => {
    setLegacyTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
    toast({
      title: "Ledger Update Executed",
      description: `Ref: ${id} status updated to ${newStatus.toUpperCase()}. Financial metrics adjusted in NRS.`,
    });
  };

  const updateSyncedBillStatus = (id: string, newStatus: any) => {
    const updated = bills.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setBills(updated);
    localStorage.setItem('moonsync_bills', JSON.stringify(updated));
    toast({
      title: "E-Bill Status Updated",
      description: `Ref: ${id} marked as ${newStatus} in shared NRS ledger.`,
    });
  }

  const deleteSyncedBill = (id: string) => {
    const updated = bills.filter(b => b.id !== id);
    setBills(updated);
    localStorage.setItem('moonsync_bills', JSON.stringify(updated));
    toast({
      title: "E-Bill Purged",
      description: `Document ${id} permanently removed from NRS infrastructure.`,
      variant: "destructive"
    });
  };

  const deleteLegacyTransaction = (id: string) => {
    setLegacyTransactions(prev => prev.filter(tx => tx.id !== id));
    toast({
      title: "Record Deleted",
      description: `Legacy transaction ${id} has been deleted.`,
      variant: "destructive"
    });
  };

  const activeBills = bills.filter(b => b.status !== 'Void');
  const activeLegacy = legacyTransactions.filter(tx => tx.status !== 'Void');

  const totalRevenue = activeBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0) + 
                       activeLegacy.reduce((sum, tx) => sum + tx.amount, 0);

  const outstandingValue = activeLegacy
    .filter(tx => tx.status === 'Pending' || tx.status === 'Overdue')
    .reduce((sum, tx) => sum + tx.amount, 0);

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
              <ArrowUpRight className="h-4 w-4 mr-1" /> +12.5% MTD
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
              {activeLegacy.filter(tx => tx.status === 'Pending' || tx.status === 'Overdue').length} Pending Documents
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-widest">Transaction Synchronization Ledger</CardTitle>
            <CardDescription className="text-xs font-medium">Monitoring encrypted E-Bills and legacy financial data in real-time.</CardDescription>
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
              {/* E-Bills Sync */}
              {bills.map((bill) => (
                <TableRow key={bill.id} className={`hover:bg-emerald-50/30 transition-colors ${bill.status === 'Void' ? 'opacity-40 grayscale' : ''}`}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-black text-primary">{bill.id}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{new Date(bill.createdAt).toLocaleDateString()}</span>
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
                            {bill.status}
                            <Edit2 className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest">Update Bill Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateSyncedBillStatus(bill.id, 'Paid')} className="text-xs font-bold">Mark as PAID</DropdownMenuItem>
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
              
              {/* Legacy Logs */}
              {legacyTransactions.map((tx) => (
                <TableRow key={tx.id} className={`hover:bg-slate-50 transition-colors ${tx.status === 'Void' ? 'opacity-40 grayscale' : ''}`}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-black text-primary">{tx.id}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{tx.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-sm text-slate-800">{tx.client}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest">{tx.service}</Badge>
                  </TableCell>
                  <TableCell className={`font-mono font-black text-sm ${tx.status === 'Void' ? 'line-through text-muted-foreground' : ''}`}>
                    NRS {tx.amount.toLocaleString()}.00
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-fit p-0 group">
                          <Badge 
                            variant={
                              tx.status === 'Paid' ? 'secondary' : 
                              tx.status === 'Pending' ? 'default' : 
                              tx.status === 'Void' ? 'destructive' : 'outline'
                            } 
                            className="text-[9px] font-black uppercase cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all flex items-center gap-1.5"
                          >
                            {tx.status}
                            <Edit2 className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest">Adjust Ledger Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus(tx.id, 'Paid')} className="text-xs font-bold">Mark as PAID</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(tx.id, 'Pending')} className="text-xs font-bold">Mark as PENDING</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(tx.id, 'Overdue')} className="text-xs font-bold text-orange-600">Mark as OVERDUE</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus(tx.id, 'Void')} className="text-xs font-bold text-destructive">VOID TRANSACTION</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteLegacyTransaction(tx.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="bg-slate-50 border-t p-4 flex justify-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">
             Financial Intelligence Terminal • MoonSync Pro ERP Node
           </p>
        </div>
      </Card>
    </div>
  )
}
