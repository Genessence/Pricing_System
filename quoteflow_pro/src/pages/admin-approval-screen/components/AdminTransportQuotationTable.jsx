import React from 'react';
import AppIcon from '../../../components/AppIcon';

const AdminTransportQuotationTable = ({ 
  suppliers = [], 
  items = [],
  adminApproval = {},
  onFinalSupplierChange,
  onFinalPriceChange,
  calculateSumAmount
}) => {
  // Vehicle size display mapping
  const getVehicleSizeDisplay = (size) => {
    const sizeMap = {
      'small': 'Small Truck',
      'medium': 'Medium Truck', 
      'large': 'Large Truck',
      'container_20ft': '20ft Container',
      'container_40ft': '40ft Container'
    };
    return sizeMap?.[size] || size;
  };

  if (!items?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <AppIcon name="Table" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No transport quotation data available</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          {/* Transport Table Header */}
          <thead className="bg-muted border-b border-border sticky top-0 z-20">
            {/* Transport Header Row */}
            <tr className="bg-primary/10">
              <th colSpan={7} className="p-3 text-center border-r border-border">
                <div className="flex items-center justify-center space-x-2">
                  <AppIcon name="Truck" size={18} className="text-primary" />
                  <span className="text-base font-bold text-primary">Transport Quotation (Read-Only)</span>
                </div>
              </th>
              
              {suppliers?.map((supplier, index) => (
                <th key={supplier?.id} className="p-3 text-center border-r border-border min-w-64">
                  <div className="flex items-center justify-center space-x-2">
                    <AppIcon name="Building2" size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {supplier?.name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Rating: {supplier?.rating}/5.0 • {supplier?.contact}
                  </div>
                </th>
              ))}

              {/* Admin Approval Header */}
              <th className="p-3 text-center border-r border-border min-w-96 bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center justify-center space-x-2">
                  <AppIcon name="UserCheck" size={16} className="text-orange-600" />
                  <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                    Admin Approval
                  </span>
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Final supplier selection & pricing
                </div>
              </th>
            </tr>

            {/* Column Headers */}
            <tr className="bg-card">
              <th className="p-4 text-left bg-card sticky left-0 z-30 border-r border-border min-w-48">
                <div className="flex items-center space-x-2">
                  <AppIcon name="MapPin" size={16} />
                  <span className="text-sm font-semibold text-foreground">From</span>
                </div>
              </th>
              
              <th className="p-4 text-left bg-card sticky left-48 z-30 border-r border-border min-w-48">
                <div className="flex items-center space-x-2">
                  <AppIcon name="MapPin" size={16} />
                  <span className="text-sm font-semibold text-foreground">To</span>
                </div>
              </th>
              
              <th className="p-4 text-left bg-card sticky left-96 z-30 border-r border-border min-w-48">
                <div className="flex items-center space-x-2">
                  <AppIcon name="Truck" size={16} />
                  <span className="text-sm font-semibold text-foreground">Vehicle Size</span>
                </div>
              </th>
              
              <th className="p-4 text-left bg-card sticky left-144 z-30 border-r border-border min-w-48">
                <div className="flex items-center space-x-2">
                  <AppIcon name="Package" size={16} />
                  <span className="text-sm font-semibold text-foreground">Load</span>
                </div>
              </th>
              
              <th className="p-4 text-left bg-card sticky left-192 z-30 border-r border-border min-w-48">
                <div className="flex items-center space-x-2">
                  <AppIcon name="Ruler" size={16} />
                  <span className="text-sm font-semibold text-foreground">Dimensions</span>
                </div>
              </th>

              <th className="p-4 text-left bg-card sticky left-240 z-30 border-r border-border min-w-48">
                <div className="flex items-center space-x-2">
                  <AppIcon name="Calendar" size={16} />
                  <span className="text-sm font-semibold text-foreground">Frequency/Month</span>
                </div>
              </th>

              <th className="p-4 text-left bg-card sticky left-288 z-30 border-r border-border min-w-48">
                <div className="flex items-center space-x-2">
                  <AppIcon name="Lightbulb" size={16} />
                  <span className="text-sm font-semibold text-foreground">Suggestion</span>
                </div>
              </th>

              {/* Transport Quote Column Headers */}
              {suppliers?.map((supplier, index) => (
                <th key={supplier?.id} className="p-4 text-left border-r border-border min-w-64">
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground font-medium mb-2">
                        {supplier?.name}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <div className="text-muted-foreground font-medium">Vendor Name</div>
                          <div className="text-muted-foreground font-medium">Rate per Trip</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground font-medium">Monthly Total</div>
                          <div className="text-muted-foreground font-medium">Attachment</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </th>
              ))}

              {/* Admin Approval Column Header */}
              <th className="p-4 text-left border-r border-border min-w-96 bg-orange-50 dark:bg-orange-950/20">
                <div className="text-center space-y-2">
                  <div className="text-xs text-orange-800 dark:text-orange-200 font-medium">
                    Admin Decision
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-orange-600 font-medium">Final Supplier</div>
                      <div className="text-orange-500">Vendor Details</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-600 font-medium">Final Price</div>
                      <div className="text-orange-500">Admin Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-600 font-medium">Sum Amount</div>
                      <div className="text-orange-500">Calculated</div>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody>
            {/* Transport Item Rows */}
            {items?.map((item) => (
              <tr key={item?.id} className="border-b border-border hover:bg-muted/50">
                {/* Fixed Left Columns */}
                <td className="p-3 bg-card sticky left-0 z-10 border-r border-border">
                  <div className="text-sm font-medium text-foreground">
                    {item?.from}
                  </div>
                </td>
                
                <td className="p-3 bg-card sticky left-48 z-10 border-r border-border">
                  <div className="text-sm font-medium text-foreground">
                    {item?.to}
                  </div>
                </td>
                
                <td className="p-3 bg-card sticky left-96 z-10 border-r border-border">
                  <div className="text-sm text-muted-foreground">
                    {getVehicleSizeDisplay(item?.vehicleSize)}
                  </div>
                </td>
                
                <td className="p-3 bg-card sticky left-144 z-10 border-r border-border">
                  <div className="text-sm text-muted-foreground">
                    {item?.load}
                  </div>
                </td>
                
                <td className="p-3 bg-card sticky left-192 z-10 border-r border-border">
                  <div className="text-sm text-muted-foreground">
                    {item?.dimensions}
                  </div>
                </td>

                <td className="p-3 bg-card sticky left-240 z-10 border-r border-border">
                  <div className="text-sm font-medium text-foreground">
                    {item?.frequency} trips/month
                  </div>
                </td>

                <td className="p-3 bg-card sticky left-288 z-10 border-r border-border">
                  {(() => {
                    const lowestQuote = suppliers?.reduce((lowest, supplier) => {
                      const quote = supplier?.quotes?.find(q => q?.itemId === item?.id);
                      const monthlyTotal = quote?.monthlyTotal || 0;
                      return !lowest || monthlyTotal < lowest?.price ? { supplier: supplier?.name, price: monthlyTotal } : lowest;
                    }, null);
                    
                    return lowestQuote ? (
                      <div className="text-sm">
                        <div className="font-medium text-green-700 dark:text-green-400">
                          {lowestQuote?.supplier}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ₹{lowestQuote?.price?.toFixed(2)}/month
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">-</div>
                    );
                  })()}
                </td>

                {/* Dynamic Quote Columns */}
                {suppliers?.map((supplier) => {
                  const quote = supplier?.quotes?.find(q => q?.itemId === item?.id);
                  
                  return (
                    <td key={supplier?.id} className="p-3 border-r border-border">
                      {quote ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div>
                              <div className="text-xs text-muted-foreground font-medium">
                                {supplier?.name}
                              </div>
                              <div className="text-sm font-medium text-foreground">
                                ₹{quote?.unitPrice?.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-primary">
                                ₹{quote?.monthlyTotal?.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                per month
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            {quote?.attachment ? (
                              <div className="inline-flex items-center space-x-1 p-1 bg-green-50 rounded border border-green-200">
                                <AppIcon name="FileCheck" size={12} className="text-green-600" />
                                <span className="text-xs text-green-700">{quote?.attachment}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">No attachment</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center">
                          No quote
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Admin Approval Column */}
                <td className="p-3 border-r border-border bg-orange-50/50 dark:bg-orange-950/10">
                  <div className="space-y-3">
                    {/* Final Supplier Section */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-orange-800 dark:text-orange-200 mb-1">
                        Final Supplier
                      </div>
                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="Vendor Code"
                          value={adminApproval?.[item?.id]?.finalSupplier?.vendorCode || ''}
                          onChange={(e) => onFinalSupplierChange?.(item?.id, 'vendorCode', e?.target?.value)}
                          className="w-full px-2 py-1 text-xs border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <input
                          type="text"
                          placeholder="Vendor Name"
                          value={adminApproval?.[item?.id]?.finalSupplier?.vendorName || ''}
                          onChange={(e) => onFinalSupplierChange?.(item?.id, 'vendorName', e?.target?.value)}
                          className="w-full px-2 py-1 text-xs border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    {/* Final Price Section */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-orange-800 dark:text-orange-200 mb-1">
                        Final Price
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Enter final price"
                        value={adminApproval?.[item?.id]?.finalPrice || ''}
                        onChange={(e) => onFinalPriceChange?.(item?.id, e?.target?.value)}
                        className="w-full px-2 py-1 text-xs border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    {/* Sum Amount Section */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-orange-800 dark:text-orange-200 mb-1">
                        Sum Amount
                      </div>
                      <div className="text-sm font-semibold text-primary bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                        ₹{calculateSumAmount?.(item?.id, parseInt(item?.frequency) || 1) || '0.00'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Frequency: {item?.frequency} × Final Price
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="border-b-2 border-primary/20 bg-primary/5 font-semibold">
              <td className="p-4 bg-card sticky left-0 z-10 border-r border-border text-primary font-bold">
                Total Monthly Cost
              </td>
              <td className="p-4 bg-card sticky left-48 z-10 border-r border-border"></td>
              <td className="p-4 bg-card sticky left-96 z-10 border-r border-border"></td>
              <td className="p-4 bg-card sticky left-144 z-10 border-r border-border"></td>
              <td className="p-4 bg-card sticky left-192 z-10 border-r border-border"></td>
              <td className="p-4 bg-card sticky left-240 z-10 border-r border-border"></td>
              <td className="p-4 bg-card sticky left-288 z-10 border-r border-border"></td>
              
              {suppliers?.map((supplier) => (
                <td key={supplier?.id} className="p-4 border-r border-border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      ₹{supplier?.totalQuote?.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Monthly Total
                    </div>
                  </div>
                </td>
              ))}

              {/* Admin Total Column */}
              <td className="p-4 border-r border-border bg-orange-50/50 dark:bg-orange-950/10">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    ₹{items?.reduce((total, item) => {
                      const sumAmount = parseFloat(calculateSumAmount?.(item?.id, parseInt(item?.frequency) || 1) || 0);
                      return total + sumAmount;
                    }, 0)?.toFixed(2)}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Admin Total
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransportQuotationTable;