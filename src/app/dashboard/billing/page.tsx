
"use client"

import { useState, useMemo } from "react"
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
  Zap, 
  History, 
  Eye, 
  XCircle,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Bill, BillItem, BillType } from "@/lib/types"
import { useFirestore, useCollection } from "@/firebase"
import { collection, doc, setDoc, query, orderBy, deleteDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function BillingPage() {
  const { toast } = useToast()
  const db = useFirestore()
  
  const [billType, setBillType] = useState<BillType>("VAT")
  const [clientName, setClientName] = useState("")
  const [address, setAddress] = useState("")
  const [particulars, setParticulars] = useState("")
  const [amount, setAmount] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [draftItems, setDraftItems] = useState<BillItem[]>([])
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const billsQuery = useMemo(() => db ? query(collection(db, 'bills'), orderBy('createdAt', 'desc')) : null, [db]);
  const { data: bills = [] } = useCollection<Bill>(billsQuery);

  const addItem = () => {
    if (!particulars || !amount) return;
    const newItem: BillItem = {
      id: Math.random().toString(36).substr(2, 9),
      particular: particulars,
      amount: parseFloat(amount),
      quantity: parseInt(quantity) || 1
    }
    setDraftItems([...draftItems, newItem])
    setParticulars(""); setAmount(""); setQuantity("1");
  }

  const subtotal = selectedBill 
    ? selectedBill.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0)
    : draftItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0)

  const isVAT = selectedBill ? selectedBill.type === "VAT" : billType === "VAT"
  const vatAmount = isVAT ? subtotal * 0.13 : 0
  const grandTotal = subtotal + vatAmount

  const generateBill = () => {
    if (!db || draftItems.length === 0) return;
    setIsGenerating(true);
    
    const billId = `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newBill: Bill = {
      id: billId,
      type: billType,
      clientName: clientName.trim() || "Cash",
      address: address || "Over-the-counter Transaction",
      items: draftItems,
      totalAmount: grandTotal,
      createdAt: new Date().toISOString(),
      currency: "NRS",
      status: 'Paid'
    };

    const billRef = doc(db, 'bills', billId);
    setDoc(billRef, newBill)
      .then(() => {
        setIsGenerating(false);
        setDraftItems([]); setClientName(""); setAddress("");
        setSelectedBill(newBill);
        toast({ title: "E-Bill Issued", description: `Ref: ${billId} | Synced in Cloud NRS.` });
      })
      .catch(async (err) => {
        setIsGenerating(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: billRef.path,
          operation: 'create',
          requestResourceData: newBill
        }));
      });
  }

  const voidBill = (id: string) => {
    if (!db) return;
    const billRef = doc(db, 'bills', id);
    setDoc(billRef, { status: 'Void' }, { merge: true })
      .then(() => toast({ title: "Bill Voided", description: "Document marked as void in Cloud NRS." }))
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: billRef.path,
          operation: 'update',
          requestResourceData: { status: 'Void' }
        }));
      });
  }

  const deleteBill = (id: string) => {
    if (!db) return;
    const billRef = doc(db, 'bills', id);
    deleteDoc(billRef)
      .then(() => toast({ title: "Bill Deleted", description: "Document removed from cloud terminal.", variant: "destructive" }))
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: billRef.path,
          operation: 'delete'
        }));
      });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Financial Terminal (NRS)</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-[10px]">Cloud-Synchronized E-Billing Hub</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl border-none bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Terminal Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4">
                <Select value={billType} onValueChange={(v: BillType) => setBillType(v)}>
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VAT">Official VAT Invoice (13%)</SelectItem>
                    <SelectItem value="Estimate">Commercial Estimate</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                <Input placeholder="Billing Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 space-y-4">
                <Input placeholder="Particular Description" value={particulars} onChange={(e) => setParticulars(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Rate (NRS)" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <Input type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
                <Button onClick={addItem} className="w-full font-bold uppercase text-[10px]">Add to draft</Button>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-6">
              <Button 
                className="w-full h-14 bg-primary font-black shadow-xl uppercase tracking-widest" 
                onClick={generateBill}
                disabled={isGenerating || draftItems.length === 0}
              >
                {isGenerating ? "Encrypting..." : `Finalize ${billType}`}
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-slate-900 py-3">
              <CardTitle className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <History className="h-4 w-4" /> Cloud History
              </CardTitle>
            </CardHeader>
            <div className="max-h-[300px] overflow-auto">
              <Table>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedBill(bill)}>
                      <TableCell className="py-3">
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
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedBill(bill); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteBill(bill.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-3 shadow-2xl border-none flex flex-col min-h-[600px] overflow-hidden bg-white">
           <CardContent className="p-10 flex-1 flex flex-col">
             {(selectedBill || draftItems.length > 0) ? (
               <div className="flex-1 flex flex-col space-y-10 animate-fade-in">
                 <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-900 uppercase">MoonSync Pro</h2>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Cloud Verification Active</p>
                    </div>
                    <Badge className="bg-slate-900 text-white font-black uppercase tracking-widest text-[9px]">
                      {selectedBill?.id || 'DRAFT SESSION'}
                    </Badge>
                 </div>
                 
                 <div className="flex-1">
                   <Table>
                     <TableHeader className="bg-slate-50">
                       <TableRow>
                         <TableHead className="text-[9px] font-black uppercase">Particulars</TableHead>
                         <TableHead className="text-right text-[9px] font-black uppercase">Total (NRS)</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {(selectedBill?.items || draftItems).map((item) => (
                         <TableRow key={item.id}>
                           <TableCell className="font-bold text-xs py-4">{item.particular} (x{item.quantity})</TableCell>
                           <TableCell className="text-right font-mono font-black text-xs">{(item.amount * item.quantity).toLocaleString()}.00</TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>

                 <div className="border-t-2 border-slate-900 pt-8 flex justify-end">
                    <div className="w-full max-w-xs space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                        <span>Subtotal</span>
                        <span>NRS {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-lg">
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Payable</span>
                        <span className="text-xl font-black text-primary-foreground">NRS {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
                 <Receipt className="h-12 w-12 text-slate-200" />
                 <p className="text-[10px] font-black uppercase text-slate-400">Construct E-Bill to preview cloud document.</p>
               </div>
             )}
           </CardContent>
        </Card>
      </div>
    </div>
  )
}
