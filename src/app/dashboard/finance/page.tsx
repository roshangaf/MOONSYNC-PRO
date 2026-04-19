
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FinancePage() {
  const transactions = [
    { id: 'tx-001', client: 'Alpha Corp', service: 'Cloud Migration', amount: 'NRS 4,500.00', status: 'Paid', date: '2024-03-01' },
    { id: 'tx-002', client: 'Beta Systems', service: 'Security Audit', amount: 'NRS 2,200.00', status: 'Pending', date: '2024-03-05' },
    { id: 'tx-003', client: 'Gamma Tech', service: 'Hardware Sync', amount: 'NRS 1,800.00', status: 'Overdue', date: '2024-02-15' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Financial Management</h1>
          <p className="text-muted-foreground">Monitor billable hours, service invoicing, and resource allocation in NRS.</p>
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
            <div className="text-2xl font-bold">NRS 124,500.00</div>
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
            <div className="text-2xl font-bold">14</div>
            <div className="flex items-center text-xs text-orange-500 font-bold mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" /> NRS 8,400.00 Receivable
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg">Recent Billing Activity</CardTitle>
          <CardDescription>Consolidated view of all service-related financial transactions (NRS) and sync logs.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-bold text-xs">ID / Date</TableHead>
                <TableHead className="font-bold text-xs">Client / Account</TableHead>
                <TableHead className="font-bold text-xs">Service Category</TableHead>
                <TableHead className="font-bold text-xs">Transaction Value</TableHead>
                <TableHead className="font-bold text-xs">System Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-primary/5 transition-colors">
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
                  <TableCell className="font-mono font-bold">{tx.amount}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'Paid' ? 'secondary' : tx.status === 'Pending' ? 'default' : 'destructive'} className="text-[10px]">
                      {tx.status}
                    </Badge>
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
