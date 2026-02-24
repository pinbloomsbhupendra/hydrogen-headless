import { Link } from 'react-router';
import { useState } from 'react';
/**
 * @param {Object} props
 * @param {number} props.cartCount
 * @param {Function} props.onCartClick
 */
export default function Header({ cartCount, onCartClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Left: Mobile Menu Button (Hidden on Desktop) */}
          <div className="navbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Center: Logo */}
          <div className="navbar-logo">
            <Link to="/" prefetch="intent" className="logo-text navbar-logo-link">
              PROLOCK
              <span className="navbar-logo-tm">TM</span>
            </Link>
          </div>

          {/* Right: Account & Cart Icons */}
          <ul className="navbar-right">
            <li>
              <Link to="/dashboard" className="navbar-icon-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </Link>
            </li>
            <li className="relative">
              <button
                onClick={onCartClick}
                className="navbar-icon-link focus:outline-none relative group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="cart-count-badge group-hover:scale-110">
                    {cartCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="logo-text mobile-menu-logo">PROLOCK</span>
              <button onClick={() => setMobileMenuOpen(false)} className="mobile-menu-close">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="mobile-menu-links">
              <li><Link to="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
              <li><Link to="/prolock" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Buy Prolock Original</Link></li>
              <li><Link to="/prolock-guardian" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Buy Prolock Guardian</Link></li>
              <li><Link to="/comparison-table" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Compare</Link></li>
              <li><Link to="/register-warranty" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Register Warranty</Link></li>
              <li><Link to="/dashboard" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>My Account</Link></li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
