import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/authStore';
import { Bell, Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useState } from 'react';

export default function Layout() {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data.data),
    refetchInterval: 30000,
  });
  const unread = (notifData || []).filter((n: any) => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200
          flex items-center justify-between px-4 md:px-6 shadow-sm gap-3">

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm md:text-base font-semibold text-gray-800 truncate">
              Graduate Accelerator Programme
            </h2>
            <p className="text-[11px] text-gray-400 hidden sm:block">Reliance New Energy · Internship Tracker</p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={18} className="text-gray-600" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white
                  text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-reliance-blue to-blue-600
                flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm hidden sm:block">
                <p className="font-medium text-gray-800 leading-tight">{user?.name}</p>
                <p className="text-[11px] text-gray-400">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
