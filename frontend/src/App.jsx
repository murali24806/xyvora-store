import React from 'react';
import { Routes, Route } from 'react-router-dom';
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


import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminTheme from './pages/admin/AdminTheme';



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
            
            {/* User Auth */}
            <Route
              path="/profile"
              element={
                <StoreLayout>
                  <Profile />
                </StoreLayout>
              }
            />
            <Route
              path="/login"
              element={
                <StoreLayout>
                  <Login />
                </StoreLayout>
              }
            />
            <Route
              path="/register"
              element={
                <StoreLayout>
                  <Register />
                </StoreLayout>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="theme" element={<AdminTheme />} />
            </Route>
          </Routes>
      </AdminAuthProvider>
    </UserAuthProvider>
  );
}

export default App;
