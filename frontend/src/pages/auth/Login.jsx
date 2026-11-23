import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UtensilsCrossed, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ username, password });
      toast.success(`Welcome back, ${user.username}!`);

      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff');
      } else if (user.role === 'kitchen') {
        navigate('/kitchen');
      } else {
        navigate('/menu');
      }
    } catch (err) {
      console.error(err);
      toast.error('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (uname, pwd) => {
    setUsername(uname);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <UtensilsCrossed size={26} />
          </div>
        </Link>
        <h2 className="text-3xl font-black text-charcoal tracking-tight">
          RESTRO<span className="text-primary">FLOW</span>
        </h2>
        <p className="text-xs text-gray-500">Sign in to your restaurant portal or customer account</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 sm:rounded-3xl border border-gray-100 space-y-6">
          {/* Quick Demo Role Buttons for Interviewer */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <ShieldCheck size={13} className="text-primary" /> One-Click Demo Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 border border-orange-200 bg-orange-50/50 hover:bg-orange-100 text-orange-900 rounded-xl font-bold transition-colors text-left"
              >
                👔 Admin
                <span className="block text-[10px] text-gray-500 font-normal">admin / admin123</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('kitchen', 'kitchen123')}
                className="p-2 border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold transition-colors text-left"
              >
                👨‍🍳 Kitchen Staff
                <span className="block text-[10px] text-gray-500 font-normal">kitchen / kitchen123</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff', 'staff123')}
                className="p-2 border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-900 rounded-xl font-bold transition-colors text-left"
              >
                🧑‍💼 Floor Staff
                <span className="block text-[10px] text-gray-500 font-normal">staff / staff123</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer', 'customer123')}
                className="p-2 border border-green-200 bg-green-50/50 hover:bg-green-100 text-green-900 rounded-xl font-bold transition-colors text-left"
              >
                🍽️ Customer
                <span className="block text-[10px] text-gray-500 font-normal">customer / customer123</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700">Username</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700">Password</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-gray-500">Don't have an account yet? </span>
            <Link to="/register" className="text-xs font-bold text-primary hover:underline">
              Create customer account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

