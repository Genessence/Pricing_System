import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import TableHeader from './components/TableHeader';
import ERPItemRow from './components/ERPItemRow';
import ServiceItemRow from './components/ServiceItemRow';
import ServiceTableHeader from './components/ServiceTableHeader';
import TransportTableHeader from './components/TransportTableHeader';
import TransportItemRow from './components/TransportItemRow';
import FooterRow from './components/FooterRow';

import ExportControls from './components/ExportControls';
import SearchAndFilters from './components/SearchAndFilters';
import QuotationFormDropdowns from './components/QuotationFormDropdowns';
import { getCurrencyOptions } from '../../constants/currencies';
import Icon from '../../components/AppIcon';

const QuotationComparisonTable = () => {
  // Mock user data
  const mockUser = {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Procurement Manager",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  };

  // Mock notifications
  const mockNotifications = [
    {
      id: 1,
      type: 'info',
      title: 'New Quote Received',
      message: 'TechSupply Corp has submitted a quote for RFQ-2024-001',
      timestamp: new Date(Date.now() - 300000),
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Quote Deadline Approaching',
      message: 'RFQ-2024-003 deadline is in 2 days',
      timestamp: new Date(Date.now() - 1800000),
      read: false
    }
  ];

  // Mock ERP Items
  const mockERPItems = [
    {
      id: "ERP001",
      description: "Industrial Grade Steel Bolts",
      specifications: "M12x50mm, Grade 8.8, Zinc Plated",
      uom: "PCS",
      commodity: "Fasteners",
      lastBuyingPrice: 2.45,
      lastVendor: "MetalWorks Inc"
    },
    {
      id: "ERP002",
      description: "Hydraulic Pump Assembly",
      specifications: "Flow Rate: 25 GPM, Pressure: 3000 PSI",
      uom: "UNIT",
      commodity: "Hydraulics",
      lastBuyingPrice: 1250.00,
      lastVendor: "HydroTech Solutions"
    },
    {
      id: "ERP003",
      description: "Electronic Control Module",
      specifications: "24V DC, IP65 Rating, CAN Bus Interface",
      uom: "UNIT",
      commodity: "Electronics",
      lastBuyingPrice: 485.75,
      lastVendor: "ElectroSys Ltd"
    },
    {
      id: "ERP004",
      description: "Safety Valve Assembly",
      specifications: "1/2 inch NPT, Set Pressure: 150 PSI",
      uom: "UNIT",
      commodity: "Safety Equipment",
      lastBuyingPrice: 89.50,
      lastVendor: "SafeGuard Industries"
    },
    {
      id: "ERP005",
      description: "Bearing Set - Deep Groove",
      specifications: "6205-2RS, Sealed, ABEC-3 Rating",
      uom: "SET",
      commodity: "Bearings",
      lastBuyingPrice: 15.25,
      lastVendor: "Precision Bearings Co"
    }
  ];

  // Mock Suppliers
  const mockSuppliers = [
    {
      id: "SUP001",
      name: "TechSupply Corp",
      location: "Dallas, TX",
      email: "quotes@techsupply.com",
      phone: "+1-555-0123",
      rating: 4.8,
      vendorCode: "TS001"
    },
    {
      id: "SUP002",
      name: "Industrial Solutions Ltd",
      location: "Chicago, IL",
      email: "procurement@indsol.com",
      phone: "+1-555-0234",
      rating: 4.6,
      vendorCode: "IS002"
    },
    {
      id: "SUP003",
      name: "Global Manufacturing Inc",
      location: "Houston, TX",
      email: "sales@globalmfg.com",
      phone: "+1-555-0345",
      rating: 4.7,
      vendorCode: "GM003"
    },
    {
      id: "SUP004",
      name: "Precision Parts Co",
      location: "Detroit, MI",
      email: "quotes@precisionparts.com",
      phone: "+1-555-0456",
      rating: 4.9,
      vendorCode: "PP004"
    },
    {
      id: "SUP005",
      name: "Quality Components LLC",
      location: "Phoenix, AZ",
      email: "orders@qualitycomp.com",
      phone: "+1-555-0567",
      rating: 4.5,
      vendorCode: "QC005"
    }
  ];

  // Add mock service items
  const mockServiceItems = [
    {
      id: "SRV001",
      projectName: "Plant Maintenance Service",
      description: "Comprehensive maintenance service for manufacturing equipment",
      specifications: "Monthly preventive maintenance, emergency repairs, 24/7 support",
      uom: "PROJECT",
      requiredQuantity: 1
    },
    {
      id: "SRV002", 
      projectName: "Software Development",
      description: "Custom ERP module development and integration",
      specifications: "Full-stack development, testing, deployment, 6-month support",
      uom: "HOURS",
      requiredQuantity: 480
    },
    {
      id: "SRV003",
      projectName: "Training & Certification",
      description: "Employee training program for new safety protocols",
      specifications: "On-site training, certification, materials, follow-up assessments",
      uom: "DAYS",
      requiredQuantity: 5
    }
  ];

  // Add mock transport items
  const mockTransportItems = [
    {
      id: "TRP001",
      from: "Mumbai Port",
      to: "Delhi Warehouse",
      vehicleSize: "container_40ft",
      load: "Electronic Components",
      dimensions: "12m x 2.4m x 2.6m",
      frequency: "4"
    },
    {
      id: "TRP002",
      from: "Chennai Factory",
      to: "Bangalore Distribution Center",
      vehicleSize: "large",
      load: "Manufacturing Equipment",
      dimensions: "8m x 2m x 2m",
      frequency: "2"
    }
  ];

  // State management
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('standard');
  const [selectedWorkType, setSelectedWorkType] = useState('normal');
  const [items, setItems] = useState([
    {
      id: 1,
      description: "Industrial Grade Steel Bolts",
      vendorCode: "TS001",
      specifications: "M12x50mm, Grade 8.8, Zinc Plated",
      requiredQuantity: 500,
      uom: "PCS",
      commodity: "Fasteners",
      lastBuyingPrice: 2.45,
      lastVendor: "MetalWorks Inc"
    },
    {
      id: 2,
      description: "Hydraulic Pump Assembly",
      vendorCode: "IS002",
      specifications: "Flow Rate: 25 GPM, Pressure: 3000 PSI",
      requiredQuantity: 2,
      uom: "UNIT",
      commodity: "Hydraulics",
      lastBuyingPrice: 1250.00,
      lastVendor: "HydroTech Solutions"
    }
  ]);

  const [serviceItems, setServiceItems] = useState([
    {
      id: 1,
      projectName: "Plant Maintenance Service",
      description: "Comprehensive maintenance service for manufacturing equipment",
      specifications: "Monthly preventive maintenance, emergency repairs, 24/7 support",
      uom: "PROJECT",
      requiredQuantity: 1
    }
  ]);

  const [serviceDocuments, setServiceDocuments] = useState({
    signedBOO: null,
    signedDrawing: null,
    additionalFiles: []
  });

  const [quotes, setQuotes] = useState([
    {
      id: 1,
      supplierId: "SUP001",
      rates: { 1: 2.25, 2: 1180.00 },
      footer: {
        transportation_freight: "included",
        packing_charges: "extra",
        delivery_lead_time: "7-10 days",
        warranty: "12 months",
        currency: "USD",
        remarks_of_quotation: "Bulk discount applied for quantities over 1000 units"
      }
    },
    {
      id: 2,
      supplierId: "SUP002",
      rates: { 1: 2.35, 2: 1225.00 },
      footer: {
        transportation_freight: "extra",
        packing_charges: "included",
        delivery_lead_time: "5-7 days",
        warranty: "18 months",
        currency: "USD",
        remarks_of_quotation: "Express delivery available at additional cost"
      }
    }
  ]);

  const [transportItems, setTransportItems] = useState([
    {
      id: 1,
      from: "Mumbai Port",
      to: "Delhi Warehouse",
      vehicleSize: "container_40ft",
      load: "Electronic Components",
      dimensions: "12m x 2.4m x 2.6m",
      frequency: "4"
    }
  ]);

  const [attachedFiles, setAttachedFiles] = useState({});
  const [editingItems, setEditingItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [quotationsConfirmed, setQuotationsConfirmed] = useState(false);
  const [showQuotationDetails, setShowQuotationDetails] = useState(false);

  // Footer row configurations
  const footerRows = [
    {
      label: "Transportation/Freight",
      type: "text"
    },
    {
      label: "Packing Charges",
      type: "text"
    },
    {
      label: "Delivery Lead Time",
      type: "text"
    },
    {
      label: "Warranty",
      type: "text"
    },
    {
      label: "Currency",
      type: "select",
      options: getCurrencyOptions()
    },
    {
      label: "Remarks of Quotation",
      type: "textarea"
    }
  ];

  // Filtered items based on search and supplier filter
  const filteredItems = useMemo(() => {
    return items?.filter(item => {
      const matchesSearch = !searchTerm || 
        item?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        item?.specifications?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      const matchesSupplier = !supplierFilter || 
        quotes?.some(quote => quote?.supplierId === supplierFilter && quote?.rates?.[item?.id]);
      
      return matchesSearch && matchesSupplier;
    });
  }, [items, searchTerm, supplierFilter, quotes]);

  // Handlers
  const handleAddQuote = () => {
    if (quotes?.length < 5) {
      const newQuote = {
        id: Date.now(),
        supplierId: '',
        rates: {},
        footer: {}
      };
      setQuotes([...quotes, newQuote]);
    }
  };

  const handleRemoveQuote = (quoteIndex) => {
    const updatedQuotes = quotes?.filter((_, index) => index !== quoteIndex);
    setQuotes(updatedQuotes);
    
    // Remove associated files
    const newAttachedFiles = { ...attachedFiles };
    delete newAttachedFiles?.[quoteIndex];
    setAttachedFiles(newAttachedFiles);
  };

  const handleAddRow = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      vendorCode: '',
      specifications: '',
      requiredQuantity: 0,
      uom: '',
      commodity: '',
      lastBuyingPrice: 0,
      lastVendor: ''
    };
    setItems([...items, newItem]);
    setEditingItems(new Set([...editingItems, newItem.id]));
  };

  const handleItemUpdate = (itemId, updates) => {
    setItems(items?.map(item => 
      item?.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleQuoteUpdate = (itemId, quoteIndex, updates) => {
    const updatedQuotes = [...quotes];
    if (!updatedQuotes?.[quoteIndex]?.rates) {
      updatedQuotes[quoteIndex].rates = {};
    }
    updatedQuotes[quoteIndex].rates[itemId] = updates?.rate;
    setQuotes(updatedQuotes);
  };

  const handleSupplierChange = (quoteIndex, supplierId) => {
    const updatedQuotes = [...quotes];
    updatedQuotes[quoteIndex].supplierId = supplierId;
    setQuotes(updatedQuotes);
  };

  const handleFooterUpdate = (quoteIndex, field, value) => {
    const updatedQuotes = [...quotes];
    if (!updatedQuotes?.[quoteIndex]?.footer) {
      updatedQuotes[quoteIndex].footer = {};
    }
    updatedQuotes[quoteIndex].footer[field] = value;
    setQuotes(updatedQuotes);
  };

  const handleFileUpload = (quoteIndex, file) => {
    setAttachedFiles({
      ...attachedFiles,
      [quoteIndex]: file
    });
  };

  const handleFileRemove = (quoteIndex) => {
    const newAttachedFiles = { ...attachedFiles };
    delete newAttachedFiles?.[quoteIndex];
    setAttachedFiles(newAttachedFiles);
  };

  const handleDeleteRow = (itemId) => {
    setItems(items?.filter(item => item?.id !== itemId));
    setEditingItems(new Set([...editingItems].filter(id => id !== itemId)));
  };

  const handleDuplicateRow = (itemId) => {
    const itemToDuplicate = items?.find(item => item?.id === itemId);
    if (itemToDuplicate) {
      const newItem = {
        ...itemToDuplicate,
        id: Date.now()
      };
      setItems([...items, newItem]);
    }
  };

  const handleEditToggle = (itemId) => {
    const newEditingItems = new Set(editingItems);
    if (newEditingItems?.has(itemId)) {
      newEditingItems?.delete(itemId);
    } else {
      newEditingItems?.add(itemId);
    }
    setEditingItems(newEditingItems);
  };

  const handleConfirmQuotations = () => {
    setQuotationsConfirmed(true);
    setShowQuotationDetails(true);
  };

  const handleModifyQuotations = () => {
    setQuotationsConfirmed(false);
    setShowQuotationDetails(true);
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      const csvContent = generateCSVContent();
      downloadFile(csvContent, 'quotation-comparison.csv', 'text/csv');
      setIsExporting(false);
    }, 1000);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      // In a real application, you would generate PDF content here
      console.log('PDF export would be generated here');
      setIsExporting(false);
    }, 1500);
  };

  const generateCSVContent = () => {
    const headers = ['Description', 'Specifications', 'Req Qty', 'UOM', 'Last Price', 'Last Vendor'];
    quotes?.forEach((quote, index) => {
      const supplier = mockSuppliers?.find(s => s?.id === quote?.supplierId);
      headers?.push(`Quote ${index + 1} - ${supplier?.name || 'Unknown'}`);
    });

    const rows = [headers?.join(',')];
    
    filteredItems?.forEach(item => {
      const row = [
        `"${item?.description}"`,
        `"${item?.specifications}"`,
        item?.requiredQuantity,
        item?.uom,
        item?.lastBuyingPrice,
        `"${item?.lastVendor}"`
      ];
      
      quotes?.forEach(quote => {
        const rate = quote?.rates?.[item?.id] || 0;
        const amount = rate * item?.requiredQuantity;
        row?.push(amount?.toFixed(2));
      });
      
      rows?.push(row?.join(','));
    });

    return rows?.join('\n');
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link?.click();
    URL.revokeObjectURL(url);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSupplierFilter('');
  };

  const calculateTotalAmount = (quoteIndex) => {
    return filteredItems?.reduce((total, item) => {
      const quote = quotes?.[quoteIndex];
      const rate = quote?.rates?.[item?.id] || 0;
      return total + (rate * item?.requiredQuantity);
    }, 0);
  };

  // New dropdown handlers
  const handleCommodityChange = (value) => {
    setSelectedCommodity(value);
    
    // Show info message for non-implemented selections
    if (value === 'transport') {
      console.log(`${value} form will be available in future updates`);
    }
  };

  const handleProductTypeChange = (value) => {
    setSelectedProductType(value);
  };

  const handleWorkTypeChange = (value) => {
    setSelectedWorkType(value);
    
    // Show approval notice for urgent work
    if (value === 'urgent') {
      console.log('Urgent work requires Plant Head approval');
    }
  };

  // Determine which form to show
  const showProvidedDataForm = selectedCommodity === 'provided_data';
  const showServiceForm = selectedCommodity === 'service';
  const showTransportForm = selectedCommodity === 'transport';
  const showAnyForm = selectedCommodity && (showProvidedDataForm || showServiceForm || showTransportForm);

  // Transport handlers
  const handleTransportItemUpdate = (itemId, updates) => {
    setTransportItems(transportItems?.map(item => 
      item?.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleAddTransportRow = () => {
    const newTransportItem = {
      id: Date.now(),
      from: '',
      to: '',
      vehicleSize: '',
      load: '',
      dimensions: '',
      frequency: ''
    };
    setTransportItems([...transportItems, newTransportItem]);
    setEditingItems(new Set([...editingItems, newTransportItem.id]));
  };

  const handleDeleteTransportRow = (itemId) => {
    setTransportItems(transportItems?.filter(item => item?.id !== itemId));
    setEditingItems(new Set([...editingItems].filter(id => id !== itemId)));
  };

  const handleDuplicateTransportRow = (itemId) => {
    const itemToDuplicate = transportItems?.find(item => item?.id === itemId);
    if (itemToDuplicate) {
      const newItem = {
        ...itemToDuplicate,
        id: Date.now()
      };
      setTransportItems([...transportItems, newItem]);
    }
  };

  // Service handlers
  const handleServiceItemUpdate = (itemId, updates) => {
    setServiceItems(serviceItems?.map(item => 
      item?.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleAddServiceRow = () => {
    const newServiceItem = {
      id: Date.now(),
      projectName: '',
      description: '',
      specifications: '',
      uom: '',
      requiredQuantity: 0
    };
    setServiceItems([...serviceItems, newServiceItem]);
    setEditingItems(new Set([...editingItems, newServiceItem.id]));
  };

  const handleDeleteServiceRow = (itemId) => {
    setServiceItems(serviceItems?.filter(item => item?.id !== itemId));
    setEditingItems(new Set([...editingItems].filter(id => id !== itemId)));
  };

  const handleDuplicateServiceRow = (itemId) => {
    const itemToDuplicate = serviceItems?.find(item => item?.id === itemId);
    if (itemToDuplicate) {
      const newItem = {
        ...itemToDuplicate,
        id: Date.now()
      };
      setServiceItems([...serviceItems, newItem]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Quotation Comparison Table - QuoteFlow Pro</title>
        <meta name="description" content="Compare supplier quotations side-by-side with advanced spreadsheet functionality" />
      </Helmet>
      <TopNavigationBar 
        user={mockUser} 
        notifications={mockNotifications}
        onLogout={() => console.log('Logout')}
        onNotificationRead={() => console.log('Notification read')}
        onNotificationClear={() => console.log('Notification cleared')}
      />
      
      {/* Main content with proper top padding for fixed navigation */}
      <div className="pt-20 pb-8">
        <BreadcrumbTrail 
          customBreadcrumbs={[
            { label: 'Dashboard', path: '/procurement-dashboard', icon: 'BarChart3' },
            { label: 'Quotation Comparison', path: '/quotation-comparison-table', icon: 'Table', current: true }
          ]}
        />
        <div className="pt-4">
        {/* Header Section */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Quotation Comparison Table
              </h1>
              <p className="text-muted-foreground">
                Configure quotation type and compare supplier quotes side-by-side
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <ExportControls 
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                isExporting={isExporting}
              />
            </div>
          </div>

          {/* Quotation Form Dropdowns */}
          <QuotationFormDropdowns 
            selectedCommodity={selectedCommodity}
            selectedProductType={selectedProductType}
            selectedWorkType={selectedWorkType}
            onCommodityChange={handleCommodityChange}
            onProductTypeChange={handleProductTypeChange}
            onWorkTypeChange={handleWorkTypeChange}
          />

          {/* Search and Filters - Only show when current form is visible */}
          {showProvidedDataForm && (
            <SearchAndFilters 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedSupplier={supplierFilter}
              onSupplierFilter={setSupplierFilter}
              suppliers={mockSuppliers}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>

                 {/* Main Comparison Table - Show based on commodity selection */}
         {!selectedCommodity ? (
           <div className="px-6">
             <div className="bg-card border border-border rounded-lg p-12 text-center">
               <div className="max-w-md mx-auto">
                 <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                   <Icon name="FileText" size={32} className="text-muted-foreground" />
                 </div>
                 <h3 className="text-xl font-semibold text-foreground mb-3">
                   Select Commodity Type
                 </h3>
                 <p className="text-muted-foreground mb-6">
                   Choose a commodity type from the dropdown above to start comparing quotations
                 </p>
                 <div className="text-sm text-muted-foreground">
                   Available options: Provided Data, Service, Transport
                 </div>
               </div>
             </div>
           </div>
         ) : showProvidedDataForm ? (
          <div className="px-6">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <TableHeader 
                    quotes={quotes} 
                    suppliers={mockSuppliers}
                    attachedFiles={attachedFiles}
                    onFileUpload={handleFileUpload}
                    onFileRemove={handleFileRemove}
                    onSupplierChange={handleSupplierChange}
                    onRemoveQuote={handleRemoveQuote}
                    onAddQuotation={showAnyForm && quotes?.length < 5 ? handleAddQuote : null}
                  />
                  
                  <tbody>
                    {filteredItems?.map((item) => (
                      <ERPItemRow
                        key={item?.id}
                        item={item}
                        quotes={quotes?.map(quote => ({
                          rate: quote?.rates?.[item?.id] || 0,
                          supplierId: quote?.supplierId,
                          attachment: quote?.attachment || false
                        }))}
                        suppliers={mockSuppliers}
                        onItemUpdate={handleItemUpdate}
                        onQuoteUpdate={handleQuoteUpdate}
                        onDeleteRow={handleDeleteRow}
                        onDuplicateRow={handleDuplicateRow}
                        erpItems={mockERPItems}
                        isEditing={editingItems?.has(item?.id)}
                        onEditToggle={handleEditToggle}
                      />
                    ))}

                    {/* Total Row */}
                    <tr className="border-b border-border bg-primary/5 font-semibold">
                      <td className="p-3 bg-card sticky left-0 z-10 border-r border-border text-primary">
                        Total Amount
                      </td>
                      <td className="p-3 bg-card sticky left-48 z-10 border-r border-border"></td>
                      <td className="p-3 bg-card sticky left-96 z-10 border-r border-border"></td>
                      <td className="p-3 bg-card sticky left-120 z-10 border-r border-border"></td>
                      <td className="p-3 bg-card sticky left-144 z-10 border-r border-border"></td>
                      <td className="p-3 bg-card sticky left-168 z-10 border-r border-border"></td>
                      
                      {quotes?.map((quote, index) => (
                        <td key={index} className="p-3 border-r border-border">
                          <div className="text-lg font-bold text-primary">
                            ${calculateTotalAmount(index)?.toFixed(2)}
                          </div>
                        </td>
                      ))}
                      <td className="p-3"></td>
                    </tr>

                    {/* Footer Rows - Only show for Provided Data form when quotations are confirmed */}
                    {quotationsConfirmed && showQuotationDetails && footerRows?.map((footerRow, index) => (
                      <FooterRow
                        key={index}
                        label={footerRow?.label}
                        type={footerRow?.type}
                        quotes={quotes}
                        onFooterUpdate={handleFooterUpdate}
                        options={footerRow?.options}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Provided Data Footer Section - Show when quotations are NOT confirmed but details should be shown */}
            {!quotationsConfirmed && showQuotationDetails && (
              <div className="mt-6 bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Quotation Details
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Complete the quotation details before confirming
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3 text-left bg-muted/50 font-medium text-muted-foreground sticky left-0 z-10 border-r border-border">
                          Details
                        </th>
                        {quotes?.map((quote, index) => {
                          const supplier = mockSuppliers?.find(s => s?.id === quote?.supplierId);
                          return (
                            <th key={index} className="p-3 text-center bg-muted/50 font-medium text-muted-foreground border-r border-border min-w-48">
                              {supplier?.name || `Supplier ${index + 1}`}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {footerRows?.map((footerRow, index) => (
                        <FooterRow
                          key={index}
                          label={footerRow?.label}
                          type={footerRow?.type}
                          quotes={quotes}
                          onFooterUpdate={handleFooterUpdate}
                          options={footerRow?.options}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center mt-6">
                  <Button 
                    variant="default"
                    iconName="Check"
                    iconPosition="left"
                    onClick={handleConfirmQuotations}
                    className="px-8"
                  >
                    Confirm Quotations
                  </Button>
                </div>
              </div>
            )}

            {/* Provided Data Action Buttons */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                iconName="Plus"
                iconPosition="left"
                onClick={handleAddRow}
              >
                Add Item
              </Button>

              <div className="flex items-center space-x-3">
                <div className="text-sm text-muted-foreground">
                  {filteredItems?.length} items • {quotes?.length} quotes
                </div>
                
                {!quotationsConfirmed && !showQuotationDetails && (
                  <Button 
                    variant="default"
                    iconName="Check"
                    iconPosition="left"
                    onClick={handleConfirmQuotations}
                    className="px-6"
                  >
                    Confirm Quotations
                  </Button>
                )}
                
                {quotationsConfirmed && (
                  <Button 
                    variant="outline" 
                    iconName="Edit2"
                    iconPosition="left"
                    onClick={handleModifyQuotations}
                  >
                    Modify Quotations
                  </Button>
                )}
                
                <Button variant="default">
                  Save Comparison
                </Button>
              </div>
            </div>
          </div>
        ) : showServiceForm ? (
          <div className="px-6">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <ServiceTableHeader 
                    quotes={quotes} 
                    suppliers={mockSuppliers}
                    attachedFiles={attachedFiles}
                    onFileUpload={handleFileUpload}
                    onFileRemove={handleFileRemove}
                    onSupplierChange={handleSupplierChange}
                    onRemoveQuote={handleRemoveQuote}
                  />
                  
                  <tbody>
                    {serviceItems?.map((item) => (
                      <ServiceItemRow
                        key={item?.id}
                        item={item}
                        quotes={quotes?.map(quote => ({
                          rate: quote?.rates?.[item?.id] || 0,
                          supplierId: quote?.supplierId,
                          attachment: quote?.attachment || false
                        }))}
                        suppliers={mockSuppliers}
                        onItemUpdate={handleServiceItemUpdate}
                        onQuoteUpdate={handleQuoteUpdate}
                        onDeleteRow={handleDeleteServiceRow}
                        onDuplicateRow={handleDuplicateServiceRow}
                        serviceItems={mockServiceItems}
                        isEditing={editingItems?.has(item?.id)}
                        onEditToggle={handleEditToggle}
                      />
                    ))}

                    {/* Total Row for Service - Clean formatting */}
                    <tr className="border-b-2 border-primary/20 bg-primary/5 font-semibold">
                      <td className="p-4 bg-card sticky left-0 z-10 border-r border-border text-primary font-bold">
                        Total Amount
                      </td>
                      <td className="p-4 bg-card sticky left-52 z-10 border-r border-border"></td>
                      <td className="p-4 bg-card sticky left-116 z-10 border-r border-border"></td>
                      <td className="p-4 bg-card sticky left-172 z-10 border-r border-border"></td>
                      <td className="p-4 bg-card sticky left-196 z-10 border-r border-border"></td>
                      <td className="p-4 bg-card sticky left-224 z-10 border-r border-border"></td>
                      
                      {quotes?.map((quote, index) => (
                        <td key={index} className="p-4 border-r border-border">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">
                              ${serviceItems?.reduce((total, item) => {
                                const rate = quote?.rates?.[item?.id] || 0;
                                return total + (rate * item?.requiredQuantity);
                              }, 0)?.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Total Cost
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="p-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Service Action Buttons - Clean layout without extra sections */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                iconName="Plus"
                iconPosition="left"
                onClick={handleAddServiceRow}
                className="px-6"
              >
                Add Service Item
              </Button>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                  {serviceItems?.length} service items • {quotes?.length} quotes
                </div>
                
                <Button 
                  variant="default"
                  iconName="Save"
                  iconPosition="left"
                  className="px-8"
                >
                  Save Service Comparison
                </Button>
              </div>
            </div>

            {/* Optional: Service Information Panel */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Service Quotation Information
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Service quotations include project-based services with detailed specifications. 
                    File attachments can be uploaded directly in the supplier columns above for each quote.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : showTransportForm ? (
          <div className="px-6">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <TransportTableHeader 
                    quotes={quotes} 
                    suppliers={mockSuppliers}
                    attachedFiles={attachedFiles}
                    onFileUpload={handleFileUpload}
                    onFileRemove={handleFileRemove}
                    onSupplierChange={handleSupplierChange}
                    onRemoveQuote={handleRemoveQuote}
                  />
                  
                  <tbody>
                    {transportItems?.map((item) => (
                      <TransportItemRow
                        key={item?.id}
                        item={item}
                        quotes={quotes?.map(quote => ({
                          rate: quote?.rates?.[item?.id] || 0,
                          supplierId: quote?.supplierId,
                          attachment: quote?.attachment || false
                        }))}
                        suppliers={mockSuppliers}
                        onItemUpdate={handleTransportItemUpdate}
                        onQuoteUpdate={handleQuoteUpdate}
                        onDeleteRow={handleDeleteTransportRow}
                        onDuplicateRow={handleDuplicateTransportRow}
                        isEditing={editingItems?.has(item?.id)}
                        onEditToggle={handleEditToggle}
                      />
                    ))}

                    {/* Total Row for Transport */}
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
                      
                      {quotes?.map((quote, index) => (
                        <td key={index} className="p-4 border-r border-border">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">
                              ${transportItems?.reduce((total, item) => {
                                const rate = quote?.rates?.[item?.id] || 0;
                                const frequency = parseFloat(item?.frequency) || 1;
                                return total + (rate * frequency);
                              }, 0)?.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Monthly Total
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="p-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transport Action Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                iconName="Plus"
                iconPosition="left"
                onClick={handleAddTransportRow}
                className="px-6"
              >
                Add Transport
              </Button>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                  {transportItems?.length} transport routes • {quotes?.length} suppliers
                </div>
                
                <Button 
                  variant="default"
                  iconName="Save"
                  iconPosition="left"
                  className="px-8"
                >
                  Save Transport Comparison
                </Button>
              </div>
            </div>

            {/* Transport Information Panel */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon name="Truck" size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Transport Quotation Information
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    Transport quotations compare shipping costs, vehicle sizes, and delivery frequency. 
                    The suggestion column automatically shows the least quoted supplier for each route.
                    Supplier attachments can be uploaded via the header section.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Form Not Available
                </h3>
                <p className="text-muted-foreground mb-4">
                  Please select a valid commodity type from the dropdown above.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => handleCommodityChange('provided_data')}
                >
                  Switch to Provided Data Form
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default QuotationComparisonTable;