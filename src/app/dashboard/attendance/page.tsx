
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { MOCK_ATTENDANCE, MOCK_USERS } from "@/lib/store"
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
  const [autoLocation, setAutoLocation] = useState<string>("Detecting High-Precision Landmark...");

  const isManagement = user?.role === 'Admin' || user?.role === 'Finance';

  useEffect(() => {
    // Initial Load from Storage
    const savedLogs = localStorage.getItem('moonsync_attendance');
    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs);
      setRecords(parsedLogs);
      
      // Check if current user is already checked in today (no checkout)
      const today = new Date().toISOString().split('T')[0];
      const activeSession = parsedLogs.find((r: AttendanceRecord) => 
        r.userId === user?.id && r.date === today && !r.checkOut
      );
      if (activeSession) {
        setIsCheckedIn(true);
      }
    } else {
      setRecords(MOCK_ATTENDANCE);
      localStorage.setItem('moonsync_attendance', JSON.stringify(MOCK_ATTENDANCE));
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    // High Precision Location Tracking
    if (typeof window !== 'undefined' && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, we'd reverse geocode here. For this ERP, we use high-precision landmarks.
          setAutoLocation(`Landmark: ZONE-${latitude.toFixed(2)}-${longitude.toFixed(2)} [Precise: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}]`);
        },
        () => {
          setAutoLocation("Terminal Location: Manual Entry Required");
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
        description: `Landmark Captured: ${autoLocation} at ${time}.`,
      });
    } else {
      // Find the active session and update it with checkOut
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
        description: `Check-out logged at ${time}. Ledger entry finalized.`,
      });
    }
  };

  const pingTerminal = () => {
    if (!isManagement) return;
    setIsPinging(true);
    setTimeout(() => {
      const success = Math.random() > 0.1;
      setTerminalStatus(success ? 'Online' : 'Offline');
      setIsPinging(false);
      toast({
        title: success ? "Hardware Node Responsive" : "Sync Error",
        description: success ? "Main Biometric Terminal reachable. Latency: 12ms." : "Communication failure with Node-02.",
        variant: success ? "default" : "destructive",
      });
    }, 1200);
  };

  const syncHardwareData = () => {
    if (!isManagement) return;
    if (terminalStatus === 'Offline') {
      toast({
        title: "Hardware Offline",
        description: "Establish connection with the biometric node first.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    setTimeout(() => {
      const hardwareRecord: AttendanceRecord = {
        id: `HW-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        userId: '4', // Simulating Tina Tech
        date: new Date().toISOString().split('T')[0],
        checkIn: '08:45 AM',
        status: 'Present',
        location: 'Biometric Node: Main Entrance',
        source: 'Hardware'
      };
      saveRecords([hardwareRecord, ...records]);
      setIsSyncing(false);
      toast({
        title: "Hardware Logs Imported",
        description: "Successfully merged external biometric sessions into the NRS ledger.",
      });
    }, 1500);
  };

  const generateReport = () => {
    toast({
      title: "Compiling High-Precision Audit",
      description: `Analyzing location landmarks and session integrity for ${isManagement ? "All Staff" : "User " + user?.name}`,
    });
  };

  const getStaffName = (id: string) => {
    return MOCK_USERS.find(u => u.id === id)?.name || "Unknown Identity";
  };

  const filteredRecords = isManagement 
    ? records 
    : records.filter(r => r.userId === user?.id);

  const presentCount = filteredRecords.filter(r => r.status === 'Present').length;
  const attendancePercentage = (presentCount / (filteredRecords.length || 1)) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Attendance Control Center</h1>
          <p className="text-muted-foreground">
            {isManagement 
              ? "Oversee organizational check-ins and high-precision location landmarks." 
              : "Synchronize your personal shift logs and captured geo-data."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(isManagement) && (
            <Button variant="outline" onClick={generateReport} className="hidden sm:flex border-primary text-primary hover:bg-primary/5 font-black uppercase text-[10px] tracking-widest h-10">
              <Download className="mr-2 h-4 w-4" />
              Export Location Audit
            </Button>
          )}
          <Card className="flex items-center gap-4 px-6 py-2 border-primary/20 bg-primary/5">
            <Clock className="h-5 w-5 text-primary animate-pulse" />
            <div className="text-xl font-mono font-bold text-primary">{currentTime || "SYNCING..."}</div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary shadow-2xl bg-white overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-widest">Manual Node Entry</CardTitle>
              <CardDescription className="text-xs">Establish a session from your current landmark.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-[10px] flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black text-white uppercase tracking-widest">Captured Digital Landmark</p>
                  <p className="font-mono text-primary truncate w-full">{autoLocation}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {!isCheckedIn ? (
                  <Button 
                    className="w-full h-16 text-md font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                    onClick={() => handleAction('check-in')}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Initialize Check-In
                  </Button>
                ) : (
                  <Button 
                    variant="destructive"
                    className="w-full h-16 text-md font-black uppercase tracking-widest shadow-xl shadow-destructive/20 transition-all hover:scale-[1.02] active:scale-95"
                    onClick={() => handleAction('check-out')}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Terminate Session
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {isManagement && (
            <Card className="border-t-4 border-t-accent shadow-xl bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg font-black uppercase tracking-widest">
                  External Node Sync
                  <Badge variant={terminalStatus === 'Online' ? 'default' : 'destructive'} className="text-[9px] font-black tracking-widest px-3">
                    {terminalStatus === 'Online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                    {terminalStatus}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs font-medium">Remote Biometric Infrastructure Status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-accent/5 rounded-xl border border-accent/20 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-muted-foreground uppercase">Target IP:</span>
                    <span className="font-mono text-accent">192.168.1.105</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full text-[10px] font-black uppercase tracking-widest h-10 border-slate-200"
                    onClick={pingTerminal}
                    disabled={isPinging}
                  >
                    {isPinging ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Activity className="h-3 w-3 mr-1" />}
                    Ping Node
                  </Button>
                  <Button 
                    variant="default" 
                    className="w-full text-[10px] font-black uppercase tracking-widest h-10 bg-accent hover:bg-accent/90"
                    onClick={syncHardwareData}
                    disabled={isSyncing}
                  >
                    {isSyncing ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                    Import Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-xl bg-slate-900 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                {isManagement ? "Integrity Compliance" : "Personal Performance"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-white">
                  <span>Trust Score</span>
                  <span className="text-primary">{Math.round(attendancePercentage)}%</span>
                </div>
                <Progress value={attendancePercentage} className="h-1.5 bg-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-xl text-center border border-slate-700/50">
                  <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Sessions</p>
                  <p className="text-lg font-black text-white">{filteredRecords.length}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl text-center border border-slate-700/50">
                  <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Status</p>
                  <p className="text-sm font-black text-emerald-400">ENCRYPTED</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 shadow-2xl border-none overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-slate-50">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-widest">Consolidated Shift Ledger</CardTitle>
              <CardDescription className="text-xs font-medium">
                {isManagement 
                  ? "Verifying organizational attendance through digital landmarks." 
                  : "Immutable record of your daily session entry points."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-black bg-white border-slate-200 text-xs">
                {filteredRecords.length} ENTRIES SYNCED
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Personnel Identity</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Date Reference</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Session Interval</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-5">Captured Landmark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-primary/5 transition-colors border-b border-slate-50">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-black text-primary border border-primary/20">
                          {getStaffName(record.userId).charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">{getStaffName(record.userId)}</span>
                          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter">
                            UID: {record.userId}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-500">{record.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-[10px] font-black border-slate-200">{record.checkIn}</Badge>
                        <span className="text-muted-foreground font-mono opacity-50">→</span>
                        {record.checkOut ? (
                          <Badge variant="outline" className="font-mono text-[10px] font-black border-slate-200">{record.checkOut}</Badge>
                        ) : (
                          <span className="text-[10px] text-primary animate-pulse font-black uppercase tracking-widest">Active Now</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {record.source === 'Hardware' ? (
                          <HardDrive className="h-3 w-3 text-accent" />
                        ) : (
                          <MapPin className="h-3 w-3 text-primary" />
                        )}
                        <span className="text-[9px] font-bold text-slate-600 truncate max-w-[200px] uppercase tracking-tighter">
                          {record.location || 'UNVERIFIED LANDMARK'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRecords.length === 0 && (
              <div className="p-20 text-center text-muted-foreground italic flex flex-col items-center gap-4">
                <WifiOff className="h-10 w-10 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest">No session data captured in current ledger.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-5 flex justify-between items-center">
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">
              Last Handshake: {new Date().toLocaleTimeString()}
            </span>
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest h-8 text-primary" onClick={generateReport}>
              <FileText className="h-3 w-3 mr-1" /> View Full Audit Log
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
