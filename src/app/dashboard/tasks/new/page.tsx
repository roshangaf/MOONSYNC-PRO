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
    toast({
      title: "Task Created Successfully",
      description: `Job listed by ${user?.name}. Admin will now assign this task.`,
    })
    router.push("/dashboard/tasks")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Create New Service Task</h1>
        <p className="text-muted-foreground">Detail the requirement. Originator: <span className="font-bold text-primary">{user?.name}</span></p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle>Job Identification</CardTitle>
              <CardDescription>Enter the core details for the service request.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title / Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Server Maintenance for Client XYZ" {...field} />
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
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-3 w-3" /> Contact Name (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-3 w-3" /> Phone Number (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
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
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Service Address (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="123 Business Way, Tech Park" {...field} />
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
                    <FormLabel>Job Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a high-level overview of what needs to be done..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <div className="flex justify-end mt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="text-accent border-accent hover:bg-accent hover:text-white"
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
                    <FormLabel>Priority Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {refinedData && (
            <Card className="border-t-4 border-t-accent bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-accent" />
                  AI Suggested Plan
                </CardTitle>
                <CardDescription>The technician will see these details upon assignment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Refined Description</h4>
                  <p className="text-sm text-muted-foreground bg-white p-3 rounded-md border border-accent/20 italic">
                    {refinedData.refinedDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Suggested Sub-tasks</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {refinedData.subTasks?.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Implementation Steps</h4>
                    <ul className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                      {refinedData.steps?.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground min-w-[150px]">Create Task</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
