import { useState, useEffect } from 'react';
import { Table2, Plus, Users, ShoppingBag, CheckCircle, Clock, UtensilsCrossed, AlertCircle, X, Search, RefreshCw, Send } from 'lucide-react';
import { getTables, updateTable } from '../../api/tables';
import { getOrders, createOrder, updateOrderStatus } from '../../api/orders';
import { getFoodItems } from '../../api/menu';
import { useToast } from '../../components/ui/Toast';

export default function StaffDashboard() {
  const [tables, setTables] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Take Order Modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState(null);
  const [orderItemsMap, setOrderItemsMap] = useState({}); // itemId -> qty
  const [specialNote, setSpecialNote] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      const [tblRes, ordRes, foodRes] = await Promise.all([
        getTables(),
        getOrders(),
        getFoodItems()
      ]);
      setTables(tblRes.data || []);
      // Active orders for floor staff: pending, confirmed, preparing, ready
      const active = (ordRes.data || []).filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
      setActiveOrders(active);
      setFoodItems(foodRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load floor data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s live floor poll
    return () => clearInterval(interval);
  }, []);

  const handleToggleTable = async (t) => {
    const nextStatus = t.status === 'available' ? 'occupied' : 'available';
    try {
      await updateTable(t.id, { status: nextStatus });
      setTables(prev => prev.map(tbl => tbl.id === t.id ? { ...tbl, status: nextStatus } : tbl));
      toast.info(`Table ${t.table_number} status changed to ${nextStatus}.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update table.');
    }
  };

  const openTakeOrderModal = (table) => {
    setSelectedTableForOrder(table);
    setOrderItemsMap({});
    setSpecialNote('');
    setItemSearch('');
    setIsOrderModalOpen(true);
  };

  const updateItemQty = (id, delta) => {
    setOrderItemsMap(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleSendOrderToKitchen = async (e) => {
    e.preventDefault();
    const itemsList = Object.entries(orderItemsMap).map(([id, qty]) => ({
      food_item_id: parseInt(id),
      quantity: qty,
      notes: ''
    }));

    if (itemsList.length === 0) {
      toast.error('Please select at least one dish for the table.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload = {
        order_type: 'dine_in',
        table: selectedTableForOrder.id,
        special_instructions: specialNote,
        items_input: itemsList
      };

      const res = await createOrder(payload);
      toast.success(`Order #${res.data.id} placed for Table ${selectedTableForOrder.table_number}! Beamed to Kitchen.`);
      setIsOrderModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Could not place order. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleMarkServed = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'completed', 'Food served to table by floor staff');
      toast.success(`Order #${orderId} marked as served!`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Could not update order.');
    }
  };

  const filteredFood = foodItems.filter(f =>
    f.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    f.category_name?.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const selectedCount = Object.values(orderItemsMap).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Overview Stat Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Available Tables</span>
            <h3 className="text-2xl font-black text-emerald-600">
              {tables.filter(t => t.status === 'available').length} / {tables.length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Table2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Occupied Tables</span>
            <h3 className="text-2xl font-black text-orange-600">
              {tables.filter(t => t.status === 'occupied').length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Floor Orders In Flight</span>
            <h3 className="text-2xl font-black text-blue-600">
              {activeOrders.length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShoppingBag size={20} />
          </div>
        </div>
      </div>

      {/* Main Floor Layout Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-charcoal">Floor Seating Map & Table Actions</h2>
            <p className="text-xs text-gray-400">Click a table to toggle seat status or take a fresh customer order</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-primary text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <RefreshCw size={13} /> Refresh Floor
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {tables.map(tbl => {
            const isOccupied = tbl.status === 'occupied';
            const isReserved = tbl.status === 'reserved';
            const tableOrder = activeOrders.find(o => o.table === tbl.id);

            return (
              <div
                key={tbl.id}
                className={`bg-white rounded-2xl p-4 border shadow-sm flex flex-col justify-between space-y-3 transition-all ${
                  isOccupied ? 'border-orange-300 bg-orange-50/20 ring-2 ring-orange-500/10' :
                  isReserved ? 'border-amber-300 bg-amber-50/20' :
                  'border-gray-100 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                    isOccupied ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30' :
                    isReserved ? 'bg-amber-500 text-white' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {tbl.table_number}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isOccupied ? 'bg-orange-100 text-orange-800' :
                    isReserved ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {tbl.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-charcoal">{tbl.location || 'Dining Hall'}</h4>
                  <p className="text-[11px] text-gray-400">{tbl.capacity} Guests Max</p>
                  {tableOrder && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-orange-50 px-2 py-0.5 rounded">
                      Order #{tableOrder.id} ({tableOrder.status})
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-[11px]">
                  <button
                    onClick={() => openTakeOrderModal(tbl)}
                    className="w-full py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Plus size={12} /> Take Order
                  </button>
                  <button
                    onClick={() => handleToggleTable(tbl)}
                    className="w-full py-1 text-gray-500 hover:text-charcoal font-semibold hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Set {isOccupied ? 'Available' : 'Occupied'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Floor Orders Live Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-charcoal text-base">Active Floor Serving Queue</h3>
            <p className="text-xs text-gray-400">Track orders cooking in kitchen and mark them served at guest tables</p>
          </div>
          <span className="text-xs font-bold text-gray-500">{activeOrders.length} In Flight</span>
        </div>

        {activeOrders.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No active floor orders. All seated tables have been served.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map(ord => (
              <div
                key={ord.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-charcoal">Order #{ord.id}</span>
                    <span className="block text-xs text-primary font-bold">
                      {ord.table_number ? `🍽️ Table ${ord.table_number}` : ord.order_type.toUpperCase()}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    ord.status === 'ready' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse' :
                    ord.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ord.status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  {ord.items?.map(it => (
                    <div key={it.id} className="flex justify-between">
                      <span>{it.food_item_name}</span>
                      <span className="font-bold text-charcoal">×{it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="font-bold text-xs text-charcoal">Total: ₹{parseFloat(ord.total_amount).toFixed(2)}</span>
                  {ord.status === 'ready' ? (
                    <button
                      onClick={() => handleMarkServed(ord.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
                    >
                      <CheckCircle size={13} /> Serve to Table
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> Cooking in Kitchen
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Take Order Modal */}
      {isOrderModalOpen && selectedTableForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-5 my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-base text-charcoal">
                  Dine-In POS: Table {selectedTableForOrder.table_number}
                </h3>
                <p className="text-xs text-gray-400">{selectedTableForOrder.location} • Capacity: {selectedTableForOrder.capacity} Guests</p>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-400 hover:text-charcoal">
                <X size={18} />
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            {/* Food Selector List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-50">
              {filteredFood.map(food => {
                const qty = orderItemsMap[food.id] || 0;

                return (
                  <div key={food.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${food.food_type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`} />
                        <span className="font-bold text-charcoal">{food.name}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">₹{parseFloat(food.price).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <button
                          type="button"
                          onClick={() => updateItemQty(food.id, -1)}
                          className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-charcoal flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                      )}
                      {qty > 0 && <span className="font-bold text-xs w-4 text-center">{qty}</span>}
                      <button
                        type="button"
                        onClick={() => updateItemQty(food.id, 1)}
                        className="px-2.5 py-1 bg-orange-50 hover:bg-primary text-primary hover:text-white rounded-lg font-bold transition-colors"
                      >
                        {qty > 0 ? '+' : '+ Add'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Customer Special Requests</label>
              <textarea
                rows={2}
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="e.g. Mild spice, allergy notice, extra plates..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Footer Submit */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs font-bold text-charcoal">
                {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendOrderToKitchen}
                  disabled={submittingOrder || selectedCount === 0}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Send size={13} />
                  {submittingOrder ? 'Transmitting...' : 'Send to Kitchen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

