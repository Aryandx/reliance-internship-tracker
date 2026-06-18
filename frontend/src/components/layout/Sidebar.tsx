import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Flag, MessageSquare,
  GitBranch, Users, UserPlus, Activity, BarChart2, CheckSquare,
  LogOut, ChevronLeft, ChevronRight, ShieldCheck, BookOpen, X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../router/routeConfig';
import { useState } from 'react';

const RelianceLogo = () => (
  <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10 flex-shrink-0">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
      flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0">
      R
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-white font-bold text-[15px] tracking-wide">Reliance</span>
      <span className="text-emerald-400 font-bold text-[10px] tracking-[0.2em] uppercase">New Energy</span>
    </div>
  </div>
);

interface NavItem { label: string; to: string; icon: React.ReactNode; }

const Item = ({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) => (
  <NavLink
    to={item.to}
    onClick={onNavigate}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
      ${isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
      ${collapsed ? 'justify-center' : ''}`
    }
    title={collapsed ? item.label : undefined}
  >
    <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
    {!collapsed && <span>{item.label}</span>}
  </NavLink>
);

const Section = ({ label, items, collapsed, onNavigate }: {
  label: string; items: NavItem[]; collapsed: boolean; onNavigate?: () => void
}) => (
  <div className="mb-1">
    {!collapsed && (
      <p className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">{label}</p>
    )}
    {collapsed && <div className="my-2 border-t border-white/10" />}
    <div className="space-y-0.5">
      {items.map((item) => <Item key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />)}
    </div>
  </div>
);

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const role = user?.role;

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN); };
  const handleNavigate = () => { onMobileClose?.(); };

  const internItems: NavItem[] = [
    { label: 'My Dashboard', to: ROUTES.WORKSPACE.STANDARD.DASHBOARDS.INTERN, icon: <LayoutDashboard size={18} /> },
    { label: 'Submit Standup', to: ROUTES.WORKSPACE.STANDARD.SUBMIT_STANDUP, icon: <ClipboardList size={18} /> },
    { label: 'My Progress', to: '/progress/me', icon: <Flag size={18} /> },
    { label: 'My Feedback', to: '/reviews/my', icon: <MessageSquare size={18} /> },
    { label: 'My Attendance', to: '/attendance/me', icon: <Activity size={18} /> },
  ];

  const buddyItems: NavItem[] = [
    { label: 'Buddy Dashboard', to: ROUTES.WORKSPACE.STANDARD.DASHBOARDS.BUDDY, icon: <LayoutDashboard size={18} /> },
    { label: 'Standup Feed', to: ROUTES.WORKSPACE.STANDARD.STANDUP_FEED, icon: <ClipboardList size={18} /> },
    { label: 'Progress Tracker', to: '/progress/tracker', icon: <Flag size={18} /> },
    { label: 'Write Review', to: '/reviews/new', icon: <CheckSquare size={18} /> },
    { label: 'My Reviews', to: '/reviews/submitted', icon: <BookOpen size={18} /> },
  ];

  const hrItems: NavItem[] = [
    { label: 'HR Dashboard', to: ROUTES.WORKSPACE.STANDARD.DASHBOARDS.HR, icon: <LayoutDashboard size={18} /> },
    { label: 'Intern Directory', to: ROUTES.WORKSPACE.STANDARD.INTERNS, icon: <Users size={18} /> },
    { label: 'Create Intern', to: ROUTES.WORKSPACE.STANDARD.CREATE_INTERN, icon: <UserPlus size={18} /> },
    { label: 'Review Queue', to: '/reviews/inbox', icon: <CheckSquare size={18} /> },
    { label: 'Audit Log', to: '/audit', icon: <ShieldCheck size={18} /> },
    { label: 'Assign Manager', to: ROUTES.WORKSPACE.STANDARD.MAP_MANAGER, icon: <GitBranch size={18} /> },
  ];

  const managerItems: NavItem[] = [
    { label: 'Manager Dashboard', to: ROUTES.WORKSPACE.STANDARD.DASHBOARDS.MANAGER, icon: <LayoutDashboard size={18} /> },
    { label: 'All Interns', to: ROUTES.WORKSPACE.STANDARD.INTERNS, icon: <Users size={18} /> },
    { label: 'Create Intern', to: ROUTES.WORKSPACE.STANDARD.CREATE_INTERN, icon: <UserPlus size={18} /> },
    { label: 'Assign Team', to: ROUTES.WORKSPACE.STANDARD.MAP_MANAGER, icon: <GitBranch size={18} /> },
    { label: 'Review Inbox', to: '/reviews/inbox', icon: <CheckSquare size={18} /> },
    { label: 'Analytics', to: '/analytics', icon: <BarChart2 size={18} /> },
  ];

  const techLeadItems: NavItem[] = [
    { label: 'Tech Lead Dashboard', to: ROUTES.WORKSPACE.STANDARD.DASHBOARDS.TECH_LEAD, icon: <LayoutDashboard size={18} /> },
    { label: 'My Interns', to: ROUTES.WORKSPACE.STANDARD.INTERNS, icon: <Users size={18} /> },
    { label: 'Assign Buddy', to: ROUTES.WORKSPACE.STANDARD.MAP_BUDDY, icon: <GitBranch size={18} /> },
    { label: 'Review Inbox', to: '/reviews/inbox', icon: <CheckSquare size={18} /> },
    { label: 'Standup Feed', to: ROUTES.WORKSPACE.STANDARD.STANDUP_FEED, icon: <ClipboardList size={18} /> },
  ];

  const sidebarContent = (
    <aside className={`flex flex-col h-full bg-gradient-to-b from-[#0d1b2a] to-[#1a2744]
      transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>

      {/* Desktop collapse toggle */}
      <div className="hidden md:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-reliance-blue
            border-2 border-[#0d1b2a] text-white flex items-center justify-center
            hover:bg-blue-600 transition-colors shadow-md"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Mobile close button */}
      <button
        onClick={onMobileClose}
        className="md:hidden absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10
          text-white flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <X size={16} />
      </button>

      <RelianceLogo />

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {role === 'INTERN' && <Section label="Intern" items={internItems} collapsed={collapsed} onNavigate={handleNavigate} />}

        {role === 'BUDDY' && (
          <>
            <Section label="Buddy" items={buddyItems} collapsed={collapsed} onNavigate={handleNavigate} />
            <Section label="Intern" items={internItems.slice(0, 2)} collapsed={collapsed} onNavigate={handleNavigate} />
          </>
        )}

        {role === 'TECH_LEAD' && (
          <>
            <Section label="Tech Lead" items={techLeadItems} collapsed={collapsed} onNavigate={handleNavigate} />
            <Section label="Buddy" items={[buddyItems[0], buddyItems[1]]} collapsed={collapsed} onNavigate={handleNavigate} />
          </>
        )}

        {role === 'MANAGER' && (
          <>
            <Section label="Manager" items={managerItems} collapsed={collapsed} onNavigate={handleNavigate} />
            <Section label="Tech Lead" items={[techLeadItems[0], techLeadItems[2]]} collapsed={collapsed} onNavigate={handleNavigate} />
          </>
        )}

        {role === 'HR' && (
          <Section label="HR" items={hrItems} collapsed={collapsed} onNavigate={handleNavigate} />
        )}
      </nav>

      <div className="border-t border-white/10 px-3 py-3 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500
              flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500
              flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} title="Logout"
              className="text-slate-400 hover:text-red-400 transition-colors p-1">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:block relative flex-shrink-0 h-screen">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — slide-in drawer */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300
        ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          onClick={onMobileClose}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300
            ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Drawer */}
        <div className={`relative h-full transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
