import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ChefHat, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function KitchenLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Kitchen Top Bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
            <ChefHat size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              RESTROFLOW <span className="text-orange-500 font-semibold text-sm uppercase px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">Kitchen Display</span>
            </h1>
            <p className="text-xs text-gray-400">Live order processing and status management</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right font-mono text-sm tracking-wider text-orange-400 bg-black/40 px-3 py-1.5 rounded-lg border border-gray-800">
            {time}
          </div>

          <div className="flex items-center gap-3 border-l border-gray-800 pl-6">
            <span className="text-xs text-gray-400">Chef {user?.username}</span>
            <Link
              to="/menu"
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={14} /> Menu
            </Link>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

