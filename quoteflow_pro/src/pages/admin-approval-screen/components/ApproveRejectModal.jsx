import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const ApproveRejectModal = ({
  isOpen,
  onClose,
  onRejectConfirm,
  onApproveConfirm,
  quotationId,
  mode, // "approve" or "reject"
}) => {
  const [reason, setReason] = useState("");
  const [selectedPresetReason, setSelectedPresetReason] = useState("");

  const presetReasons =
    mode === "approve"
      ? [
          "Meets all technical requirements",
          "Pricing is within budget",
          "Supplier has good track record",
          "Delivery timeline acceptable",
          "Quality standards assured",
          "All compliance documents available",
        ]
      : [
          "Pricing exceeds approved budget",
          "Supplier requirements not met",
          "Delivery timeline unacceptable",
          "Technical specifications insufficient",
          "Quality standards not satisfied",
          "Compliance documentation missing",
          "Better alternatives available",
          "Project requirements changed",
        ];

  const handlePresetReasonSelect = (r) => {
    setSelectedPresetReason(r);
    setReason(r);
  };

  const handleConfirm = () => {
    if (reason?.trim()) {
      switch (mode) {
        case "approve":
          onApproveConfirm(reason);
          break;
        case "reject":
          onRejectConfirm(reason);
          break;
        default:
          console.log("unknown mode", mode);
      }
    }
    setReason("");
    setSelectedPresetReason("");
  };

  const handleClose = () => {
    setReason("");
    setSelectedPresetReason("");
    onClose();
  };

  if (!isOpen) return null;

  const isReject = mode === "reject";
  const minLength = 10;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isReject ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <Icon
                name={isReject ? "X" : "Check"}
                size={20}
                className={isReject ? "text-red-600" : "text-green-600"}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {isReject ? "Reject Quotation" : "Approve Quotation"}
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
          {isReject && (
            <div className="mb-6">
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Icon
                  name="AlertTriangle"
                  size={20}
                  className="text-red-600 mt-0.5"
                />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">
                    Important Notice
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    Rejecting this quotation will permanently remove it from the
                    approval process. Please provide a clear reason for
                    rejection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preset Reasons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Select a reason (optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetReasons?.map((r, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetReasonSelect(r)}
                  className={`text-left p-3 rounded-lg border text-sm transition-all duration-200
                    ${
                      selectedPresetReason === r
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }
                  `}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              {isReject ? "Rejection Reason" : "Approval Reason"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Please provide a detailed reason for ${
                isReject ? "rejecting" : "approving"
              } this quotation...`}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Minimum {minLength} characters required.
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
              onClick={handleConfirm}
              disabled={!reason?.trim() || reason.trim().length < minLength}
              iconName={isReject ? "X" : "Check"}
              className={`w-full sm:w-auto ${
                isReject
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isReject ? "Confirm Rejection" : "Confirm Approval"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveRejectModal;
