"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-context"
import { Briefcase, CheckCircle2, Clock, ListTodo, Users, TrendingUp, Inbox } from "lucide-react"
import { MOCK_USERS } from "@/lib/store"
import { Task } from "@/lib/types"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"

export default function DashboardPage() {
  const { user } = useAuth();
  const db = useFirestore();

  const tasksQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(10));
  }, [db]);
  
  const { data: tasks = [], loading } = useCollection<Task>(tasksQuery);

  const activeTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const completedMtd = tasks.filter(t => t.status === 'Completed').length;

  const stats = [
    { title: "Active Tasks", value: activeTasksCount, icon: ListTodo, color: "text-blue-500" },
    { title: "Completed (MTD)", value: completedMtd, icon: CheckCircle2, color: "text-green-500" },
    { title: "Resolution Potential", value: "98.2%", icon: Clock, color: "text-orange-500" },
    { title: "Staff Nodes", value: MOCK_USERS.length, icon: Users, color: "text-purple-500" },
  ];

  const recentTasks = tasks.slice(0, 5);

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase tracking-widest text-primary">Synchronizing Cloud Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary uppercase">Welcome, {user?.name}</h1>
        <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest">
          Cloud Terminal Active • Sector: <span className="font-bold text-primary">{user?.department}</span>
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-xl bg-white overflow-hidden">
            <div className={`h-1 w-full ${stat.color.replace('text-', 'bg-')}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
              <p className="text-[7px] font-bold text-muted-foreground uppercase mt-1">Live Cloud Sync</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-xl bg-white hidden sm:block">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest">Global Activity Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-2xl bg-slate-50 border-slate-200">
            <div className="text-center space-y-4">
              <TrendingUp className="h-8 w-8 text-primary mx-auto opacity-20" />
              <p className="text-[10px] font-black uppercase text-slate-400">Monitoring real-time throughput metrics.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 border-none shadow-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase tracking-widest">Cloud Job Feed</CardTitle>
            <Briefcase className="h-4 w-4 text-primary opacity-20" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map(task => (
                <div key={task.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all">
                  <div className={`w-1 h-10 rounded-full ${task.priority === 'Critical' ? 'bg-destructive' : 'bg-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-900 truncate uppercase">{task.title}</p>
                    <Badge variant="outline" className="text-[8px] uppercase px-1 py-0 mt-1">{task.status}</Badge>
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <Inbox className="h-8 w-8 text-slate-200 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No active cloud jobs.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
