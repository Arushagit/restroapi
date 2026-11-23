import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight, Clock, Award, ShieldCheck, Flame, ShoppingBag, Plus } from 'lucide-react';
import { getCategories, getFeaturedItems } from '../../api/menu';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../components/ui/Toast';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, featRes] = await Promise.all([
          getCategories(),
          getFeaturedItems()
        ]);
        setCategories(catRes.data || []);
        setFeatured(featRes.data || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickAdd = (item) => {
    addToCart(item, 1);
    toast.success(`Added ${item.name} to cart!`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold tracking-wide">
                <Flame size={14} className="text-primary fill-primary" />
                Voted #1 Culinary Destination & Bistro
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal tracking-tight leading-[1.1]">
                Masterpiece Flavors, <br />
                <span className="text-primary">Delivered to Perfection.</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Experience gourmet perfection crafted by master chefs using heirloom spices and farm-fresh ingredients. Dine-in, takeaway, or contactless doorstep delivery.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5"
                >
                  <UtensilsCrossed size={18} />
                  Explore Full Menu
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-50 text-charcoal font-semibold rounded-xl border border-gray-200 transition-colors"
                >
                  Track Live Orders
                </Link>
              </div>

              {/* Value highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div>
                  <h4 className="text-2xl font-black text-charcoal">30 min</h4>
                  <p className="text-xs text-gray-500 font-medium">Lightning Delivery</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-charcoal">100%</h4>
                  <p className="text-xs text-gray-500 font-medium">Fresh Ingredients</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-charcoal">4.9 ★</h4>
                  <p className="text-xs text-gray-500 font-medium">Guest Rating</p>
                </div>
              </div>
            </div>

            {/* Visual Hero Card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-amber-300 rounded-3xl blur-2xl opacity-20 -z-10"></div>
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Signature Special</span>
                    <h3 className="text-xl font-bold text-charcoal">Grand Butter Chicken</h3>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                    Chef's Pick
                  </span>
                </div>
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-50 flex items-center justify-center overflow-hidden relative">
                  <div className="text-center p-6 space-y-3">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <UtensilsCrossed size={36} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Tandoori smoked chicken simmered in rich satin tomato gravy</p>
                    <span className="inline-block text-2xl font-black text-primary">₹390.00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={16} className="text-primary" />
                    <span>Prep Time: ~20 mins</span>
                  </div>
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark"
                  >
                    View in Menu <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Handpicked Selections</span>
            <h2 className="text-3xl font-extrabold text-charcoal">Browse Categories</h2>
          </div>
          <Link to="/menu" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            See All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${cat.id}`}
              className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all duration-300">
                <UtensilsCrossed size={28} />
              </div>
              <h3 className="font-bold text-charcoal group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{cat.description || `${cat.items_count || 0} delicious dishes`}</p>
              <span className="inline-block text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                {cat.items_count || 0} Items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Items Grid */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Most Loved</span>
              <h2 className="text-3xl font-extrabold text-charcoal">Chef's Signature Dishes</h2>
            </div>
            <Link to="/menu" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View Entire Menu <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col"
              >
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border ${item.food_type === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.food_type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`} />
                      </span>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.category_name}</span>
                    </div>
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Featured</span>
                  </div>

                  <h3 className="text-lg font-bold text-charcoal">{item.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="px-5 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium block">Price</span>
                    <span className="text-lg font-black text-charcoal">₹{parseFloat(item.price).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => handleQuickAdd(item)}
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus size={15} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience Features */}
      <section className="bg-charcoal text-white py-16 my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">The RestroFlow Promise</span>
            <h2 className="text-3xl font-extrabold text-white">Why Guests Keep Coming Back</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-primary flex items-center justify-center">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-bold">Artisanal Culinary Craft</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Every recipe is precision-tested and seasoned to perfection by experienced master chefs.
              </p>
            </div>

            <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-primary flex items-center justify-center">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-bold">Synchronized Kitchen Display</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Orders instantly beam to the kitchen screen, minimizing prep time and eliminating delays.
              </p>
            </div>

            <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-primary flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold">Transparent Billing & Hygiene</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Zero hidden charges. Itemized GST-compliant invoices generated in seconds with instant receipting.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

