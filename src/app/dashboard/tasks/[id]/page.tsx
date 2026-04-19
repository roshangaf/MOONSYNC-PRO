"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { MOCK_TASKS, MOCK_USERS } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Clock, Play, Square, UserPlus, CheckCircle, ArrowLeft } from "lucide-react"
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
      <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tasks
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={task.status === 'Completed' ? 'secondary' : 'default'}>{task.status}</Badge>
                <Badge variant="outline">{task.priority} Priority</Badge>
              </div>
              <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
              <CardDescription>Created by Mark Marketer on {new Date(task.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Description</h4>
                <p className="text-muted-foreground">{task.description}</p>
              </div>
              
              {/* Dummy expansion if not present */}
              <div className="space-y-2">
                <h4 className="font-semibold">Detailed Requirements</h4>
                <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-2">
                  <p>1. Analyze current infrastructure constraints.</p>
                  <p>2. Prepare staging environment for validation.</p>
                  <p>3. Execute primary task flow following IT security protocols.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-80 space-y-6">
          {user?.role === 'Admin' && (
            <Card className="border-accent">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-accent" />
                  Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Assign Technician</label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_USERS.filter(u => u.role === 'Technician').map(tech => (
                        <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-accent" onClick={handleAssign}>Confirm Assignment</Button>
              </CardContent>
            </Card>
          )}

          {user?.role === 'Technician' && task.assignedTo === user.id && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Time Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-mono text-center py-4 bg-primary/5 rounded-lg border border-primary/20">
                  {formatTime(timer)}
                </div>
                <Button 
                  className={`w-full ${isLoggingTime ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary'}`}
                  onClick={toggleTimeLogging}
                >
                  {isLoggingTime ? (
                    <><Square className="mr-2 h-4 w-4 fill-current" /> Stop Work</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4 fill-current" /> Start Work</>
                  )}
                </Button>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled={isLoggingTime || task.status === 'Completed'}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Completed
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono">{task.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span>IT Services</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>Just now</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}