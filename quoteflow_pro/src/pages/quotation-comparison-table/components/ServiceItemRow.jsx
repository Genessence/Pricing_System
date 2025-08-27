import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const ServiceItemRow = ({ 
  item, 
  quotes, 
  suppliers,
  onItemUpdate, 
  onQuoteUpdate, 
  onDeleteRow, 
  onDuplicateRow,
  serviceItems,
  isEditing,
  onEditToggle
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const uomOptions = [
    { value: 'PROJECT', label: 'Project' },
    { value: 'HOURS', label: 'Hours' },
    { value: 'DAYS', label: 'Days' },
    { value: 'MONTHS', label: 'Months' },
    { value: 'SESSIONS', label: 'Sessions' },
    { value: 'VISITS', label: 'Visits' },
    { value: 'LUMPSUM', label: 'Lump Sum' }
  ];

  const handleItemChange = (field, value) => {
    onItemUpdate(item?.id, { [field]: value });
  };

  const handleRateChange = (quoteIndex, rate) => {
    const numericRate = parseFloat(rate) || 0;
    onQuoteUpdate(item?.id, quoteIndex, { rate: numericRate });
  };

  const calculateAmount = (rate) => {
    return (rate * (item?.requiredQuantity || 0))?.toFixed(2);
  };

  const getSuggestions = () => {
    return serviceItems?.filter(serviceItem => 
      serviceItem?.projectName?.toLowerCase()?.includes(item?.projectName?.toLowerCase()) ||
      serviceItem?.description?.toLowerCase()?.includes(item?.description?.toLowerCase())
    )?.slice(0, 3);
  };

  const applySuggestion = (suggestion) => {
    onItemUpdate(item?.id, {
      projectName: suggestion?.projectName,
      description: suggestion?.description,
      specifications: suggestion?.specifications,
      uom: suggestion?.uom,
      requiredQuantity: suggestion?.requiredQuantity
    });
    setShowSuggestions(false);
  };

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      {/* Project Name */}
      <td className="p-3 bg-card sticky left-0 z-10 border-r border-border">
        {isEditing ? (
          <Input
            type="text"
            value={item?.projectName || ''}
            onChange={(e) => handleItemChange('projectName', e?.target?.value)}
            placeholder="Enter project name..."
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm text-foreground font-medium">
            {item?.projectName || 'Unnamed Project'}
          </div>
        )}
      </td>
      {/* Description */}
      <td className="p-3 bg-card sticky left-48 z-10 border-r border-border">
        {isEditing ? (
          <textarea
            value={item?.description || ''}
            onChange={(e) => handleItemChange('description', e?.target?.value)}
            placeholder="Enter description..."
            rows={2}
            className="w-full text-sm p-2 border border-border rounded resize-none bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        ) : (
          <div className="text-sm text-foreground">
            {item?.description || 'No description'}
          </div>
        )}
      </td>
      {/* Specifications */}
      <td className="p-3 bg-card sticky left-96 z-10 border-r border-border">
        {isEditing ? (
          <textarea
            value={item?.specifications || ''}
            onChange={(e) => handleItemChange('specifications', e?.target?.value)}
            placeholder="Enter specifications..."
            rows={2}
            className="w-full text-sm p-2 border border-border rounded resize-none bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            {item?.specifications || 'No specifications'}
          </div>
        )}
      </td>
      {/* UOM */}
      <td className="p-3 bg-card sticky left-144 z-10 border-r border-border">
        {isEditing ? (
          <Select
            options={uomOptions}
            value={item?.uom}
            onChange={(value) => handleItemChange('uom', value)}
            placeholder="Select UOM"
            className="text-sm"
          />
        ) : (
          <div className="text-sm text-foreground font-mono">
            {item?.uom || 'N/A'}
          </div>
        )}
      </td>
      {/* Required Quantity */}
      <td className="p-3 bg-card sticky left-192 z-10 border-r border-border">
        {isEditing ? (
          <Input
            type="number"
            value={item?.requiredQuantity || ''}
            onChange={(e) => handleItemChange('requiredQuantity', parseFloat(e?.target?.value) || 0)}
            placeholder="0"
            min="0"
            step="0.01"
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm text-foreground font-mono">
            {item?.requiredQuantity || 0}
          </div>
        )}
      </td>
      {/* Suggestion Column */}
      <td className="p-3 bg-card sticky left-240 z-10 border-r border-border">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            iconName="Lightbulb"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-muted-foreground hover:text-primary"
          />
          
          {showSuggestions && (
            <div className="absolute top-8 left-0 z-50 w-80 bg-card border border-border rounded-lg shadow-lg p-3">
              <div className="text-xs font-semibold text-foreground mb-2">Suggested Services</div>
              {getSuggestions()?.length > 0 ? (
                <div className="space-y-2">
                  {getSuggestions()?.map((suggestion, index) => (
                    <div key={index} className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                         onClick={() => applySuggestion(suggestion)}>
                      <div className="text-xs font-medium text-foreground">
                        {suggestion?.projectName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {suggestion?.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No suggestions available</div>
              )}
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => setShowSuggestions(false)}
                className="absolute top-1 right-1 p-1 h-auto"
              />
            </div>
          )}
        </div>
      </td>
      {/* Quote Columns */}
      {quotes?.map((quote, quoteIndex) => (
        <td key={quoteIndex} className="p-3 border-r border-border">
          <div className="grid grid-cols-3 gap-2">
            {/* Vendor Name Display */}
            <div className="text-xs">
              <div className="text-muted-foreground truncate">
                {suppliers?.find(s => s?.id === quote?.supplierId)?.name || 'No Vendor'}
              </div>
            </div>
            
            {/* Rate Input */}
            <div>
              <Input
                type="number"
                value={quote?.rate || ''}
                onChange={(e) => handleRateChange(quoteIndex, e?.target?.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full text-xs h-7"
              />
            </div>
            
            {/* Sum Amount Display */}
            <div className="text-xs">
              <div className="font-mono text-primary">
                ${calculateAmount(quote?.rate || 0)}
              </div>
            </div>
          </div>
          
          {/* Attachment indicator row */}
          <div className="mt-1 text-center">
            {quote?.attachment ? (
              <Icon name="Paperclip" size={12} className="text-primary" />
            ) : (
              <div className="text-xs text-muted-foreground">-</div>
            )}
          </div>
        </td>
      ))}
      {/* Actions Column */}
      <td className="p-3">
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            iconName={isEditing ? "Check" : "Edit2"}
            onClick={() => onEditToggle(item?.id)}
            className="text-muted-foreground hover:text-primary p-1 h-auto"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Copy"
            onClick={() => onDuplicateRow(item?.id)}
            className="text-muted-foreground hover:text-primary p-1 h-auto"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            onClick={() => onDeleteRow(item?.id)}
            className="text-muted-foreground hover:text-destructive p-1 h-auto"
          />
        </div>
      </td>
    </tr>
  );
};

export default ServiceItemRow;