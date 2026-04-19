
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
  Printer, 
  Download, 
  Hash,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Bill, BillItem, BillType } from "@/lib/types"

// A realistic-looking QR Code SVG for the E-Bill
const QRCode = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-80">
    <rect width="80" height="80" fill="white" />
    <path d="M10 10h20v20H10zM10 50h20v20H10zM50 10h20v20H50z" fill="black" />
    <path d="M15 15h10v10H15zM15 55h10v10H15zM55 15h10v10H55z" fill="white" />
    <path d="M40 10h5v5h-5zM45 15h5v5h-5zM40 20h5v5h-5zM35 25h5v5h-5zM10 35h5v5h-5zM20 35h5v5h-5zM30 35h5v5h-5zM10 45h5v5h-5zM20 45h5v5h-5zM30 45h5v5h-5zM40 40h5v5h-5zM50 40h5v5h-5zM60 40h5v5h-5zM40 50h5v5h-5zM50 50h5v5h-5zM60 50h5v5h-5zM70 50h5v5h-5zM40 60h5v5h-5zM50 60h5v5h-5zM60 60h5v5h-5zM70 60h5v5h-5zM40 70h5v5h-5zM50 70h5v5h-5zM60 70h5v5h-5zM70 70h5v5h-5z" fill="black" />
  </svg>
);

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
    const updatedBills = bills.map(bill => bill.id === id ? { ...bill, status: 'Void' } : bill);
    saveBillsToStorage(updatedBills);
    toast({
      title: "Bill Voided",
      description: `Document ${id} has been marked as void.`,
      variant: "destructive"
    });
  }

  const subtotal = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0)
  const vatAmount = billType === "VAT" ? subtotal * 0.13 : 0
  const grandTotal = subtotal + vatAmount

  const generateBill = () => {
    if (items.length === 0) {
      toast({
        title: "Empty Ledger",
        description: "Add service particulars to generate the document.",
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
        address: address || "Over-the-counter Transaction",
        items: [...items],
        totalAmount: grandTotal,
        createdAt: new Date().toISOString(),
        currency: "NRS",
        status: 'Paid'
      }

      saveBillsToStorage([newBill, ...bills]);
      setItems([])
      setClientName("")
      setAddress("")
      setIsGenerating(false)
      
      toast({
        title: "Electronic Bill Issued",
        description: `Ref: ${billId} | Client: ${finalClientName} | Synced with Ledger.`,
      })
    }, 1000)
  }

  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Electronic Billing Node</h1>
          <p className="text-muted-foreground">Issue formal VAT invoices and estimates with high-precision digital verification.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-xl border-none bg-slate-50 overflow-hidden h-fit">
          <div className="bg-primary h-1.5 w-full" />
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-800">Terminal Entry</CardTitle>
            <CardDescription>Input transaction metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 bg-white">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Document Category</Label>
                <Select value={billType} onValueChange={(v: BillType) => setBillType(v)}>
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VAT">Standard VAT Invoice (13%)</SelectItem>
                    <SelectItem value="Estimate">Commercial Estimate (Pro-Forma)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Client Signature / Name</Label>
                <Input 
                  placeholder="Defaults to 'Cash'" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Billing Address</Label>
                <Input 
                  placeholder="Registered Office Address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="p-5 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 space-y-4">
              <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                <Zap className="h-3 w-3 fill-primary" /> Itemized Particulars
              </h4>
              <div className="space-y-3">
                <Input 
                  placeholder="Service description" 
                  value={particulars} 
                  onChange={(e) => setParticulars(e.target.value)}
                  className="bg-white h-11"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Rate (NRS)</Label>
                    <Input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Quantity</Label>
                    <Input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
                <Button onClick={addItem} className="w-full font-bold uppercase text-xs h-11">
                  Add Entry to Ledger
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-white border-t p-6">
            <Button 
              className="w-full h-14 bg-primary font-black shadow-2xl shadow-primary/20 text-md uppercase tracking-widest transition-transform hover:scale-[1.02]" 
              onClick={generateBill}
              disabled={isGenerating || items.length === 0}
            >
              {isGenerating ? "Encrypting Data..." : `Issue Official ${billType}`}
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-3 shadow-2xl border-none flex flex-col min-h-[700px] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-[0.1em]">Formal E-Bill Preview</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 text-xs font-bold">
                <Printer className="h-3.5 w-3.5 mr-2" /> Print
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold">
                <Download className="h-3.5 w-3.5 mr-2" /> PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col bg-white">
            {items.length > 0 ? (
              <div className="flex-1 flex flex-col p-10 md:p-16 space-y-12">
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 p-2.5 rounded-xl">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">MoonSync Pro</h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Infrastructure Management ERP</p>
                      </div>
                    </div>
                    <div className="text-[10px] leading-relaxed text-muted-foreground font-medium max-w-[200px]">
                      VAT Reg: 601234567 • Corporate HQ: Tech Plaza, Level 4, Kathmandu, Nepal
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <Badge variant="outline" className="bg-slate-900 text-white border-none font-black px-5 py-1.5 text-xs tracking-widest uppercase">
                      {billType === 'VAT' ? 'Official VAT Invoice' : 'Commercial Estimate'}
                    </Badge>
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document No.</p>
                      <p className="font-mono text-sm font-black text-slate-900">DRAFT-SESSION-LOG</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Billed To</h4>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-slate-900">{clientName || "Cash"}</p>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[250px]">{address || "Over-the-counter Transaction"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-6">
                    <div className="text-right">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</h4>
                      <p className="text-sm font-black">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                      <QRCode />
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <Table>
                    <TableHeader className="bg-slate-50 border-y-2 border-slate-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase text-slate-900 py-4">Particulars</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-900 py-4">Rate</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-900 py-4">Qty</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-900 py-4">Total (NRS)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} className="border-b border-slate-100">
                          <TableCell className="font-bold text-sm py-6 text-slate-800">{item.particular}</TableCell>
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

                <div className="border-t-2 border-slate-900 pt-10 flex justify-between items-end">
                   <div className="space-y-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Signature</p>
                        <div className="h-10 border-b border-slate-300 w-48 italic font-serif text-slate-400 flex items-end pb-1 px-2">
                          MoonSync Terminal
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter">
                        Computer Generated Document • Requires No Physical Signature
                      </p>
                   </div>
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
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-2xl">
                      <span className="text-xs font-black uppercase tracking-widest">Total Payable</span>
                      <span className="text-2xl font-black text-primary-foreground">NRS {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : bills.length > 0 ? (
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase py-4">Serial / Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase py-4">Client Entity</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase py-4">Amount (NRS)</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase py-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id} className={`hover:bg-slate-50 transition-colors ${bill.status === 'Void' ? 'opacity-50' : ''}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                              <Receipt className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-mono text-xs font-black text-primary">{bill.id}</span>
                              <span className="text-[9px] text-muted-foreground uppercase font-black">{new Date(bill.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800">{bill.clientName}</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{bill.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-black text-slate-900">
                          NRS {bill.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Badge variant={bill.status === 'Void' ? 'destructive' : 'secondary'} className="text-[9px] font-black uppercase">
                               {bill.status || 'Paid'}
                             </Badge>
                             {bill.status !== 'Void' && (
                               <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => voidBill(bill.id)}
                                  title="Void Bill"
                               >
                                 <XCircle className="h-4 w-4" />
                               </Button>
                             )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all rounded-full" />
                  <Receipt className="h-24 w-24 text-slate-200 relative animate-pulse-slow" />
                  <ShieldCheck className="h-10 w-10 text-primary absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-slate-900 font-black text-lg uppercase tracking-[0.3em]">Awaiting Transaction</p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Construct your formal E-Bill to begin encryption.</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-5 flex justify-center">
             <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
               <span>Terminal: V8.2.0</span>
               <div className="h-1 w-1 bg-slate-300 rounded-full" />
               <span>Encryption: RSA-4096</span>
               <div className="h-1 w-1 bg-slate-300 rounded-full" />
               <span>Secure Ledger Sync: Active</span>
             </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
