import * as React from "react"
import { Link } from "react-router-dom"
import {
  IconDashboard,
  IconFileDescription,
  IconSettings,
  IconShield,
  IconUsers,
} from "@tabler/icons-react"
import type { User } from "@/types"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from '@/hooks/useAuth';

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Logs",
    url: "/logs",
    icon: IconFileDescription,
  },
  {
    title: "Proxy Rules",
    url: "/proxy-rules",
    icon: IconShield,
  },
  {
    title: "Users",
    url: "/users",
    icon: IconUsers,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: IconSettings,
  },
];



interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User | null;
  onLogout?: () => void;
}

export function AppSidebar({ user, onLogout, ...props }: AppSidebarProps) {
  const { isAdmin } = useAuth();
  // Filter nav items based on role
  const filteredNav = isAdmin
    ? navMain
    : navMain.filter(item => item.title === 'Dashboard');

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <div className="flex items-center gap-2">
                  <img src="/src/assets/ability.png" alt="Ability" className="w-5 h-5" />
                  <span className="text-base font-semibold">Ability Proxy Logger</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser user={{ 
            name: `${user.username}`, 
            email: user.email, 
            avatar: "" 
          }} onLogout={onLogout} />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
