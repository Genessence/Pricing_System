import React, { useState, useRef } from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";
import Select from "../../../../components/ui/Select";

const TableHeader = ({
  quotes,
  suppliers,
  attachedFiles,
  onFileUpload,
  onFileRemove,
  onSupplierChange,
  onRemoveQuote,
  onAddQuotation,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRefs = useRef({});

  const getSupplierName = (supplierId) => {
    const supplier = suppliers?.find((s) => s?.id === supplierId);
    return supplier ? supplier?.name : "Select Supplier";
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
      const allowedTypes = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/png",
        "image/jpeg",
      ];
      if (allowedTypes.includes(file?.type)) {
        onFileUpload(quoteIndex, file);
      }
    }
  };

  const handleFileSelect = (e, quoteIndex) => {
    const file = e?.target?.files?.[0];
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
    ];
    if (file && allowedTypes.includes(file?.type)) {
      onFileUpload(quoteIndex, file);
    }
  };

  const supplierOptions = suppliers?.map((supplier) => ({
    value: supplier?.id,
    label: `${supplier?.vendorCode} - ${supplier?.name}`,
    description: supplier?.location,
  }));

  return (
    <thead className="bg-muted border-b border-border sticky top-0 z-20">
      <tr>
        {/* Fixed Left Column Headers */}
        <th className="p-3 text-left bg-card sticky left-0 z-30 border-r border-border min-w-48">
          <div className="flex items-center space-x-2">
            <Icon name="Package" size={16} />
            <span className="text-sm font-semibold text-foreground">Item</span>
          </div>
        </th>

        <th className="p-3 text-left bg-card sticky left-48 z-30 border-r border-border min-w-48">
          <div className="flex items-center space-x-2">
            <Icon name="FileText" size={16} />
            <span className="text-sm font-semibold text-foreground">
              Description
            </span>
          </div>
        </th>

        <th className="p-3 text-left bg-card sticky left-96 z-30 border-r border-border min-w-48">
          <div className="flex items-center space-x-2">
            <Icon name="FileText" size={16} />
            <span className="text-sm font-semibold text-foreground">
              Specifications
            </span>
          </div>
        </th>

        <th className="p-3 text-left bg-card sticky left-144 z-30 border-r border-border min-w-24">
          <div className="flex items-center space-x-2">
            <Icon name="Hash" size={16} />
            <span className="text-sm font-semibold text-foreground">
              Req Qty
            </span>
          </div>
        </th>

        <th className="p-3 text-left bg-card sticky left-168 z-30 border-r border-border min-w-24">
          <div className="flex items-center space-x-2">
            <Icon name="Ruler" size={16} />
            <span className="text-sm font-semibold text-foreground">UOM</span>
          </div>
        </th>

        <th className="p-3 text-left bg-card sticky left-192 z-30 border-r border-border min-w-32">
          <div className="flex items-center space-x-2">
            <Icon name="Rupee" size={16} />
            <span className="text-sm font-semibold text-foreground">
              Last Price
            </span>
          </div>
        </th>

        <th className="p-3 text-left bg-card sticky left-224 z-30 border-r border-border min-w-48">
          <div className="flex items-center space-x-2">
            <Icon name="Building2" size={16} />
            <span className="text-sm font-semibold text-foreground">
              Last Vendor
            </span>
          </div>
        </th>

        {/* Dynamic Quote Column Headers with compact PDF upload */}
        {quotes?.map((quote, index) => (
          <th
            key={index}
            className="p-3 text-left border-r border-border min-w-64"
          >
            <div className="space-y-3">
              {/* Quote Header with Remove Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Quote" size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Quote {index + 1}
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

              {/* Supplier Selection with Vendor Code */}
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

              {/* Compact PDF Upload Section */}
              <div className="space-y-1">
                {attachedFiles?.[index] ? (
                  <div className="flex items-center justify-between p-1.5 bg-muted rounded border border-border">
                    <div className="flex items-center space-x-1 min-w-0">
                      <Icon
                        name="FileText"
                        size={10}
                        className="text-primary flex-shrink-0"
                      />
                      <span
                        className="text-xs text-foreground truncate max-w-16"
                        title={attachedFiles?.[index]?.name}
                      >
                        {attachedFiles?.[index]?.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-0.5 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Download"
                        onClick={() => {
                          const url = URL.createObjectURL(
                            attachedFiles?.[index]
                          );
                          const a = document.createElement("a");
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
                        fileInputRefs.current[index] =
                          document.createElement("input");
                        fileInputRefs.current[index].type = "file";
                        fileInputRefs.current[index].accept =
                          ".pdf,.xlsx,.xls,.png,.jpeg,.jpg";
                        fileInputRefs.current[index].onchange = (e) =>
                          handleFileSelect(e, index);
                      }
                      fileInputRefs?.current?.[index]?.click();
                    }}
                    className="w-full h-7 text-xs bg-muted/50 hover:bg-muted border-dashed"
                  >
                    Upload PDF / Excel / Image
                  </Button>
                )}
              </div>
            </div>
          </th>
        ))}

        {/* Add Quotation Column Header */}
        <th className="p-3 text-left">
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              iconPosition="left"
              onClick={() => onAddQuotation && onAddQuotation()}
              className="text-muted-foreground hover:text-primary"
              disabled={!onAddQuotation}
            >
              Add Quotation
            </Button>
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
