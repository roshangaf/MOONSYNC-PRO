
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { MOCK_USERS } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Clock, Play, Square, UserPlus, CheckCircle, ArrowLeft, UserCheck, Phone, MapPin, User, Calendar, Settings2, Info, ListChecks, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskStatus, Task } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function TaskDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [task, setTask] = useState<Task | null>(null)
  const [isLoggingTime, setIsLoggingTime] = useState(false)
  const [timer, setTimer] = useState(0)
  const [assigneeId, setAssigneeId] = useState("")

  useEffect(() => {
    const savedTasksStr = localStorage.getItem('moonsync_tasks');
    if (savedTasksStr) {
      const savedTasks: Task[] = JSON.parse(savedTasksStr);
      const foundTask = savedTasks.find(t => t.id === id);
      if (foundTask) {
        setTask(foundTask);
        setAssigneeId(foundTask.assignedTo || "");
      }
    }
  }, [id]);

  const getStaffName = (id?: string) => {
    return MOCK_USERS.find(u => u.id === id)?.name || "Unknown Personnel";
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

  if (!task) return <div className="p-20 text-center font-bold">Task Terminal Error: Document Not Found</div>;

  const handleAssign = () => {
    if (!assigneeId) return;
    const updatedTask = { ...task, assignedTo: assigneeId, status: 'Assigned' as TaskStatus };
    setTask(updatedTask);
    updateTaskInStorage(updatedTask);
    toast({
      title: "Task Assigned",
      description: `Task assigned to ${MOCK_USERS.find(u => u.id === assigneeId)?.name}`,
    });
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    const updatedTask = { ...task, status: newStatus };
    setTask(updatedTask);
    updateTaskInStorage(updatedTask);
    toast({
      title: "Status Updated",
      description: `Task status changed to ${newStatus}`,
    });
  };

  const handleDeleteTask = () => {
    const savedTasksStr = localStorage.getItem('moonsync_tasks');
    if (savedTasksStr) {
      const savedTasks: Task[] = JSON.parse(savedTasksStr);
      const updatedTasks = savedTasks.filter(t => t.id !== task.id);
      localStorage.setItem('moonsync_tasks', JSON.stringify(updatedTasks));
      toast({
        title: "Task Deleted",
        description: `Task ${task.id} permanently removed.`,
        variant: "destructive",
      });
      router.push("/dashboard/tasks");
    }
  };

  const updateTaskInStorage = (updatedTask: Task) => {
    const savedTasksStr = localStorage.getItem('moonsync_tasks');
    if (savedTasksStr) {
      const savedTasks: Task[] = JSON.parse(savedTasksStr);
      const updatedTasks = savedTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      localStorage.setItem('moonsync_tasks', JSON.stringify(updatedTasks));
    }
  };

  const toggleTimeLogging = () => {
    if (isLoggingTime) {
      const completionTime = new Date().toISOString();
      toast({
        title: "Work Session Stopped",
        description: `Logged ${Math.floor(timer / 60)} minutes of work. Job marked completed at ${new Date(completionTime).toLocaleTimeString()}.`,
      });
      setIsLoggingTime(false);
      const updatedTask = { ...task, status: 'Completed' as TaskStatus, completedAt: completionTime };
      setTask(updatedTask);
      updateTaskInStorage(updatedTask);
    } else {
      setIsLoggingTime(true);
      const updatedTask = { ...task, status: 'In Progress' as TaskStatus };
      setTask(updatedTask);
      updateTaskInStorage(updatedTask);
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
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xs">Operational Blueprints</h4>
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
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary font-bold" 
                  disabled={isLoggingTime || task.status === 'Completed'}
                  onClick={() => handleStatusChange('Completed')}
                >
                  <><CheckCircle className="mr-2 h-4 w-4" /> Finalize Job</>
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card className="border-none shadow-md bg-white">
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
              {task.completedAt && (
                <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-emerald-50/50">
                  <span className="text-emerald-700 font-bold text-[10px] uppercase">Finalized At</span>
                  <span className="font-mono text-[10px] font-bold text-emerald-700">{new Date(task.completedAt).toLocaleTimeString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-muted-foreground font-bold text-[10px] uppercase">Org Dept</span>
                <span className="font-bold text-xs uppercase">{user?.department || 'IT SERVICES'}</span>
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
