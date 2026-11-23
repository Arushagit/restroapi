import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Topbar({ title, onMenuToggle }) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-lg font-semibold text-charcoal">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-charcoal hidden sm:block">{user?.username}</span>
        </div>
      </div>
    </header>
  );
}
