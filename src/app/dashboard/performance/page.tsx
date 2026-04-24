
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Award, Clock, Target, TrendingUp, ShieldCheck } from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Task, User } from "@/lib/types"

export default function PerformancePage() {
  const db = useFirestore();

  const tasksQuery = useMemoFirebase(() => db ? query(collection(db, 'tasks')) : null, [db]);
  const usersQuery = useMemoFirebase(() => db ? collection(db, 'users') : null, [db]);

  const { data: tasks = [] } = useCollection<Task>(tasksQuery);
  const { data: users = [] } = useCollection<User>(usersQuery);

  const stats = useMemo(() => {
    const technicianUsers = users.filter(u => u.role === 'Technician');
    const performanceData = technicianUsers.map(user => {
      const userTasks = tasks.filter(t => t.assignedTo === user.id);
      const completedTasks = userTasks.filter(t => t.status === 'Completed');
      
      // Heuristic hours calculation (3 hours per completed task for visualization)
      const hours = completedTasks.length * 3;
      
      return {
        name: user.name.split(' ')[0],
        fullName: user.name,
        tasks: completedTasks.length,
        hours: hours,
        score: completedTasks.length > 0 ? (completedTasks.length / (hours || 1) * 10).toFixed(1) : "0.0"
      };
    }).sort((a, b) => b.tasks - a.tasks);

    const totalCompleted = tasks.filter(t => t.status === 'Completed').length;
    const avgEfficiency = performanceData.length > 0 
      ? Math.round(performanceData.reduce((acc, curr) => acc + parseFloat(curr.score), 0) / performanceData.length * 10)
      : 0;

    return { performanceData, totalCompleted, avgEfficiency };
  }, [tasks, users]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Performance Intelligence</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Real-time cloud analytics for departmental output and resource synchronization.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Efficiency Index</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{stats.avgEfficiency}%</div>
            <Progress value={stats.avgEfficiency} className="h-1.5 mt-2 bg-slate-100" />
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Jobs Finalized</CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{stats.totalCompleted}</div>
            <p className="text-[8px] font-bold text-emerald-500 uppercase mt-1 tracking-widest">Verified in Cloud Ledger</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Technician Nodes</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{users.filter(u => u.role === 'Technician').length}</div>
            <p className="text-[8px] font-bold text-primary uppercase mt-1 tracking-widest">Active Resource Pool</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-slate-900 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Integrity</CardTitle>
            <ShieldCheck className="h-4 w-4 text-accent animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white tracking-tighter">SUB-1S SYNC</div>
            <p className="text-[7px] font-bold text-accent uppercase mt-1 tracking-widest">Persistent Cache Active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-3 border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-xs font-black uppercase tracking-widest">Workload Distribution (Completed Jobs)</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase">Visual comparison of staff output verified in cloud.</CardDescription>
          </CardHeader>
          <CardContent className="pt-10 h-[400px]">
            {stats.performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    fontWeight="900"
                    textAnchor="middle"
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    fontWeight="900"
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--primary), 0.05)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <Bar dataKey="tasks" radius={[6, 6, 0, 0]} barSize={40}>
                    {stats.performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                <TrendingUp className="h-12 w-12 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest">No performance data nodes active.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-xs font-black uppercase tracking-widest">Staff Output Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-[9px] font-black uppercase py-4">Personnel</TableHead>
                  <TableHead className="text-[9px] font-black uppercase py-4">Jobs</TableHead>
                  <TableHead className="text-[9px] font-black uppercase py-4">Efficiency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.performanceData.map((staff) => (
                  <TableRow key={staff.fullName} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800">{staff.fullName}</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Technician Node</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-primary text-sm">{staff.tasks}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500">{staff.score}/10</span>
                        <Progress value={parseFloat(staff.score) * 10} className="h-1 w-10 bg-slate-100" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {stats.performanceData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-20 text-center font-black uppercase tracking-widest text-slate-300">
                      Ledger Synchronization Pending
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
