import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import OrderingPage from './pages/OrderingPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CalendarView from './pages/CalendarView';
import AdminPage from './pages/AdminPage';
import InventoryDashboard from './pages/InventoryDashboard';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FeedbackPage from './pages/FeedbackPage';
import OrderManagement from './pages/OrderManagement';
import SalesManagement from './pages/SalesManagement';
import FeedbackManagement from './pages/FeedbackManagement';
import MenuManagement from './pages/MenuManagement';
import GoogleAuthWrapper from './components/GoogleAuthWrapper';

const AppContent = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isOrderRoute = location.pathname === '/order';
  const isHomeRoute = location.pathname === '/';
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
  const isImsRoute = location.pathname.startsWith('/ims');
  const isOrdersRoute = location.pathname.startsWith('/orders');
  const isSalesRoute = location.pathname.startsWith('/sales');
  const isFeedbackAdminRoute = location.pathname.startsWith('/feedback-admin');
  const isMenuAdminRoute = location.pathname.startsWith('/menu-admin');
  const isFullWidthRoute = isAdminRoute || isHomeRoute || isAuthRoute || isOrderRoute || isImsRoute || isOrdersRoute || isSalesRoute || isFeedbackAdminRoute || isMenuAdminRoute;

  return (
    <GoogleAuthWrapper>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        {!isAuthRoute && <Header />}
        <main style={{ flex: 1, width: '100%', maxWidth: isFullWidthRoute ? '100%' : '1440px', margin: '0 auto', padding: isFullWidthRoute ? '0' : '0 5%' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/order" element={<OrderingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/ims" element={<InventoryDashboard />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/sales" element={<SalesManagement />} />
            <Route path="/feedback-admin" element={<FeedbackManagement />} />
            <Route path="/menu-admin" element={<MenuManagement />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Routes>
        </main>
        {!isAuthRoute && <Footer />}
      </div>
    </GoogleAuthWrapper>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
