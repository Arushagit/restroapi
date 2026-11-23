import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Utensils, MapPin, ShoppingBag, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { createOrder } from '../../api/orders';
import { getTables } from '../../api/tables';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [orderType, setOrderType] = useState('dine_in');
  const [tableId, setTableId] = useState('');
  const [tables, setTables] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.customer_profile?.address || '');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    if (orderType === 'dine_in') {
      getTables()
        .then(res => setTables(res.data || []))
        .catch(err => console.error('Failed to load tables', err));
    }
  }, [orderType]);

  const taxAmount = totalPrice * 0.05;
  const grandTotal = totalPrice + taxAmount;

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-gray-500">You don't have any items in your cart.</p>
        <Link to="/menu" className="inline-block text-primary font-bold hover:underline">
          Return to menu
        </Link>
      </div>
    );
  }

  // Success Confirmation Screen
  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center animate-bounce">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-3 py-1 rounded-full">
            Order Confirmed!
          </span>
          <h2 className="text-3xl font-black text-charcoal">Order #{placedOrder.id} Placed</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your culinary request has been transmitted directly to our kitchen station. Our chefs are preparing your dishes.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left space-y-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Order Type:</span>
            <span className="font-bold text-charcoal uppercase">{placedOrder.order_type.replace('_', ' ')}</span>
          </div>
          {placedOrder.table_number && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Table Assigned:</span>
              <span className="font-bold text-charcoal">Table {placedOrder.table_number}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Status:</span>
            <span className="font-bold text-orange-600 capitalize">{placedOrder.status}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Total Amount:</span>
            <span className="font-black text-charcoal text-sm">₹{parseFloat(placedOrder.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            to="/orders"
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            Track Order Live
          </Link>
          <Link
            to="/menu"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-charcoal text-sm font-bold rounded-xl transition-colors"
          >
            Order More
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to place your order.');
      navigate('/login?redirect=/checkout');
      return;
    }

    if (orderType === 'dine_in' && !tableId) {
      toast.error('Please select a dining table.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Please provide a delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        order_type: orderType,
        table: orderType === 'dine_in' ? tableId : null,
        delivery_address: orderType === 'delivery' ? deliveryAddress : '',
        special_instructions: instructions,
        items_input: items.map(i => ({
          food_item_id: i.foodItem.id,
          quantity: i.quantity,
          notes: i.notes || ''
        }))
      };

      const res = await createOrder(payload);
      clearCart();
      setPlacedOrder(res.data);
      toast.success('Order placed successfully!');
    } catch (err) {
      console.error('Failed to place order:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.items || err.response?.data?.food_item || 'Could not place order. Please check inputs.';
      toast.error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-charcoal">
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <h1 className="text-3xl font-black text-charcoal tracking-tight">Checkout & Place Order</h1>

      {!isAuthenticated && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-primary shrink-0" />
            <p className="text-xs text-orange-900 font-medium">
              You are placing an order as a guest. Please sign in to link this order to your profile and track it in real-time.
            </p>
          </div>
          <Link
            to="/login?redirect=/checkout"
            className="text-xs font-bold text-white bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-lg shrink-0 transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type Selector */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-charcoal uppercase tracking-wider">1. Select Dining Mode</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'dine_in', label: 'Dine In', icon: Utensils },
                { id: 'takeaway', label: 'Takeaway', icon: ShoppingBag },
                { id: 'delivery', label: 'Delivery', icon: MapPin },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setOrderType(opt.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${orderType === opt.id ? 'border-primary bg-orange-50 text-primary font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-orange-200'}`}
                >
                  <opt.icon size={20} className="mb-2" />
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* If Dine-In: Table Picker */}
            {orderType === 'dine_in' && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-gray-700">Choose Table Number *</label>
                <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Select a dining table...</option>
                  {tables.map(tbl => (
                    <option key={tbl.id} value={tbl.id}>
                      Table {tbl.table_number} ({tbl.location} - Seats {tbl.capacity}) - {tbl.status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If Delivery: Address Input */}
            {orderType === 'delivery' && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-gray-700">Doorstep Delivery Address *</label>
                <textarea
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street, Building name, Flat No, Landmark..."
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary"
                  required
                />
              </div>
            )}
          </div>

          {/* Kitchen / Special Instructions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-charcoal uppercase tracking-wider">2. Kitchen Instructions (Optional)</h2>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Mild spice only, separate cutlery, serve beverages first..."
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Order Review & Pay CTA */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6 h-fit sticky top-24">
          <h2 className="text-sm font-bold text-charcoal uppercase tracking-wider">Order Summary</h2>

          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {items.map(({ foodItem, quantity }) => (
              <div key={foodItem.id} className="py-2 flex justify-between text-xs">
                <span className="text-gray-700">{foodItem.name} × {quantity}</span>
                <span className="font-semibold text-charcoal">₹{(parseFloat(foodItem.price) * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-charcoal">₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span className="font-semibold text-charcoal">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-charcoal pt-2 border-t border-gray-100">
              <span>Final Total:</span>
              <span className="text-primary text-base">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
          >
            {submitting ? 'Confirming Order...' : `Place Order (₹${grandTotal.toFixed(2)})`}
          </button>
        </div>
      </form>
    </div>
  );
}

