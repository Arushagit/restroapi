import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, Clock, X, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../api/orders';
import { useToast } from '../../components/ui/Toast';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const toast = useToast();

  const loadOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus} by admin`);
      toast.success(`Order #${orderId} moved to ${newStatus}`);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(ord => {
    if (activeTab !== 'all' && ord.status !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = String(ord.id).includes(q);
      const matchCust = ord.customer_name?.toLowerCase().includes(q);
      const matchTable = ord.table_number?.toLowerCase().includes(q);
      return matchId || matchCust || matchTable;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      preparing: 'bg-orange-50 text-orange-700 border-orange-200',
      ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-300',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status] || 'bg-gray-50'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-charcoal">Restaurant Orders</h2>
          <p className="text-xs text-gray-500">Live order queue, fulfillment progress, and service statuses</p>
        </div>

        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-primary text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <RefreshCw size={14} /> Refresh Queue
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 md:pb-0">
          {STATUS_TABS.map(tab => {
            const count = tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-5">Guest</th>
                <th className="py-3 px-5">Channel</th>
                <th className="py-3 px-5">Items</th>
                <th className="py-3 px-5">Total</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Time</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">No orders matching tab selection.</td>
                </tr>
              ) : (
                filteredOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-5 font-bold text-charcoal">#{ord.id}</td>
                    <td className="py-3 px-5 text-gray-700">{ord.customer_name}</td>
                    <td className="py-3 px-5 capitalize text-gray-600">
                      {ord.order_type.replace('_', ' ')}
                      {ord.table_number && ` (T${ord.table_number})`}
                    </td>
                    <td className="py-3 px-5 text-gray-500">
                      {ord.items?.length || 0} item{ord.items?.length > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-5 font-black text-charcoal">₹{parseFloat(ord.total_amount).toFixed(2)}</td>
                    <td className="py-3 px-5">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-5 text-gray-400">
                      {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Quick state advances */}
                        {ord.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(ord.id, 'confirmed')}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-[10px] hover:bg-blue-100"
                          >
                            Confirm
                          </button>
                        )}
                        {ord.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(ord.id, 'preparing')}
                            className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg font-bold text-[10px] hover:bg-orange-100"
                          >
                            To Kitchen
                          </button>
                        )}
                        {ord.status === 'preparing' && (
                          <button
                            onClick={() => handleStatusChange(ord.id, 'ready')}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-[10px] hover:bg-emerald-100"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-charcoal flex items-center gap-2">
                  Order #{selectedOrder.id}
                  {getStatusBadge(selectedOrder.status)}
                </h3>
                <span className="text-xs text-gray-400">{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-charcoal">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl">
                <div>
                  <span className="text-gray-400 block">Customer</span>
                  <span className="font-bold text-charcoal">{selectedOrder.customer_name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Order Mode</span>
                  <span className="font-bold text-charcoal capitalize">
                    {selectedOrder.order_type.replace('_', ' ')}
                    {selectedOrder.table_number && ` (Table ${selectedOrder.table_number})`}
                  </span>
                </div>
              </div>

              {selectedOrder.special_instructions && (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                  <span className="font-bold text-orange-900 block mb-0.5">Special Instructions:</span>
                  <p className="text-orange-800">{selectedOrder.special_instructions}</p>
                </div>
              )}

              {/* Items Table */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3">Qty</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items?.map(it => (
                      <tr key={it.id}>
                        <td className="py-2 px-3 font-semibold text-charcoal">
                          {it.food_item_name}
                          {it.notes && <span className="block text-[10px] text-gray-400">"{it.notes}"</span>}
                        </td>
                        <td className="py-2 px-3 text-gray-600">×{it.quantity}</td>
                        <td className="py-2 px-3 text-gray-600">₹{parseFloat(it.unit_price).toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-black text-charcoal">₹{parseFloat(it.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financials */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 text-right">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>₹{parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (5%):</span>
                  <span>₹{parseFloat(selectedOrder.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-charcoal pt-1 border-t border-gray-100">
                  <span>Total Amount:</span>
                  <span className="text-primary text-base">₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div className="pt-2">
                <label className="block font-bold text-gray-700 mb-1">Update Status</label>
                <div className="flex gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    disabled={updating}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

