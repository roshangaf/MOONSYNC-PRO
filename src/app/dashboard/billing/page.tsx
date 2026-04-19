
"use client"

import { useState, useEffect, useRef } from "react"
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
  Zap,
  History,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Bill, BillItem, BillType } from "@/lib/types"

// A realistic-looking QR Code SVG for the E-Bill
const QRCode = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-80">
    <rect width="80" height="80" fill="white" />
    <path d="M10 10h20v20H10zM10 50h20v20H10zM50 10h20v20H50z" fill="black" />
    <path d="M15 15h10v10H15zM15 55h10v10H15zM55 15h10v10H55z" fill="white" />
    <path d="M40 10h5v5h-5zM45 15h5v5h-5zM40 20h5v5h-5zM35 25h5v5h-5zM10 35h5v5h-5zM20 35h5v5h-5zM30 35h5v5h-5zM10 45h5v5h-5zM20 45h5v5h-5zM30 45h5v5h-5zM40 40h5v5h-5zM50 40h5v5h-5zM60 40h5v5h-5zM40 50h5v5h-5zM50 50h5v5h-5zM60 50h5v5h-5zM70 50h5v5h-5zM40 60h5v5h-5zM50 60h5v5h-5zM60 60h5v5h-5zM70 60h5v5h-5zM40 70h5v5h-5zM50 70h5v5h-5" fill="black" />
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
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
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
    setSelectedBill(null) // Reset selection if drafting new
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const voidBill = (id: string) => {
    const updatedBills = bills.map(bill => bill.id === id ? { ...bill, status: 'Void' } : bill);
    saveBillsToStorage(updatedBills);
    if (selectedBill?.id === id) {
      setSelectedBill(prev => prev ? { ...prev, status: 'Void' } : null);
    }
    toast({
      title: "Bill Voided",
      description: `Document ${id} has been marked as void in the NRS ledger.`,
      variant: "destructive"
    });
  }

  const deleteBill = (id: string) => {
    const updatedBills = bills.filter(bill => bill.id !== id);
    saveBillsToStorage(updatedBills);
    if (selectedBill?.id === id) {
      setSelectedBill(null);
    }
    toast({
      title: "Bill Deleted",
      description: `Document ${id} has been permanently removed from the NRS terminal.`,
      variant: "destructive"
    });
  }

  const subtotal = selectedBill 
    ? selectedBill.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0)
    : items.reduce((sum, item) => sum + (item.amount * item.quantity), 0)

  const isVAT = selectedBill ? selectedBill.type === "VAT" : billType === "VAT"
  const vatAmount = isVAT ? subtotal * 0.13 : 0
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

      const updatedBills = [newBill, ...bills];
      saveBillsToStorage(updatedBills);
      setItems([])
      setClientName("")
      setAddress("")
      setIsGenerating(false)
      setSelectedBill(newBill)
      
      toast({
        title: "Electronic Bill Issued",
        description: `Ref: ${billId} | Client: ${finalClientName} | Synced in NRS.`,
      })
    }, 1000)
  }

  const handlePrint = () => {
    window.print();
  }

  const viewBillDetails = (bill: Bill) => {
    setSelectedBill(bill);
    setItems([]); // Clear draft if viewing history
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Financial Terminal (NRS)</h1>
          <p className="text-muted-foreground">Professional E-Billing node with digital signature and audit-ready PDF logs.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl border-none bg-white overflow-hidden h-fit">
            <div className="bg-primary h-1.5 w-full" />
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-800">Terminal Entry</CardTitle>
              <CardDescription>Construct a new commercial document.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Bill Category</Label>
                  <Select value={billType} onValueChange={(v: BillType) => setBillType(v)}>
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VAT">Official VAT Invoice (13%)</SelectItem>
                      <SelectItem value="Estimate">Commercial Estimate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Client Name / Identity</Label>
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
                    placeholder="Office / Site Address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-slate-50"
                  />
                </div>
              </div>

              <div className="p-5 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                  <Zap className="h-3 w-3 fill-primary" /> Service Particulars
                </h4>
                <div className="space-y-3">
                  <Input 
                    placeholder="Description of work" 
                    value={particulars} 
                    onChange={(e) => setParticulars(e.target.value)}
                    className="bg-white"
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
                      <Label className="text-[9px] font-bold uppercase text-muted-foreground">Qty</Label>
                      <Input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <Button onClick={addItem} className="w-full font-bold uppercase text-xs h-11">
                    Add Entry to draft
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-6">
              <Button 
                className="w-full h-14 bg-primary font-black shadow-2xl shadow-primary/20 text-md uppercase tracking-widest transition-transform hover:scale-[1.02]" 
                onClick={generateBill}
                disabled={isGenerating || (items.length === 0)}
              >
                {isGenerating ? "Encrypting..." : `Finalize ${billType}`}
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-slate-900 py-3">
              <CardTitle className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <History className="h-4 w-4" /> Document History
              </CardTitle>
            </CardHeader>
            <div className="max-h-[300px] overflow-auto">
              <Table>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => viewBillDetails(bill)}>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800">{bill.id}</span>
                          <span className="text-[9px] text-muted-foreground font-bold uppercase">{bill.clientName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-[10px] font-black text-primary">NRS {bill.totalAmount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); viewBillDetails(bill); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {bill.status !== 'Void' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-orange-500 hover:bg-orange-50"
                              onClick={(e) => { e.stopPropagation(); voidBill(bill.id); }}
                              title="Void Bill"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); deleteBill(bill.id); }}
                            title="Delete Bill"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bills.length === 0 && (
                    <TableRow>
                      <TableCell className="text-center py-10 text-xs text-muted-foreground italic">No historical data synced.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-3 shadow-2xl border-none flex flex-col min-h-[800px] overflow-hidden bg-white">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4 print:hidden">
            <div>
              <CardTitle className="text-xs font-black uppercase tracking-[0.1em]">Formal Document Preview</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 text-xs font-bold" disabled={!selectedBill && items.length === 0}>
                <Printer className="h-3.5 w-3.5 mr-2" /> Print / Save PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {(selectedBill || items.length > 0) ? (
              <div className="flex-1 flex flex-col p-10 md:p-16 space-y-12 animate-fade-in">
                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 p-2.5 rounded-xl">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">MoonSync Pro</h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Corporate ERP Terminal</p>
                      </div>
                    </div>
                    <div className="text-[10px] leading-relaxed text-muted-foreground font-medium max-w-[200px]">
                      VAT Reg: 601234567 • Level 4, Tech Plaza, Kathmandu, Nepal
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <Badge variant="outline" className="bg-slate-900 text-white border-none font-black px-5 py-1.5 text-xs tracking-widest uppercase">
                      {selectedBill ? (selectedBill.type === 'VAT' ? 'Official VAT Invoice' : 'Commercial Estimate') : (billType === 'VAT' ? 'Official VAT Invoice' : 'Commercial Estimate')}
                    </Badge>
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial No.</p>
                      <p className="font-mono text-sm font-black text-slate-900">{selectedBill?.id || 'DRAFT-SESSION'}</p>
                      {selectedBill?.status === 'Void' && (
                        <Badge variant="destructive" className="mt-2 uppercase font-black tracking-widest text-[10px]">Document Voided</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recipient Information</h4>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-slate-900">{selectedBill?.clientName || clientName || "Cash"}</p>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[250px]">{selectedBill?.address || address || "Over-the-counter Transaction"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-6">
                    <div className="text-right">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated At</h4>
                      <p className="text-sm font-black">{selectedBill ? new Date(selectedBill.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-900 py-4">Rate (NRS)</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-900 py-4">Qty</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase text-slate-900 py-4">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedBill?.items || items).map((item) => (
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Node Signature</p>
                        <div className="h-10 border-b border-slate-300 w-48 italic font-serif text-slate-400 flex items-end pb-1 px-2">
                          Electronic Seal Active
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter">
                        Authenticated Digital Document • MoonSync Infrastructure Sync
                      </p>
                   </div>
                  <div className="w-full max-w-xs space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>TAXABLE SUBTOTAL</span>
                      <span className="font-mono">NRS {subtotal.toLocaleString()}.00</span>
                    </div>
                    {isVAT && (
                      <div className="flex justify-between items-center text-xs font-bold text-primary">
                        <span>VAT (13%)</span>
                        <span className="font-mono">+ NRS {vatAmount.toLocaleString()}.00</span>
                      </div>
                    )}
                    <div className="h-px bg-slate-200" />
                    <div className={`flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-2xl transition-all ${selectedBill?.status === 'Void' ? 'opacity-50 grayscale' : ''}`}>
                      <span className="text-xs font-black uppercase tracking-widest">Total Payable</span>
                      <span className="text-2xl font-black text-primary-foreground">NRS {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-8 text-center">
                <div className="bg-slate-50 p-10 rounded-full border-2 border-dashed border-slate-200">
                  <Receipt className="h-16 w-16 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Awaiting Data Entry</h3>
                  <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest">Construct a new bill or select from history to generate PDF preview.</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-5 flex justify-center print:hidden">
             <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
               <span>Currency: NRS</span>
               <div className="h-1 w-1 bg-slate-300 rounded-full" />
               <span>Serial Type: INV-M1</span>
               <div className="h-1 w-1 bg-slate-300 rounded-full" />
               <span>Verification: 2048-BIT</span>
             </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
