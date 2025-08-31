import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RFQTable = ({ rfqs, onBulkAction, selectedRFQs, onSelectionChange }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState('rfqId');
  const [sortDirection, setSortDirection] = useState('asc');

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-muted text-muted-foreground',
      'Pending': 'bg-warning/10 text-warning border border-warning/20',
      'In Review': 'bg-primary/10 text-primary border border-primary/20',
      'Approved': 'bg-success/10 text-success border border-success/20',
      'Rejected': 'bg-error/10 text-error border border-error/20',
      'Completed': 'bg-success text-success-foreground'
    };
    return colors?.[status] || colors?.['Draft'];
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRFQs = [...rfqs]?.sort((a, b) => {
    const aValue = a?.[sortField];
    const bValue = b?.[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(rfqs?.map(rfq => rfq?.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRFQ = (rfqId, checked) => {
    if (checked) {
      onSelectionChange([...selectedRFQs, rfqId]);
    } else {
      onSelectionChange(selectedRFQs?.filter(id => id !== rfqId));
    }
  };

  const isAllSelected = selectedRFQs?.length === rfqs?.length && rfqs?.length > 0;
  const isPartiallySelected = selectedRFQs?.length > 0 && selectedRFQs?.length < rfqs?.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">RFQ Management</h3>
          {selectedRFQs?.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedRFQs?.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                iconName="Check"
                onClick={() => onBulkAction('approve')}
              >
                Bulk Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                iconName="X"
                onClick={() => onBulkAction('reject')}
              >
                Bulk Reject
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isPartiallySelected;
                  }}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                  className="rounded border-border"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort('rfqId')}
              >
                <div className="flex items-center space-x-1">
                  <span>RFQ ID</span>
                  <Icon 
                    name={sortField === 'rfqId' && sortDirection === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                    size={14} 
                  />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort('subjectFromPlant')}
              >
                <div className="flex items-center space-x-1">
                  <span>Subject From Plant</span>
                  <Icon 
                    name={sortField === 'subjectFromPlant' && sortDirection === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                    size={14} 
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Amount
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <Icon 
                    name={sortField === 'status' && sortDirection === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                    size={14} 
                  />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort('createdDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <Icon 
                    name={sortField === 'createdDate' && sortDirection === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                    size={14} 
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedRFQs?.map((rfq) => (
              <tr key={rfq?.id} className="hover:bg-muted/30 transition-smooth">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRFQs?.includes(rfq?.id)}
                    onChange={(e) => handleSelectRFQ(rfq?.id, e?.target?.checked)}
                    className="rounded border-border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-primary">{rfq?.rfqId}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-foreground truncate">{rfq?.subjectFromPlant}</p>
                    <p className="text-xs text-muted-foreground">{rfq?.category}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-foreground">
                    ₹{rfq?.totalAmount?.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rfq?.status)}`}>
                    {rfq?.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground">{rfq?.createdDate}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      onClick={() => navigate(`/rfq-creation-wizard?id=${rfq?.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Edit"
                      onClick={() => navigate(`/rfq-creation-wizard?id=${rfq?.id}&mode=edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="BarChart3"
                      onClick={() => navigate(`/quotation-comparison-table?rfqId=${rfq?.id}`)}
                    >
                      Compare
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rfqs?.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No RFQs Found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first RFQ</p>
          <Button
            variant="primary"
            iconName="Plus"
            onClick={() => navigate('/rfq-creation-wizard')}
          >
            Create New RFQ
          </Button>
        </div>
      )}
    </div>
  );
};

export default RFQTable;