import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
import apiService from '../../services/api';

const QuotationComparisonTable = () => {
  const navigate = useNavigate();
  
  const { user } = useAuth();
  
  // Use authenticated user data from backend
  const currentUser = user;

  // Real notifications from backend (will be implemented when notification system is added)
  const [notifications, setNotifications] = useState([]);

  // Real ERP Items from backend
  const [erpItems, setErpItems] = useState([]);
  const [erpItemsLoading, setErpItemsLoading] = useState(true);

  // Load ERP items from backend
  useEffect(() => {
    const loadERPItems = async () => {
      try {
        const items = await apiService.getERPItems();
        setErpItems(items);
      } catch (error) {
        console.error('Error loading ERP items:', error);
        setErpItems([]);
      } finally {
        setErpItemsLoading(false);
      }
    };

    loadERPItems();
  }, []);

  // Transform backend ERP items to match frontend format
  const transformedERPItems = erpItems.map(item => ({
    id: item.item_code,
    description: item.description,
    specifications: item.specifications || 'N/A',
    uom: item.unit_of_measure,
    commodity: item.category || 'General',
    lastBuyingPrice: 0, // Will be updated when we have historical data
    lastVendor: 'N/A' // Will be updated when we have historical data
  }));

  // Real Suppliers from backend (will be implemented when supplier management is added)
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  // Load suppliers from backend
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        // TODO: Implement supplier API endpoint
        // const supplierData = await apiService.getSuppliers();
        // setSuppliers(supplierData);
        setSuppliers([]); // Empty for now until supplier management is implemented
      } catch (error) {
        console.error('Error loading suppliers:', error);
        setSuppliers([]);
      } finally {
        setSuppliersLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  // Transform backend suppliers to match frontend format
  const mockSuppliers = suppliers.map(supplier => ({
    id: supplier.id,
    name: supplier.name,
    location: supplier.location || 'N/A',
    email: supplier.email || 'N/A',
    phone: supplier.phone || 'N/A',
    rating: supplier.rating || 0,
    vendorCode: supplier.vendor_code || 'N/A'
  }));

  // Service and Transport items will be managed dynamically
  // No mock data - all data comes from backend or user input

  // State management
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('standard');
  const [selectedWorkType, setSelectedWorkType] = useState('normal');
  
  // Initialize with one default empty row for user to start with
  const [items, setItems] = useState([
    {
      id: 1,
      itemCode: "",
      description: "",
      specifications: "",
      requiredQuantity: 1,
      uom: "",
      erpItemId: null
    }
  ]);
  const [serviceItems, setServiceItems] = useState([
    {
      id: 1,
      projectName: "",
      description: "",
      specifications: "",
      uom: "Nos",
      requiredQuantity: 1,
      rate: 0
    }
  ]);

  const [serviceDocuments, setServiceDocuments] = useState({
    signedBOO: null,
    signedDrawing: null,
    additionalFiles: []
  });

  const [serviceProjectName, setServiceProjectName] = useState('');

  const [quotes, setQuotes] = useState([]);

  const [transportItems, setTransportItems] = useState([
    {
      id: 1,
      from: "",
      to: "",
      vehicleSize: "",
      load: "",
      dimensions: "",
      frequency: "1"
    }
  ]);

  const [attachedFiles, setAttachedFiles] = useState({});
  const [boqFile, setBoqFile] = useState(null);
  const [drawingFile, setDrawingFile] = useState(null);
  const [editingItems, setEditingItems] = useState(new Set([1])); // Initialize with service item ID 1 in editing mode
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      itemCode: '',
      description: '',
      specifications: '',
      requiredQuantity: 1,
      uom: '',
      erpItemId: null
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

  const handleSubmitQuotation = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate total value based on form data
      let totalValue = 0;
      if (selectedCommodity === 'provided_data') {
        totalValue = items?.reduce((total, item) => {
          const quantity = parseFloat(item?.requiredQuantity) || 1;
          const price = parseFloat(item?.lastBuyingPrice) || 0;
          return total + (quantity * price);
        }, 0);
      } else if (selectedCommodity === 'service') {
        totalValue = serviceItems?.reduce((total, item) => {
          const quantity = parseFloat(item?.requiredQuantity) || 1;
          const rate = parseFloat(item?.rate) || 0;
          return total + (quantity * rate);
        }, 0);
      } else if (selectedCommodity === 'transport') {
        totalValue = transportItems?.reduce((total, item) => {
          const rate = quotes?.[0]?.rates?.[item?.id] || 0;
          const frequency = parseFloat(item?.frequency) || 1;
          return total + (rate * frequency);
        }, 0);
      }
      
      // Ensure minimum total value to pass backend validation
      // If total is 0, set to 1 to indicate "price to be determined"
      if (totalValue === 0) {
        totalValue = 1;
      }
      
      // Transform items to match backend format
      const rfqItems = (selectedCommodity === 'provided_data' ? items : 
                       selectedCommodity === 'service' ? serviceItems : 
                       transportItems).map(item => ({
        item_code: String(item.id || item.itemCode || 'CUSTOM'),
        description: item.description || item.itemDescription || 'Custom Item',
        specifications: item.specifications || item.specs || 'N/A',
        unit_of_measure: item.uom || item.unitOfMeasure || 'Nos',
        required_quantity: parseFloat(item.requiredQuantity || item.quantity || 1),
        last_buying_price: parseFloat(item.lastBuyingPrice || item.rate || 0),
        last_vendor: item.lastVendor || 'N/A',
        erp_item_id: item.erpItemId ? parseInt(item.erpItemId) : null
      }));
      
      // Create RFQ data for backend
      const rfqData = {
        title: `${selectedCommodity === 'provided_data' ? 'Material' : selectedCommodity === 'service' ? 'Service' : 'Transport'} Procurement Request`,
        description: `${selectedCommodity === 'provided_data' ? 'Material' : selectedCommodity === 'service' ? 'Service' : 'Transport'} procurement request`,
        commodity_type: selectedCommodity,
        total_value: totalValue,
        currency: 'INR',
        site_id: 1, // Default to site A001 (ID: 1) - in production this should be user-selectable
        items: rfqItems
      };

      // 🔍 COMPREHENSIVE DEBUGGER - Print everything before API call
      console.log('🔍 ===== RFQ SUBMISSION DEBUGGER =====');
      console.log('📊 Selected Commodity:', selectedCommodity);
      console.log('💰 Total Value Calculated:', totalValue);
      console.log('💰 Total Value Source:', totalValue === 1 ? 'Set to 1 (was 0 - price to be determined)' : 'Calculated from items');
      console.log('📦 Raw Items Data:', selectedCommodity === 'provided_data' ? items : selectedCommodity === 'service' ? serviceItems : transportItems);
      console.log('🔄 Transformed RFQ Items:', rfqItems);
      console.log('📋 Complete RFQ Data being sent:', rfqData);
      console.log('🔍 Data Types Check:');
      console.log('  - title type:', typeof rfqData.title);
      console.log('  - description type:', typeof rfqData.description);
      console.log('  - commodity_type type:', typeof rfqData.commodity_type);
      console.log('  - total_value type:', typeof rfqData.total_value);
      console.log('  - currency type:', typeof rfqData.currency);
      console.log('  - site_id type:', typeof rfqData.site_id);
      console.log('  - items type:', typeof rfqData.items);
      console.log('  - items length:', rfqData.items.length);
      console.log('🔍 Item Details:');
      rfqData.items.forEach((item, index) => {
        console.log(`  Item ${index + 1}:`, {
          item_code: { value: item.item_code, type: typeof item.item_code },
          description: { value: item.description, type: typeof item.description },
          specifications: { value: item.specifications, type: typeof item.specifications },
          unit_of_measure: { value: item.unit_of_measure, type: typeof item.unit_of_measure },
          required_quantity: { value: item.required_quantity, type: typeof item.required_quantity },
          last_buying_price: { value: item.last_buying_price, type: typeof item.last_buying_price },
          last_vendor: { value: item.last_vendor, type: typeof item.last_vendor },
          erp_item_id: { value: item.erp_item_id, type: typeof item.erp_item_id }
        });
      });
      console.log('🔍 ===== END DEBUGGER =====');

      // Submit to backend
      console.log('🚀 Sending RFQ data to backend...');
      const createdRFQ = await apiService.createRFQ(rfqData);
      console.log('RFQ created successfully:', createdRFQ);
      
      // Show success message
      setShowSuccessMessage(true);
      setIsSubmitting(false);
      
      // Navigate to user dashboard after 3 seconds so user can see their submission
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 3000);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
    } catch (error) {
      // 🔍 COMPREHENSIVE ERROR DEBUGGER
      console.log('❌ ===== RFQ SUBMISSION ERROR DEBUGGER =====');
      console.log('❌ Error object:', error);
      console.log('❌ Error message:', error.message);
      console.log('❌ Error response:', error.response);
      console.log('❌ Error status:', error.response?.status);
      console.log('❌ Error statusText:', error.response?.statusText);
      console.log('❌ Error data:', error.response?.data);
      console.log('❌ Error headers:', error.response?.headers);
      console.log('❌ Error config:', error.config);
      console.log('❌ Full error details:', JSON.stringify(error, null, 2));
      console.log('❌ ===== END ERROR DEBUGGER =====');
      
      setIsSubmitting(false);
      // Show detailed error message to user
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
      alert(`Failed to create RFQ: ${errorMessage}\n\nCheck console for detailed error information.`);
    }
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
    
    // If Transport is selected and current work type is Urgent, reset to Normal
    if (value === 'transport' && selectedWorkType === 'urgent') {
      setSelectedWorkType('normal');
      console.log('Work type automatically reset to Normal for Transport commodity');
    }
    
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
  const handleServiceItemUpdate = (itemId, field, value) => {
    console.log('handleServiceItemUpdate called:', { itemId, field, value });
    console.log('Current serviceItems before update:', serviceItems);
    setServiceItems(serviceItems?.map(item => 
      item?.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  // Debug useEffect to monitor serviceItems changes
  useEffect(() => {
    console.log('serviceItems state updated:', serviceItems);
  }, [serviceItems]);

  // Debug useEffect to monitor quotes changes
  useEffect(() => {
    console.log('quotes state updated:', quotes);
  }, [quotes]);

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
        user={currentUser} 
        notifications={notifications}
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
        
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg mx-4 animate-bounce">
            <div className="bg-green-500 border-2 border-green-600 rounded-lg p-6 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Check" size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    🎉 Quotation Submitted Successfully!
                  </h3>
                  <p className="text-base text-green-100 mt-2">
                    Your quotation request has been submitted and is now pending admin approval.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-white hover:text-green-100 p-2"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
        
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
                        suppliers={suppliers}
                        onItemUpdate={handleItemUpdate}
                        onQuoteUpdate={handleQuoteUpdate}
                        onDeleteRow={handleDeleteRow}
                        onDuplicateRow={handleDuplicateRow}
                        erpItems={erpItems}
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
                      <td className="p-3 bg-card sticky left-168 z-10 border-r border-border"></td>
                      
                      {quotes?.map((quote, index) => (
                        <td key={index} className="p-3 border-r border-border">
                          <div className="flex justify-center text-lg font-bold text-primary">
                                                          ₹{calculateTotalAmount(index)?.toFixed(2)}
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
              
              {/* Add Item Button */}
              
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
                
                <Button 
                  variant="default"
                  iconName="Send"
                  iconPosition="left"
                  onClick={handleSubmitQuotation}
                  disabled={isSubmitting}
                  className="px-8 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
                </Button>
              </div>
            </div>
          </div>
        ) : showServiceForm ? (
          <div className="px-6">
            {/* Document Upload Section */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Mandatory Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Signed BOQ Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Icon name="FileText" size={16} className="inline mr-2 text-orange-600" />
                    Signed BOQ
                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Mandatory</span>
                  </label>
                  <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                    <Icon name="Upload" size={24} className="mx-auto text-orange-500 mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF files only, max 10MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="boq-file-input"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setBoqFile(file);
                          console.log('BOQ file selected:', file);
                        }
                      }}
                    />
                    {boqFile ? (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon name="FileText" size={14} className="text-green-600" />
                            <span className="text-sm text-green-800 truncate">{boqFile.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="X"
                            onClick={() => setBoqFile(null)}
                            className="text-green-600 hover:text-green-800 p-1 h-auto"
                          />
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                        onClick={() => {
                          document.getElementById('boq-file-input').click();
                        }}
                      >
                        Upload BOQ
                      </Button>
                    )}
                  </div>
                </div>

                {/* Signed Drawing Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Icon name="FileText" size={16} className="inline mr-2 text-orange-600" />
                    Signed Drawing
                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Mandatory</span>
                  </label>
                  <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                    <Icon name="Upload" size={24} className="mx-auto text-orange-500 mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF files only, max 10MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="drawing-file-input"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setDrawingFile(file);
                          console.log('Drawing file selected:', file);
                        }
                      }}
                    />
                    {drawingFile ? (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon name="FileText" size={14} className="text-green-600" />
                            <span className="text-sm text-green-800 truncate">{drawingFile.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="X"
                            onClick={() => setDrawingFile(null)}
                            className="text-green-600 hover:text-green-800 p-1 h-auto"
                          />
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                        onClick={() => {
                          document.getElementById('drawing-file-input').click();
                        }}
                      >
                        Upload Drawing
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Name Section */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Project Information
              </h3>
              <div className="max-w-2xl">
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Icon name="Briefcase" size={16} className="inline mr-2 text-blue-600" />
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="Enter project name..."
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={serviceProjectName || ''}
                  onChange={(e) => setServiceProjectName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This project name will apply to all service items below
                </p>
              </div>
            </div>

            {/* Service Quotation Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <ServiceTableHeader 
                    quotes={quotes} 
                    onAddQuotation={showAnyForm && quotes?.length < 5 ? handleAddQuote : null}
                    onRemoveQuote={handleRemoveQuote}
                  />
                  
                  <tbody>
                    {serviceItems?.map((item) => (
                      <ServiceItemRow
                        key={`${item?.id}-${item?.requiredQuantity}`}
                        item={item}
                        isEditing={editingItems?.has(item?.id)}
                        onItemChange={handleServiceItemUpdate}
                        quotes={quotes?.map(quote => {
                          const rate = quote?.rates?.[item?.id] || 0;
                          console.log('Quote mapping:', { itemId: item?.id, quoteId: quote?.id, rate });
                          return {
                            rate: rate,
                            supplierId: quote?.supplierId
                          };
                        })}
                        suppliers={mockSuppliers}
                        onSupplierChange={handleSupplierChange}
                        onRateChange={(quoteIndex, rate) => {
                          console.log('onRateChange called:', { quoteIndex, rate, itemId: item.id });
                          const updatedQuotes = [...quotes];
                          updatedQuotes[quoteIndex].rates[item.id] = parseFloat(rate) || 0;
                          console.log('Updated quotes:', updatedQuotes);
                          setQuotes(updatedQuotes);
                        }}
                      />
                    ))}

                    {/* Total Row for Service - Clean formatting */}
                    <tr className="border-b-2 border-primary/20 bg-primary/5 font-semibold">
                      <td className="p-4 bg-card sticky left-0 z-10 border-r border-border text-primary font-bold">
                        Total Amount
                      </td>
                      <td className="p-4 bg-card sticky left-52 z-10 border-r border-border"></td>
                      <td className="p-4 bg-card sticky left-112 z-10 border-r border-border"></td>
                      <td className="p-4 bg-card sticky left-148 z-10 border-r border-border"></td>
                      <td className="p-4 bg-card sticky left-188 z-10 border-r border-border"></td>
                      
                      {quotes?.map((quote, index) => (
                        <td key={index} className="p-4 flex justify-center border-r border-border">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">
                              ₹{serviceItems?.reduce((total, item) => {
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
                
                <Button 
                  variant="default"
                  iconName="Send"
                  iconPosition="left"
                  onClick={handleSubmitQuotation}
                  disabled={isSubmitting}
                  className="px-8 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
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
                    onAddQuotation={showAnyForm && quotes?.length < 5 ? handleAddQuote : null}
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
                          <div className="flex justify-center text-center">
                            <div className="text-lg font-bold text-primary">
                              ₹{transportItems?.reduce((total, item) => {
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
                
                <Button 
                  variant="default"
                  iconName="Send"
                  iconPosition="left"
                  onClick={handleSubmitQuotation}
                  disabled={isSubmitting}
                  className="px-8 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
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