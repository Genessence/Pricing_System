import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNavigationBar from '../../../components/ui/TopNavigationBar';
import BreadcrumbTrail from '../../../components/ui/BreadcrumbTrail';
import Button from '../../../components/ui/Button';
import SummaryMetrics from './SummaryMetrics';
import RejectModal from './RejectModal';
import StatusIndicator from './StatusIndicator';
import AdminQuotationComparisonTable from './AdminQuotationComparisonTable';
import AppIcon from '../../../components/AppIcon';

const AdminQuotationDetail = () => {
  const navigate = useNavigate();
  const { quotationId } = useParams();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Add admin approval state
  const [adminApproval, setAdminApproval] = useState({
    provided_data: {},
    service: {},
    transport: {}
  });

  // Mock user data
  const currentUser = {
    id: 1,
    name: "Admin User",
    email: "admin@company.com",
    role: "Administrator",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'Quotation Awaiting Review',
      message: `${quotationId} requires your approval`,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: false
    }
  ];

  // Get quotation data from localStorage or use mock data as fallback
  const submittedQuotations = JSON.parse(localStorage.getItem('submittedQuotations') || '[]');
  const quotationData = submittedQuotations.find(q => q.id === quotationId);
  
  // Mock quotation data - fallback if not found in localStorage
  const mockQuotationData = quotationData || {
    id: quotationId || 'RFQ-2024-007',
    title: 'Industrial Equipment Procurement - Manufacturing Line Upgrade',
    description: 'Comprehensive procurement request for upgrading manufacturing line including machinery, safety equipment, and electronic components',
    requestedBy: 'Sarah Johnson',
    plant: 'Plant A - Manufacturing',
    submittedDate: '08/20/2024',
    deadline: '09/15/2024',
    deliveryLocation: 'Manufacturing Facility - Building A, Floor 3',
    specialRequirements: 'ISO 9001 certified suppliers required, 2-year warranty mandatory',
    status: 'Pending Approval',
    submissionTime: '2024-08-22 14:30:00',
    commodityType: quotationData?.commodityTypeRaw || (quotationId?.includes('RFQ-2024-008') ? 'Service' : 
                   quotationId?.includes('RFQ-2024-009') ? 'Transport' : 'Provided Data'),
         items: [
       {
         id: 1,
         description: 'Industrial CNC Machine - 5-axis',
         specifications: 'Working envelope: 1000x800x600mm, Spindle speed: 12000 RPM',
         quantity: 2,
         unitOfMeasure: 'Units',
         lastBuyingPrice: 150000,
         lastVendor: 'Tech Solutions Inc.'
       },
       {
         id: 2,
         description: 'Safety Equipment Bundle',
         specifications: 'Hard hats, safety vests, protective goggles, steel-toe boots',
         quantity: 50,
         unitOfMeasure: 'Sets',
         lastBuyingPrice: 7500,
         lastVendor: 'Global Safety Corp.'
       },
       {
         id: 3,
         description: 'Electronic Control Systems',
         specifications: 'PLC controllers, HMI panels, sensor arrays',
         quantity: 10,
         unitOfMeasure: 'Units',
         lastBuyingPrice: 25000,
         lastVendor: 'TechFlow Manufacturing'
       }
     ],
    suppliers: [
      {
        id: 1,
        name: 'ACME Industrial Solutions',
        contact: 'john.smith@acme-industrial.com',
        rating: 4.8,
        items: [
          { itemId: 1, unitPrice: 72000, totalPrice: 144000, deliveryTime: '8-10 weeks', warranty: '3 years', notes: 'Premium quality, extended warranty included' },
          { itemId: 2, unitPrice: 145, totalPrice: 7250, deliveryTime: '2-3 weeks', warranty: '1 year', notes: 'CE certified, bulk discount applied' }
        ],
        totalQuote: 151250,
        attachments: ['technical_specs.pdf', 'warranty_terms.pdf']
      },
      {
        id: 2,
        name: 'TechFlow Manufacturing',
        contact: 'sarah.jones@techflow.com',
        rating: 4.6,
        items: [
          { itemId: 1, unitPrice: 68000, totalPrice: 136000, deliveryTime: '6-8 weeks', warranty: '2 years', notes: 'Standard warranty, installation included' },
          { itemId: 3, unitPrice: 2400, totalPrice: 24000, deliveryTime: '4-5 weeks', warranty: '2 years', notes: 'Latest generation controllers' }
        ],
        totalQuote: 160000,
        attachments: ['product_catalog.pdf', 'installation_guide.pdf']
      },
      {
        id: 3,
        name: 'Global Safety Corp',
        contact: 'mike.wilson@globalsafety.com',
        rating: 4.9,
        items: [
          { itemId: 2, unitPrice: 140, totalPrice: 7000, deliveryTime: '1-2 weeks', warranty: '1 year', notes: 'Premium safety equipment, ISO certified' },
          { itemId: 3, unitPrice: 2600, totalPrice: 26000, deliveryTime: '3-4 weeks', warranty: '3 years', notes: 'Extended support package included' }
        ],
        totalQuote: 33000,
        attachments: ['safety_certificates.pdf', 'compliance_docs.pdf']
      }
    ]
  };

  const handleApprove = () => {
    // Handle approval logic
    console.log('Quotation approved:', mockQuotationData?.id);
    alert('Quotation has been approved successfully!');
    navigate('/admin-approval-screen');
  };

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = (rejectionReason) => {
    console.log('Quotation rejected:', mockQuotationData?.id, 'Reason:', rejectionReason);
    setIsRejectModalOpen(false);
    alert('Quotation has been rejected with reason: ' + rejectionReason);
    navigate('/admin-approval-screen');
  };

  const handleLogout = () => {
    navigate('/login-screen');
  };

  const totalEstimatedValue = mockQuotationData?.suppliers?.reduce((sum, supplier) => sum + supplier?.totalQuote, 0) || 0;
  const lowestQuote = Math.min(...(mockQuotationData?.suppliers?.map(s => s?.totalQuote) || [0]));
  const highestQuote = Math.max(...(mockQuotationData?.suppliers?.map(s => s?.totalQuote) || [0]));
  const averageQuote = totalEstimatedValue / (mockQuotationData?.suppliers?.length || 1);

  // Transform quotation data for the comparison table format
  const transformedSuppliers = mockQuotationData?.quotes?.map((quote, index) => ({
    id: quote?.supplierId || `supplier-${index}`,
    name: quote?.supplierId || `Supplier ${index + 1}`,
    contact: `contact@supplier${index + 1}.com`,
    rating: 4.5
  })) || [];

  const transformedQuotes = mockQuotationData?.quotes?.map(quote => ({
    id: quote?.supplierId,
    rates: quote?.rates || {},
    footer: quote?.footer || {
      transportation_freight: "Included in quote",
      packing_charges: "Extra as applicable", 
      delivery_lead_time: "As per agreement",
      warranty: "Standard warranty",
      currency: "INR",
      remarks_of_quotation: "All terms as per RFQ"
    }
  })) || [];

  // Add handlers for admin approval fields
  const handleFinalSupplierChange = (itemId, field, value) => {
    const commodityType = mockQuotationData?.commodityTypeRaw || 'provided_data';
    setAdminApproval(prev => ({
      ...prev,
      [commodityType]: {
        ...prev?.[commodityType],
        [itemId]: {
          ...prev?.[commodityType]?.[itemId],
          finalSupplier: {
            ...prev?.[commodityType]?.[itemId]?.finalSupplier,
            [field]: value
          }
        }
      }
    }));
  };

  const handleFinalPriceChange = (itemId, value) => {
    const commodityType = mockQuotationData?.commodityTypeRaw || 'provided_data';
    setAdminApproval(prev => ({
      ...prev,
      [commodityType]: {
        ...prev?.[commodityType],
        [itemId]: {
          ...prev?.[commodityType]?.[itemId],
          finalPrice: value
        }
      }
    }));
  };

  // Calculate sum amount based on quantity and final price
  const calculateSumAmount = (itemId, quantity) => {
    const commodityType = mockQuotationData?.commodityTypeRaw || 'provided_data';
    const finalPrice = adminApproval?.[commodityType]?.[itemId]?.finalPrice || 0;
    return (parseFloat(finalPrice) * quantity)?.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigationBar 
        user={currentUser}
        notifications={notifications}
        onLogout={handleLogout}
        onNotificationRead={() => {}}
        onNotificationClear={() => {}}
      />
      <div className="pt-20">
        <BreadcrumbTrail 
          customBreadcrumbs={[
            { label: 'Dashboard', path: '/procurement-dashboard', icon: 'BarChart3' },
            { label: 'Quotation Requests', path: '/admin-approval-screen', icon: 'FileText' },
            { label: `Review ${quotationId}`, path: `/admin-approval-screen/${quotationId}`, icon: 'Eye', current: true }
          ]}
        />
        <div className="pt-4 pb-8">
        {/* Header Section */}
        <div className="px-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Review Quotation</h1>
              <p className="text-muted-foreground">
                Review quotation details and make approval decisions
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                iconName="ArrowLeft"
                onClick={() => navigate('/admin-approval-screen')}
              >
                Back to Requests
              </Button>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="px-6 mb-6">
          <StatusIndicator 
            status={mockQuotationData?.status}
            submissionTime={mockQuotationData?.submissionTime}
          />
        </div>



        {/* Attached Documents Section */}
        {(mockQuotationData?.attachments?.boqFile || mockQuotationData?.attachments?.drawingFile || mockQuotationData?.attachments?.quoteFiles) && (
          <div className="px-6 mb-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Attached Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Documents */}
                {mockQuotationData?.commodityType === 'Service' && (
                  <>
                    {mockQuotationData?.attachments?.boqFile && (
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AppIcon name="FileText" size={16} className="text-blue-600" />
                          <span className="text-sm font-medium text-foreground">Signed BOQ</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{mockQuotationData.attachments.boqFile.name}</p>
                      </div>
                    )}
                    {mockQuotationData?.attachments?.drawingFile && (
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AppIcon name="FileText" size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-foreground">Signed Drawing</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{mockQuotationData.attachments.drawingFile.name}</p>
                      </div>
                    )}
                  </>
                )}
                
                {/* Quote Files */}
                {mockQuotationData?.attachments?.quoteFiles && Object.keys(mockQuotationData.attachments.quoteFiles).length > 0 && (
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AppIcon name="FileText" size={16} className="text-purple-600" />
                      <span className="text-sm font-medium text-foreground">Quote Attachments</span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(mockQuotationData.attachments.quoteFiles).map(([index, file]) => (
                        <p key={index} className="text-xs text-muted-foreground">Quote {parseInt(index) + 1}: {file.name}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quotation Comparison Table */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Quotation Comparison</h2>
            <span className="text-sm text-muted-foreground">
              Same view as created by quotation requesting team
            </span>
          </div>
          <AdminQuotationComparisonTable 
            suppliers={transformedSuppliers}
            items={mockQuotationData?.items}
            quotes={transformedQuotes}
            commodityType={mockQuotationData?.commodityType}
            adminApproval={adminApproval?.[mockQuotationData?.commodityTypeRaw] || {}}
            onFinalSupplierChange={handleFinalSupplierChange}
            onFinalPriceChange={handleFinalPriceChange}
            calculateSumAmount={calculateSumAmount}
          />
        </div>

        {/* Summary Metrics */}
        <div className="px-6 mb-6">
          <SummaryMetrics 
            lowestQuote={lowestQuote}
            highestQuote={highestQuote}
            averageQuote={averageQuote}
            suppliersCount={mockQuotationData?.suppliers?.length}
          />
        </div>

        {/* Action Buttons */}
        <div className="px-6">
          <div className="sticky bottom-6 bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Ready for Decision
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review all quotation details above before making your decision
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="destructive"
                  iconName="X"
                  onClick={handleReject}
                  className="px-8"
                >
                  Reject
                </Button>
                <Button
                  variant="default"
                  iconName="Check"
                  onClick={handleApprove}
                  className="px-8"
                >
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        quotationId={mockQuotationData?.id}
      />
    </div>
  );
};

export default AdminQuotationDetail;
