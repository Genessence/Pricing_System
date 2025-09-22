import React, { useRef } from "react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/AppIcon";

const PdfUploadSection = ({ 
  urgentWorkPdf, 
  onPdfUpload, 
  onPdfRemove 
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onPdfUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-medium text-blue-800 flex items-center">
            <Icon name="FileText" size={16} className="mr-2" />
            Urgent Work Approval Document
          </h4>
          <p className="text-xs text-blue-600 mt-1">
            Please attach a PDF document for Plant Head approval
          </p>
        </div>
        {urgentWorkPdf && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPdfRemove}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Icon name="X" size={14} className="mr-1" />
            Remove
          </Button>
        )}
      </div>

      {urgentWorkPdf ? (
        // PDF Preview
        <div className="bg-white border border-blue-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <Icon name="FileText" size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {urgentWorkPdf.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(urgentWorkPdf.size)} • PDF Document
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Icon name="CheckCircle" size={12} className="mr-1" />
                Uploaded
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Upload Button
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={handleUploadClick}
            className="border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
          >
            <Icon name="Upload" size={16} className="mr-2" />
            Upload PDF Document
          </Button>
          <p className="text-xs text-blue-600 mt-2">
            Maximum file size: 10MB • PDF format only
          </p>
        </div>
      )}

      {/* Validation Message */}
      {!urgentWorkPdf && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <Icon name="AlertTriangle" size={14} className="text-yellow-600 mr-2" />
            <span className="text-xs text-yellow-700">
              PDF document is required for urgent work approval
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUploadSection;
