import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Minus, ShoppingBag, Check, Flame, Filter } from 'lucide-react';
import { getCategories, getFoodItems } from '../../api/menu';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../components/ui/Toast';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, veg, non_veg
  const [loading, setLoading] = useState(true);

  const { items: cartItems, addToCart, updateQuantity } = useCart();
  const toast = useToast();

  useEffect(() => {
    async function loadMenu() {
      try {
        const [catRes, itemsRes] = await Promise.all([
          getCategories(),
          getFoodItems()
        ]);
        setCategories(catRes.data || []);
        setItems(itemsRes.data || []);
      } catch (err) {
        console.error('Failed to load menu items:', err);
        toast.error('Failed to load menu. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId.toString());
    setSearchParams(catId === 'all' ? {} : { category: catId });
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== parseInt(selectedCategory)) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && item.food_type !== typeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [items, selectedCategory, typeFilter, searchQuery]);

  const getCartQuantity = (itemId) => {
    const found = cartItems.find(i => i.foodItem.id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-charcoal tracking-tight">Our Gourmet Menu</h1>
          <p className="text-sm text-gray-500 mt-1">Explore authentic recipes crafted with passion and precision.</p>
        </div>

        {/* Search & Veg/Non-veg Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${typeFilter === 'all' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('veg')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${typeFilter === 'veg' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
            >
              <span className="w-2 h-2 rounded-full bg-green-600 inline-block"></span> Veg
            </button>
            <button
              onClick={() => setTypeFilter('non_veg')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${typeFilter === 'non_veg' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span> Non-Veg
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${selectedCategory === 'all' ? 'bg-primary text-white shadow-md shadow-orange-500/20' : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300'}`}
        >
          All Items ({items.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${selectedCategory === cat.id.toString() ? 'bg-primary text-white shadow-md shadow-orange-500/20' : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300'}`}
          >
            {cat.name} ({cat.items_count || 0})
          </button>
        ))}
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 space-y-3">
          <p className="text-gray-500 text-sm">No delicious items match your search criteria.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setTypeFilter('all'); }}
            className="text-xs font-bold text-primary hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const qty = getCartQuantity(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border ${item.food_type === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.food_type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`} />
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{item.category_name}</span>
                    </div>
                    {item.is_featured && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        Chef's Special
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-charcoal text-base group-hover:text-primary transition-colors">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="px-5 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-lg font-black text-charcoal">₹{parseFloat(item.price).toFixed(2)}</span>

                  {qty > 0 ? (
                    <div className="inline-flex items-center gap-2 bg-primary text-white rounded-xl px-2 py-1 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, qty - 1)}
                        className="p-1 hover:bg-black/10 rounded-lg transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{qty}</span>
                      <button
                        onClick={() => updateQuantity(item.id, qty + 1)}
                        className="p-1 hover:bg-black/10 rounded-lg transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        addToCart(item, 1);
                        toast.success(`Added ${item.name} to cart`);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-primary text-primary hover:text-white border border-primary/30 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                    >
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

