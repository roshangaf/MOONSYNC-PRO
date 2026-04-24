
"use client"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { useAuth } from "@/components/auth-context"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useFirestore, useMemoFirebase, useCollection } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const db = useFirestore();

  const tasksQuery = useMemoFirebase(() => db ? query(collection(db, 'tasks'), orderBy('createdAt', 'desc')) : null, [db]);
  const usersQuery = useMemoFirebase(() => db ? collection(db, 'users') : null, [db]);
  const attendanceQuery = useMemoFirebase(() => db ? query(collection(db, 'attendance'), orderBy('date', 'desc')) : null, [db]);
  const billsQuery = useMemoFirebase(() => db ? query(collection(db, 'bills'), orderBy('createdAt', 'desc')) : null, [db]);
  
  useCollection(tasksQuery);
  useCollection(usersQuery);
  useCollection(attendanceQuery);
  useCollection(billsQuery);

  useEffect(() => {
    if (!isLoading && !user) {
      redirect('/login');
    }
  }, [user, isLoading]);

  if (isLoading) return null;
  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border/50 bg-white/50 backdrop-blur-sm sticky top-0 z-10 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink href="/dashboard" className="font-bold text-xs uppercase tracking-widest">MoonSync Pro</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-black text-xs uppercase tracking-widest text-primary">Terminal</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-8 w-full max-w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
