"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FileText, Receipt, Download, Banknote } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Bill, BillItem, BillType } from "@/lib/types"

export default function BillingPage() {
  const { toast } = useToast()
  const [billType, setBillType] = useState<BillType>("VAT")
  const [clientName, setClientName] = useState("")
  const [address, setAddress] = useState("")
  const [particulars, setParticulars] = useState("")
  const [amount, setAmount] = useState("")
  const [items, setItems] = useState<BillItem[]>([])
  const [bills, setBills] = useState<Bill[]>([])

  const addItem = () => {
    if (!particulars || !amount) {
      toast({
        title: "Missing Information",
        description: "Please provide both particulars and amount.",
        variant: "destructive"
      })
      return
    }

    const newItem: BillItem = {
      id: Math.random().toString(36).substr(2, 9),
      particular: particulars,
      amount: parseFloat(amount)
    }

    setItems([...items, newItem])
    setParticulars("")
    setAmount("")
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0)

  const generateBill = () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Add at least one item to generate a bill.",
        variant: "destructive"
      })
      return
    }

    const finalClientName = clientName.trim() === "" ? "Cash" : clientName

    const newBill: Bill = {
      id: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      type: billType,
      clientName: finalClientName,
      address: address || undefined,
      items: [...items],
      totalAmount: total,
      createdAt: new Date().toISOString(),
      currency: "NRS"
    }

    setBills([newBill, ...bills])
    setItems([])
    setClientName("")
    setAddress("")
    
    toast({
      title: `${billType} Bill Generated`,
      description: `Bill for ${finalClientName} recorded successfully in NRS.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Billing Terminal</h1>
          <p className="text-muted-foreground">Generate VAT invoices and Estimates for clients. All values in NRS.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">New Bill Entry</CardTitle>
            <CardDescription>Configure client details and bill type.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bill Category</Label>
              <Select value={billType} onValueChange={(v: BillType) => setBillType(v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VAT">VAT Invoice</SelectItem>
                  <SelectItem value="Estimate">Commercial Estimate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Client Name (Optional)</Label>
              <Input 
                placeholder="Defaults to 'Cash'" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Address (Optional)</Label>
              <Input 
                placeholder="Client Address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
              <Label className="text-primary font-bold uppercase text-[10px] tracking-widest">Add Particulars</Label>
              <div className="space-y-3">
                <Input 
                  placeholder="Service description" 
                  value={particulars} 
                  onChange={(e) => setParticulars(e.target.value)}
                  className="bg-white text-xs h-8"
                />
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Amount (NRS)" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white text-xs h-8"
                  />
                  <Button size="sm" onClick={addItem} className="h-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary font-bold shadow-lg shadow-primary/20" onClick={generateBill}>
              Generate {billType} Bill
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2 shadow-xl border-none">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bill Preview & Ledger</CardTitle>
              <CardDescription>Itemized breakdown and historical records.</CardDescription>
            </div>
            {items.length > 0 && (
              <Badge variant="outline" className="bg-white border-primary text-primary font-bold">
                {items.length} Pending Items
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {items.length > 0 ? (
              <div className="p-6">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Current Draft</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Particulars</TableHead>
                      <TableHead className="text-right">Amount (NRS)</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">{item.particular}</TableCell>
                        <TableCell className="text-right font-mono font-bold">NRS {item.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-primary/5 font-black">
                      <TableCell>SUBTOTAL</TableCell>
                      <TableCell className="text-right text-primary">NRS {total.toLocaleString()}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : bills.length > 0 ? (
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase">ID / Type</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Client</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Date</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase">Total (NRS)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-[10px] font-bold text-primary">{bill.id}</span>
                            <Badge variant={bill.type === 'VAT' ? 'default' : 'secondary'} className="text-[9px] h-4 w-fit px-1">
                              {bill.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{bill.clientName}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{bill.address || 'No address provided'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-black text-slate-900">
                          NRS {bill.totalAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <Receipt className="h-12 w-12 text-slate-200 mx-auto" />
                <p className="text-slate-400 italic text-sm">No billing data captured yet.</p>
              </div>
            )}
          </CardContent>
          {bills.length > 0 && (
             <CardFooter className="bg-muted/10 border-t p-4 flex justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Secure Billing Ledger | NRS Only
                </span>
                <Button variant="outline" size="sm" className="text-[10px] h-7 border-primary text-primary">
                  <Download className="h-3 w-3 mr-1" /> Export Statement
                </Button>
             </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
