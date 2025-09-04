import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import TopNavigationBar from '../../../components/ui/TopNavigationBar';
import BreadcrumbTrail from '../../../components/ui/BreadcrumbTrail';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';
import apiService from '../../../services/api';

const UserQuotationDetail = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuotation = async () => {
      try {
        console.log('Loading quotation with ID:', quotationId);
        const quotationData = await apiService.getRFQ(quotationId);
        console.log('Found quotation data:', quotationData);
        setQuotation(quotationData);
      } catch (error) {
        console.error('Error loading quotation:', error);
        // Quotation not found or error occurred
      } finally {
        setLoading(false);
      }
    };

    loadQuotation();
  }, [quotationId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getCommodityTypeColor = (type) => {
    switch (type) {
      case 'provided_data':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'service':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'transport':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/user-dashboard' },
    { label: 'Quotation Details', path: `/user-dashboard/${quotationId}` }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigationBar user={user} />
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center space-x-2">
            <Icon name="Loader" size={24} className="animate-spin text-primary" />
            <span className="text-muted-foreground">Loading quotation details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigationBar user={user} />
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center">
              <Icon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Quotation Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The quotation you're looking for doesn't exist or has been removed.
              </p>
              <button
                onClick={() => navigate('/user-dashboard')}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderProvidedDataTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        {/* Table Header */}
        <thead className="bg-muted border-b border-border sticky top-0 z-20">
          <tr>
            {/* Fixed Left Column Headers - Matching user form structure */}
            <th className="p-2 text-left bg-card sticky left-0 z-30 border-r border-border min-w-36">
              <div className="flex items-center space-x-1">
                <Icon name="Package" size={14} />
                <span className="text-xs font-semibold text-foreground">Item</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-36 z-30 border-r border-border min-w-36">
              <div className="flex items-center space-x-1">
                <Icon name="FileText" size={14} />
                <span className="text-xs font-semibold text-foreground">Description</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-96 z-30 border-r border-border min-w-48">
              <div className="flex items-center space-x-1">
                <Icon name="FileText" size={14} />
                <span className="text-xs font-semibold text-foreground">Specification</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-144 z-30 border-r border-border min-w-24">
              <div className="flex items-center space-x-1">
                <Icon name="Hash" size={14} />
                <span className="text-xs font-semibold text-foreground">Qty</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-168 z-30 border-r border-border min-w-24">
              <div className="flex items-center space-x-1">
                <Icon name="Ruler" size={14} />
                <span className="text-xs font-semibold text-foreground">UOM</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-192 z-30 border-r border-border min-w-32">
              <div className="flex items-center space-x-1">
                <Icon name="DollarSign" size={14} />
                <span className="text-xs font-semibold text-foreground">Last Price</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-224 z-30 border-r border-border min-w-40">
              <div className="flex items-center space-x-1">
                <Icon name="Building" size={14} />
                <span className="text-xs font-semibold text-foreground">Last Vendor</span>
              </div>
            </th>
            
            {/* Quote Columns */}
            {quotation.quotes && quotation.quotes.length > 0 ? (
              quotation.quotes.map((quote, index) => (
                <th key={index} className="p-2 text-center bg-muted border-r border-border min-w-32">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-semibold text-foreground">Quote {index + 1}</span>
                    <span className="text-xs text-muted-foreground">{quote.supplierId || `Supplier ${index + 1}`}</span>
                  </div>
                </th>
              ))
            ) : (
              <th className="p-2 text-center bg-muted border-r border-border min-w-32">
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-xs font-semibold text-foreground">No Quotes</span>
                  <span className="text-xs text-muted-foreground">Awaiting Suppliers</span>
                </div>
              </th>
            )}
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="divide-y divide-border">
          {quotation.items?.map((item, itemIndex) => (
            <tr key={itemIndex} className="hover:bg-muted/30">
              {/* Fixed Left Columns */}
              <td className="p-2 bg-card sticky left-0 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.item_code || item.vendorCode || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-36 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.description || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-96 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.specifications || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-144 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.required_quantity || item.requiredQuantity || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-168 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.unit_of_measure || item.uom || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-192 z-20 border-r border-border">
                <span className="text-sm text-foreground">{(item.last_buying_price || item.lastBuyingPrice) ? formatCurrency(item.last_buying_price || item.lastBuyingPrice) : '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-224 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.last_vendor || item.lastVendor || '-'}</span>
              </td>
              
              {/* Quote Columns */}
              {quotation.quotes && quotation.quotes.length > 0 ? (
                quotation.quotes.map((quote, quoteIndex) => (
                  <td key={quoteIndex} className="p-2 text-center border-r border-border">
                    <span className="text-sm text-foreground">
                      {quote.rates?.[item.id] ? formatCurrency(quote.rates[item.id]) : '-'}
                    </span>
                  </td>
                ))
              ) : (
                <td className="p-2 text-center border-r border-border">
                  <span className="text-sm text-foreground">-</span>
                </td>
              )}
            </tr>
          ))}
          
                     {/* Footer Rows */}
           <tr className="bg-muted/30 font-medium">
             <td colSpan={7} className="p-2 text-sm text-foreground border-r border-border">
               Transportation/Freight
             </td>
             {quotation.quotes && quotation.quotes.length > 0 ? (
               quotation.quotes.map((quote, index) => (
                 <td key={index} className="p-2 text-center border-r border-border">
                   <span className="text-sm text-foreground">{quote.footer?.transportation_freight || '-'}</span>
                 </td>
               ))
             ) : (
               <td className="p-2 text-center border-r border-border">
                 <span className="text-sm text-foreground">-</span>
               </td>
             )}
           </tr>
           
           <tr className="bg-muted/20 font-medium">
             <td colSpan={7} className="p-2 text-sm text-foreground border-r border-border">
               Packing Charges
             </td>
             {quotation.quotes && quotation.quotes.length > 0 ? (
               quotation.quotes.map((quote, index) => (
                 <td key={index} className="p-2 text-center border-r border-border">
                   <span className="text-sm text-foreground">{quote.footer?.packing_charges || '-'}</span>
                 </td>
               ))
             ) : (
               <td className="p-2 text-center border-r border-border">
                 <span className="text-sm text-foreground">-</span>
               </td>
             )}
           </tr>
           
           <tr className="bg-muted/30 font-medium">
             <td colSpan={7} className="p-2 text-sm text-foreground border-r border-border">
               Delivery Lead Time
             </td>
             {quotation.quotes && quotation.quotes.length > 0 ? (
               quotation.quotes.map((quote, index) => (
                 <td key={index} className="p-2 text-center border-r border-border">
                   <span className="text-sm text-foreground">{quote.footer?.delivery_lead_time || '-'}</span>
                 </td>
               ))
             ) : (
               <td className="p-2 text-center border-r border-border">
                 <span className="text-sm text-foreground">-</span>
               </td>
             )}
           </tr>
           
           <tr className="bg-muted/20 font-medium">
             <td colSpan={7} className="p-2 text-sm text-foreground border-r border-border">
               Warranty
             </td>
             {quotation.quotes && quotation.quotes.length > 0 ? (
               quotation.quotes.map((quote, index) => (
                 <td key={index} className="p-2 text-center border-r border-border">
                   <span className="text-sm text-foreground">{quote.footer?.warranty || '-'}</span>
                 </td>
               ))
             ) : (
               <td className="p-2 text-center border-r border-border">
                 <span className="text-sm text-foreground">-</span>
               </td>
             )}
           </tr>
           
           <tr className="bg-muted/30 font-medium">
             <td colSpan={7} className="p-2 text-sm text-foreground border-r border-border">
               Currency
             </td>
             {quotation.quotes && quotation.quotes.length > 0 ? (
               quotation.quotes.map((quote, index) => (
                 <td key={index} className="p-2 text-center border-r border-border">
                   <span className="text-sm text-foreground">{quote.footer?.currency || '-'}</span>
                 </td>
               ))
             ) : (
               <td className="p-2 text-center border-r border-border">
                 <span className="text-sm text-foreground">-</span>
               </td>
             )}
           </tr>
           
           <tr className="bg-muted/20 font-medium">
             <td colSpan={7} className="p-2 text-sm text-foreground border-r border-border">
               Remarks of Quotation
             </td>
             {quotation.quotes && quotation.quotes.length > 0 ? (
               quotation.quotes.map((quote, index) => (
                 <td key={index} className="p-2 text-center border-r border-border">
                   <span className="text-sm text-foreground">{quote.footer?.remarks_of_quotation || '-'}</span>
                 </td>
               ))
             ) : (
               <td className="p-2 text-center border-r border-border">
                 <span className="text-sm text-foreground">-</span>
               </td>
             )}
           </tr>
           
           <tr className="bg-primary/5 font-bold">
             <td colSpan={7} className="p-2 text-sm text-foreground border-r border-border">
               Total Amount
             </td>
             {quotation.quotes && quotation.quotes.length > 0 ? (
               quotation.quotes.map((quote, index) => (
                 <td key={index} className="p-2 text-center border-r border-border">
                   <span className="text-sm text-foreground">{(quotation.total_value || quotation.totalValue) ? formatCurrency(quotation.total_value || quotation.totalValue) : '-'}</span>
                 </td>
               ))
             ) : (
               <td className="p-2 text-center border-r border-border">
                 <span className="text-sm text-foreground">{(quotation.total_value || quotation.totalValue) ? formatCurrency(quotation.total_value || quotation.totalValue) : '-'}</span>
               </td>
             )}
           </tr>
        </tbody>
      </table>
    </div>
  );

  const renderServiceTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        {/* Table Header */}
        <thead className="bg-muted border-b border-border sticky top-0 z-20">
          <tr>
            {/* Fixed Left Column Headers - Matching user form structure */}
            <th className="p-2 text-left bg-card sticky left-0 z-30 border-r border-border min-w-48">
              <div className="flex items-center space-x-1">
                <Icon name="FileText" size={14} />
                <span className="text-xs font-semibold text-foreground">Description</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-48 z-30 border-r border-border min-w-48">
              <div className="flex items-center space-x-1">
                <Icon name="FileText" size={14} />
                <span className="text-xs font-semibold text-foreground">Specifications</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-96 z-30 border-r border-border min-w-24">
              <div className="flex items-center space-x-1">
                <Icon name="Ruler" size={14} />
                <span className="text-xs font-semibold text-foreground">UOM</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-120 z-30 border-r border-border min-w-24">
              <div className="flex items-center space-x-1">
                <Icon name="Hash" size={14} />
                <span className="text-xs font-semibold text-foreground">Qty</span>
              </div>
            </th>
            
            {/* Quote Columns */}
            {quotation.quotes && quotation.quotes.length > 0 ? (
              quotation.quotes.map((quote, index) => (
                <th key={index} className="p-2 text-center bg-muted border-r border-border min-w-32">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-semibold text-foreground">Quote {index + 1}</span>
                    <span className="text-xs text-muted-foreground">{quote.supplierId || `Supplier ${index + 1}`}</span>
                  </div>
                </th>
              ))
            ) : (
              <th className="p-2 text-center bg-muted border-r border-border min-w-32">
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-xs font-semibold text-foreground">No Quotes</span>
                  <span className="text-xs text-muted-foreground">Awaiting Suppliers</span>
                </div>
              </th>
            )}
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="divide-y divide-border">
          {quotation.items?.map((item, itemIndex) => (
            <tr key={itemIndex} className="hover:bg-muted/30">
              {/* Fixed Left Columns */}
              <td className="p-2 bg-card sticky left-0 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.description || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-48 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.specifications || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-96 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.unit_of_measure || item.uom || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-120 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.required_quantity || item.requiredQuantity || '-'}</span>
              </td>
              
              {/* Quote Columns */}
              {quotation.quotes && quotation.quotes.length > 0 ? (
                quotation.quotes.map((quote, quoteIndex) => (
                  <td key={quoteIndex} className="p-2 text-center border-r border-border">
                    <span className="text-sm text-foreground">
                      {quote.rates?.[item.id] ? formatCurrency(quote.rates[item.id]) : '-'}
                    </span>
                  </td>
                ))
              ) : (
                <td className="p-2 text-center border-r border-border">
                  <span className="text-sm text-foreground">-</span>
                </td>
              )}
            </tr>
          ))}
          
                     {/* Footer Row - Only Total Amount for Service */}
           <tr className="bg-primary/5 font-bold">
             <td colSpan={4} className="p-2 text-sm text-foreground border-r border-border">
               Total Amount
             </td>
             {quotation.quotes && quotation.quotes.length > 0 ? (
               quotation.quotes.map((quote, index) => (
                 <td key={index} className="p-2 text-center border-r border-border">
                   <span className="text-sm text-foreground">{(quotation.total_value || quotation.totalValue) ? formatCurrency(quotation.total_value || quotation.totalValue) : '-'}</span>
                 </td>
               ))
             ) : (
               <td className="p-2 text-center border-r border-border">
                 <span className="text-sm text-foreground">{(quotation.total_value || quotation.totalValue) ? formatCurrency(quotation.total_value || quotation.totalValue) : '-'}</span>
               </td>
             )}
           </tr>
        </tbody>
      </table>
    </div>
  );

  const renderTransportTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        {/* Table Header */}
        <thead className="bg-muted border-b border-border sticky top-0 z-20">
          <tr>
            {/* Fixed Left Column Headers - Matching user form structure */}
            <th className="p-2 text-left bg-card sticky left-0 z-30 border-r border-border min-w-32">
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={14} />
                <span className="text-xs font-semibold text-foreground">From</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-32 z-30 border-r border-border min-w-32">
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={14} />
                <span className="text-xs font-semibold text-foreground">To</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-64 z-30 border-r border-border min-w-32">
              <div className="flex items-center space-x-1">
                <Icon name="Truck" size={14} />
                <span className="text-xs font-semibold text-foreground">Vehicle Size</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-96 z-30 border-r border-border min-w-32">
              <div className="flex items-center space-x-1">
                <Icon name="Package" size={14} />
                <span className="text-xs font-semibold text-foreground">Load</span>
              </div>
            </th>
            
            <th className="p-2 text-left bg-card sticky left-128 z-30 border-r border-border min-w-24">
              <div className="flex items-center space-x-1">
                <Icon name="Repeat" size={14} />
                <span className="text-xs font-semibold text-foreground">Freq</span>
              </div>
            </th>
            
            {/* Quote Columns */}
            {quotation.quotes && quotation.quotes.length > 0 ? (
              quotation.quotes.map((quote, index) => (
                <th key={index} className="p-2 text-center bg-muted border-r border-border min-w-32">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-semibold text-foreground">Quote {index + 1}</span>
                    <span className="text-xs text-muted-foreground">{quote.supplierId || `Supplier ${index + 1}`}</span>
                  </div>
                </th>
              ))
            ) : (
              <th className="p-2 text-center bg-muted border-r border-border min-w-32">
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-xs font-semibold text-foreground">No Quotes</span>
                  <span className="text-xs text-muted-foreground">Awaiting Suppliers</span>
                </div>
              </th>
            )}
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="divide-y divide-border">
          {quotation.items?.map((item, itemIndex) => (
            <tr key={itemIndex} className="hover:bg-muted/30">
              {/* Fixed Left Columns */}
              <td className="p-2 bg-card sticky left-0 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.from || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-32 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.to || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-64 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.vehicleSize || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-96 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.load || '-'}</span>
              </td>
              
              <td className="p-2 bg-card sticky left-128 z-20 border-r border-border">
                <span className="text-sm text-foreground">{item.frequency || '-'}</span>
              </td>
              
              {/* Quote Columns */}
              {quotation.quotes && quotation.quotes.length > 0 ? (
                quotation.quotes.map((quote, quoteIndex) => (
                  <td key={quoteIndex} className="p-2 text-center border-r border-border">
                    <span className="text-sm text-foreground">
                      {quote.rates?.[item.id] ? formatCurrency(quote.rates[item.id]) : '-'}
                    </span>
                  </td>
                ))
              ) : (
                <td className="p-2 text-center border-r border-border">
                  <span className="text-sm text-foreground">-</span>
                </td>
              )}
            </tr>
          ))}
          
                     {/* Footer Row - Only Total Amount for Transport */}
           <tr className="bg-primary/5 font-bold">
             <td colSpan={5} className="p-2 text-sm text-foreground border-r border-border">
               Total Amount
             </td>
             {quotation.quotes && quotation.quotes.length > 0 ? (
               quotation.quotes.map((quote, index) => (
                 <td key={index} className="p-2 text-center border-r border-border">
                   <span className="text-sm text-foreground">{(quotation.total_value || quotation.totalValue) ? formatCurrency(quotation.total_value || quotation.totalValue) : '-'}</span>
                 </td>
               ))
             ) : (
               <td className="p-2 text-center border-r border-border">
                 <span className="text-sm text-foreground">{(quotation.total_value || quotation.totalValue) ? formatCurrency(quotation.total_value || quotation.totalValue) : '-'}</span>
               </td>
             )}
           </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNavigationBar user={user} />
      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <BreadcrumbTrail items={breadcrumbItems} />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Quotation Details
                </h1>
                <p className="text-muted-foreground mt-2">
                  View detailed information about your submitted quotation request
                </p>
              </div>
              <button
                onClick={() => navigate('/user-dashboard')}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Quotation Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="Hash" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Request ID</p>
                  <p className="text-lg font-semibold text-foreground">{quotation.rfq_number || quotation.id}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Icon name="Package" size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commodity Type</p>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1",
                    getCommodityTypeColor(quotation.commodity_type || quotation.commodityType)
                  )}>
                    {(quotation.commodity_type || quotation.commodityType) === 'provided_data' ? 'Provided Data' :
                     (quotation.commodity_type || quotation.commodityType) === 'service' ? 'Service' :
                     (quotation.commodity_type || quotation.commodityType) === 'transport' ? 'Transport' : (quotation.commodity_type || quotation.commodityType)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1",
                    getStatusColor(quotation.status)
                  )}>
                    {quotation.status === 'pending' ? 'Pending Review' :
                     quotation.status === 'approved' ? 'Approved' :
                     quotation.status === 'rejected' ? 'Rejected' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          </div>

                     {/* Form Configuration Section */}
           {/* <div className="bg-card border border-border rounded-lg p-6 shadow-sm mb-8">
             <h2 className="text-xl font-semibold text-foreground mb-4">Form Configuration</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div>
                 <p className="text-sm font-medium text-muted-foreground mb-1">Product Type</p>
                 <p className="text-foreground">{quotation.productType || 'Not specified'}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-muted-foreground mb-1">Work Type</p>
                 <p className="text-foreground">{quotation.workType || 'Not specified'}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-muted-foreground mb-1">Priority</p>
                 <p className="text-foreground">{quotation.priority || 'Not specified'}</p>
               </div>
               {quotation.serviceProjectName && (
                 <div>
                   <p className="text-sm font-medium text-muted-foreground mb-1">Project Name</p>
                   <p className="text-foreground">{quotation.serviceProjectName}</p>
                 </div>
               )}
               <div>
                 <p className="text-sm font-medium text-muted-foreground mb-1">Requested By</p>
                 <p className="text-foreground">{quotation.requestedBy || 'Not specified'}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-muted-foreground mb-1">Plant</p>
                 <p className="text-foreground">{quotation.plant || 'Not specified'}</p>
               </div>
               <div className="md:col-span-2 lg:col-span-3">
                 <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                 <p className="text-foreground">{quotation.description || 'No description provided'}</p>
               </div>
               <div className="md:col-span-2 lg:col-span-3">
                 <p className="text-sm font-medium text-muted-foreground mb-1">Submitted Date</p>
                 <p className="text-foreground">
                   {new Date(quotation.created_at || quotation.submittedAt || Date.now()).toLocaleDateString('en-US', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit'
                   })}
                 </p>
               </div>
             </div>
           </div> */}

          {/* Attached Documents */}
          {(quotation.attachments?.boqFile || quotation.attachments?.drawingFile || quotation.attachments?.quoteFiles) && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Attached Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quotation.attachments?.boqFile && (
                  <div className="flex items-center p-3 border border-border rounded-lg">
                    <Icon name="FileText" size={20} className="text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-foreground">BOQ File</p>
                      <p className="text-xs text-muted-foreground">Bill of Quantities</p>
                    </div>
                  </div>
                )}
                {quotation.attachments?.drawingFile && (
                  <div className="flex items-center p-3 border border-border rounded-lg">
                    <Icon name="Image" size={20} className="text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Drawing File</p>
                      <p className="text-xs text-muted-foreground">Technical Drawing</p>
                    </div>
                  </div>
                )}
                {quotation.attachments?.quoteFiles && Object.keys(quotation.attachments.quoteFiles).map((key, index) => (
                  <div key={index} className="flex items-center p-3 border border-border rounded-lg">
                    <Icon name="File" size={20} className="text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Quote File {index + 1}</p>
                      <p className="text-xs text-muted-foreground">Additional Document</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

                     {/* Submitted Form Table */}
           <div className="bg-card border border-border rounded-lg shadow-sm">
             <div className="p-6 border-b border-border">
               <h2 className="text-xl font-semibold text-foreground">Submitted Form</h2>
               <p className="text-muted-foreground mt-1">
                 This is the exact form you submitted for admin approval
               </p>
             </div>
             <div className="p-6">
               {(quotation.commodity_type || quotation.commodityType) === 'provided_data' && renderProvidedDataTable()}
               {(quotation.commodity_type || quotation.commodityType) === 'service' && renderServiceTable()}
               {(quotation.commodity_type || quotation.commodityType) === 'transport' && renderTransportTable()}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserQuotationDetail;
