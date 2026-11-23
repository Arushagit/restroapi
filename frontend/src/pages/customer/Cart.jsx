import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, UtensilsCrossed, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems, updateNotes } = useCart();

  const taxAmount = totalPrice * 0.05;
  const grandTotal = totalPrice + taxAmount;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-orange-50 text-primary rounded-3xl mx-auto flex items-center justify-center">
          <ShoppingBag size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-charcoal">Your cart is empty</h2>
          <p className="text-sm text-gray-500">Discover our authentic delicacies and fill your dining table.</p>
        </div>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md transition-colors"
        >
          <UtensilsCrossed size={18} /> Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Order Cart</h1>
          <p className="text-xs text-gray-500">{totalItems} item{totalItems > 1 ? 's' : ''} selected</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ foodItem, quantity, notes }) => {
            const itemTotal = parseFloat(foodItem.price) * quantity;

            return (
              <div
                key={foodItem.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-sm border ${foodItem.food_type === 'veg' ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                      <span className={`w-1 h-1 rounded-full ${foodItem.food_type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`} />
                    </span>
                    <h3 className="font-bold text-charcoal text-sm">{foodItem.name}</h3>
                  </div>
                  <p className="text-xs text-gray-400">₹{parseFloat(foodItem.price).toFixed(2)} each</p>

                  {/* Cooking Note Input */}
                  <input
                    type="text"
                    value={notes || ''}
                    onChange={(e) => updateNotes(foodItem.id, e.target.value)}
                    placeholder="Add cooking note (e.g. less spicy)..."
                    className="w-full text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 mt-2 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(foodItem.id, quantity - 1)}
                      className="p-1 hover:bg-white rounded-lg text-gray-600 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-charcoal">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(foodItem.id, quantity + 1)}
                      className="p-1 hover:bg-white rounded-lg text-gray-600 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="font-black text-sm text-charcoal">₹{itemTotal.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => removeFromCart(foodItem.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6 h-fit sticky top-24">
          <h2 className="font-bold text-charcoal text-base">Bill Details</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Item Subtotal</span>
              <span className="font-semibold text-charcoal">₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Taxes & GST (5%)</span>
              <span className="font-semibold text-charcoal">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Restaurant Packaging</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="font-bold text-charcoal text-base">To Pay</span>
              <span className="font-black text-xl text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all hover:scale-[1.01]"
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </Link>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck size={14} className="text-primary" />
            <span>Secure Checkout • Zero Hidden Fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}

