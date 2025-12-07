import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getNavItems = () => {
    if (!user) return [];

    if (user.position === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: '🏠' },
        { path: '/admin/employees', label: 'Employees', icon: '👥' },
        { path: '/admin/inventory', label: 'Inventory', icon: '📦' },
        { path: '/coupons', label: 'Coupons', icon: '🎫' },
      ];
    } else if (user.position === 'cashier') {
      return [
        { path: '/cashier', label: 'Dashboard', icon: '🏠' },
        { path: '/cashier/sale', label: 'New Sale', icon: '💰' },
        { path: '/cashier/rental', label: 'Rental', icon: '📋' },
        { path: '/cashier/return', label: 'Return', icon: '↩️' },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <h1 className="logo">SG Technologies POS</h1>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">
                👤 {user?.name || user?.username} ({user?.position})
              </span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="layout-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path)}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}

