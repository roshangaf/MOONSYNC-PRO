
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FileText, Receipt, Download, Banknote, Calculator, Hash } from "lucide-react"
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

    const finalClientName = clientName.trim() === "" ? "Cash" : clientName

    const newBill: Bill = {
      id: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      type: billType,
      clientName: finalClientName,
      address: address || undefined,
      items: [...items],
      totalAmount: grandTotal,
      createdAt: new Date().toISOString(),
      currency: "NRS"
    }

    setBills([newBill, ...bills])
    setItems([])
    setClientName("")
    setAddress("")
    
    toast({
      title: `${billType} Bill Generated`,
      description: `Bill for ${finalClientName} recorded successfully. Total: NRS ${grandTotal.toLocaleString()}`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Billing Terminal</h1>
          <p className="text-muted-foreground">Professional invoicing for MoonSync Pro. All values in NRS.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-lg border-none bg-slate-50 overflow-hidden">
          <div className="bg-primary h-1.5 w-full" />
          <CardHeader className="bg-white border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tighter">Invoicing Ledger</CardTitle>
                <CardDescription>Configure document parameters.</CardDescription>
              </div>
              <Receipt className="h-8 w-8 text-primary opacity-20" />
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

              <div className="grid grid-cols-1 gap-4">
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
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Entry Particulars</span>
              </div>
              <div className="space-y-3">
                <Input 
                  placeholder="Service description or item name" 
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
                  Add Entry
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-white border-t pt-6">
            <Button className="w-full h-12 bg-primary font-black shadow-xl shadow-primary/20 text-md uppercase tracking-widest" onClick={generateBill}>
              Initialize {billType} Document
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-3 shadow-2xl border-none flex flex-col">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Live Bill Preview</CardTitle>
              <CardDescription>Real-time calculation including tax adjustments.</CardDescription>
            </div>
            {items.length > 0 && (
              <Badge variant="outline" className="bg-white border-primary text-primary font-black px-3">
                {items.length} ITEMS READY
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {items.length > 0 ? (
              <div className="flex-1 flex flex-col">
                <div className="p-8 space-y-8 flex-1">
                  <div className="flex justify-between items-start border-b pb-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Identity</p>
                      <h3 className="text-xl font-bold">{clientName || "Cash"}</h3>
                      <p className="text-xs text-muted-foreground">{address || "No address provided"}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Class</p>
                      <Badge className="bg-slate-900">{billType === 'VAT' ? 'TAX INVOICE' : 'COMMERCIAL ESTIMATE'}</Badge>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="text-[10px] font-black uppercase text-slate-400">Description</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Rate</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Qty</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Total (NRS)</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} className="border-b-slate-100 hover:bg-slate-50/50">
                          <TableCell className="font-semibold text-sm py-4">{item.particular}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{item.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{item.quantity}</TableCell>
                          <TableCell className="text-right font-mono font-bold">{(item.amount * item.quantity).toLocaleString()}.00</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-slate-300 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-b-xl">
                  <div className="space-y-3 max-w-xs ml-auto">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>TAXABLE SUBTOTAL</span>
                      <span>NRS {subtotal.toLocaleString()}.00</span>
                    </div>
                    {billType === "VAT" && (
                      <div className="flex justify-between text-xs font-bold text-accent">
                        <span>VAT (13%)</span>
                        <span>+ NRS {vatAmount.toLocaleString()}.00</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
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
                      <TableHead className="text-[10px] font-black uppercase">Document ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Client Signature</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase">Grand Total (NRS)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-[10px] font-bold text-primary">{bill.id}</span>
                            <span className="text-[9px] text-muted-foreground uppercase font-black">{bill.type}</span>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
                <Calculator className="h-16 w-16 text-slate-200" />
                <div className="text-center">
                  <p className="text-slate-900 font-bold uppercase tracking-widest">Awaiting Line Items</p>
                  <p className="text-slate-400 text-sm italic">Populate the form to visualize the document.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
