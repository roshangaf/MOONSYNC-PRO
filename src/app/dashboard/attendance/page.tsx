
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { MOCK_USERS } from "@/lib/store"
import { 
  Clock, 
  LogIn, 
  LogOut, 
  MapPin, 
  Calendar, 
  RefreshCw, 
  HardDrive, 
  FileText, 
  Download, 
  TrendingUp, 
  Wifi, 
  WifiOff, 
  Activity, 
  ShieldCheck 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { AttendanceRecord } from "@/lib/types"

export default function AttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState<'Online' | 'Offline'>('Online');
  const [autoLocation, setAutoLocation] = useState<string>("Detecting...");

  const isManagement = user?.role === 'Admin' || user?.role === 'Finance';

  useEffect(() => {
    // Initial Load from Storage
    const savedLogs = localStorage.getItem('moonsync_attendance');
    
    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs);
      setRecords(parsedLogs);
      
      const today = new Date().toISOString().split('T')[0];
      const activeSession = parsedLogs.find((r: AttendanceRecord) => 
        r.userId === user?.id && r.date === today && !r.checkOut
      );
      if (activeSession) {
        setIsCheckedIn(true);
      }
    } else {
      // Start with empty ledger
      setRecords([]);
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    // Location Tracking
    if (typeof window !== 'undefined' && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setAutoLocation(`COORD: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => {
          setAutoLocation("Terminal Location: Manual Entry");
        },
        { enableHighAccuracy: true }
      );
    }

    return () => clearInterval(timer);
  }, [user?.id]);

  const saveRecords = (newRecords: AttendanceRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('moonsync_attendance', JSON.stringify(newRecords));
  }

  const handleAction = (type: 'check-in' | 'check-out') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toISOString().split('T')[0];

    if (type === 'check-in') {
      const newRecord: AttendanceRecord = {
        id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userId: user?.id || 'unknown',
        date,
        checkIn: time,
        status: 'Present',
        location: autoLocation,
        source: 'Manual'
      };
      
      saveRecords([newRecord, ...records]);
      setIsCheckedIn(true);
      toast({
        title: "Check-in Synchronized",
        description: `Landmark Captured at ${time}.`,
      });
    } else {
      const updatedRecords = records.map(r => {
        if (r.userId === user?.id && r.date === date && !r.checkOut) {
          return { ...r, checkOut: time };
        }
        return r;
      });
      
      saveRecords(updatedRecords);
      setIsCheckedIn(false);
      toast({
        title: "Session Terminated",
        description: `Check-out logged at ${time}.`,
      });
    }
  };

  const getStaffName = (id: string) => {
    return MOCK_USERS.find(u => u.id === id)?.name || "Unknown Identity";
  };

  const filteredRecords = isManagement 
    ? records 
    : records.filter(r => r.userId === user?.id);

  const presentCount = filteredRecords.filter(r => r.status === 'Present').length;
  const attendancePercentage = filteredRecords.length > 0 ? (presentCount / filteredRecords.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary uppercase">Attendance Control</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Synchronize personal shift logs and captured geo-data.</p>
        </div>
        <div className="flex items-center gap-2">
          <Card className="flex items-center gap-3 px-4 py-2 border-primary/20 bg-primary/5">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
            <div className="text-lg font-mono font-bold text-primary">{currentTime || "SYNCING..."}</div>
          </Card>
        </div>
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
                  <p className="font-black text-white uppercase tracking-widest">Digital Landmark</p>
                  <p className="font-mono text-primary truncate">{autoLocation}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!isCheckedIn ? (
                  <Button 
                    className="w-full h-14 text-sm font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
                    onClick={() => handleAction('check-in')}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Check-In
                  </Button>
                ) : (
                  <Button 
                    variant="destructive"
                    className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-destructive/20 transition-all active:scale-95"
                    onClick={() => handleAction('check-out')}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Check-Out
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
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/50 p-2 rounded-xl text-center border border-slate-700/50">
                  <p className="text-[7px] uppercase font-black text-slate-500">Logs</p>
                  <p className="text-sm font-black text-white">{filteredRecords.length}</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-xl text-center border border-slate-700/50">
                  <p className="text-[7px] uppercase font-black text-slate-500">Status</p>
                  <p className="text-[10px] font-black text-emerald-400">VERIFIED</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 shadow-2xl border-none overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50 py-4">
            <div>
              <CardTitle className="text-xs font-black uppercase tracking-widest">Shift Ledger</CardTitle>
            </div>
            <Badge variant="outline" className="font-black bg-white text-[9px]">
              {filteredRecords.length} ENTRIES
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black text-[9px] uppercase tracking-widest py-3">Personnel</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-widest py-3">Date</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-widest py-3">Session</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-widest py-3 hidden sm:table-cell">Landmark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary shrink-0">
                            {getStaffName(record.userId).charAt(0)}
                          </div>
                          <span className="text-[10px] font-black text-slate-900 truncate max-w-[80px]">{getStaffName(record.userId)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[9px] font-bold text-slate-500">{record.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-black text-slate-800">{record.checkIn}</span>
                          <span className="text-muted-foreground opacity-30 text-[8px]">→</span>
                          <span className="text-[9px] font-black text-slate-800">{record.checkOut || 'Active'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-[8px] font-bold text-slate-500 truncate max-w-[100px] block uppercase">
                          {record.location || 'UNVERIFIED'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredRecords.length === 0 && (
              <div className="p-10 text-center flex flex-col items-center gap-2 opacity-30">
                <WifiOff className="h-6 w-6" />
                <p className="text-[9px] font-black uppercase tracking-widest">No local session data found.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-3 flex justify-center">
             <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em]">Last Sync: {currentTime}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
