import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { useAuth } from '@/context/AuthContext';
import { 
  IconDashboard,
  IconFileDescription,
  IconUsers,
  IconSettings,
  IconShield
} from '@tabler/icons-react';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      <AppSidebar className="hidden lg:flex" />
      <div className="flex-1 flex flex-col">
        <SiteHeader 
          user={user}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 