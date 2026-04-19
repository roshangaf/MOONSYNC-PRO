"use client"

import * as React from "react"
import {
  Briefcase,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
  CheckCircle2,
  PlusCircle
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ["Admin", "Marketing", "Technician", "Finance"],
    },
    {
      title: "Tasks Portal",
      url: "/dashboard/tasks",
      icon: Briefcase,
      roles: ["Admin", "Marketing", "Technician", "Finance"],
    },
    {
      title: "Staff Management",
      url: "/dashboard/users",
      icon: Users,
      roles: ["Admin"],
    },
    {
      title: "Performance",
      url: "/dashboard/performance",
      icon: ShieldCheck,
      roles: ["Admin", "Finance"],
    },
    {
      title: "Accounting",
      url: "/dashboard/finance",
      icon: Wallet,
      roles: ["Finance", "Admin"],
    },
  ];

  if (!user) return null;

  const filteredNav = navMain.filter(item => item.roles.includes(user.role));

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border py-4">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-primary">MoonSync Pro</span>
            <span className="text-xs text-muted-foreground">{user.department}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={item.title}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        
        {user.role === 'Marketing' && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Actions</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New Task">
                  <Link href="/dashboard/tasks/new">
                    <PlusCircle className="text-accent" />
                    <span>New Task</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex items-center gap-2 px-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                  {user.name.charAt(0)}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.role}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Log out" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
