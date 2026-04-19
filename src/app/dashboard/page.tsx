"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-context"
import { Briefcase, CheckCircle2, Clock, ListTodo, Users, TrendingUp } from "lucide-react"
import { MOCK_TASKS, MOCK_USERS } from "@/lib/store"

export default function DashboardPage() {
  const { user } = useAuth();
  
  const stats = [
    { title: "Active Tasks", value: MOCK_TASKS.length, icon: ListTodo, color: "text-blue-500" },
    { title: "Completed (MTD)", value: "24", icon: CheckCircle2, color: "text-green-500" },
    { title: "Avg Resolution", value: "4.2 hrs", icon: Clock, color: "text-orange-500" },
    { title: "Staff Online", value: MOCK_USERS.length, icon: Users, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Here is what is happening across {user?.department} today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                +2.5% from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Departmental Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
            <div className="text-center space-y-2">
              <TrendingUp className="h-10 w-10 text-muted mx-auto" />
              <p className="text-muted-foreground">Activity chart will be rendered here.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_TASKS.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-2 h-10 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.status}</p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    2h ago
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}