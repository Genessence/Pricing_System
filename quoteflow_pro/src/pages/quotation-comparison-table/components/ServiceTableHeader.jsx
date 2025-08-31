import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServiceTableHeader = ({ quotes, onAddQuotation, onRemoveQuote }) => {
  return (
    <thead className="bg-muted border-b border-border sticky top-0 z-20">
      {/* Main Data Row */}
      <tr className="h-12">
        {/* Fixed Left Column Headers */}
        <th className="p-3 text-left bg-card sticky left-0 z-30 border-r border-border min-w-52">
          <div className="flex items-center space-x-2">
            <Icon name="FileText" size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Description</span>
          </div>
        </th>
        <th className="p-3 text-left bg-card sticky left-52 z-30 border-r border-border min-w-60">
          <div className="flex items-center space-x-2">
            <Icon name="Settings" size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Specification</span>
          </div>
        </th>
        <th className="p-3 text-left bg-card sticky left-112 z-30 border-r border-border min-w-36">
          <div className="flex items-center space-x-2">
            <Icon name="Package" size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">UOM</span>
          </div>
        </th>
        <th className="p-3 text-left bg-card sticky left-148 z-30 border-r border-border min-w-40">
          <div className="flex items-center space-x-2">
            <Icon name="Hash" size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Req Qty</span>
          </div>
        </th>
        <th className="p-3 text-left bg-card sticky left-188 z-30 border-r border-border min-w-44">
          <div className="flex items-center space-x-2">
            <Icon name="DollarSign" size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Rate</span>
          </div>
        </th>

        {/* Supplier Quote Headers - Matching Provided Data Table */}
        {quotes?.map((quote, index) => (
          <th key={index} className="p-3 text-left border-r border-border min-w-64">
            <div className="space-y-3">
              {/* Quote Header with Remove Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Quote" size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Quote {index + 1}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => onRemoveQuote && onRemoveQuote(index)}
                  className="text-muted-foreground hover:text-destructive p-1 h-auto"
                />
              </div>

              {/* Supplier Selection */}
              <div className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
                Supplier {index + 1}
              </div>
            </div>
          </th>
        ))}

        {/* Add Quotation Button */}
        <th className="p-3 text-center bg-muted/20 min-w-48">
          <div className="flex items-center justify-center">
            <button
              onClick={onAddQuotation}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Icon name="Plus" size={14} />
              <span>Add Quotation</span>
            </button>
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default ServiceTableHeader;