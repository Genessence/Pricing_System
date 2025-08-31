import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const AdminApprovalScreen = () => {
  const navigate = useNavigate();
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

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
      title: 'New Quotation Request',
      message: 'RFQ-2024-008 requires your approval',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'High Value Transaction',
      message: 'Quotation exceeds $200K threshold',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: false
    }
  ];

  // Mock quotation requests data
  const mockQuotationRequests = [
    {
      id: 'RFQ-2024-007',
      title: 'Industrial Equipment Procurement - Manufacturing Line Upgrade',
      requestedBy: 'Sarah Johnson',
      plant: 'Plant A - Manufacturing',
      submittedDate: '2024-08-22 14:30:00',
      status: 'Pending Approval',
      totalValue: 245000,
      supplierCount: 3,
      commodityType: 'Provided Data',
      description: 'Comprehensive procurement request for upgrading manufacturing line including machinery, safety equipment, and electronic components'
    },
    {
      id: 'RFQ-2024-008',
      title: 'Safety Equipment Supply - Plant B',
      requestedBy: 'Mike Wilson',
      plant: 'Plant B - Assembly',
      submittedDate: '2024-08-23 09:15:00',
      status: 'Pending Approval',
      totalValue: 15000,
      supplierCount: 2,
      commodityType: 'Service',
      description: 'Safety equipment procurement for Plant B assembly line workers'
    },
    {
      id: 'RFQ-2024-009',
      title: 'Electronic Components - Quality Control',
      requestedBy: 'Emily Davis',
      plant: 'Plant C - Quality Control',
      submittedDate: '2024-08-21 16:45:00',
      status: 'Approved',
      totalValue: 45000,
      supplierCount: 4,
      commodityType: 'Transport',
      description: 'Electronic components for quality control testing equipment'
    },
    {
      id: 'RFQ-2024-010',
      title: 'Office Supplies - Administrative Department',
      requestedBy: 'David Brown',
      plant: 'Head Office',
      submittedDate: '2024-08-24 11:20:00',
      status: 'Rejected',
      totalValue: 5000,
      supplierCount: 1,
      commodityType: 'Provided Data',
      description: 'Office supplies and stationery for administrative department'
    },
    {
      id: 'RFQ-2024-011',
      title: 'Raw Materials - Steel Supply',
      requestedBy: 'Lisa Chen',
      plant: 'Plant A - Manufacturing',
      submittedDate: '2024-08-20 13:10:00',
      status: 'Pending Approval',
      totalValue: 180000,
      supplierCount: 3,
      commodityType: 'Service',
      description: 'Steel supply for manufacturing operations'
    }
  ];

  // Get submitted quotations from localStorage
  const submittedQuotations = JSON.parse(localStorage.getItem('submittedQuotations') || '[]');
  console.log('Submitted quotations from localStorage:', submittedQuotations);
  
  // Combine mock data with submitted quotations
  const allQuotationRequests = [...mockQuotationRequests, ...submittedQuotations];
  console.log('All quotation requests:', allQuotationRequests);

  // Force re-render when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    navigate('/login-screen');
  };

  const handleViewQuotation = (quotationId) => {
    // Navigate to detailed approval screen
    navigate(`/admin-approval-screen/${quotationId}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Approval':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'Approved':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getCommodityTypeColor = (commodityType) => {
    switch (commodityType) {
      case 'Provided Data':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Service':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Transport':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Filter quotations based on search and status
  const filteredQuotations = allQuotationRequests.filter(quotation => {
    const matchesSearch = !searchTerm || 
      quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.commodityType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = allQuotationRequests.filter(q => q.status === 'Pending Approval').length;
  const approvedCount = allQuotationRequests.filter(q => q.status === 'Approved').length;
  const rejectedCount = allQuotationRequests.filter(q => q.status === 'Rejected').length;

  return (
    <div className="min-h-screen bg-background">
      <TopNavigationBar 
        user={currentUser}
        notifications={notifications}
        onLogout={handleLogout}
        onNotificationRead={() => {}}
        onNotificationClear={() => {}}
      />
      <BreadcrumbTrail />
      <div className="pt-20 pb-8">
        {/* Header Section */}
        <div className="px-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Quotation Requests</h1>
              <p className="text-muted-foreground">
                Review and approve quotation requests submitted by plant members
              </p>
            </div>
                         <div className="flex items-center space-x-3 mt-4 lg:mt-0">
               <Button
                 variant="outline"
                 iconName="RefreshCw"
                 onClick={handleRefresh}
                 className="mr-2"
               >
                 Refresh
               </Button>
               <Button
                 variant="outline"
                 iconName="ArrowLeft"
                 onClick={() => navigate('/procurement-dashboard')}
               >
                 Back to Dashboard
               </Button>
             </div>
          </div>

                     {/* Statistics Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-elevated transition-smooth">
               <div className="flex items-center justify-between">
                 <div className="flex-1">
                   <p className="text-sm font-medium text-muted-foreground mb-1">Total Requests</p>
                   <p className="text-2xl font-semibold text-foreground">{allQuotationRequests.length}</p>
                 </div>
                                   <div className="p-3 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                    <Icon name="FileText" size={24} strokeWidth={2} />
                  </div>
               </div>
             </div>
             <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-elevated transition-smooth">
               <div className="flex items-center justify-between">
                 <div className="flex-1">
                   <p className="text-sm font-medium text-muted-foreground mb-1">Pending Approval</p>
                   <p className="text-2xl font-semibold text-foreground">{pendingCount}</p>
                 </div>
                                   <div className="p-3 rounded-lg bg-orange-100 text-orange-800 border border-orange-200">
                    <Icon name="Clock" size={24} strokeWidth={2} />
                  </div>
               </div>
             </div>
             <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-elevated transition-smooth">
               <div className="flex items-center justify-between">
                 <div className="flex-1">
                   <p className="text-sm font-medium text-muted-foreground mb-1">Approved</p>
                   <p className="text-2xl font-semibold text-foreground">{approvedCount}</p>
                 </div>
                                   <div className="p-3 rounded-lg bg-green-100 text-green-800 border border-green-200">
                    <Icon name="Check" size={24} strokeWidth={2} />
                  </div>
               </div>
             </div>
             <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-elevated transition-smooth">
               <div className="flex items-center justify-between">
                 <div className="flex-1">
                   <p className="text-sm font-medium text-muted-foreground mb-1">Rejected</p>
                   <p className="text-2xl font-semibold text-foreground">{rejectedCount}</p>
                 </div>
                                   <div className="p-3 rounded-lg bg-red-100 text-red-800 border border-red-200">
                    <Icon name="X" size={24} strokeWidth={2} />
                  </div>
               </div>
             </div>
           </div>

                     {/* Search and Filters */}
           <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-soft">
             <div className="flex flex-col lg:flex-row gap-6">
               <div className="flex-1">
                 <label className="block text-sm font-medium text-foreground mb-2">Search Quotations</label>
                 <div className="relative">
                   <Icon name="Search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                   <input
                     type="text"
                     placeholder="Search by RFQ ID, title, requester, or commodity type..."
                     value={searchTerm}
                     onChange={handleSearch}
                     className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                   />
                 </div>
               </div>
               <div className="flex flex-col lg:flex-row gap-3">
                 <label className="block text-sm font-medium text-foreground mb-2 lg:mb-0 lg:mr-3 lg:self-end">Filter by Status:</label>
                 <div className="flex flex-wrap gap-2">
                   <Button
                     variant={statusFilter === 'all' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => handleStatusFilter('all')}
                     className="px-4 py-2 text-sm font-medium"
                   >
                     All ({allQuotationRequests.length})
                   </Button>
                   <Button
                     variant={statusFilter === 'Pending Approval' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => handleStatusFilter('Pending Approval')}
                     className="px-4 py-2 text-sm font-medium"
                   >
                     Pending ({pendingCount})
                   </Button>
                   <Button
                     variant={statusFilter === 'Approved' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => handleStatusFilter('Approved')}
                     className="px-4 py-2 text-sm font-medium"
                   >
                     Approved ({approvedCount})
                   </Button>
                   <Button
                     variant={statusFilter === 'Rejected' ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => handleStatusFilter('Rejected')}
                     className="px-4 py-2 text-sm font-medium"
                   >
                     Rejected ({rejectedCount})
                   </Button>
                 </div>
               </div>
             </div>
           </div>
        </div>

                 {/* Quotation Requests Table */}
         <div className="px-6">
           <div className="bg-card border border-border rounded-lg overflow-hidden shadow-soft">
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead className="bg-muted border-b border-border">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                       RFQ Details
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                       Requester
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                       Status
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                       Commodity Type
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                       Value
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                       Actions
                     </th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {filteredQuotations.map((quotation) => (
                     <tr key={quotation.id} className="hover:bg-muted/50 transition-colors duration-200">
                       <td className="px-6 py-5">
                         <div>
                           <div className="flex items-center space-x-3 mb-2">
                             <span className="text-sm font-bold text-foreground bg-muted px-3 py-1 rounded-lg">{quotation.id}</span>
                           </div>
                           <h3 className="text-sm font-semibold text-foreground mb-2 leading-tight">{quotation.title}</h3>
                           {quotation.commodityType === 'Service' && quotation.serviceProjectName && (
                             <div className="mb-2">
                               <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                 Project: {quotation.serviceProjectName}
                               </span>
                             </div>
                           )}
                           <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{quotation.description}</p>
                         </div>
                       </td>
                       <td className="px-6 py-5">
                         <div className="space-y-1">
                           <p className="text-sm font-semibold text-foreground">{quotation.requestedBy}</p>
                           <p className="text-xs text-muted-foreground">{quotation.plant}</p>
                           <p className="text-xs text-muted-foreground">{new Date(quotation.submittedDate).toLocaleDateString('en-US', { 
                             year: 'numeric', 
                             month: 'short', 
                             day: 'numeric' 
                           })}</p>
                         </div>
                       </td>
                                               <td className="px-6 py-5">
                          <span className={`px-3 py-2 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(quotation.status)}`}>
                            {quotation.status}
                          </span>
                        </td>
                                               <td className="px-6 py-5">
                          <span className={`px-3 py-2 text-xs font-semibold rounded-full whitespace-nowrap ${getCommodityTypeColor(quotation.commodityType)}`}>
                            {quotation.commodityType}
                          </span>
                        </td>
                       <td className="px-6 py-5">
                         <div className="space-y-1">
                           <p className="text-sm font-bold text-foreground">₹{quotation.totalValue.toLocaleString()}</p>
                           <p className="text-xs text-muted-foreground">{quotation.supplierCount} supplier{quotation.supplierCount !== 1 ? 's' : ''}</p>
                         </div>
                       </td>
                       <td className="px-6 py-5">
                         <div className="flex items-center space-x-2">
                           {quotation.status === 'Pending Approval' && (
                             <Button
                               variant="default"
                               size="sm"
                               onClick={() => handleViewQuotation(quotation.id)}
                               className="px-4 py-2 text-sm font-medium"
                             >
                               Review & Approve
                             </Button>
                           )}
                           {(quotation.status === 'Approved' || quotation.status === 'Rejected') && (
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleViewQuotation(quotation.id)}
                               className="px-4 py-2 text-sm font-medium"
                             >
                               View Details
                             </Button>
                           )}
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             
             {filteredQuotations.length === 0 && (
               <div className="text-center py-16">
                 <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                   <Icon name="FileText" size={32} className="text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-semibold text-foreground mb-2">No quotation requests found</h3>
                 <p className="text-muted-foreground max-w-md mx-auto">
                   {searchTerm || statusFilter !== 'all' 
                     ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                     : 'No quotation requests have been submitted yet. Check back later for new requests.'
                   }
                 </p>
               </div>
             )}
           </div>
         </div>
      </div>
    </div>
  );
};

export default AdminApprovalScreen;