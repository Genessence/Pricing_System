import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityFooter = () => {
  const currentYear = new Date()?.getFullYear();

  const securityFeatures = [
    {
      icon: 'Shield',
      text: 'SSL Encrypted'
    },
    {
      icon: 'Lock',
      text: 'Secure Authentication'
    },
    {
      icon: 'CheckCircle',
      text: 'Enterprise Grade'
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-border">
      {/* Security Trust Signals */}
      <div className="flex items-center justify-center space-x-6 mb-4">
        {securityFeatures?.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Icon 
              name={feature?.icon} 
              size={16} 
              className="text-success" 
              strokeWidth={2}
            />
            <span className="text-xs text-muted-foreground font-medium">
              {feature?.text}
            </span>
          </div>
        ))}
      </div>
      {/* Copyright and Links */}
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          © {currentYear} QuoteFlow Pro. All rights reserved.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button className="text-xs text-muted-foreground hover:text-foreground transition-smooth">
            Privacy Policy
          </button>
          <span className="text-xs text-muted-foreground">•</span>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-smooth">
            Terms of Service
          </button>
          <span className="text-xs text-muted-foreground">•</span>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-smooth">
            Support
          </button>
        </div>
      </div>
      {/* System Status */}
      <div className="flex items-center justify-center space-x-2 mt-4">
        <div className="w-2 h-2 bg-success rounded-full"></div>
        <span className="text-xs text-muted-foreground">
          All systems operational
        </span>
      </div>
    </div>
  );
};

export default SecurityFooter;