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
  const [records, setRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState<'Online' | 'Offline'>('Online');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = (type: 'check-in' | 'check-out') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toISOString().split('T')[0];

    if (type === 'check-in') {
      const newRecord: AttendanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.id || 'unknown',
        date,
        checkIn: time,
        status: 'Present',
        location: 'HQ Terminal-A1',
        source: 'Manual'
      };
      setRecords([newRecord, ...records]);
      setIsCheckedIn(true);
      toast({
        title: "Check-in Logged",
        description: `Session initialized via local terminal at ${time}`,
      });
    } else {
      setIsCheckedIn(false);
      toast({
        title: "Check-out Logged",
        description: `Session terminated at ${time}. Data queued for sync.`,
      });
    }
  };

  const pingTerminal = () => {
    setIsPinging(true);
    setTimeout(() => {
      const success = Math.random() > 0.1;
      setTerminalStatus(success ? 'Online' : 'Offline');
      setIsPinging(false);
      toast({
        title: success ? "Terminal Responsive" : "Connection Timeout",
        description: success ? "Ping successful. Latency: 24ms." : "Unable to reach Biometric Terminal-02.",
        variant: success ? "default" : "destructive",
      });
    }, 1500);
  };

  const syncHardwareData = () => {
    if (terminalStatus === 'Offline') {
      toast({
        title: "Sync Failed",
        description: "Hardware terminal is offline. Please ping device first.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    setTimeout(() => {
      const hardwareRecord: AttendanceRecord = {
        id: `hw-${Math.random().toString(36).substr(2, 5)}`,
        userId: '4', // Tina Tech
        date: new Date().toISOString().split('T')[0],
        checkIn: '08:45 AM',
        status: 'Present',
        location: 'Bio-Matrix v8',
        source: 'Hardware'
      };
      setRecords(prev => [hardwareRecord, ...prev]);
      setIsSyncing(false);
      toast({
        title: "Data Synced",
        description: "Successfully imported 1 hardware log from Bio-Matrix v8.",
      });
    }, 2000);
  };

  const generateReport = () => {
    toast({
      title: "Generating Comprehensive Report",
      description: "Compiling check-in/check-out metrics for " + (user?.role === 'Admin' ? "All Staff" : user?.name),
    });
  };

  const getStaffName = (id: string) => {
    return MOCK_USERS.find(u => u.id === id)?.name || "Unknown User";
  };

  const filteredRecords = user?.role === 'Admin' 
    ? records 
    : records.filter(r => r.userId === user?.id);

  const presentCount = filteredRecords.filter(r => r.status === 'Present').length;
  const attendancePercentage = (presentCount / (filteredRecords.length || 1)) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Time Management Console</h1>
          <p className="text-muted-foreground">Monitor check-in/out logs and synchronize with biometric hardware.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={generateReport} className="hidden sm:flex border-primary text-primary hover:bg-primary/5">
            <Download className="mr-2 h-4 w-4" />
            Export Daily Report
          </Button>
          <Card className="flex items-center gap-4 px-6 py-3 border-primary/20 bg-primary/5">
            <Clock className="h-5 w-5 text-primary animate-pulse" />
            <div className="text-xl font-mono font-bold text-primary">{currentTime || "Loading..."}</div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Manual Logging</CardTitle>
              <CardDescription>Direct terminal check-in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                {!isCheckedIn ? (
                  <Button 
                    className="w-full h-14 text-md font-bold bg-primary hover:bg-primary/90"
                    onClick={() => handleAction('check-in')}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Check In
                  </Button>
                ) : (
                  <Button 
                    variant="destructive"
                    className="w-full h-14 text-md font-bold"
                    onClick={() => handleAction('check-out')}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Check Out
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-accent shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                Device Connectivity
                <Badge variant={terminalStatus === 'Online' ? 'default' : 'destructive'} className="text-[10px]">
                  {terminalStatus === 'Online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                  {terminalStatus}
                </Badge>
              </CardTitle>
              <CardDescription>Bio-Matrix Hardware Interface.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-accent/5 rounded-lg border border-accent/20 text-sm space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Main Terminal:</span>
                  <span className="font-mono text-[10px]">192.168.1.105</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Protocol:</span>
                  <span className="font-mono text-[10px]">TCP/IP Secure</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs"
                  onClick={pingTerminal}
                  disabled={isPinging}
                >
                  {isPinging ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Activity className="h-3 w-3 mr-1" />}
                  Ping Device
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="w-full text-xs bg-accent hover:bg-accent/90"
                  onClick={syncHardwareData}
                  disabled={isSyncing}
                >
                  {isSyncing ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                  Sync Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Compliance Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Shift Compliance</span>
                  <span className="font-bold">{Math.round(attendancePercentage)}%</span>
                </div>
                <Progress value={attendancePercentage} className="h-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-lg text-center border">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Hours Logged</p>
                  <p className="text-lg font-bold">164h</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg text-center border">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Exceptions</p>
                  <p className="text-lg font-bold text-orange-600">2</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" size="sm" className="w-full text-xs text-primary" onClick={generateReport}>
                <FileText className="mr-2 h-3 w-3" />
                View Full Audit Log
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="md:col-span-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Attendance & Shift Ledger</CardTitle>
              <CardDescription>
                Synchronized data from manual terminals and biometric hardware.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {filteredRecords.length} Logs Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold text-xs">Personnel</TableHead>
                  <TableHead className="font-bold text-xs">Date</TableHead>
                  <TableHead className="font-bold text-xs">Time (In/Out)</TableHead>
                  <TableHead className="font-bold text-xs">Origin Machine</TableHead>
                  <TableHead className="font-bold text-xs">Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                          {getStaffName(record.userId).charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{getStaffName(record.userId)}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-medium">{record.userId === user?.id ? 'Self' : 'Staff'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600">{record.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100">{record.checkIn}</Badge>
                        <span className="text-muted-foreground font-mono">-</span>
                        {record.checkOut ? (
                          <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100">{record.checkOut}</Badge>
                        ) : (
                          <span className="text-[10px] text-primary animate-pulse font-bold">ACTIVE</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {record.source === 'Hardware' ? (
                          <HardDrive className="h-3 w-3 text-accent" />
                        ) : (
                          <MapPin className="h-3 w-3 text-primary" />
                        )}
                        <span className="text-[10px] font-semibold">{record.location || 'Local Terminal'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={record.status === 'Present' ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRecords.length === 0 && (
              <div className="p-16 text-center text-muted-foreground italic flex flex-col items-center gap-2">
                <WifiOff className="h-8 w-8 opacity-20" />
                No session data captured.
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/20 border-t p-4 flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Last Sync: {new Date().toLocaleTimeString()}
            </span>
            <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={generateReport}>
              <Download className="h-3 w-3 mr-1" /> Download CSV Audit
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
