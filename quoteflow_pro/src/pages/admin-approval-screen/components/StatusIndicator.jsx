import React from 'react';
import Icon from '../../../components/AppIcon';

const StatusIndicator = ({ status, submissionTime }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending Approval':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: 'Clock',
          iconColor: 'text-yellow-600'
        };
      case 'Approved':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: 'Check',
          iconColor: 'text-green-600'
        };
      case 'Rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: 'X',
          iconColor: 'text-red-600'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: 'FileText',
          iconColor: 'text-gray-600'
        };
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime)?.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateTime) => {
    const now = new Date();
    const submittedDate = new Date(dateTime);
    const diffTime = Math.abs(now - submittedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Status Badge */}
        <div className="flex items-center space-x-3">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${statusConfig?.color}`}>
            <Icon name={statusConfig?.icon} size={16} className={statusConfig?.iconColor} />
            <span className="text-sm font-semibold">
              {status}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Current approval status
          </div>
        </div>

        {/* Submission Info */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} />
            <span>Submitted: {formatDateTime(submissionTime)}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border"></div>
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} />
            <span>{getTimeAgo(submissionTime)}</span>
          </div>
        </div>
      </div>
      {/* Pending Approval Message */}
      {status === 'Pending Approval' && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Awaiting Your Decision
              </p>
              <p className="text-sm text-blue-700 mt-1">
                This quotation has been submitted for your review and approval. 
                Please review all details carefully before making a decision.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;