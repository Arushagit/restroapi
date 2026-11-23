import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Clock, CheckCircle2, Users, TrendingUp, Flame, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getDashboardStats } from '../../api/dashboard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Today's Revenue",
      value: `₹${(stats?.today_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      sub: `Lifetime: ₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Orders',
      value: stats?.total_orders || 0,
      sub: `${stats?.today_orders || 0} placed today`,
      icon: ShoppingBag,
      color: 'text-primary',
      bg: 'bg-orange-50',
    },
    {
      label: 'Active in Kitchen',
      value: (stats?.pending_orders || 0) + (stats?.preparing_orders || 0),
      sub: `${stats?.pending_orders || 0} pending, ${stats?.preparing_orders || 0} prep`,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Registered Guests',
      value: stats?.total_customers || 0,
      sub: `${stats?.completed_orders || 0} orders served`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{card.label}</span>
              <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                <card.icon size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-charcoal">{card.value}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Graph & Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-charcoal text-base">7-Day Revenue Velocity</h3>
              <p className="text-xs text-gray-400">Daily gross revenue and order transactions</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp size={14} /> Live DB Data
            </span>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenue_chart || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => [`₹${parseFloat(val).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Food Items */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-charcoal text-base flex items-center gap-2">
              <Flame size={18} className="text-primary" /> Popular Dishes
            </h3>
            <span className="text-[11px] font-semibold text-gray-400">By Orders</span>
          </div>

          <div className="divide-y divide-gray-50 space-y-3">
            {stats?.popular_items?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No orders yet.</p>
            ) : (
              stats?.popular_items?.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-sm border ${item.type === 'veg' ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'} flex items-center justify-center`}>
                        <span className={`w-1 h-1 rounded-full ${item.type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`} />
                      </span>
                      <h4 className="font-bold text-xs text-charcoal line-clamp-1">{item.name}</h4>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">{item.order_count} portions ordered</span>
                  </div>
                  <span className="font-black text-xs text-charcoal">₹{parseFloat(item.revenue).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-charcoal text-base">Recent Restaurant Transactions</h3>
          <span className="text-xs text-gray-400">Live PostgreSQL Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Type / Table</th>
                <th className="py-3 px-5">Total</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {stats?.recent_orders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">No recent orders recorded.</td>
                </tr>
              ) : (
                stats?.recent_orders?.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-5 font-bold text-charcoal">#{ord.id}</td>
                    <td className="py-3 px-5 text-gray-700">{ord.customer_name}</td>
                    <td className="py-3 px-5 capitalize text-gray-600">
                      {ord.order_type.replace('_', ' ')}
                      {ord.table_number && ` • Table ${ord.table_number}`}
                    </td>
                    <td className="py-3 px-5 font-black text-charcoal">₹{parseFloat(ord.total_amount).toFixed(2)}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'completed' ? 'bg-green-50 text-green-700' :
                        ord.status === 'preparing' ? 'bg-orange-50 text-orange-700' :
                        ord.status === 'ready' ? 'bg-emerald-50 text-emerald-700' :
                        ord.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-gray-400">{ord.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

