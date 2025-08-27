import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbTrail = ({ customBreadcrumbs = null, showBreadcrumbs = true }) => {
  const location = useLocation();

  if (!showBreadcrumbs) return null;

  // Route mapping for breadcrumb generation
  const routeMap = {
    '/procurement-dashboard': { label: 'Dashboard', icon: 'BarChart3' },
    '/rfq-creation-wizard': { label: 'Create RFQ', icon: 'FileText', parent: '/procurement-dashboard' },
    '/quotation-comparison-table': { label: 'Compare Quotations', icon: 'Table', parent: '/procurement-dashboard' },

  };

  // Generate breadcrumbs from current path or use custom ones
  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const currentPath = location?.pathname;
    const breadcrumbs = [];

    // Always start with Dashboard if not already there
    if (currentPath !== '/procurement-dashboard') {
      breadcrumbs?.push({
        label: 'Dashboard',
        path: '/procurement-dashboard',
        icon: 'BarChart3'
      });
    }

    // Add current page
    const currentRoute = routeMap?.[currentPath];
    if (currentRoute) {
      breadcrumbs?.push({
        label: currentRoute?.label,
        path: currentPath,
        icon: currentRoute?.icon,
        current: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 px-6 py-3 bg-background border-b border-border" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs?.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="text-muted-foreground mx-2" 
                strokeWidth={2}
              />
            )}
            
            {crumb?.current ? (
              <span className="flex items-center space-x-2 text-sm font-medium text-foreground">
                <Icon name={crumb?.icon} size={16} strokeWidth={2} />
                <span>{crumb?.label}</span>
              </span>
            ) : (
              <Link
                to={crumb?.path}
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Icon name={crumb?.icon} size={16} strokeWidth={2} />
                <span>{crumb?.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbTrail;