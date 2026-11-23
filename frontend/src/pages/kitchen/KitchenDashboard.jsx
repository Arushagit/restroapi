import { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame, Play, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { getKitchenOrders, updateOrderStatus } from '../../api/orders';
import { useToast } from '../../components/ui/Toast';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  const loadOrders = async () => {
    try {
      const res = await getKitchenOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, `Kitchen advanced status to ${newStatus}`);
      toast.success(`Order #${orderId} marked as ${newStatus}!`);
      await loadOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update kitchen ticket.');
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed').slice(-6);

  const renderOrderCard = (order, actionButton) => (
    <div
      key={order.id}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3.5 shadow-xl transition-all hover:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">#{order.id}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {order.order_type.replace('_', ' ')}
            </span>
          </div>
          {order.table_number && (
            <span className="text-xs font-bold text-amber-400 mt-0.5 block">
              🍽️ Table {order.table_number}
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono text-gray-400">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[10px] text-gray-500 block">Guest: {order.customer_name}</span>
        </div>
      </div>

      {/* Special Kitchen Cooking Notes */}
      {order.special_instructions && (
        <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-2.5 text-xs text-amber-200">
          <span className="font-bold block text-[10px] text-amber-400 uppercase tracking-wider">Chef Note:</span>
          {order.special_instructions}
        </div>
      )}

      {/* Food Items */}
      <div className="space-y-2 divide-y divide-gray-800/50 pt-1">
        {order.items?.map(it => (
          <div key={it.id} className="pt-2 first:pt-0 flex items-start justify-between gap-2 text-xs">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${it.food_item_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-bold text-gray-200">{it.food_item_name}</span>
              </div>
              {it.notes && (
                <span className="text-[10px] text-orange-400/90 italic block pl-3.5">
                  ↳ "{it.notes}"
                </span>
              )}
            </div>
            <span className="text-sm font-black text-orange-400 bg-gray-800 px-2 py-0.5 rounded-lg shrink-0">
              ×{it.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {actionButton && (
        <div className="pt-2 border-t border-gray-800">
          {actionButton}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Station Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-white tracking-tight">Active Preparation Tickets</h2>
          <span className="text-xs bg-gray-800 text-gray-300 font-mono px-2.5 py-1 rounded-lg">
            {pendingOrders.length + preparingOrders.length + readyOrders.length} In Progress
          </span>
        </div>

        <button
          onClick={loadOrders}
          className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* 4-Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {/* Column 1: New Orders */}
        <div className="space-y-3 bg-gray-900/50 p-4 rounded-3xl border border-gray-800/80 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
              Incoming Orders ({pendingOrders.length})
            </h3>
          </div>

          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-12">No pending tickets.</p>
            ) : (
              pendingOrders.map(order =>
                renderOrderCard(
                  order,
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleAdvanceStatus(order.id, 'preparing')}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/30"
                  >
                    <Play size={14} className="fill-white" />
                    Start Preparing
                  </button>
                )
              )
            )}
          </div>
        </div>

        {/* Column 2: In Preparation */}
        <div className="space-y-3 bg-gray-900/50 p-4 rounded-3xl border border-gray-800/80 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Flame size={16} className="text-orange-400" />
              Cooking on Stove ({preparingOrders.length})
            </h3>
          </div>

          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-12">No dishes on fire.</p>
            ) : (
              preparingOrders.map(order =>
                renderOrderCard(
                  order,
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleAdvanceStatus(order.id, 'ready')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                  >
                    <CheckCircle2 size={14} />
                    Mark Plated & Ready
                  </button>
                )
              )
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup */}
        <div className="space-y-3 bg-gray-900/50 p-4 rounded-3xl border border-gray-800/80 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Ready at Pass ({readyOrders.length})
            </h3>
          </div>

          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-12">No orders at pickup pass.</p>
            ) : (
              readyOrders.map(order =>
                renderOrderCard(
                  order,
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleAdvanceStatus(order.id, 'completed')}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-gray-700"
                  >
                    <Check size={14} />
                    Complete Service
                  </button>
                )
              )
            )}
          </div>
        </div>

        {/* Column 4: Recently Served */}
        <div className="space-y-3 bg-gray-900/50 p-4 rounded-3xl border border-gray-800/80 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
              Recently Served ({completedOrders.length})
            </h3>
          </div>

          <div className="space-y-3 opacity-60">
            {completedOrders.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-12">No recently served orders.</p>
            ) : (
              completedOrders.map(order => renderOrderCard(order, null))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

