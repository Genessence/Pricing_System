import React from 'react';
import Icon from '../../../components/AppIcon';

const QuotationDetailsSection = ({ quotationData }) => {
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUrgencyColor = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'text-red-600 bg-red-50 border-red-200';
    if (diffDays <= 14) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getUrgencyText = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Overdue';
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">RFQ Information</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {quotationData?.id}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-base text-foreground mt-1 font-medium">
                  {quotationData?.title}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm text-foreground mt-1 leading-relaxed">
                  {quotationData?.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                  <p className="text-sm text-foreground mt-1">
                    {quotationData?.requestedBy}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted Date</label>
                  <p className="text-sm text-foreground mt-1">
                    {formatDate(quotationData?.submittedDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline & Requirements */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Timeline & Requirements</h3>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-lg ${getUrgencyColor(quotationData?.deadline)}`}>
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} />
                  <label className="text-sm font-medium">Deadline</label>
                </div>
                <p className="text-base font-semibold mt-1">
                  {formatDate(quotationData?.deadline)}
                </p>
                <p className="text-xs mt-1">
                  {getUrgencyText(quotationData?.deadline)}
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="MapPin" size={16} className="text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Delivery Location</label>
                </div>
                <p className="text-sm text-foreground">
                  {quotationData?.deliveryLocation}
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="FileCheck" size={16} className="text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Special Requirements</label>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {quotationData?.specialRequirements}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailsSection;