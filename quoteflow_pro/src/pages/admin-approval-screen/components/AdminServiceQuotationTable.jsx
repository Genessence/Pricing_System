import React from 'react';
import AppIcon from '../../../components/AppIcon';

const AdminServiceQuotationTable = ({ 
  suppliers = [], 
  items = [], 
  serviceDocuments = {},
  commodityType = 'Service',
  adminApproval = {},
  onFinalSupplierChange,
  onFinalPriceChange,
  calculateSumAmount
}) => {
  // Convert commodityType to the correct format for state access
  const commodityTypeKey = "SERVICE"; // Service table always uses SERVICE
  // Get supplier name by ID
  const getSupplierName = (supplierId) => {
    const supplier = suppliers?.find(s => s?.id === supplierId);
    return supplier ? supplier?.name : 'Unknown Supplier';
  };

  if (!items?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <AppIcon name="Table" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No service quotation data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Service Quotation Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            {/* Service Table Header */}
            <thead className="bg-muted border-b border-border sticky top-0 z-20">
              {/* Service Header Row */}
              <tr className="bg-primary/10">
                <th colSpan={6} className="p-3 text-center border-r border-border">
                  <div className="flex items-center justify-center space-x-2">
                    <AppIcon name="Wrench" size={18} className="text-primary" />
                    <span className="text-base font-bold text-primary">Service Quotation (Read-Only)</span>
                  </div>
                </th>
                
                {suppliers?.map((supplier, index) => (
                  <th key={supplier?.id} className="p-3 text-center border-r border-border min-w-72">
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
                <th className="p-4 text-left bg-card sticky left-0 z-30 border-r border-border min-w-52">
                  <div className="flex items-center space-x-2">
                    <AppIcon name="Briefcase" size={16} />
                    <span className="text-sm font-semibold text-foreground">Project Name</span>
                  </div>
                </th>
                
                <th className="p-4 text-left bg-card sticky left-52 z-30 border-r border-border min-w-64">
                  <div className="flex items-center space-x-2">
                    <AppIcon name="FileText" size={16} />
                    <span className="text-sm font-semibold text-foreground">Description</span>
                  </div>
                </th>
                
                <th className="p-4 text-left bg-card sticky left-116 z-30 border-r border-border min-w-56">
                  <div className="flex items-center space-x-2">
                    <AppIcon name="ClipboardList" size={16} />
                    <span className="text-sm font-semibold text-foreground">Specification</span>
                  </div>
                </th>
                
                <th className="p-4 text-left bg-card sticky left-172 z-30 border-r border-border min-w-24">
                  <div className="flex items-center space-x-2">
                    <AppIcon name="Ruler" size={16} />
                    <span className="text-sm font-semibold text-foreground">UOM</span>
                  </div>
                </th>
                
                <th className="p-4 text-left bg-card sticky left-196 z-30 border-r border-border min-w-28">
                  <div className="flex items-center space-x-2">
                    <AppIcon name="Hash" size={16} />
                    <span className="text-sm font-semibold text-foreground">Req Qty</span>
                  </div>
                </th>

                <th className="p-4 text-left bg-card sticky left-224 z-30 border-r border-border min-w-48">
                  <div className="flex items-center space-x-2">
                    <AppIcon name="Lightbulb" size={16} />
                    <span className="text-sm font-semibold text-foreground">Suggestion</span>
                  </div>
                </th>

                {/* Service Quote Column Headers */}
                {suppliers?.map((supplier, index) => (
                  <th key={supplier?.id} className="p-4 text-left border-r border-border min-w-72">
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground font-medium mb-2">
                          {supplier?.name}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="text-center">
                            <div className="text-muted-foreground font-medium">Rate</div>
                            <div className="text-muted-foreground">per unit</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground font-medium">Total Amount</div>
                            <div className="text-muted-foreground">calculated</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground font-medium">Attachment</div>
                            <div className="text-muted-foreground">files</div>
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
              {/* Service Item Rows */}
              {items?.map((item) => (
                <tr key={item?.id} className="border-b border-border hover:bg-muted/50">
                  {/* Fixed Left Columns */}
                  <td className="p-3 bg-card sticky left-0 z-10 border-r border-border">
                    <div className="text-sm font-medium text-foreground">
                      {item?.projectName}
                    </div>
                  </td>
                  
                  <td className="p-3 bg-card sticky left-52 z-10 border-r border-border">
                    <div className="text-sm text-muted-foreground max-w-64 line-clamp-2">
                      {item?.description}
                    </div>
                  </td>
                  
                  <td className="p-3 bg-card sticky left-116 z-10 border-r border-border">
                    <div className="text-sm text-muted-foreground max-w-56 line-clamp-2">
                      {item?.specifications}
                    </div>
                  </td>
                  
                  <td className="p-3 bg-card sticky left-172 z-10 border-r border-border">
                    <div className="text-sm text-muted-foreground">
                      {item?.uom}
                    </div>
                  </td>
                  
                  <td className="p-3 bg-card sticky left-196 z-10 border-r border-border">
                    <div className="text-sm font-medium text-foreground">
                      {item?.requiredQuantity}
                    </div>
                  </td>

                  <td className="p-3 bg-card sticky left-224 z-10 border-r border-border">
                    {(() => {
                      const lowestQuote = suppliers?.reduce((lowest, supplier) => {
                        const quote = supplier?.quotes?.find(q => q?.itemId === item?.id);
                        const total = quote?.totalPrice || 0;
                        return !lowest || total < lowest?.price ? { supplier: supplier?.name, price: total } : lowest;
                      }, null);
                      
                      return lowestQuote ? (
                        <div className="text-sm">
                          <div className="font-medium text-green-700 dark:text-green-400">
                            {lowestQuote?.supplier}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ₹{lowestQuote?.price?.toFixed(2)}
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
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  ₹{quote?.unitPrice?.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-primary">
                                  ₹{quote?.totalPrice?.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                {quote?.attachment ? (
                                  <div className="flex items-center justify-center">
                                    <div className="p-1 bg-green-50 rounded border border-green-200">
                                      <AppIcon name="FileCheck" size={12} className="text-green-600" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">No file</div>
                                )}
                              </div>
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
                          <select
                            value={adminApproval?.[commodityTypeKey]?.[item?.id]?.finalSupplier?.vendorName || ''}
                            onChange={(e) => onFinalSupplierChange?.(item?.id, 'vendorName', e?.target?.value)}
                            className="w-full px-2 py-1 text-xs border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Select Vendor</option>
                            {suppliers?.map((supplier, index) => (
                              <option key={supplier?.id || index} value={supplier?.name}>
                                {supplier?.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Final Price Section */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-orange-800 dark:text-orange-200 mb-1">
                          Final Total Price
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Enter total price"
                          value={adminApproval?.[commodityTypeKey]?.[item?.id]?.totalPrice || ''}
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
                          ₹{calculateSumAmount?.(item?.id, item?.requiredQuantity) || '0.00'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Qty: {item?.requiredQuantity} × Final Price
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="border-b-2 border-primary/20 bg-primary/5 font-semibold">
                <td className="p-4 bg-card sticky left-0 z-10 border-r border-border text-primary font-bold">
                  Total Amount
                </td>
                <td className="p-4 bg-card sticky left-52 z-10 border-r border-border"></td>
                <td className="p-4 bg-card sticky left-116 z-10 border-r border-border"></td>
                <td className="p-4 bg-card sticky left-172 z-10 border-r border-border"></td>
                <td className="p-4 bg-card sticky left-196 z-10 border-r border-border"></td>
                <td className="p-4 bg-card sticky left-224 z-10 border-r border-border"></td>
                
                {suppliers?.map((supplier) => (
                  <td key={supplier?.id} className="p-4 border-r border-border">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        ₹{supplier?.totalQuote?.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Total Cost
                      </div>
                    </div>
                  </td>
                ))}

                {/* Admin Total Column */}
                <td className="p-4 border-r border-border bg-orange-50/50 dark:bg-orange-950/10">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      ₹{items?.reduce((total, item) => {
                        const sumAmount = parseFloat(calculateSumAmount?.(item?.id, item?.requiredQuantity) || 0);
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
      {/* Service Documentation Section */}
      {serviceDocuments && (Object.keys(serviceDocuments)?.length > 0) && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <AppIcon name="FileText" size={20} />
              <span>Service Documentation (Submitted)</span>
            </h3>
            <div className="text-sm text-muted-foreground">
              Documents as uploaded by quotation team
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Signed BOO */}
            {serviceDocuments?.signedBOO && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AppIcon name="FileCheck" size={14} className="text-green-600" />
                  <span className="text-sm font-medium text-foreground">Signed BOO</span>
                  <span className="text-xs text-green-600">✓ Uploaded</span>
                </div>
                <div className="p-3 bg-muted rounded border border-border">
                  <div className="flex items-center space-x-2">
                    <AppIcon name="FileText" size={16} className="text-primary" />
                    <span className="text-sm text-foreground">{serviceDocuments?.signedBOO?.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Signed Drawing */}
            {serviceDocuments?.signedDrawing && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AppIcon name="FileCheck" size={14} className="text-green-600" />
                  <span className="text-sm font-medium text-foreground">Signed Drawing</span>
                  <span className="text-xs text-green-600">✓ Uploaded</span>
                </div>
                <div className="p-3 bg-muted rounded border border-border">
                  <div className="flex items-center space-x-2">
                    <AppIcon name="FileText" size={16} className="text-primary" />
                    <span className="text-sm text-foreground">{serviceDocuments?.signedDrawing?.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Summary */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AppIcon name="CheckCircle" size={14} className="text-green-600" />
                <span className="text-sm font-medium text-foreground">Documentation Status</span>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
                <div className="text-sm text-green-800 dark:text-green-200">
                  All required documents submitted
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Ready for approval
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceQuotationTable;