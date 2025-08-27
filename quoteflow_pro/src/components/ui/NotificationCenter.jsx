import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const NotificationCenter = ({ notifications = [], onNotificationRead, onNotificationClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const closeNotifications = () => {
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        closeNotifications();
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
        closeNotifications();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  const handleNotificationClick = (notification) => {
    if (onNotificationRead && !notification?.read) {
      onNotificationRead(notification?.id);
    }
  };

  const handleClearAll = () => {
    if (onNotificationClear) {
      onNotificationClear();
    }
    closeNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return { name: 'CheckCircle', color: 'text-success' };
      case 'warning':
        return { name: 'AlertTriangle', color: 'text-warning' };
      case 'error':
        return { name: 'AlertCircle', color: 'text-error' };
      case 'info':
      default:
        return { name: 'Info', color: 'text-primary' };
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleNotifications}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Icon name="Bell" size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevated z-1010 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-popover-foreground">Notifications</h3>
            {notifications?.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-smooth"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications?.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications?.map((notification) => {
                  const iconConfig = getNotificationIcon(notification?.type);
                  
                  return (
                    <div
                      key={notification?.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        px-4 py-3 border-b border-border last:border-b-0 cursor-pointer transition-smooth
                        ${notification?.read 
                          ? 'hover:bg-muted' :'bg-muted/50 hover:bg-muted border-l-4 border-l-primary'
                        }
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon 
                          name={iconConfig?.name} 
                          size={16} 
                          className={`mt-0.5 ${iconConfig?.color}`}
                          strokeWidth={2}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${notification?.read ? 'text-muted-foreground' : 'text-popover-foreground font-medium'}`}>
                            {notification?.title}
                          </p>
                          {notification?.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification?.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification?.timestamp)}
                          </p>
                        </div>
                        {!notification?.read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications?.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <button className="w-full text-sm text-primary hover:text-primary/80 transition-smooth">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;