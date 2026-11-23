import { Outlet, Link } from 'react-router-dom';
import CustomerNavbar from '../components/customer/Navbar';
import { UtensilsCrossed, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <CustomerNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-charcoal text-white mt-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                RESTRO<span className="text-primary">FLOW</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              The modern intelligent restaurant operating system. Crafted for exquisite dining and seamless operations.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/menu" className="hover:text-primary transition-colors">Food Menu</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">Shopping Cart</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Track Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Portal Access</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/login" className="hover:text-primary transition-colors">Admin Sign In</Link></li>
              <li><Link to="/kitchen" className="hover:text-primary transition-colors">Kitchen Display</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Customer Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Contact & Hours</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-2"><MapPin size={16} className="text-primary shrink-0" /> 123 Gourmet Blvd, Foodville</li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-primary shrink-0" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail size={16} className="text-primary shrink-0" /> contact@restroflow.com</li>
              <li className="pt-2 text-xs text-gray-500">Open Daily: 11:00 AM – 11:30 PM</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          © {new Date().getFullYear()} RESTROFLOW. Built with <Heart size={12} className="text-primary fill-primary" /> for interview demonstration.
        </div>
      </footer>
    </div>
  );
}

