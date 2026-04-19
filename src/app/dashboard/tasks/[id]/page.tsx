
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { MOCK_TASKS, MOCK_USERS } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Clock, Play, Square, UserPlus, CheckCircle, ArrowLeft, UserCheck, Phone, MapPin, User, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TaskDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [task, setTask] = useState(MOCK_TASKS.find(t => t.id === id))
  const [isLoggingTime, setIsLoggingTime] = useState(false)
  const [timer, setTimer] = useState(0)
  const [assigneeId, setAssigneeId] = useState(task?.assignedTo || "")

  const getStaffName = (id?: string) => {
    return MOCK_USERS.find(u => u.id === id)?.name || "Unknown Personnel";
  };

  useEffect(() => {
    let interval: any;
    if (isLoggingTime) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLoggingTime]);

  if (!task) return <div>Task not found</div>;

  const handleAssign = () => {
    if (!assigneeId) return;
    setTask({ ...task, assignedTo: assigneeId, status: 'Assigned' });
    toast({
      title: "Task Assigned",
      description: `Task assigned to ${MOCK_USERS.find(u => u.id === assigneeId)?.name}`,
    });
  };

  const toggleTimeLogging = () => {
    if (isLoggingTime) {
      toast({
        title: "Work Session Stopped",
        description: `Logged ${Math.floor(timer / 60)} minutes of work.`,
      });
      setIsLoggingTime(false);
      setTask({ ...task, status: 'Completed' });
    } else {
      setIsLoggingTime(true);
      setTask({ ...task, status: 'In Progress' });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="-ml-2 hover:bg-primary/5 text-primary font-bold">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Task Ledger
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card className="shadow-lg border-none">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center justify-between mb-4">
                <Badge variant={task.status === 'Completed' ? 'secondary' : 'default'} className="font-bold uppercase tracking-widest">{task.status}</Badge>
                <Badge variant="outline" className="font-bold border-primary text-primary">{task.priority} Priority</Badge>
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-slate-900">{task.title}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span>Listed by <span className="text-primary font-bold">{getStaffName(task.createdBy)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>On <span className="text-slate-900 font-bold">{new Date(task.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span></span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {(task.contactName || task.contactNumber || task.address) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  {task.contactName && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Contact Person</p>
                        <p className="text-sm font-bold">{task.contactName}</p>
                      </div>
                    </div>
                  )}
                  {task.contactNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Phone Number</p>
                        <p className="text-sm font-bold">{task.contactNumber}</p>
                      </div>
                    </div>
                  )}
                  {task.address && (
                    <div className="flex items-center gap-3 md:col-span-2 border-t pt-2 mt-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Service Address</p>
                        <p className="text-sm font-bold">{task.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-tighter">Job Overview</h4>
                <p className="text-slate-600 leading-relaxed">{task.description || "No overview provided."}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-tighter">Operational Requirements</h4>
                <div className="p-5 bg-primary/5 rounded-2xl text-sm space-y-3 border border-primary/10">
                  <p className="flex gap-2">
                    <span className="font-black text-primary">01.</span> Analyze current infrastructure constraints and dependency map.
                  </p>
                  <p className="flex gap-2">
                    <span className="font-black text-primary">02.</span> Prepare secure staging environment for validation protocols.
                  </p>
                  <p className="flex gap-2">
                    <span className="font-black text-primary">03.</span> Execute primary task flow following IT security handbooks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-80 space-y-6">
          {user?.role === 'Admin' && (
            <Card className="border-accent bg-accent/5">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
                  <UserPlus className="h-4 w-4 text-accent" />
                  Terminal Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assign Technician</label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_USERS.filter(u => u.role === 'Technician').map(tech => (
                        <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90 font-bold" onClick={handleAssign}>Initialize Assignment</Button>
              </CardContent>
            </Card>
          )}

          {user?.role === 'Technician' && task.assignedTo === user.id && (
            <Card className="border-primary bg-primary/5 shadow-xl shadow-primary/10">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter text-primary">
                  <Clock className="h-4 w-4" />
                  Execution Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-mono text-center py-6 bg-white rounded-2xl border-2 border-primary/10 text-primary font-black">
                  {formatTime(timer)}
                </div>
                <Button 
                  className={`w-full h-12 text-md font-bold shadow-lg ${isLoggingTime ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/20' : 'bg-primary shadow-primary/20'}`}
                  onClick={toggleTimeLogging}
                >
                  {isLoggingTime ? (
                    <><Square className="mr-2 h-4 w-4 fill-current" /> Terminate Session</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4 fill-current" /> Initialize Session</>
                  )}
                </Button>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-primary text-primary font-bold" disabled={isLoggingTime || task.status === 'Completed'}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finalize Job
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Task Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm pt-0">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-muted-foreground font-bold text-[10px] uppercase">Job ID</span>
                <span className="font-mono text-xs font-bold text-primary">{task.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-muted-foreground font-bold text-[10px] uppercase">Listing Timestamp</span>
                <span className="font-mono text-[10px] font-bold">{new Date(task.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-muted-foreground font-bold text-[10px] uppercase">Org Dept</span>
                <span className="font-bold text-xs">IT SERVICES</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-bold text-[10px] uppercase">Sync Status</span>
                <span className="text-[10px] text-emerald-500 font-black animate-pulse uppercase tracking-widest">Live</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
