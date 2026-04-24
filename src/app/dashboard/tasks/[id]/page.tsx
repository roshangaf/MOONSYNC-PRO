"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Clock, Play, Square, UserPlus, CheckCircle, ArrowLeft, UserCheck, Phone, MapPin, User, Calendar, Settings2, Info, ListChecks, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskStatus, Task, User as UserType } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, setDoc, deleteDoc, collection } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function TaskDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const db = useFirestore()
  
  const taskRef = useMemoFirebase(() => db ? doc(db, 'tasks', id as string) : null, [db, id])
  const { data: task, loading } = useDoc<Task>(taskRef)

  const usersQuery = useMemoFirebase(() => db ? collection(db, 'users') : null, [db])
  const { data: staffList = [] } = useCollection<UserType>(usersQuery)

  const [isLoggingTime, setIsLoggingTime] = useState(false)
  const [timer, setTimer] = useState(0)
  const [assigneeId, setAssigneeId] = useState("")

  useEffect(() => {
    if (task) {
      setAssigneeId(task.assignedTo || "")
    }
  }, [task])

  const getStaffName = (userId?: string) => {
    return staffList.find(u => u.id === userId)?.name || "Unknown Personnel";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'secondary';
      case 'In Progress': return 'default';
      case 'On Hold': return 'destructive';
      case 'Assigned': return 'outline';
      default: return 'outline';
    }
  }

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

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase tracking-widest text-primary">Handshaking with Cloud Node...</div>;
  if (!task) return <div className="p-20 text-center font-bold">Task Terminal Error: Document Not Found</div>;

  const handleAssign = () => {
    if (!db || !taskRef || !assigneeId) return;
    const data = { assignedTo: assigneeId, status: 'Assigned' as TaskStatus };
    setDoc(taskRef, data, { merge: true })
      .then(() => {
        toast({
          title: "Task Assigned",
          description: `Task assigned to ${getStaffName(assigneeId)}`,
        });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: taskRef.path,
          operation: 'update',
          requestResourceData: data
        }));
      });
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!db || !taskRef) return;
    const data = { status: newStatus };
    setDoc(taskRef, data, { merge: true })
      .then(() => {
        toast({
          title: "Status Updated",
          description: `Task status changed to ${newStatus}`,
        });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: taskRef.path,
          operation: 'update',
          requestResourceData: data
        }));
      });
  };

  const handleDeleteTask = () => {
    if (!db || !taskRef) return;
    deleteDoc(taskRef)
      .then(() => {
        toast({
          title: "Task Deleted",
          description: `Task ${task.id} permanently removed.`,
          variant: "destructive",
        });
        router.push("/dashboard/tasks");
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: taskRef.path,
          operation: 'delete'
        }));
      });
  };

  const toggleTimeLogging = () => {
    if (!db || !taskRef) return;
    if (isLoggingTime) {
      const completionTime = new Date().toISOString();
      toast({
        title: "Work Session Stopped",
        description: `Logged ${Math.floor(timer / 60)} minutes of work. Job marked completed.`,
      });
      setIsLoggingTime(false);
      setDoc(taskRef, { status: 'Completed' as TaskStatus, completedAt: completionTime }, { merge: true });
    } else {
      setIsLoggingTime(true);
      setDoc(taskRef, { status: 'In Progress' as TaskStatus }, { merge: true });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const canManageStatus = user?.role === 'Admin' || (user?.role === 'Technician' && task.assignedTo === user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-2 hover:bg-primary/5 text-primary font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Task Ledger
        </Button>
        {user?.role === 'Admin' && (
          <Button variant="destructive" size="sm" onClick={handleDeleteTask} className="font-bold uppercase text-[10px] tracking-widest">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Task
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card className="shadow-lg border-none overflow-hidden bg-white">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center justify-between mb-4">
                <Badge variant={getStatusColor(task.status)} className="font-bold uppercase tracking-widest">{task.status}</Badge>
                <Badge variant="outline" className="font-bold border-primary text-primary">{task.priority} Priority</Badge>
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-slate-900 uppercase">{task.title}</CardTitle>
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
            <CardContent className="pt-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 mb-6">
                  <TabsTrigger value="overview" className="font-bold uppercase text-[10px] tracking-widest">
                    <ListChecks className="h-3 w-3 mr-2" />
                    Job Overview
                  </TabsTrigger>
                  <TabsTrigger value="details" className="font-bold uppercase text-[10px] tracking-widest">
                    <Info className="h-3 w-3 mr-2" />
                    Customer Details
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xs">Requirement Analysis</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">{task.description || "No overview provided."}</p>
                    {task.detailedDescription && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-500 text-xs">
                        {task.detailedDescription}
                      </div>
                    )}
                  </div>
                  
                  {task.steps && task.steps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xs">Operational Blueprints</h4>
                      <div className="p-5 bg-primary/5 rounded-2xl text-sm space-y-3 border border-primary/10">
                        {task.steps.map((step, idx) => (
                          <p key={idx} className="flex gap-2">
                            <span className="font-black text-primary">{(idx + 1).toString().padStart(2, '0')}.</span> {step}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Customer Identity</p>
                        <p className="text-md font-bold text-slate-900">{task.contactName || "Direct Transaction / Cash"}</p>
                      </div>
                    </div>

                    <a 
                      href={task.contactNumber ? `tel:${task.contactNumber}` : undefined}
                      className={cn(
                        "flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors",
                        task.contactNumber && "hover:bg-primary/5 active:scale-[0.98] cursor-pointer"
                      )}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Verification Contact</p>
                        <p className="text-md font-bold text-slate-900">{task.contactNumber || "Not Provided"}</p>
                      </div>
                    </a>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Deployment / Service Address</p>
                        <p className="text-md font-bold text-slate-900">{task.address || "Over-the-counter Service"}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-80 space-y-6">
          {canManageStatus && (
             <Card className="border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter text-primary">
                    <Settings2 className="h-4 w-4" />
                    Status Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Modify Status</label>
                    <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
             </Card>
          )}

          {user?.role === 'Admin' && task.status !== 'Completed' && (
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
                      {staffList.filter(u => u.role === 'Technician').map(tech => (
                        <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90 font-bold" onClick={handleAssign}>Initialize Assignment</Button>
              </CardContent>
            </Card>
          )}

          {user?.role === 'Technician' && task.assignedTo === user.id && task.status !== 'Completed' && (
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
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
