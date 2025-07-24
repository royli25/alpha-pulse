
import { NavLink, useLocation } from "react-router-dom"
import { 
  BarChart3, 
  Search, 
  Database, 
  Settings, 
  Home
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Signal Explorer", url: "/signals", icon: Search },
  { title: "Data Sources", url: "/data-sources", icon: Database },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary border-r-2 border-primary font-medium" 
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"

  return (
    <Sidebar className="w-64">
      <SidebarContent className="bg-background border-r border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                AlphaPulse
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Financial Intelligence
              </p>
            </div>
          </div>
        </div>

        <SidebarGroup className="px-4 py-6">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
