
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, FileText, Download, Edit2 } from "lucide-react"
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
    { id: 'tx-001', client: 'Alpha Corp', service: 'Cloud Migration', amount: 4500, status: 'Paid', date: '2024-03-01' },
    { id: 'tx-002', client: 'Beta Systems', service: 'Security Audit', amount: 2200, status: 'Pending', date: '2024-03-05' },
    { id: 'tx-003', client: 'Gamma Tech', service: 'Hardware Sync', amount: 1800, status: 'Overdue', date: '2024-02-15' },
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
      title: "Ledger Updated",
      description: `Transaction ${id} is now marked as ${newStatus}. ${newStatus === 'Void' ? 'Amount removed from revenue.' : ''}`,
    });
  };

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0) + 
                       legacyTransactions
                         .filter(tx => tx.status !== 'Void')
                         .reduce((sum, tx) => sum + tx.amount, 0);

  const outstandingValue = legacyTransactions
    .filter(tx => tx.status === 'Pending' || tx.status === 'Overdue')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Financial Management</h1>
          <p className="text-muted-foreground">Monitor billable hours, service invoicing, and synchronized billing data in NRS.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
            <Download className="mr-2 h-4 w-4" />
            Export Ledger
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-lg border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NRS {totalRevenue.toLocaleString()}.00</div>
            <div className="flex items-center text-xs text-emerald-500 font-bold mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12.5% vs Last Month
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Billable Output</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,240 hrs</div>
            <div className="flex items-center text-xs text-primary font-bold mt-1 uppercase tracking-tighter">
              94% Resource Efficiency
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-t-4 border-t-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Outstanding Invoices</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{legacyTransactions.filter(tx => tx.status === 'Pending' || tx.status === 'Overdue').length}</div>
            <div className="flex items-center text-xs text-orange-500 font-bold mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" /> NRS {outstandingValue.toLocaleString()}.00 Receivable
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg">Recent Billing & Sync Activity</CardTitle>
          <CardDescription>Consolidated view of static transactions and live generated E-Bills (NRS).</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase">ID / Date</TableHead>
                <TableHead className="font-bold text-xs uppercase">Client / Account</TableHead>
                <TableHead className="font-bold text-xs uppercase">Type / Service</TableHead>
                <TableHead className="font-bold text-xs uppercase">Transaction Value</TableHead>
                <TableHead className="font-bold text-xs uppercase">System Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Live Synced Bills */}
              {bills.map((bill) => (
                <TableRow key={bill.id} className="hover:bg-emerald-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] font-bold text-primary">{bill.id}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(bill.createdAt).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-sm">{bill.clientName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50">SYNCED {bill.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-emerald-600">NRS {bill.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">Live</Badge>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Static Legacy Transactions */}
              {legacyTransactions.map((tx) => (
                <TableRow key={tx.id} className={`hover:bg-primary/5 transition-colors ${tx.status === 'Void' ? 'opacity-50' : ''}`}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] font-bold text-primary">{tx.id}</span>
                      <span className="text-[10px] text-muted-foreground">{tx.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-sm">{tx.client}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{tx.service}</Badge>
                  </TableCell>
                  <TableCell className={`font-mono font-bold ${tx.status === 'Void' ? 'line-through text-muted-foreground' : ''}`}>
                    NRS {tx.amount.toLocaleString()}.00
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-fit p-0 hover:bg-transparent group">
                          <Badge 
                            variant={
                              tx.status === 'Paid' ? 'secondary' : 
                              tx.status === 'Pending' ? 'default' : 
                              tx.status === 'Void' ? 'outline' : 'destructive'
                            } 
                            className="text-[10px] cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all flex items-center gap-1"
                          >
                            {tx.status}
                            <Edit2 className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest">Adjust Ledger Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus(tx.id, 'Paid')} className="text-xs font-bold">Mark as Paid</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(tx.id, 'Pending')} className="text-xs font-bold">Mark as Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(tx.id, 'Overdue')} className="text-xs font-bold text-destructive">Mark as Overdue</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus(tx.id, 'Void')} className="text-xs font-bold text-destructive">Void Transaction</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
