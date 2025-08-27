import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const TransportTableHeader = ({ quotes, suppliers, attachedFiles, onFileUpload, onFileRemove, onSupplierChange, onRemoveQuote }) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRefs = useRef({});

  const getSupplierName = (supplierId) => {
    const supplier = suppliers?.find(s => s?.id === supplierId);
    return supplier ? supplier?.name : 'Select Supplier';
  };

  const handleDragOver = (e, index) => {
    e?.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setDragOverIndex(null);
  };

  const handleDrop = (e, quoteIndex) => {
    e?.preventDefault();
    setDragOverIndex(null);
    
    const files = e?.dataTransfer?.files;
    if (files?.length > 0) {
      const file = files?.[0];
      if (file?.type === 'application/pdf') {
        onFileUpload(quoteIndex, file);
      }
    }
  };

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
      <tr>
        {/* Fixed Left Column Headers for Transport - Updated with proper widths */}
        <th className="p-3 text-left bg-card sticky left-0 z-30 border-r border-border min-w-40 w-40">
          <div className="flex items-center space-x-2">
            <Icon name="MapPin" size={16} />
            <span className="text-sm font-semibold text-foreground">From</span>
          </div>
        </th>
        
        <th className="p-3 text-left bg-card sticky left-40 z-30 border-r border-border min-w-40 w-40">
          <div className="flex items-center space-x-2">
            <Icon name="Navigation" size={16} />
            <span className="text-sm font-semibold text-foreground">To</span>
          </div>
        </th>
        
        <th className="p-3 text-left bg-card sticky left-80 z-30 border-r border-border min-w-44 w-44">
          <div className="flex items-center space-x-2">
            <Icon name="Truck" size={16} />
            <span className="text-sm font-semibold text-foreground">Vehicle Size</span>
          </div>
        </th>
        
        <th className="p-3 text-left bg-card sticky left-[21rem] z-30 border-r border-border min-w-36 w-36">
          <div className="flex items-center space-x-2">
            <Icon name="Package" size={16} />
            <span className="text-sm font-semibold text-foreground">Load</span>
          </div>
        </th>
        
        <th className="p-3 text-left bg-card sticky left-[30rem] z-30 border-r border-border min-w-40 w-40">
          <div className="flex items-center space-x-2">
            <Icon name="Ruler" size={16} />
            <span className="text-sm font-semibold text-foreground">Dimensions</span>
          </div>
        </th>
        
        <th className="p-3 text-left bg-card sticky left-[40rem] z-30 border-r border-border min-w-44 w-44">
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} />
            <span className="text-sm font-semibold text-foreground">Frequency/Month</span>
          </div>
        </th>
        
        <th className="p-3 text-left bg-card sticky left-[51rem] z-30 border-r border-border min-w-48 w-48">
          <div className="flex items-center space-x-2">
            <Icon name="Lightbulb" size={16} />
            <span className="text-sm font-semibold text-foreground">Suggestion</span>
          </div>
        </th>

        {/* Dynamic Quote Column Headers with supplier info */}
        {quotes?.map((quote, index) => {
          const supplier = suppliers?.find(s => s?.id === quote?.supplierId);
          const isSupplier1 = index === 0;
          const isSupplier2 = index === 1;
          
          return (
            <th key={index} className="p-3 text-left border-r border-border min-w-80 w-80">
              <div className="space-y-3">
                {/* Supplier Header with Remove Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Building2" size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {isSupplier1 ? 'Supplier 1' : isSupplier2 ? 'Supplier 2' : `Supplier ${index + 1}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="X"
                    onClick={() => onRemoveQuote(index)}
                    className="text-muted-foreground hover:text-destructive p-1 h-auto"
                  />
                </div>

                {/* Supplier Selection */}
                <div>
                  <Select
                    placeholder="Choose supplier..."
                    options={supplierOptions}
                    value={quote?.supplierId}
                    onChange={(supplierId) => onSupplierChange(index, supplierId)}
                    searchable
                    className="text-xs"
                  />
                </div>

                {/* Sub-headers for supplier data fields */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="text-muted-foreground font-medium">Vendor Name</div>
                    <div className="text-muted-foreground font-medium">Rate</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground font-medium">Sum Amount</div>
                    <div className="text-muted-foreground font-medium">Attachment</div>
                  </div>
                </div>

                {/* Compact PDF Upload Section */}
                <div className="space-y-1">
                  {attachedFiles?.[index] ? (
                    <div className="flex items-center justify-between p-1.5 bg-muted rounded border border-border">
                      <div className="flex items-center space-x-1 min-w-0">
                        <Icon name="FileText" size={10} className="text-primary flex-shrink-0" />
                        <span className="text-xs text-foreground truncate max-w-20" title={attachedFiles?.[index]?.name}>
                          {attachedFiles?.[index]?.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-0.5 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Download"
                          onClick={() => {
                            const url = URL.createObjectURL(attachedFiles?.[index]);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = attachedFiles?.[index]?.name;
                            a?.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="p-0.5 h-auto w-auto"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Trash2"
                          onClick={() => onFileRemove(index)}
                          className="text-destructive hover:text-destructive p-0.5 h-auto w-auto"
                        />
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Upload"
                      iconPosition="left"
                      onClick={() => {
                        if (!fileInputRefs?.current?.[index]) {
                          fileInputRefs.current[index] = document.createElement('input');
                          fileInputRefs.current[index].type = 'file';
                          fileInputRefs.current[index].accept = '.pdf';
                          fileInputRefs.current[index].onchange = (e) => handleFileSelect(e, index);
                        }
                        fileInputRefs?.current?.[index]?.click();
                      }}
                      className="w-full h-7 text-xs bg-muted/50 hover:bg-muted border-dashed"
                    >
                      Upload PDF
                    </Button>
                  )}
                </div>
              </div>
            </th>
          );
        })}

        {/* Actions Column Header */}
        <th className="p-3 text-left min-w-32 w-32">
          <div className="flex items-center space-x-2">
            <Icon name="Settings" size={16} />
            <span className="text-sm font-semibold text-foreground">Actions</span>
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default TransportTableHeader;