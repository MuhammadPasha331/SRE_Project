import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CashierDashboard from './pages/CashierDashboard';
import CouponManagement from './pages/CouponManagement';
import './App.css';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.position)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Unauthorized Access</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to={user.position === 'admin' ? '/admin' : '/cashier'} replace />} 
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard activeTab="employees" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard activeTab="inventory" />
          </ProtectedRoute>
        }
      />
      
      {/* Cashier Routes */}
      <Route
        path="/cashier"
        element={
          <ProtectedRoute allowedRoles={['cashier', 'admin']}>
            <CashierDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier/sale"
        element={
          <ProtectedRoute allowedRoles={['cashier', 'admin']}>
            <CashierDashboard activeTab="sale" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier/rental"
        element={
          <ProtectedRoute allowedRoles={['cashier', 'admin']}>
            <CashierDashboard activeTab="rental" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier/return"
        element={
          <ProtectedRoute allowedRoles={['cashier', 'admin']}>
            <CashierDashboard activeTab="return" />
          </ProtectedRoute>
        }
      />
      
      {/* Coupon Management (Admin only) */}
      <Route
        path="/coupons"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CouponManagement />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route
        path="/"
        element={
          <Navigate 
            to={user?.position === 'admin' ? '/admin' : user?.position === 'cashier' ? '/cashier' : '/login'} 
            replace 
          />
        }
      />
      
      {/* Catch all - redirect to appropriate dashboard */}
      <Route
        path="*"
        element={
          <Navigate 
            to={user?.position === 'admin' ? '/admin' : user?.position === 'cashier' ? '/cashier' : '/login'} 
            replace 
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
