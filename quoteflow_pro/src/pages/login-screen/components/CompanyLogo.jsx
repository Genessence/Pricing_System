import React from 'react';
import Icon from '../../../components/AppIcon';

const CompanyLogo = () => {
  return (
    <div className="flex flex-col items-center space-y-4 mb-8">
      {/* Logo Icon */}
      <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-soft">
        <Icon name="Zap" size={32} color="white" strokeWidth={2.5} />
      </div>
      
      {/* Company Name and Tagline */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          QuoteFlow Pro
        </h1>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Enterprise Procurement Management
        </p>
      </div>
      
      {/* Welcome Message */}
      <div className="text-center max-w-sm">
        <p className="text-sm text-muted-foreground">
          Sign in to access your procurement dashboard and manage supplier quotations
        </p>
      </div>
    </div>
  );
};

export default CompanyLogo;