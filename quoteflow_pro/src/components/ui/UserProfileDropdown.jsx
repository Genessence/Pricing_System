import React, { useState, useRef, useEffect } from 'react';

import Icon from '../AppIcon';
import Image from '../AppImage';

const UserProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    closeDropdown();
    if (onLogout) {
      onLogout();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event?.key === 'Escape') {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  const menuItems = [
    {
      label: 'Profile Settings',
      icon: 'User',
      action: () => {
        closeDropdown();
        // Navigate to profile settings
      }
    },
    {
      label: 'Account Preferences',
      icon: 'Settings',
      action: () => {
        closeDropdown();
        // Navigate to account preferences
      }
    },
    {
      label: 'Help & Support',
      icon: 'HelpCircle',
      action: () => {
        closeDropdown();
        // Navigate to help
      }
    },
    {
      label: 'System Admin',
      icon: 'Shield',
      action: () => {
        closeDropdown();
        // Navigate to admin panel
      },
      adminOnly: true
    }
  ];

  const displayName = user?.name || user?.email || 'User';
  const userRole = user?.role || 'Procurement Manager';
  const userAvatar = user?.avatar;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon name="User" size={16} color="white" strokeWidth={2} />
          )}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-foreground">{displayName}</span>
          <span className="text-xs text-muted-foreground">{userRole}</span>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-elevated z-1010">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon name="User" size={20} color="white" strokeWidth={2} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-popover-foreground">{displayName}</span>
                <span className="text-xs text-muted-foreground">{userRole}</span>
                {user?.email && (
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems?.map((item, index) => {
              // Skip admin-only items if user is not admin
              if (item?.adminOnly && user?.role !== 'Admin') {
                return null;
              }

              return (
                <button
                  key={index}
                  onClick={item?.action}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                >
                  <Icon name={item?.icon} size={16} strokeWidth={2} />
                  <span>{item?.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout Section */}
          <div className="border-t border-border py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-destructive hover:bg-muted transition-smooth"
            >
              <Icon name="LogOut" size={16} strokeWidth={2} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;