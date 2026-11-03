import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserAuthProvider } from './context/UserAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import OrderSuccess from './pages/OrderSuccess';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminTheme from './pages/admin/AdminTheme';
import AdminOrders from './pages/admin/AdminOrders';

const StoreLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-bg">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <UserAuthProvider>
      <AdminAuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Public storefront */}
          <Route
            path="/"
            element={
              <StoreLayout>
                <Home />
              </StoreLayout>
            }
          />
          <Route
            path="/shop"
            element={
              <StoreLayout>
                <Shop />
              </StoreLayout>
            }
          />
          <Route
            path="/product/:slug"
            element={
              <StoreLayout>
                <ProductDetail />
              </StoreLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <StoreLayout>
                <Cart />
              </StoreLayout>
            }
          />
          <Route
            path="/order-success"
            element={
              <StoreLayout>
                <OrderSuccess />
              </StoreLayout>
            }
          />
          
          {/* Auth routes redirected */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<Navigate to="/" replace />} />
          <Route path="/admin/login" element={<Navigate to="/admin" replace />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="theme" element={<AdminTheme />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </UserAuthProvider>
  );
}

export default App;