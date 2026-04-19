
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Receipt, 
  Building2, 
  QrCode, 
  Printer, 
  Download, 
  Hash,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Bill, BillItem, BillType } from "@/lib/types"

export default function BillingPage() {
  const { toast } = useToast()
  const [billType, setBillType] = useState<BillType>("VAT")
  const [clientName, setClientName] = useState("")
  const [address, setAddress] = useState("")
  const [particulars, setParticulars] = useState("")
  const [amount, setAmount] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [items, setItems] = useState<BillItem[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Load bills from localStorage for cross-page synchronization
  useEffect(() => {
    const savedBills = localStorage.getItem('moonsync_bills');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }
  }, []);

  const saveBillsToStorage = (updatedBills: Bill[]) => {
    localStorage.setItem('moonsync_bills', JSON.stringify(updatedBills));
    setBills(updatedBills);
  };

  const addItem = () => {
    if (!particulars || !amount || !quantity) {
      toast({
        title: "Missing Information",
        description: "Please provide particulars, amount, and quantity.",
        variant: "destructive"
      })
      return
    }

    const newItem: BillItem = {
      id: Math.random().toString(36).substr(2, 9),
      particular: particulars,
      amount: parseFloat(amount),
      quantity: parseInt(quantity) || 1
    }

    setItems([...items, newItem])
    setParticulars("")
    setAmount("")
    setQuantity("1")
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const voidBill = (id: string) => {
    const updatedBills = bills.filter(bill => bill.id !== id);
    saveBillsToStorage(updatedBills);
    toast({
      title: "Bill Voided",
      description: `Document ${id} has been removed from the ledger.`,
      variant: "destructive"
    });
  }

  const subtotal = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0)
  const vatAmount = billType === "VAT" ? subtotal * 0.13 : 0
  const grandTotal = subtotal + vatAmount

  const generateBill = () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Add at least one item to generate a bill.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    setTimeout(() => {
      const finalClientName = clientName.trim() === "" ? "Cash" : clientName
      const billId = `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      const newBill: Bill = {
        id: billId,
        type: billType,
        clientName: finalClientName,
        address: address || undefined,
        items: [...items],
        totalAmount: grandTotal,
        createdAt: new Date().toISOString(),
        currency: "NRS"
      }

      saveBillsToStorage([newBill, ...bills]);
      setItems([])
      setClientName("")
      setAddress("")
      setIsGenerating(false)
      
      toast({
        title: "E-Bill Generated",
        description: `Document ${billId} for ${finalClientName} is ready and synced with Accounting.`,
      })
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">E-Billing Terminal</h1>
          <p className="text-muted-foreground">Digital VAT invoicing & commercial estimates synced with Finance.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-lg border-none bg-slate-50 overflow-hidden h-fit">
          <div className="bg-primary h-1.5 w-full" />
          <CardHeader className="bg-white border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tighter">New Transaction</CardTitle>
                <CardDescription>Configure document parameters.</CardDescription>
              </div>
              <Building2 className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 bg-white">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Document Category</Label>
                <Select value={billType} onValueChange={(v: BillType) => setBillType(v)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VAT">VAT Invoice (13% Tax)</SelectItem>
                    <SelectItem value="Estimate">Commercial Estimate (No Tax)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client Name</Label>
                <Input 
                  placeholder="Defaults to 'Cash'" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Service Address</Label>
                <Input 
                  placeholder="Client's Registered Address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Entry Particulars</span>
              </div>
              <div className="space-y-3">
                <Input 
                  placeholder="Service description" 
                  value={particulars} 
                  onChange={(e) => setParticulars(e.target.value)}
                  className="bg-white text-xs h-10 border-slate-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Rate (NRS)</Label>
                    <Input 
                      type="number" 
                      placeholder="Rate" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-white text-xs h-10 border-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Qty</Label>
                    <Input 
                      type="number" 
                      placeholder="Qty" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-white text-xs h-10 border-slate-200"
                    />
                  </div>
                </div>
                <Button onClick={addItem} className="w-full h-10 font-bold">
                  Add Item
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-white border-t pt-6">
            <Button 
              className="w-full h-12 bg-primary font-black shadow-xl shadow-primary/20 text-md uppercase tracking-widest" 
              onClick={generateBill}
              disabled={isGenerating || items.length === 0}
            >
              {isGenerating ? "Processing..." : `Issue ${billType} Document`}
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-3 shadow-2xl border-none flex flex-col min-h-[600px] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-lg">Live E-Bill Interface</CardTitle>
              <CardDescription>Real-time digital receipt visualization.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8"><Printer className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col bg-white">
            {items.length > 0 ? (
              <div className="flex-1 flex flex-col p-8 md:p-12 space-y-10">
                <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary p-2 rounded-lg">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">MoonSync Pro</h2>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">IT Services & Infrastructure Synchronization</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <Badge variant="outline" className="bg-slate-900 text-white border-none font-black px-4 py-1 text-[10px]">
                      {billType === 'VAT' ? 'VAT INVOICE' : 'COMMERCIAL ESTIMATE'}
                    </Badge>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-400">
                      <Hash className="h-3 w-3" />
                      DRAFT-PENDING
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Signature</p>
                      <h3 className="text-lg font-bold">{clientName || "Cash"}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{address || "Over-the-counter transaction"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Date</p>
                      <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                      <QrCode className="h-16 w-16 text-slate-900 opacity-80" />
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <Table>
                    <TableHeader className="bg-slate-50 border-none rounded-lg">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="text-[10px] font-black uppercase text-slate-400">Particulars</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Rate</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Qty</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Total (NRS)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} className="border-b-slate-100 hover:bg-slate-50/50">
                          <TableCell className="font-semibold text-sm py-5">{item.particular}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{item.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{item.quantity}</TableCell>
                          <TableCell className="text-right font-mono font-black text-slate-900">
                            {(item.amount * item.quantity).toLocaleString()}.00
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="border-t border-slate-200 pt-8 flex justify-end">
                  <div className="w-full max-w-xs space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>TAXABLE SUBTOTAL</span>
                      <span className="font-mono">NRS {subtotal.toLocaleString()}.00</span>
                    </div>
                    {billType === "VAT" && (
                      <div className="flex justify-between items-center text-xs font-bold text-primary">
                        <span>VAT (13%)</span>
                        <span className="font-mono">+ NRS {vatAmount.toLocaleString()}.00</span>
                      </div>
                    )}
                    <div className="h-px bg-slate-900/10" />
                    <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                      <span className="text-sm font-black uppercase tracking-widest">Total Payable</span>
                      <span className="text-2xl font-black text-primary-foreground">NRS {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : bills.length > 0 ? (
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase">Bill Number</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Client Information</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase">Grand Total (NRS)</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                              <QrCode className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-mono text-xs font-bold text-primary">{bill.id}</span>
                              <span className="text-[9px] text-muted-foreground uppercase font-black">{bill.type}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{bill.clientName}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(bill.createdAt).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-black text-slate-900">
                          NRS {bill.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                             <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => voidBill(bill.id)}
                                title="Void Bill"
                             >
                               <XCircle className="h-4 w-4" />
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-6">
                <div className="relative">
                  <Receipt className="h-20 w-20 text-slate-100" />
                  <QrCode className="h-10 w-10 text-primary/20 absolute -bottom-2 -right-2" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-slate-900 font-black uppercase tracking-[0.2em]">Awaiting Transaction</p>
                  <p className="text-slate-400 text-xs italic">Construct your E-Bill using the terminal on the left.</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-4 flex justify-center">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
               MoonSync Pro Terminal v8.2 • Secure Billing Node
             </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
