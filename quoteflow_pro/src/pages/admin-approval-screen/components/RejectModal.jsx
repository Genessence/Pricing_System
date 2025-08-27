import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RejectModal = ({ isOpen, onClose, onConfirm, quotationId }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedPresetReason, setSelectedPresetReason] = useState('');

  const presetReasons = [
    'Pricing exceeds approved budget',
    'Supplier requirements not met',
    'Delivery timeline unacceptable',
    'Technical specifications insufficient',
    'Quality standards not satisfied',
    'Compliance documentation missing',
    'Better alternatives available',
    'Project requirements changed'
  ];

  const handlePresetReasonSelect = (reason) => {
    setSelectedPresetReason(reason);
    setRejectionReason(reason);
  };

  const handleConfirm = () => {
    if (rejectionReason?.trim()) {
      onConfirm(rejectionReason);
      setRejectionReason('');
      setSelectedPresetReason('');
    }
  };

  const handleClose = () => {
    setRejectionReason('');
    setSelectedPresetReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon name="X" size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Reject Quotation
              </h2>
              <p className="text-sm text-muted-foreground">
                Quotation ID: {quotationId}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            iconName="X"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <Icon name="AlertTriangle" size={20} className="text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  Important Notice
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Rejecting this quotation will permanently remove it from the approval process. 
                  Please provide a clear reason for rejection to help the procurement team understand the decision.
                </p>
              </div>
            </div>
          </div>

          {/* Preset Reasons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Select a reason (optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetReasons?.map((reason, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetReasonSelect(reason)}
                  className={`
                    text-left p-3 rounded-lg border text-sm transition-all duration-200
                    ${selectedPresetReason === reason
                      ? 'border-primary bg-primary/5 text-primary font-medium' :'border-border bg-background text-foreground hover:bg-muted'
                    }
                  `}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e?.target?.value)}
              placeholder="Please provide a detailed reason for rejecting this quotation..."
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Minimum 10 characters required. This will be sent to the procurement team.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!rejectionReason?.trim() || rejectionReason?.trim()?.length < 10}
              iconName="X"
              className="w-full sm:w-auto"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;