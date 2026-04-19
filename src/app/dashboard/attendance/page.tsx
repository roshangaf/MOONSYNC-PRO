"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { MOCK_ATTENDANCE, MOCK_USERS } from "@/lib/store"
import { Clock, LogIn, LogOut, MapPin, Calendar, CheckCircle2, RefreshCw, HardDrive, FileText, Download, TrendingUp } from "lucide-react"
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
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
        location: 'HQ Terminal',
        source: 'Manual'
      };
      setRecords([newRecord, ...records]);
      setIsCheckedIn(true);
      toast({
        title: "Checked In Successfully",
        description: `Terminal session initialized at ${time}`,
      });
    } else {
      setIsCheckedIn(false);
      toast({
        title: "Checked Out Successfully",
        description: `Terminal session terminated at ${time}`,
      });
    }
  };

  const syncHardwareData = () => {
    setIsSyncing(true);
    // Simulate API call to attendance hardware
    setTimeout(() => {
      const hardwareRecord: AttendanceRecord = {
        id: `hw-${Math.random().toString(36).substr(2, 5)}`,
        userId: '4', // Tina Tech
        date: new Date().toISOString().split('T')[0],
        checkIn: '08:45 AM',
        status: 'Present',
        location: 'Biometric Terminal-02',
        source: 'Hardware'
      };
      setRecords(prev => [hardwareRecord, ...prev]);
      setIsSyncing(false);
      toast({
        title: "Hardware Sync Complete",
        description: "Successfully imported 1 log from BioSync Terminal 02.",
      });
    }, 2000);
  };

  const generateReport = () => {
    toast({
      title: "Generating Report",
      description: "Compiling attendance data into PDF/CSV format...",
    });
    // In a real app, this would trigger a download or a modal with report data
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Attendance Console</h1>
          <p className="text-muted-foreground">Monitor and record departmental presence across the infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={generateReport} className="hidden sm:flex">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Card className="flex items-center gap-4 px-6 py-3 border-primary/20 bg-primary/5">
            <Clock className="h-5 w-5 text-primary animate-pulse" />
            <div className="text-xl font-mono font-bold text-primary">{currentTime || "Loading..."}</div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Shift Control</CardTitle>
              <CardDescription>Establish your current session status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                {!isCheckedIn ? (
                  <Button 
                    className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90"
                    onClick={() => handleAction('check-in')}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Clock In
                  </Button>
                ) : (
                  <Button 
                    variant="destructive"
                    className="w-full h-16 text-lg font-bold"
                    onClick={() => handleAction('check-out')}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Clock Out
                  </Button>
                )}
              </div>
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </span>
                  <span className="font-semibold">Main Office (HQ)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Today
                  </span>
                  <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.role === 'Admin' && (
            <Card className="border-t-4 border-t-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-accent" />
                  Hardware Sync
                </CardTitle>
                <CardDescription>Pull logs from biometric terminals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20 text-sm space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Connected Devices:</span>
                    <Badge variant="outline" className="text-accent border-accent">3 Terminals Active</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">Hardware protocols: ZKTeco, NFC Sync, Biometric v4</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-accent text-accent hover:bg-accent hover:text-white"
                  onClick={syncHardwareData}
                  disabled={isSyncing}
                >
                  {isSyncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  {isSyncing ? "Syncing Hardware..." : "Sync Hardware Data"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Quick Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Presence Rate</span>
                  <span>{Math.round(attendancePercentage)}%</span>
                </div>
                <Progress value={attendancePercentage} className="h-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Present</p>
                  <p className="text-xl font-bold">{presentCount}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Avg Clock In</p>
                  <p className="text-xl font-bold">09:12</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={generateReport}>
                <Download className="mr-2 h-3 w-3" />
                Download Full Report
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Ledger</CardTitle>
                <CardDescription>
                  {user?.role === 'Admin' ? 'Comprehensive view of all staff activity across all sync sources.' : 'Your recent terminal sessions.'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {filteredRecords.length} Entries
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>In/Out</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                          {getStaffName(record.userId).charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">{getStaffName(record.userId)}</span>
                          <span className="text-[10px] text-muted-foreground">{record.location}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{record.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="font-mono text-[10px]">{record.checkIn}</Badge>
                        <span className="text-muted-foreground">/</span>
                        {record.checkOut ? (
                          <Badge variant="secondary" className="font-mono text-[10px]">{record.checkOut}</Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground animate-pulse">--:--</span>
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
                        <span className="text-[10px] font-medium">{record.source || 'Manual'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.status === 'Present' ? 'default' : 'destructive'}
                        className={record.status === 'Present' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRecords.length === 0 && (
              <div className="p-12 text-center text-muted-foreground italic">
                No session data discovered for this period.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
