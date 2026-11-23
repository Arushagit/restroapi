import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tag, UtensilsCrossed, ShoppingBag, Table2, Receipt, LogOut, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/categories', icon: Tag, label: 'Food Categories' },
  { to: '/admin/food', icon: UtensilsCrossed, label: 'Food Items' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/tables', icon: Table2, label: 'Tables' },
  { to: '/admin/billing', icon: Receipt, label: 'Billing' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`bg-charcoal text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen sticky top-0`}>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'px-6'} py-5 border-b border-white/10`}>
        {!collapsed && (
          <span className="text-xl font-bold text-primary">RESTROFLOW</span>
        )}
        {collapsed && <span className="text-primary font-bold text-lg">RF</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors ${collapsed ? 'mx-auto mt-0' : ''}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 text-sm font-medium
              ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`
            }
            title={collapsed ? label : ''}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className={`border-t border-white/10 p-4 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 text-gray-300 hover:text-red-400 hover:bg-white/10 rounded-lg p-2 transition-colors text-sm w-full ${collapsed ? 'justify-center' : ''}`}
          title="Logout"
        >
          <LogOut size={16} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
