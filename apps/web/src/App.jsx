
import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import HomePage from '@/pages/HomePage.jsx';
import AboutPage from '@/pages/AboutPage.jsx';
import MenuPage from '@/pages/MenuPage.jsx';
import GalleryPage from '@/pages/GalleryPage.jsx';
import OrderPage from '@/pages/OrderPage.jsx';
import ContactPage from '@/pages/ContactPage.jsx';
import CartPage from '@/pages/CartPage.jsx';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage.jsx';
import PaymentFailurePage from '@/pages/PaymentFailurePage.jsx';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/components/CartContext.jsx';
import { PaymentProvider } from '@/contexts/PaymentContext.jsx';

function App() {
  return (
    <PaymentProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/checkout" element={<Navigate to="/order" replace />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failure" element={<PaymentFailurePage />} />
          </Routes>
          <Toaster />
        </Router>
      </CartProvider>
    </PaymentProvider>
  );
}

export default App;
