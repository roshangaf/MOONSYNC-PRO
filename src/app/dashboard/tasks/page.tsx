
"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MOCK_USERS } from "@/lib/store"
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
      setTasks([]);
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary uppercase">Job & Task Portal</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Track and manage service requests across all departments.</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'Admin' && (
            <Button variant="outline" onClick={handleDownloadReport} className="hidden sm:flex border-primary text-primary hover:bg-primary/5 font-bold uppercase text-[10px] tracking-widest">
              <Download className="mr-2 h-4 w-4" />
              Audit Report
            </Button>
          )}
          <Button asChild className="flex-1 sm:flex-none bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 font-bold uppercase text-[10px] tracking-widest h-10">
            <Link href="/dashboard/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ledger" className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <TabsList className="bg-muted/50 p-1 w-full sm:w-auto overflow-x-auto justify-start">
            <TabsTrigger value="ledger" className="flex-1 sm:flex-none font-bold uppercase text-[10px] tracking-widest">
              <Briefcase className="h-3 w-3 mr-2" />
              Ledger
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1 sm:flex-none font-bold uppercase text-[10px] tracking-widest">
              <Info className="h-3 w-3 mr-2" />
              Directory
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 bg-white h-10 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className={filterPriority.length > 0 || filterStatus.length > 0 ? "border-accent text-accent h-10 w-10" : "h-10 w-10"}>
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-[10px] uppercase font-black">Filter Tasks</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Priority</p>
                  {["Critical", "High", "Medium", "Low"].map((p) => (
                    <DropdownMenuCheckboxItem
                      key={p}
                      checked={filterPriority.includes(p)}
                      onCheckedChange={() => togglePriorityFilter(p)}
                      className="text-xs uppercase font-bold"
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
                      className="text-xs uppercase font-bold"
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold text-[10px] uppercase min-w-[150px]">Task / Job</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase hidden md:table-cell">Listed At</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase hidden sm:table-cell">Priority</TableHead>
                      <TableHead className="text-right font-bold text-[10px] uppercase">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-primary/5 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-slate-900 line-clamp-1">{task.title}</span>
                            <span className="text-[10px] text-muted-foreground truncate">Client: {task.contactName || 'Unspecified'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(task.status)} className="rounded-md font-bold uppercase text-[9px] px-2 py-0">
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={getPriorityColor(task.priority)} className="rounded-md font-bold uppercase text-[9px] px-2 py-0">
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] text-primary font-bold hover:bg-primary/5 uppercase tracking-tighter">
                              <Link href={`/dashboard/tasks/${task.id}`}>Manage</Link>
                            </Button>
                            {user?.role === 'Admin' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredTasks.length === 0 && (
                <div className="p-10 text-center text-muted-foreground italic flex flex-col items-center gap-2">
                  <Briefcase className="h-6 w-6 opacity-20" />
                  <p className="text-[10px] uppercase font-black tracking-widest">No entries found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="shadow-xl border-none overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Personnel & Customer Directory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold text-[10px] uppercase min-w-[120px]">Client Identity</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase hidden sm:table-cell">Contact</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase hidden md:table-cell">Address</TableHead>
                      <TableHead className="text-right font-bold text-[10px] uppercase">Jobs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uniqueCustomers.map((customer, idx) => (
                      <TableRow key={idx} className="hover:bg-primary/5">
                        <TableCell className="font-black text-xs text-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                              <User className="h-3 w-3" />
                            </div>
                            <span className="truncate">{customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                            <Phone className="h-3 w-3 text-primary shrink-0" />
                            {customer.phone}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                            <MapPin className="h-3 w-3 text-primary shrink-0" />
                            <span className="truncate max-w-[150px]">{customer.address}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-black text-[9px] px-2">
                            {customer.tasks.length}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {uniqueCustomers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="p-10 text-center text-muted-foreground italic">
                          <p className="text-[10px] uppercase font-black tracking-widest">No directory entries.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
