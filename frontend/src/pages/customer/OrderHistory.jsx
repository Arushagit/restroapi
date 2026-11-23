import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, RefreshCw, XCircle, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { getMyOrders, cancelOrder } from '../../api/orders';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleCancel = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;
    try {
      await cancelOrder(orderId, 'Cancelled by customer');
      toast.success(`Order #${orderId} has been cancelled.`);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel order.');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      preparing: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      ready: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${s.bg} ${s.text} ${s.border}`}>
        {status}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle size={40} className="mx-auto text-primary" />
        <h2 className="text-xl font-bold text-charcoal">Please Sign In</h2>
        <p className="text-xs text-gray-500">Log in to view your order history and track active kitchen progress.</p>
        <Link
          to="/login?redirect=/orders"
          className="inline-block px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">My Orders & Receipts</h1>
          <p className="text-xs text-gray-500 mt-1">Review live preparation updates and historic meal invoices.</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchOrders(); }}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary bg-white border border-gray-200 px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
          <ShoppingBag size={40} className="mx-auto text-gray-300" />
          <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>
          <Link
            to="/menu"
            className="inline-block text-xs font-bold text-primary hover:underline"
          >
            Start your first order →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4 hover:border-orange-200 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-black text-base text-charcoal">Order #{ord.id}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                    {ord.order_type.replace('_', ' ')}
                  </span>
                  {ord.table_number && (
                    <span className="text-xs font-semibold text-primary">
                      Table {ord.table_number}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(ord.status)}
                  <span className="text-xs text-gray-400">
                    {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 text-xs text-gray-600">
                {ord.items?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.food_item_name} <span className="font-semibold text-charcoal">× {item.quantity}</span>
                    </span>
                    <span className="font-medium text-charcoal">₹{parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-50 text-xs">
                <div className="text-gray-500">
                  Total Bill: <span className="font-black text-sm text-charcoal ml-1">₹{parseFloat(ord.total_amount).toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {ord.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(ord.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      <XCircle size={14} /> Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

