
"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MOCK_TASKS, MOCK_USERS } from "@/lib/store"
import { useAuth } from "@/components/auth-context"
import { Briefcase, Filter, Plus, Search, Download, Calendar, User, Phone, MapPin, Info, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Task } from "@/lib/types"

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedTasks = localStorage.getItem('moonsync_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(MOCK_TASKS);
      localStorage.setItem('moonsync_tasks', JSON.stringify(MOCK_TASKS));
    }
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'secondary';
      case 'In Progress': return 'default';
      case 'On Hold': return 'destructive';
      case 'Assigned': return 'outline';
      default: return 'outline';
    }
  }

  const handleDownloadReport = () => {
    toast({
      title: "Generating Task Audit Report",
      description: "Compiling comprehensive ledger including listing timestamps, personnel metadata, and high-precision completion records.",
    });
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('moonsync_tasks', JSON.stringify(updatedTasks));
    toast({
      title: "Task Deleted",
      description: `Task ${id} has been permanently removed from the terminal.`,
      variant: "destructive",
    });
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (t.contactName && t.contactName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = filterPriority.length === 0 || filterPriority.includes(t.priority);
    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(t.status);

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const uniqueCustomers = Array.from(new Set(tasks.map(t => t.contactName).filter(Boolean)))
    .map(name => {
      const task = tasks.find(t => t.contactName === name);
      return {
        name,
        phone: task?.contactNumber || "Not Provided",
        address: task?.address || "No Address Found",
        tasks: tasks.filter(t => t.contactName === name)
      }
    });

  const togglePriorityFilter = (priority: string) => {
    setFilterPriority(prev => 
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setFilterStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return "";
    return new Date(dateString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Job & Task Portal</h1>
          <p className="text-muted-foreground">Track and manage service requests across all departments with precise timestamps.</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'Admin' && (
            <Button variant="outline" onClick={handleDownloadReport} className="border-primary text-primary hover:bg-primary/5 font-bold uppercase text-[10px] tracking-widest">
              <Download className="mr-2 h-4 w-4" />
              Download Audit Report
            </Button>
          )}
          <Button asChild className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 font-bold uppercase text-[10px] tracking-widest h-10">
            <Link href="/dashboard/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ledger" className="w-full space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="ledger" className="font-bold uppercase text-[10px] tracking-widest">
              <Briefcase className="h-3 w-3 mr-2" />
              Task Ledger
            </TabsTrigger>
            <TabsTrigger value="details" className="font-bold uppercase text-[10px] tracking-widest">
              <Info className="h-3 w-3 mr-2" />
              Customer Details
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search portal..."
                className="pl-8 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className={filterPriority.length > 0 || filterStatus.length > 0 ? "border-accent text-accent" : ""}>
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Priority</p>
                  {["Critical", "High", "Medium", "Low"].map((p) => (
                    <DropdownMenuCheckboxItem
                      key={p}
                      checked={filterPriority.includes(p)}
                      onCheckedChange={() => togglePriorityFilter(p)}
                    >
                      {p}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Status</p>
                  {["Pending", "Assigned", "In Progress", "Completed", "On Hold"].map((s) => (
                    <DropdownMenuCheckboxItem
                      key={s}
                      checked={filterStatus.includes(s)}
                      onCheckedChange={() => toggleStatusFilter(s)}
                    >
                      {s}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="ledger">
          <Card className="shadow-xl border-none overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold text-xs uppercase">Task Title / Job</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Listed At</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Status</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Priority</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Listed By</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900">{task.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">Client: {task.contactName || 'Unspecified'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <Calendar className="h-3 w-3" />
                          {formatDate(task.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(task.status)} className="rounded-md font-bold uppercase text-[10px]">
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild className="text-primary font-bold hover:bg-primary/5">
                            <Link href={`/dashboard/tasks/${task.id}`}>Manage</Link>
                          </Button>
                          {user?.role === 'Admin' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
        </TabsContent>

        <TabsContent value="details">
          <Card className="shadow-xl border-none overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg font-black uppercase tracking-widest">Customer Directory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold text-xs uppercase">Client Identity</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Contact Portal</TableHead>
                    <TableHead className="font-bold text-xs uppercase">Primary Service Address</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase">Active Task Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueCustomers.map((customer, idx) => (
                    <TableRow key={idx} className="hover:bg-primary/5">
                      <TableCell className="font-black text-sm text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <User className="h-4 w-4" />
                          </div>
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Phone className="h-3 w-3 text-primary" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <MapPin className="h-3 w-3 text-primary" />
                          {customer.address}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-black">
                          {customer.tasks.length} Job(s)
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {uniqueCustomers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="p-16 text-center text-muted-foreground italic">
                        No customer details indexed in current task set.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
