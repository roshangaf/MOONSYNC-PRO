"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { refineMarketerTask } from "@/ai/flows/marketer-task-refinement-flow"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sparkles, Wand2, MapPin, User, Phone } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { Task, TaskStatus } from "@/lib/types"

const taskSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  contactName: z.string().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
})

export default function NewTaskPage() {
  const [isRefining, setIsRefining] = useState(false)
  const [refinedData, setRefinedData] = useState<{
    refinedDescription?: string;
    subTasks?: string[];
    steps?: string[];
  } | null>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      contactName: "",
      contactNumber: "",
      address: "",
      priority: "Medium",
    },
  })

  async function handleAIRefine() {
    const description = form.getValues("description")
    if (!description || description.length < 10) {
      toast({
        title: "More info needed",
        description: "Please provide a brief description before using AI refinement.",
        variant: "destructive",
      })
      return
    }

    setIsRefining(true)
    try {
      const result = await refineMarketerTask({ taskDescription: description })
      setRefinedData(result)
      toast({
        title: "Task Refined",
        description: "AI has suggested detailed steps and sub-tasks.",
      })
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to refine task details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefining(false)
    }
  }

  function onSubmit(values: z.infer<typeof taskSchema>) {
    const newTask: Task = {
      id: `TASK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      title: values.title,
      description: values.description || "",
      contactName: values.contactName,
      contactNumber: values.contactNumber,
      address: values.address,
      status: 'Pending' as TaskStatus,
      priority: values.priority,
      createdBy: user?.id || 'unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeLogs: [],
      detailedDescription: refinedData?.refinedDescription,
      subTasks: refinedData?.subTasks,
      steps: refinedData?.steps,
    }

    const savedTasksStr = localStorage.getItem('moonsync_tasks');
    const existingTasks = savedTasksStr ? JSON.parse(savedTasksStr) : [];
    localStorage.setItem('moonsync_tasks', JSON.stringify([newTask, ...existingTasks]));

    toast({
      title: "Task Created Successfully",
      description: `Job listed by ${user?.name}. Admin will now assign this task.`,
    })
    router.push("/dashboard/tasks")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-6 md:px-0">
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary uppercase">Create New Service Task</h1>
        <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest">Originator: <span className="font-bold text-primary">{user?.name}</span></p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-xs font-black uppercase tracking-widest">Job Identification</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold">Enter the core details for the service request.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-500">Task Title / Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Server Maintenance for Client XYZ" className="h-12 bg-slate-50 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                        <User className="h-3 w-3" /> Contact Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="h-12 bg-slate-50 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                        <Phone className="h-3 w-3" /> Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+977 98..." className="h-12 bg-slate-50 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                      <MapPin className="h-3 w-3" /> Deployment Address
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Client Location / Site" className="h-12 bg-slate-50 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-500">Job Requirement Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a high-level overview of what needs to be done..." 
                        className="min-h-[120px] bg-slate-50 rounded-xl"
                        {...field} 
                      />
                    </FormControl>
                    <div className="flex justify-end mt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="text-accent border-accent hover:bg-accent hover:text-white rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest"
                        onClick={handleAIRefine}
                        disabled={isRefining}
                      >
                        {isRefining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        AI Refine Details
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-500">Priority Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-slate-50 rounded-xl font-bold">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low" className="font-bold">LOW</SelectItem>
                        <SelectItem value="Medium" className="font-bold">MEDIUM</SelectItem>
                        <SelectItem value="High" className="font-bold">HIGH</SelectItem>
                        <SelectItem value="Critical" className="font-bold text-destructive">CRITICAL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {refinedData && (
            <Card className="border-t-4 border-t-accent bg-accent/5 overflow-hidden">
              <CardHeader className="bg-white/50 border-b">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                  <Wand2 className="h-4 w-4 text-accent" />
                  AI Execution Blueprint
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold">Technical implementation suggestions for personnel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-slate-500">Refined Scope</h4>
                  <p className="text-xs text-slate-700 bg-white p-4 rounded-2xl border border-accent/20 italic font-medium leading-relaxed">
                    {refinedData.refinedDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-500">Sub-tasks Inventory</h4>
                    <ul className="space-y-2">
                      {refinedData.subTasks?.map((st, i) => (
                        <li key={i} className="flex gap-2 text-[11px] font-bold text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-accent">•</span> {st}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-500">Deployment Sequence</h4>
                    <ol className="space-y-2">
                      {refinedData.steps?.map((step, i) => (
                        <li key={i} className="flex gap-3 text-[11px] font-bold text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                          <span className="h-5 w-5 bg-accent/10 rounded-full flex items-center justify-center text-[10px] text-accent shrink-0">{i+1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pb-10">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="w-full sm:w-auto font-black uppercase text-xs tracking-widest h-12">Cancel</Button>
            <Button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground min-w-[200px] h-12 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-transform active:scale-95">Initialize Job Node</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}