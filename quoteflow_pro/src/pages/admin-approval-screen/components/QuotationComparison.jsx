import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuotationComparison = ({ suppliers, items }) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getItemById = (itemId) => {
    return items?.find(item => item?.id === itemId);
  };

  return (
    <div className="space-y-6">
      {suppliers?.map((supplier, index) => (
        <div 
          key={supplier?.id} 
          className="bg-card rounded-lg border border-border overflow-hidden"
        >
          {/* Supplier Header */}
          <div className="bg-muted/30 px-6 py-4 border-b border-border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Building2" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {supplier?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {supplier?.contact}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={16} className={`${getRatingColor(supplier?.rating)} fill-current`} />
                    <span className={`text-sm font-semibold ${getRatingColor(supplier?.rating)}`}>
                      {supplier?.rating}
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Quote</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(supplier?.totalQuote)}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  iconName={selectedSupplier === supplier?.id ? "ChevronUp" : "ChevronDown"}
                  onClick={() => setSelectedSupplier(selectedSupplier === supplier?.id ? null : supplier?.id)}
                >
                  {selectedSupplier === supplier?.id ? 'Hide Details' : 'View Details'}
                </Button>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {selectedSupplier === supplier?.id && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-semibold text-foreground">
                        Item
                      </th>
                      <th className="text-left py-3 text-sm font-semibold text-foreground">
                        Unit Price
                      </th>
                      <th className="text-left py-3 text-sm font-semibold text-foreground">
                        Total Price
                      </th>
                      <th className="text-left py-3 text-sm font-semibold text-foreground">
                        Delivery Time
                      </th>
                      <th className="text-left py-3 text-sm font-semibold text-foreground">
                        Warranty
                      </th>
                      <th className="text-left py-3 text-sm font-semibold text-foreground">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {supplier?.items?.map((quotedItem, idx) => {
                      const originalItem = getItemById(quotedItem?.itemId);
                      return (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {originalItem?.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {originalItem?.itemCode}
                              </p>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-sm font-semibold text-foreground">
                              {formatCurrency(quotedItem?.unitPrice)}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-sm font-semibold text-foreground">
                              {formatCurrency(quotedItem?.totalPrice)}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-1">
                              <Icon name="Clock" size={14} className="text-muted-foreground" />
                              <span className="text-sm text-foreground">
                                {quotedItem?.deliveryTime}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-1">
                              <Icon name="Shield" size={14} className="text-muted-foreground" />
                              <span className="text-sm text-foreground">
                                {quotedItem?.warranty}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 max-w-xs">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {quotedItem?.notes}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Attachments */}
              {supplier?.attachments && supplier?.attachments?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon name="Paperclip" size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Attachments ({supplier?.attachments?.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {supplier?.attachments?.map((attachment, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2 text-sm"
                      >
                        <Icon name="FileText" size={14} className="text-muted-foreground" />
                        <span className="text-foreground">{attachment}</span>
                        <Button variant="ghost" size="sm" iconName="Download" className="p-1 h-auto">
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuotationComparison;