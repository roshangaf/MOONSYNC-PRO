
"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MOCK_TASKS, MOCK_USERS } from "@/lib/store"
import { useAuth } from "@/components/auth-context"
import { Briefcase, Filter, Plus, Search, UserCircle } from "lucide-react"
import Link from "next/link"

export default function TasksPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const getStaffName = (id?: string) => {
    return MOCK_USERS.find(u => u.id === id)?.name || "Unassigned";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'default';
      case 'Medium': return 'secondary';
      default: return 'outline';
    }
  }

  const filteredTasks = MOCK_TASKS.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Job & Task Portal</h1>
          <p className="text-muted-foreground">Track and manage service requests across all departments.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20">
          <Link href="/dashboard/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Card className="shadow-xl border-none overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Task Title / Job</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Priority</TableHead>
                <TableHead className="font-bold">Listed By</TableHead>
                <TableHead className="font-bold">Assigned To</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className="cursor-pointer hover:bg-primary/5 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900">{task.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{task.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.status === 'Completed' ? 'secondary' : 'default'} className="rounded-md font-bold uppercase text-[10px]">
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(task.priority)} className="rounded-md font-bold uppercase text-[10px]">
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {getStaffName(task.createdBy).charAt(0)}
                      </div>
                      <span className="text-xs font-semibold">{getStaffName(task.createdBy)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                        {getStaffName(task.assignedTo).charAt(0)}
                      </div>
                      <span className="text-xs">{getStaffName(task.assignedTo)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="text-primary font-bold hover:bg-primary/5">
                      <Link href={`/dashboard/tasks/${task.id}`}>Manage</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTasks.length === 0 && (
            <div className="p-16 text-center text-muted-foreground italic flex flex-col items-center gap-2">
              <Briefcase className="h-8 w-8 opacity-20" />
              No jobs found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
