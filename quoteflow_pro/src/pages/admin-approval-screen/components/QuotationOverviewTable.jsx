import React from 'react';
import Icon from '../../../components/AppIcon';

const QuotationOverviewTable = ({ quotationData }) => {
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
              currency: 'INR'
    })?.format(amount);
  };

  const getUrgencyColor = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'text-red-600 bg-red-50';
    if (diffDays <= 14) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending Approval': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Under Review': 'bg-blue-100 text-blue-800'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyText = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Overdue';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  // Calculate total estimated budget
  const totalEstimatedBudget = quotationData?.items?.reduce((sum, item) => sum + item?.estimatedBudget, 0) || 0;

  // Calculate total suppliers quotes
  const totalSuppliersValue = quotationData?.suppliers?.reduce((sum, supplier) => sum + supplier?.totalQuote, 0) || 0;

  const tableData = [
    {
      category: 'Basic Information',
      rows: [
        { label: 'RFQ ID', value: quotationData?.id, icon: 'FileText' },
        { label: 'Title', value: quotationData?.title, icon: 'Tag' },
        { label: 'Status', value: quotationData?.status, icon: 'Activity', isStatus: true },
        { label: 'Requested By', value: quotationData?.requestedBy, icon: 'User' }
      ]
    },
    {
      category: 'Timeline & Deadlines',
      rows: [
        { label: 'Submitted Date', value: formatDate(quotationData?.submittedDate), icon: 'Calendar' },
        { label: 'Deadline', value: formatDate(quotationData?.deadline), icon: 'Clock', urgency: quotationData?.deadline },
        { label: 'Days Remaining', value: getUrgencyText(quotationData?.deadline), icon: 'Timer', urgency: quotationData?.deadline }
      ]
    },
    {
      category: 'Requirements & Specifications',
      rows: [
        { label: 'Delivery Location', value: quotationData?.deliveryLocation, icon: 'MapPin' },
        { label: 'Special Requirements', value: quotationData?.specialRequirements, icon: 'FileCheck', isLong: true },
        { label: 'Total Items', value: `${quotationData?.items?.length} items`, icon: 'Package' }
      ]
    },
    {
      category: 'Financial Overview',
      rows: [
        { label: 'Estimated Budget', value: formatCurrency(totalEstimatedBudget), icon: 'DollarSign', isCurrency: true },
        { label: 'Suppliers Responded', value: `${quotationData?.suppliers?.length} suppliers`, icon: 'Users' },
        { label: 'Total Quoted Value', value: formatCurrency(totalSuppliersValue), icon: 'TrendingUp', isCurrency: true }
      ]
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="bg-muted px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Quotation Overview</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quotationData?.status)}`}>
            <Icon name="Activity" size={14} className="mr-1" />
            {quotationData?.status}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/4">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/4">
                Field
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/2">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tableData?.map((category, categoryIndex) => (
              category?.rows?.map((row, rowIndex) => (
                <tr key={`${categoryIndex}-${rowIndex}`} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 align-top">
                    {rowIndex === 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm font-medium text-foreground">
                          {category?.category}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center space-x-2">
                      <Icon name={row?.icon} size={16} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {row?.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className={`${row?.isLong ? 'max-w-md' : ''}`}>
                      {row?.isStatus ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(row?.value)}`}>
                          {row?.value}
                        </span>
                      ) : row?.urgency ? (
                        <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getUrgencyColor(row?.urgency)}`}>
                          <span>{row?.value}</span>
                        </div>
                      ) : row?.isCurrency ? (
                        <span className="text-sm font-bold text-foreground">
                          {row?.value}
                        </span>
                      ) : (
                        <p className={`text-sm text-foreground ${row?.isLong ? 'leading-relaxed' : ''}`}>
                          {row?.value}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-muted/30 px-6 py-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Icon name="Package" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Items:</span>
            <span className="text-sm font-semibold text-foreground">
              {quotationData?.items?.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Suppliers:</span>
            <span className="text-sm font-semibold text-foreground">
              {quotationData?.suppliers?.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Calculator" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Value:</span>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(totalSuppliersValue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationOverviewTable;