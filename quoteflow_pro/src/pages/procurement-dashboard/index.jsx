import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import MetricsCard from './components/MetricsCard';
import RFQTable from './components/RFQTable';
import FilterControls from './components/FilterControls';
import QuickActions from './components/QuickActions';
import PerformanceCharts from './components/PerformanceCharts';
import Button from '../../components/ui/Button';


const ProcurementDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedRFQs, setSelectedRFQs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams?.get('filter') || '',
    supplier: '',
    dateRange: '',
    category: ''
  });

  // Mock user data
  const currentUser = {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Procurement Manager",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'RFQ Deadline Approaching',
      message: 'RFQ-2024-003 deadline is in 2 days',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Quotation Received',
      message: 'New quotation from ACME Corporation for Industrial Pumps',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'RFQ Approved',
      message: 'RFQ-2024-001 has been approved by Finance Team',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true
    }
  ];

  // Mock RFQ data
  const mockRFQs = [
    {
      id: 1,
      rfqId: 'RFQ-2024-001',
      subjectFromPlant: 'Industrial Water Pumps Requirement - Plant A',
      description: 'Industrial Water Pumps - High Capacity',
      category: 'Machinery',
      quantity: 25,
      unit: 'Units',
      totalAmount: 125000,
      status: 'Approved',
      createdDate: '08/15/2024',
      supplier: 'acme-corp',
      estimatedValue: 125000
    },
    {
      id: 2,
      rfqId: 'RFQ-2024-002',
      subjectFromPlant: 'Electronic Components Supply - Plant B',
      description: 'Electronic Components - Microcontrollers',
      category: 'Electronics',
      quantity: 500,
      unit: 'Pieces',
      totalAmount: 75000,
      status: 'In Review',
      createdDate: '08/18/2024',
      supplier: 'tech-solutions',
      estimatedValue: 75000
    },
    {
      id: 3,
      rfqId: 'RFQ-2024-003',
      subjectFromPlant: 'Safety Equipment Procurement - Plant C',
      description: 'Safety Equipment - Hard Hats & Vests',
      category: 'Safety Equipment',
      quantity: 200,
      unit: 'Sets',
      totalAmount: 15000,
      status: 'Pending',
      createdDate: '08/20/2024',
      supplier: 'quality-materials',
      estimatedValue: 15000
    },
    {
      id: 4,
      rfqId: 'RFQ-2024-004',
      subjectFromPlant: 'Office Supplies Request - Plant D',
      description: 'Office Supplies - Stationery Bundle',
      category: 'Office Supplies',
      quantity: 100,
      unit: 'Packages',
      totalAmount: 5000,
      status: 'Draft',
      createdDate: '08/21/2024',
      supplier: '',
      estimatedValue: 5000
    },
    {
      id: 5,
      rfqId: 'RFQ-2024-005',
      subjectFromPlant: 'Raw Materials Supply - Plant A',
      description: 'Raw Materials - Steel Sheets',
      category: 'Raw Materials',
      quantity: 50,
      unit: 'Tons',
      totalAmount: 200000,
      status: 'Completed',
      createdDate: '08/10/2024',
      supplier: 'industrial-parts',
      estimatedValue: 200000
    },
    {
      id: 6,
      rfqId: 'RFQ-2024-006',
      subjectFromPlant: 'Machinery Parts Order - Plant B',
      description: 'Machinery Parts - Conveyor Belts',
      category: 'Machinery',
      quantity: 15,
      unit: 'Meters',
      totalAmount: 35000,
      status: 'Rejected',
      createdDate: '08/12/2024',
      supplier: 'global-supply',
      estimatedValue: 35000
    }
  ];

  // Filter RFQs based on current filters and search
  const filteredRFQs = mockRFQs?.filter(rfq => {
    const matchesSearch = !searchQuery || 
      rfq?.rfqId?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      rfq?.subjectFromPlant?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      rfq?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      rfq?.category?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    
    const matchesStatus = !filters?.status || rfq?.status === filters?.status;
    const matchesSupplier = !filters?.supplier || rfq?.supplier === filters?.supplier;
    const matchesCategory = !filters?.category || rfq?.category?.toLowerCase()?.replace(/\s+/g, '-') === filters?.category;
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesCategory;
  });

  // Calculate metrics
  const totalRFQs = mockRFQs?.length;
  const pendingRFQs = mockRFQs?.filter(rfq => rfq?.status === 'Pending')?.length;
  const completedRFQs = mockRFQs?.filter(rfq => rfq?.status === 'Completed')?.length;
  const draftRFQs = mockRFQs?.filter(rfq => rfq?.status === 'Draft')?.length;
  const totalValue = mockRFQs?.reduce((sum, rfq) => sum + rfq?.estimatedValue, 0);
  const costSavings = 285000; // Mock cost savings
  const averageTAT = 12; // Mock average TAT in days
  const supplierCount = 12; // Mock supplier count

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Search is handled in real-time through filteredRFQs
    console.log('Search executed with query:', searchQuery);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      supplier: '',
      dateRange: '',
      category: ''
    });
    setSearchQuery('');
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} for RFQs:`, selectedRFQs);
    // Handle bulk operations
    setSelectedRFQs([]);
  };

  const handleLogout = () => {
    navigate('/login-screen');
  };

  const handleNotificationRead = (notificationId) => {
    console.log('Mark notification as read:', notificationId);
  };

  const handleNotificationClear = () => {
    console.log('Clear all notifications');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigationBar 
        user={currentUser}
        notifications={notifications}
        onLogout={handleLogout}
        onNotificationRead={handleNotificationRead}
        onNotificationClear={handleNotificationClear}
      />
      <BreadcrumbTrail />
      <div className="pt-20">
        <div className="px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Procurement Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor RFQ activities, track performance metrics, and manage procurement processes
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">

              <Button
                variant="outline"
                iconName="Shield"
                onClick={() => navigate('/admin-approval-screen')}
              >
                Admin Approval
              </Button>
              <Button
                variant="default"
                iconName="Plus"
                onClick={() => navigate('/quotation-comparison-table')}
              >
                View Quotations
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricsCard
              title="Total RFQs"
              value={totalRFQs?.toString()}
              change="+12% from last month"
              changeType="positive"
              icon="FileText"
              color="primary"
            />
            <MetricsCard
              title="Pending Approvals"
              value={pendingRFQs?.toString()}
              change="-8% from last week"
              changeType="negative"
              icon="Clock"
              color="warning"
            />
            <MetricsCard
              title="Cost Savings"
              value={`$${(costSavings / 1000)?.toFixed(0)}K`}
              change="+15% from target"
              changeType="positive"
              icon="TrendingUp"
              color="success"
            />
            <MetricsCard
              title="Average TAT"
              value={averageTAT?.toString()}
              change="+3 new this month"
              changeType="positive"
              icon="Timer"
              color="primary"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="xl:col-span-3 space-y-6">
              {/* Filter Controls */}
              <FilterControls
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onClearFilters={handleClearFilters}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              {/* RFQ Table */}
              <RFQTable
                rfqs={filteredRFQs}
                onBulkAction={handleBulkAction}
                selectedRFQs={selectedRFQs}
                onSelectionChange={setSelectedRFQs}
              />

              {/* Performance Charts */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Performance Analytics</h2>
                  <Button variant="ghost" size="sm" iconName="BarChart3">
                    View Detailed Reports
                  </Button>
                </div>
                <PerformanceCharts />
              </div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              <QuickActions 
                pendingApprovals={pendingRFQs}
                draftRFQs={draftRFQs}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;