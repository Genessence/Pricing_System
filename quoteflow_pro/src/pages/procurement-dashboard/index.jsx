import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import MetricsCard from './components/MetricsCard';
import RFQTable from './components/RFQTable';
import FilterControls from './components/FilterControls';
import QuickActions from './components/QuickActions';
import PerformanceCharts from './components/PerformanceCharts';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { cn } from '../../utils/cn';

const ProcurementDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedRFQs, setSelectedRFQs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [filters, setFilters] = useState({
    status: searchParams?.get('filter') || '',
    supplier: '',
    dateRange: '',
    category: ''
  });

  // Use authenticated user data
  const currentUser = user;

  // Mock user data for user management
  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'User',
      status: 'Active',
      lastLogin: '2024-08-22 10:30',
      quotationCount: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'User',
      status: 'Active',
      lastLogin: '2024-08-22 09:15',
      quotationCount: 3,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'User',
      status: 'Inactive',
      lastLogin: '2024-08-15 14:20',
      quotationCount: 0,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  ];

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
    },
    {
      id: 4,
      type: 'warning',
      title: 'New User Registration',
      message: 'New user Sarah Wilson has registered and needs approval',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: false
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
      estimatedValue: 125000,
      submittedBy: 'John Doe',
      priority: 'High'
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
      estimatedValue: 75000,
      submittedBy: 'Jane Smith',
      priority: 'Medium'
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
      estimatedValue: 15000,
      submittedBy: 'Mike Johnson',
      priority: 'High'
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
      estimatedValue: 5000,
      submittedBy: 'John Doe',
      priority: 'Low'
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
      estimatedValue: 200000,
      submittedBy: 'Jane Smith',
      priority: 'High'
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
      estimatedValue: 35000,
      submittedBy: 'Mike Johnson',
      priority: 'Medium'
    }
  ];

  // Filter RFQs based on current filters and search
  const filteredRFQs = mockRFQs?.filter(rfq => {
    const matchesSearch = !searchQuery || 
      rfq?.rfqId?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      rfq?.subjectFromPlant?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      rfq?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      rfq?.category?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      rfq?.submittedBy?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    
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
  const activeUsers = mockUsers?.filter(user => user?.status === 'Active')?.length;
  const totalUsers = mockUsers?.length;

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Inactive':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'users', label: 'User Management', icon: 'Users' },
    { id: 'analytics', label: 'Advanced Analytics', icon: 'TrendingUp' },
    { id: 'reports', label: 'Reports', icon: 'FileText' }
  ];

  const renderOverviewTab = () => (
    <>
      {/* Enhanced Metrics Cards */}
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
          value={formatCurrency(costSavings)}
          change="+15% from target"
          changeType="positive"
          icon="TrendingUp"
          color="success"
        />
        <MetricsCard
          title="Active Users"
          value={`${activeUsers}/${totalUsers}`}
          change="+3 new this month"
          changeType="positive"
          icon="Users"
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

          {/* Enhanced RFQ Table */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Recent Quotation Requests</h2>
                  <p className="text-muted-foreground mt-1">
                    Monitor and manage all quotation requests from users
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Download"
                  >
                    Export
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Plus"
                    onClick={() => navigate('/admin-approval-screen')}
                  >
                    View All
                  </Button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      RFQ ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Submitted By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRFQs.slice(0, 5).map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {rfq.rfqId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        <div>
                          <div className="font-medium">{rfq.subjectFromPlant}</div>
                          <div className="text-muted-foreground">{rfq.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {rfq.submittedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          getPriorityColor(rfq.priority)
                        )}>
                          {rfq.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {formatCurrency(rfq.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          rfq.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                          rfq.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          rfq.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        )}>
                          {rfq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin-approval-screen/${rfq.id}`)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
    </>
  );

  const renderUserManagementTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">User Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, permissions, and access controls
          </p>
        </div>
        <Button
          variant="default"
          iconName="Plus"
          onClick={() => setShowUserManagement(true)}
        >
          Add User
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quotations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full mr-3"
                        src={user.avatar}
                        alt={user.name}
                      />
                      <div>
                        <div className="text-sm font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getStatusColor(user.status)
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {user.quotationCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Advanced Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Deep insights into procurement performance and trends
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Approval Trends</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Approval Rate</span>
              <span className="text-sm font-medium text-foreground">85%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Processing Time</span>
              <span className="text-sm font-medium text-foreground">2.3 days</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Cost Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Procurement Value</span>
              <span className="text-sm font-medium text-foreground">{formatCurrency(totalValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cost Savings</span>
              <span className="text-sm font-medium text-green-600">{formatCurrency(costSavings)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Savings Rate</span>
              <span className="text-sm font-medium text-foreground">12.5%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Category Performance</h3>
        <div className="space-y-3">
          {['Machinery', 'Electronics', 'Safety Equipment', 'Office Supplies', 'Raw Materials'].map((category, index) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{category}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${70 + (index * 5)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {70 + (index * 5)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Reports & Exports</h2>
        <p className="text-muted-foreground mt-1">
          Generate comprehensive reports and export data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Icon name="FileText" size={24} className="text-blue-600" />
            <Button variant="ghost" size="sm">Generate</Button>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Monthly Procurement Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comprehensive overview of all procurement activities
          </p>
          <div className="text-xs text-muted-foreground">
            Last generated: Aug 22, 2024
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Icon name="TrendingUp" size={24} className="text-green-600" />
            <Button variant="ghost" size="sm">Generate</Button>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Cost Savings Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Detailed breakdown of cost savings and optimization
          </p>
          <div className="text-xs text-muted-foreground">
            Last generated: Aug 20, 2024
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Icon name="Users" size={24} className="text-purple-600" />
            <Button variant="ghost" size="sm">Generate</Button>
          </div>
          <h3 className="font-semibold text-foreground mb-2">User Activity Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            User engagement and quotation submission statistics
          </p>
          <div className="text-xs text-muted-foreground">
            Last generated: Aug 18, 2024
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Icon name="Clock" size={24} className="text-orange-600" />
            <Button variant="ghost" size="sm">Generate</Button>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Turnaround Time Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Processing times and efficiency metrics
          </p>
          <div className="text-xs text-muted-foreground">
            Last generated: Aug 15, 2024
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Icon name="Shield" size={24} className="text-red-600" />
            <Button variant="ghost" size="sm">Generate</Button>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Approval Workflow Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Approval patterns and decision analytics
          </p>
          <div className="text-xs text-muted-foreground">
            Last generated: Aug 12, 2024
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Icon name="BarChart3" size={24} className="text-indigo-600" />
            <Button variant="ghost" size="sm">Generate</Button>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Custom Analytics Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Customizable reports based on your criteria
          </p>
          <div className="text-xs text-muted-foreground">
            Configure your own parameters
          </div>
        </div>
      </div>
    </div>
  );

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
              <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive procurement management and analytics for administrators
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

          {/* Tab Navigation */}
          <div className="border-b border-border mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'users' && renderUserManagementTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'reports' && renderReportsTab()}
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;