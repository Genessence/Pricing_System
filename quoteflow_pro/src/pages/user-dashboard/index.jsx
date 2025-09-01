import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import { cn } from '../../utils/cn';
import Button from '../../components/ui/Button';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userQuotations, setUserQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for user quotations
  const loadUserQuotations = () => {
    const storedQuotations = localStorage.getItem('quotationRequests');
    if (storedQuotations) {
      const allQuotations = JSON.parse(storedQuotations);
      // Filter quotations for current user (in real app, this would be by user ID)
      setUserQuotations(allQuotations);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserQuotations();
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all quotation data? This is for testing purposes only.')) {
      localStorage.removeItem('quotationRequests');
      setUserQuotations([]);
    }
  };

  useEffect(() => {
    loadUserQuotations();
    
    // Refresh data every 5 seconds to catch new submissions
    const interval = setInterval(loadUserQuotations, 5000);
    
    return () => clearInterval(interval);
  }, []);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const calculateTotalAmount = (quotation) => {
    // Use the totalValue from the quotation data if available
    if (quotation.totalValue !== undefined) {
      return quotation.totalValue;
    }
    
    // Fallback to calculating from quotes if totalValue is not available
    if (!quotation.quotes || quotation.quotes.length === 0) return 0;
    
    return quotation.quotes.reduce((total, quote) => {
      if (quote.items && quote.items.length > 0) {
        return total + quote.items.reduce((itemTotal, item) => {
          return itemTotal + (item.amount || 0);
        }, 0);
      }
      return total;
    }, 0);
  };

  const statistics = {
    totalQuotations: userQuotations.length,
    pendingQuotations: userQuotations.filter(q => q.status === 'pending').length,
    approvedQuotations: userQuotations.filter(q => q.status === 'approved').length,
    totalValue: userQuotations.reduce((total, q) => total + calculateTotalAmount(q), 0)
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/user-dashboard' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigationBar user={user} />
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center space-x-2">
            <Icon name="Loader" size={24} className="animate-spin text-primary" />
            <span className="text-muted-foreground">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigationBar user={user} />
      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <BreadcrumbTrail items={breadcrumbItems} />
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your quotation requests and monitor their approval status
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Quotations</p>
                  <p className="text-2xl font-bold text-foreground">{statistics.totalQuotations}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon name="FileText" size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-foreground">{statistics.pendingQuotations}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Icon name="Clock" size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-foreground">{statistics.approvedQuotations}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Icon name="CheckCircle" size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(statistics.totalValue)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Icon name="DollarSign" size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quotations Table */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Your Quotation Requests</h2>
                  <p className="text-muted-foreground mt-1">
                    Track the status of all your submitted quotations
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="RefreshCw"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Trash2"
                    onClick={handleClearData}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Clear Data
                  </Button>
                </div>
              </div>
            </div>

            {userQuotations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Icon name="FileText" size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No quotations yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by creating your first quotation request
                </p>
                <a
                  href="/quotation-comparison-table"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Create Quotation
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Commodity Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Submitted Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {userQuotations.map((quotation, index) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {quotation.id || `RFQ-${String(index + 1).padStart(3, '0')}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            getCommodityTypeColor(quotation.commodityType)
                          )}>
                            {quotation.commodityType === 'provided_data' ? 'Provided Data' :
                             quotation.commodityType === 'service' ? 'Service' :
                             quotation.commodityType === 'transport' ? 'Transport' : quotation.commodityType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {formatCurrency(calculateTotalAmount(quotation))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            getStatusColor(quotation.status)
                          )}>
                            {quotation.status === 'pending' ? 'Pending Review' :
                             quotation.status === 'approved' ? 'Approved' :
                             quotation.status === 'rejected' ? 'Rejected' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(quotation.submittedAt || Date.now()).toLocaleDateString()}
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                           <button 
                             onClick={() => navigate(`/user-dashboard/${quotation.id}`)}
                             className="text-primary hover:text-primary/80 font-medium"
                           >
                             View Details
                           </button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/quotation-comparison-table"
                className="flex items-center p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <Icon name="Plus" size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Create New Quotation</h4>
                  <p className="text-sm text-muted-foreground">Submit a new quotation request</p>
                </div>
              </a>

              <div className="flex items-center p-4 border border-border rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <Icon name="Download" size={20} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Export Reports</h4>
                  <p className="text-sm text-muted-foreground">Download quotation history</p>
                </div>
              </div>

              <div className="flex items-center p-4 border border-border rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <Icon name="Settings" size={20} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Preferences</h4>
                  <p className="text-sm text-muted-foreground">Manage your account settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
