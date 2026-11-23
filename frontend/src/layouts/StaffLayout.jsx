import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { Table2, ShoppingBag, Utensils, Receipt, LogOut, ChevronLeft, ChevronRight, UserCheck, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const staffNavItems = [
  { to: '/staff', icon: Table2, label: 'Floor Map & Tables', end: true },
  { to: '/staff/orders', icon: ShoppingBag, label: 'Active Floor Orders' },
  { to: '/staff/billing', icon: Receipt, label: 'Table Billing' },
];

export default function StaffLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Staff Sidebar */}
      <aside className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen sticky top-0 border-r border-gray-800`}>
        {/* Brand */}
        <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'px-6'} py-5 border-b border-gray-800`}>
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                RESTRO<span className="text-primary">FLOW</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                Staff
              </span>
            </div>
          ) : (
            <span className="text-primary font-bold text-lg">RF</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`ml-auto p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ${collapsed ? 'mx-auto mt-0' : ''}`}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-1">
          {staffNavItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all text-xs font-bold
                ${isActive ? 'bg-primary text-white shadow-md shadow-orange-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
              }
              title={collapsed ? label : ''}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Staff User Footer */}
        <div className={`border-t border-gray-800 p-4 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed && (
            <div className="mb-3 bg-gray-800/60 p-3 rounded-xl border border-gray-700/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user?.first_name || user?.username}</p>
                  <p className="text-[10px] text-blue-400 font-semibold uppercase">Floor Service Staff</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-xl p-2 transition-colors text-xs font-bold w-full ${collapsed ? 'justify-center' : ''}`}
            title="Sign out"
          >
            <LogOut size={16} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-charcoal">Floor Staff Station</h1>
            <p className="text-xs text-gray-400">Table seating, in-person ordering, and dining service</p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/menu"
              className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <Utensils size={15} /> Customer Menu
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-gray-600">On Duty</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

