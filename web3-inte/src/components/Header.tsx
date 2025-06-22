import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/upload', label: 'Upload Record', icon: '📤' },
    { path: '/records', label: 'My Records', icon: '📋' },
    { path: '/consent', label: 'Consent Management', icon: '🤝' },
    { path: '/verify', label: 'Verify Document', icon: '✅' },
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo and Title */}
          <div className="logo">
            <div className="logo-icon">🏥</div>
            <div>
              <h1 className="logo-title">SwasthWrap</h1>
              <p className="logo-subtitle">Web3 Medical Records</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Connect Wallet Button */}
          <div className="flex items-center" style={{ gap: '1rem' }}>
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span>Base L2</span>
            </div>
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
