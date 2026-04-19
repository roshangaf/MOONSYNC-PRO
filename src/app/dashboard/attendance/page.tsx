"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { MOCK_ATTENDANCE, MOCK_USERS } from "@/lib/store"
import { Clock, LogIn, LogOut, MapPin, Calendar, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [records, setRecords] = useState(MOCK_ATTENDANCE);

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
      const newRecord = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.id || 'unknown',
        date,
        checkIn: time,
        status: 'Present' as const,
        location: 'HQ Terminal'
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

  const getStaffName = (id: string) => {
    return MOCK_USERS.find(u => u.id === id)?.name || "Unknown User";
  };

  const filteredRecords = user?.role === 'Admin' 
    ? records 
    : records.filter(r => r.userId === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Attendance Console</h1>
          <p className="text-muted-foreground">Monitor and record departmental presence across the infrastructure.</p>
        </div>
        <Card className="flex items-center gap-4 px-6 py-3 border-primary/20 bg-primary/5">
          <Clock className="h-5 w-5 text-primary animate-pulse" />
          <div className="text-xl font-mono font-bold text-primary">{currentTime || "Loading..."}</div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-t-4 border-t-primary">
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

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Ledger</CardTitle>
                <CardDescription>
                  {user?.role === 'Admin' ? 'Comprehensive view of all staff activity.' : 'Your recent terminal sessions.'}
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
                  <TableHead>In</TableHead>
                  <TableHead>Out</TableHead>
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
                        {getStaffName(record.userId)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{record.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">{record.checkIn}</Badge>
                    </TableCell>
                    <TableCell>
                      {record.checkOut ? (
                        <Badge variant="secondary" className="font-mono">{record.checkOut}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground animate-pulse">Active...</span>
                      )}
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
