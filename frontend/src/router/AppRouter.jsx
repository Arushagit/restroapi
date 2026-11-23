import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import KitchenLayout from '../layouts/KitchenLayout';
import StaffLayout from '../layouts/StaffLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Customer Pages
import Home from '../pages/customer/Home';
import Menu from '../pages/customer/Menu';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import OrderHistory from '../pages/customer/OrderHistory';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import FoodCategories from '../pages/admin/FoodCategories';
import FoodItems from '../pages/admin/FoodItems';
import AdminOrders from '../pages/admin/Orders';
import TablesManagement from '../pages/admin/Tables';
import BillingManagement from '../pages/admin/Billing';

// Staff Pages
import StaffDashboard from '../pages/staff/StaffDashboard';

// Kitchen Pages
import KitchenDashboard from '../pages/kitchen/KitchenDashboard';

// Guard
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  return (
    <Routes>
      {/* Customer Facing Web Storefront */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin SaaS Control Center (Admin only) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout title="RESTROFLOW Executive Center" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<FoodCategories />} />
        <Route path="food" element={<FoodItems />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="tables" element={<TablesManagement />} />
        <Route path="billing" element={<BillingManagement />} />
      </Route>

      {/* Floor Staff Station (Staff & Admin) */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="billing" element={<BillingManagement />} />
      </Route>

      {/* Kitchen Display System (KDS) */}
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff', 'kitchen']}>
            <KitchenLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<KitchenDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
