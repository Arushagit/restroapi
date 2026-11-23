import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, UtensilsCrossed, ShieldCheck, Flame, Table2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function CustomerNavbar() {
  const { user, isAuthenticated, logout, isAdmin, isStaff, isKitchen } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <UtensilsCrossed size={22} />
          </div>
          <span className="text-2xl font-black tracking-tight text-charcoal">
            RESTRO<span className="text-primary">FLOW</span>
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/menu" className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors flex items-center gap-1.5">
            <Flame size={16} className="text-primary" />
            Explore Menu
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
              My Orders
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick link to admin / staff / kitchen if privileged role */}
          {isAuthenticated && isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-charcoal text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                title="Executive Admin Dashboard"
              >
                <ShieldCheck size={14} className="text-primary" />
                Admin Panel
              </Link>
              <Link
                to="/staff"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-blue-700 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-800 transition-colors"
                title="Switch to Floor Staff Station"
              >
                <Table2 size={13} className="text-white" />
                Staff
              </Link>
              <Link
                to="/kitchen"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-orange-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-orange-700 transition-colors"
                title="Switch to Kitchen Screen"
              >
                Kitchen
              </Link>
            </div>
          )}
          {isAuthenticated && isStaff && (
            <Link
              to="/staff"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <ShieldCheck size={14} className="text-white" />
              Staff Station
            </Link>
          )}
          {isAuthenticated && isKitchen && (
            <Link
              to="/kitchen"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Kitchen Screen
            </Link>
          )}

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-primary transition-colors"
            title="View Cart"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-charcoal leading-none">{user.username}</p>
                <span className="text-[10px] text-gray-400 capitalize">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-700 hover:text-primary px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors shadow-sm shadow-orange-500/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

