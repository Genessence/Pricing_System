import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const QuoteColumnHeader = ({ 
  quoteIndex, 
  selectedSupplier, 
  onSupplierChange, 
  suppliers, 
  attachedFile, 
  onFileUpload, 
  onFileRemove,
  onRemoveQuote 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
    
    const files = e?.dataTransfer?.files;
    if (files?.length > 0) {
      const file = files?.[0];
      if (file?.type === 'application/pdf') {
        onFileUpload(quoteIndex, file);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file && file?.type === 'application/pdf') {
      onFileUpload(quoteIndex, file);
    }
  };

  const supplierOptions = suppliers?.map(supplier => ({
    value: supplier?.id,
    label: supplier?.name,
    description: supplier?.location
  }));

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Quote Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Quote {quoteIndex + 1}</h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="X"
          onClick={() => onRemoveQuote(quoteIndex)}
          className="text-muted-foreground hover:text-destructive"
        >
          Remove
        </Button>
      </div>
      {/* Supplier Selection */}
      <div>
        <Select
          label="Select Supplier"
          placeholder="Choose supplier..."
          options={supplierOptions}
          value={selectedSupplier}
          onChange={onSupplierChange}
          searchable
          required
        />
      </div>
      {/* PDF Attachment Area */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">PDF Attachment</label>
        
        {attachedFile ? (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center space-x-2">
              <Icon name="FileText" size={16} className="text-primary" />
              <span className="text-sm text-foreground truncate max-w-32">
                {attachedFile?.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                iconName="Download"
                onClick={() => {
                  const url = URL.createObjectURL(attachedFile);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = attachedFile?.name;
                  a?.click();
                  URL.revokeObjectURL(url);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                iconName="Trash2"
                onClick={() => onFileRemove(quoteIndex)}
                className="text-destructive hover:text-destructive"
              />
            </div>
          </div>
        ) : (
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${isDragOver 
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef?.current?.click()}
          >
            <Icon name="Upload" size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              Drop PDF file here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              PDF files only, max 10MB
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteColumnHeader;