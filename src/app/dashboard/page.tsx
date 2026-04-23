
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-context"
import { Briefcase, CheckCircle2, Clock, ListTodo, Users, TrendingUp, Inbox } from "lucide-react"
import { MOCK_TASKS, MOCK_USERS } from "@/lib/store"
import { Task } from "@/lib/types"

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTasks = localStorage.getItem('moonsync_tasks');
    const wasReset = localStorage.getItem('moonsync_was_reset') === 'true';

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else if (!wasReset) {
      // Only initialize with mocks if not intentionally reset
      const companyVerified = localStorage.getItem('company_verified');
      if (companyVerified === 'true') {
         setTasks(MOCK_TASKS);
         localStorage.setItem('moonsync_tasks', JSON.stringify(MOCK_TASKS));
      }
    } else {
      // If was reset, start with empty task list
      setTasks([]);
    }
  }, []);

  const activeTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const completedMtd = tasks.filter(t => t.status === 'Completed').length;

  const stats = [
    { title: "Active Tasks", value: activeTasksCount, icon: ListTodo, color: "text-blue-500" },
    { title: "Completed (MTD)", value: completedMtd, icon: CheckCircle2, color: "text-green-500" },
    { title: "Avg Resolution", value: tasks.length > 0 ? "3.8 hrs" : "0 hrs", icon: Clock, color: "text-orange-500" },
    { title: "Staff Online", value: MOCK_USERS.length, icon: Users, color: "text-purple-500" },
  ];

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Monitoring organizational throughput in the <span className="font-bold text-primary">{user?.department}</span> sector.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-xl bg-white overflow-hidden">
            <div className={`h-1 w-full ${stat.color.replace('text-', 'bg-')}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
                Live Terminal Sync
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest">Departmental Activity Metrics</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center border-2 border-dashed rounded-2xl bg-slate-50 border-slate-200">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Activity Analytics Ledger</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Visualizing cross-departmental sync latency.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 border-none shadow-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Recent Job Entries</CardTitle>
            <Briefcase className="h-4 w-4 text-primary opacity-20" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map(task => (
                <div key={task.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10">
                  <div className={`w-1.5 h-10 rounded-full shrink-0 ${task.priority === 'High' || task.priority === 'Critical' ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight group-hover:text-primary transition-colors">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 tracking-tighter">{task.status}</span>
                       <span className="text-[9px] text-slate-400 font-medium">Ref: {task.id}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-400 whitespace-nowrap">
                    {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <Inbox className="h-10 w-10 text-slate-200 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Empty</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
