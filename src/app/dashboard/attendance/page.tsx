
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { 
  Clock, 
  LogIn, 
  LogOut, 
  MapPin, 
  WifiOff, 
  ShieldCheck 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { AttendanceRecord } from "@/lib/types"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, query, orderBy, where } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function AttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const db = useFirestore();
  
  const [currentTime, setCurrentTime] = useState<string>("");
  const [autoLocation, setAutoLocation] = useState<string>("Detecting...");

  const attendanceQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'attendance'), orderBy('date', 'desc'));
  }, [db]);

  const { data: allRecords = [] } = useCollection<AttendanceRecord>(attendanceQuery);

  const records = useMemo(() => {
    if (user?.role === 'Admin' || user?.role === 'Finance') return allRecords;
    return allRecords.filter(r => r.userId === user?.id);
  }, [allRecords, user]);

  const isCheckedIn = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return records.some(r => r.userId === user?.id && r.date === today && !r.checkOut);
  }, [records, user?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    if (typeof window !== 'undefined' && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setAutoLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => setAutoLocation("Standard Office"),
        { enableHighAccuracy: true }
      );
    }

    return () => clearInterval(timer);
  }, []);

  const handleAction = (type: 'check-in' | 'check-out') => {
    if (!db || !user) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toISOString().split('T')[0];

    if (type === 'check-in') {
      const recordId = `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const newRecord: Partial<AttendanceRecord> = {
        id: recordId,
        userId: user.id,
        userName: user.name,
        date,
        checkIn: time,
        status: 'Present',
        location: autoLocation,
        source: 'Mobile'
      };
      
      const recordRef = doc(db, 'attendance', recordId);
      setDoc(recordRef, newRecord);
      toast({ title: "Session Initialized", description: `Clocked in at ${time}.` });
    } else {
      const activeRecord = records.find(r => r.userId === user.id && r.date === date && !r.checkOut);
      if (!activeRecord) return;

      const recordRef = doc(db, 'attendance', activeRecord.id);
      setDoc(recordRef, { checkOut: time }, { merge: true });
      toast({ title: "Session Terminated", description: `Clocked out at ${time}.` });
    }
  };

  const presentCount = records.filter(r => r.status === 'Present').length;
  const attendancePercentage = records.length > 0 ? (presentCount / records.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary uppercase">Attendance Terminal</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Real-time shift tracking and geolocation nodes.</p>
        </div>
        <Card className="flex items-center gap-3 px-4 py-2 border-primary/20 bg-primary/5">
          <Clock className="h-4 w-4 text-primary animate-pulse" />
          <div className="text-lg font-mono font-bold text-primary">{currentTime || "SYNCING..."}</div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary shadow-2xl bg-white overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Action Terminal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] flex items-start gap-2">
                <MapPin className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5 overflow-hidden">
                  <p className="font-black text-white uppercase tracking-widest text-[8px]">Digital Node</p>
                  <p className="font-mono text-primary truncate">{autoLocation}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!isCheckedIn ? (
                  <Button 
                    className="w-full h-14 text-sm font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                    onClick={() => handleAction('check-in')}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Initialize Shift
                  </Button>
                ) : (
                  <Button 
                    variant="destructive"
                    className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-destructive/20"
                    onClick={() => handleAction('check-out')}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Terminate Shift
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-slate-900 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                System Integrity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-black uppercase text-white">
                  <span>Efficiency Index</span>
                  <span className="text-primary">{Math.round(attendancePercentage)}%</span>
                </div>
                <Progress value={attendancePercentage} className="h-1 bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 shadow-2xl border-none overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50 py-4">
            <CardTitle className="text-xs font-black uppercase tracking-widest">Shift Ledger</CardTitle>
            <Badge variant="outline" className="font-black bg-white text-[9px]">{records.length} ENTRIES</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black text-[9px] uppercase py-3">Personnel</TableHead>
                    <TableHead className="font-black text-[9px] uppercase py-3">Date</TableHead>
                    <TableHead className="font-black text-[9px] uppercase py-3">Session</TableHead>
                    <TableHead className="font-black text-[9px] uppercase py-3 hidden sm:table-cell">Node</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="py-2">
                        <span className="text-[10px] font-black text-slate-900">{record.userName || 'Unknown'}</span>
                      </TableCell>
                      <TableCell className="text-[9px] font-bold text-slate-500">{record.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-[9px] font-black">
                          <span>{record.checkIn}</span>
                          <span className="opacity-30">→</span>
                          <span>{record.checkOut || 'Active'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-[8px] font-bold text-slate-400 truncate max-w-[100px] block uppercase">
                          {record.location || 'UNVERIFIED'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {records.length === 0 && (
              <div className="p-10 text-center flex flex-col items-center gap-2 opacity-30">
                <WifiOff className="h-6 w-6" />
                <p className="text-[9px] font-black uppercase tracking-widest">Cloud ledger empty.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-3 flex justify-center">
             <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em]">Cloud Node Active • Instant Sync</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
