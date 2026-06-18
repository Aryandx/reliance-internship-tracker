import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/authStore';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

export default function Layout() {
  const { user } = useAuthStore();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data.data),
    refetchInterval: 30000,
  });
  const unread = (notifData || []).filter((n: any) => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200
          flex items-center justify-between px-6 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Graduate Accelerator Programme</h2>
            <p className="text-xs text-gray-400">Reliance New Energy · Internship Tracker</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={18} className="text-gray-600" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white
                  text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-reliance-blue to-blue-600
                flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-[11px] text-gray-400">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
