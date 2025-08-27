import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationCenter from './NotificationCenter';

const TopNavigationBar = ({ user, notifications = [], onLogout, onNotificationRead, onNotificationClear }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/procurement-dashboard',
      icon: 'BarChart3',
      tooltip: 'RFQ overview and metrics'
    },
    {
      label: 'Quotations',
      path: '/quotation-comparison-table',
      icon: 'Table',
      tooltip: 'Compare and analyze quotes'
    },

    {
      label: 'Admin',
      path: '/admin-approval-screen',
      icon: 'Shield',
      tooltip: 'Review and approve quotations'
    }
  ];

  const isActivePath = (path) => {
    return location?.pathname === path || location?.pathname?.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-1000 bg-card border-b border-border">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/procurement-dashboard" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Icon name="Zap" size={24} color="white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground tracking-tight">
                QuoteFlow Pro
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Enterprise Procurement
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth
                  ${isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
                title={item?.tooltip}
              >
                <Icon name={item?.icon} size={18} strokeWidth={2} />
                <span>{item?.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <NotificationCenter 
              notifications={notifications}
              onNotificationRead={onNotificationRead}
              onNotificationClear={onNotificationClear}
            />
            <UserProfileDropdown user={user} onLogout={onLogout} />
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
              aria-label="Toggle mobile menu"
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <div className="space-y-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth
                    ${isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon name={item?.icon} size={20} strokeWidth={2} />
                  <div className="flex flex-col">
                    <span>{item?.label}</span>
                    <span className="text-xs opacity-75">{item?.tooltip}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNavigationBar;