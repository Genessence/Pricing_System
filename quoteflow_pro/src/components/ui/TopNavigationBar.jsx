import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../AppIcon";
import UserProfileDropdown from "./UserProfileDropdown";
import NotificationCenter from "./NotificationCenter";

const TopNavigationBar = ({
  user,
  notifications = [],
  onLogout,
  onNotificationRead,
  onNotificationClear,
}) => {
  const { userType, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems =
    userType === "admin" || userType === "super_admin"
      ? [
          {
            label: "Dashboard",
            path: "/procurement-dashboard",
            icon: "BarChart3",
            tooltip: "RFQ overview and metrics",
          },
          // {
          //   label: "Quotations",
          //   path: "/quotation-comparison-table",
          //   icon: "Table",
          //   tooltip: "Compare and analyze quotes",
          // },
          {
            label: "Approvals",
            path: "/admin-approval-screen",
            icon: "Check",
            tooltip: "Review and approve quotations",
          },
        ]
      : userType === "user"
      ? [
          {
            label: "Dashboard",
            path: "/user-dashboard",
            icon: "BarChart3",
            tooltip: "View your quotation status",
          },
          {
            label: "Quotations",
            path: "/quotation-comparison-table",
            icon: "Table",
            tooltip: "Create and submit quotations",
          },
        ]
      : [
          {
            label: "Dashboard",
            path: "/admin-approval-screen",
            icon: "Shield",
            tooltip: "Review and add APD numbers to quotations",
          },
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
          <Link
            to={
              isAuthenticated
                ? userType === "admin" || userType === "super_admin"
                  ? "/procurement-dashboard"
                  : "/user-dashboard"
                : "/login"
            }
            className="flex items-center space-x-3"
          >
            <div className="flex items-center justify-center w-50 h-10 rounded-lg overflow-hidden">
              <img
                src="/assets/images/Amber.jpg"
                alt="Amber Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground tracking-tight">
                Amber General Purchase
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Procurement Channel
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Only show when authenticated */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth
                    ${
                      isActivePath(item?.path)
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                  title={item?.tooltip}
                >
                  <Icon name={item?.icon} size={18} strokeWidth={2} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Right Side Actions - Only show when authenticated */}
          {isAuthenticated && (
            <div className="flex items-center space-x-3">
              <NotificationCenter
                notifications={notifications}
                onNotificationRead={onNotificationRead}
                onNotificationClear={onNotificationClear}
              />
              <UserProfileDropdown user={user} onLogout={logout} />

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                aria-label="Toggle mobile menu"
              >
                <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu - Only show when authenticated */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <div className="space-y-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth
                    ${
                      isActivePath(item?.path)
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
