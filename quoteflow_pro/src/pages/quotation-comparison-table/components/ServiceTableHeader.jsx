import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ServiceTableHeader = ({ quotes, suppliers, attachedFiles, onFileUpload, onFileRemove, onSupplierChange, onRemoveQuote }) => {
  const fileInputRefs = useRef({});

  const handleFileSelect = (e, quoteIndex) => {
    const file = e?.target?.files?.[0];
    if (file && file?.type === 'application/pdf') {
      onFileUpload(quoteIndex, file);
    }
  };

  const supplierOptions = suppliers?.map(supplier => ({
    value: supplier?.id,
    label: `${supplier?.vendorCode} - ${supplier?.name}`,
    description: supplier?.location
  }));

  return (
    <thead className="bg-muted border-b border-border sticky top-0 z-20">
      {/* Service Header Row - Clean single row */}
      <tr className="bg-primary/10">
        <th colSpan={6} className="p-3 text-center border-r border-border">
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Wrench" size={18} className="text-primary" />
            <span className="text-base font-bold text-primary">Service Quotation Comparison</span>
          </div>
        </th>
        
        {/* Supplier Headers - Clean and organized */}
        {quotes?.map((quote, index) => (
          <th key={index} className="p-3 text-center border-r border-border min-w-72">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">
                Supplier {index + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => onRemoveQuote(index)}
                className="text-muted-foreground hover:text-destructive p-1 h-auto"
              />
            </div>
          </th>
        ))}
        
        <th className="p-3 text-center">
          <div className="text-sm font-semibold text-foreground">Actions</div>
        </th>
      </tr>

      {/* Main Column Headers - Properly aligned */}
      <tr className="bg-card">
        <th className="p-4 text-left bg-card sticky left-0 z-30 border-r border-border min-w-52">
          <div className="flex items-center space-x-2">
            <Icon name="Briefcase" size={16} />
            <span className="text-sm font-semibold text-foreground">Project Name</span>
          </div>
        </th>
        
        <th className="p-4 text-left bg-card sticky left-52 z-30 border-r border-border min-w-64">
          <div className="flex items-center space-x-2">
            <Icon name="FileText" size={16} />
            <span className="text-sm font-semibold text-foreground">Description</span>
          </div>
        </th>
        
        <th className="p-4 text-left bg-card sticky left-116 z-30 border-r border-border min-w-56">
          <div className="flex items-center space-x-2">
            <Icon name="ClipboardList" size={16} />
            <span className="text-sm font-semibold text-foreground">Specification</span>
          </div>
        </th>
        
        <th className="p-4 text-left bg-card sticky left-172 z-30 border-r border-border min-w-24">
          <div className="flex items-center space-x-2">
            <Icon name="Ruler" size={16} />
            <span className="text-sm font-semibold text-foreground">UOM</span>
          </div>
        </th>
        
        <th className="p-4 text-left bg-card sticky left-196 z-30 border-r border-border min-w-28">
          <div className="flex items-center space-x-2">
            <Icon name="Hash" size={16} />
            <span className="text-sm font-semibold text-foreground">Req Qty</span>
          </div>
        </th>

        <th className="p-4 text-left bg-card sticky left-224 z-30 border-r border-border min-w-48">
          <div className="flex items-center space-x-2">
            <Icon name="Lightbulb" size={16} />
            <span className="text-sm font-semibold text-foreground">Suggestion</span>
          </div>
        </th>

        {/* Service Quote Column Headers - Clean layout */}
        {quotes?.map((quote, index) => (
          <th key={index} className="p-4 text-left border-r border-border min-w-72">
            <div className="space-y-4">
              {/* Vendor Name Selection */}
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-2">
                  Supplier Selection
                </label>
                <Select
                  placeholder="Choose supplier..."
                  options={supplierOptions}
                  value={quote?.supplierId}
                  onChange={(supplierId) => onSupplierChange(index, supplierId)}
                  searchable
                  className="text-sm"
                />
              </div>

              {/* Quote Details Grid - Clean 3-column layout */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <label className="text-xs text-muted-foreground font-medium block mb-1">
                    Rate
                  </label>
                  <div className="text-xs text-muted-foreground">per unit</div>
                </div>
                <div className="text-center">
                  <label className="text-xs text-muted-foreground font-medium block mb-1">
                    Total Amount
                  </label>
                  <div className="text-xs text-muted-foreground">calculated</div>
                </div>
                <div className="text-center">
                  <label className="text-xs text-muted-foreground font-medium block mb-1">
                    Attachment
                  </label>
                  {attachedFiles?.[index] ? (
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-1 p-1 bg-green-50 rounded border border-green-200">
                        <Icon name="FileCheck" size={12} className="text-green-600" />
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Trash2"
                          onClick={() => onFileRemove(index)}
                          className="text-red-500 hover:text-red-700 p-0.5 h-auto w-auto"
                        />
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Upload"
                      onClick={() => {
                        if (!fileInputRefs?.current?.[index]) {
                          fileInputRefs.current[index] = document.createElement('input');
                          fileInputRefs.current[index].type = 'file';
                          fileInputRefs.current[index].accept = '.pdf';
                          fileInputRefs.current[index].onchange = (e) => handleFileSelect(e, index);
                        }
                        fileInputRefs?.current?.[index]?.click();
                      }}
                      className="w-full h-7 text-xs bg-muted/30 hover:bg-muted border-dashed"
                    >
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </th>
        ))}

        {/* Actions Column Header */}
        <th className="p-4 text-center">
          <div className="flex items-center justify-center">
            <Icon name="Settings" size={16} className="text-muted-foreground" />
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default ServiceTableHeader;