import React, { useState, useRef, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const TransportItemRow = ({ 
  item, 
  quotes, 
  suppliers,
  onItemUpdate, 
  onQuoteUpdate, 
  onDeleteRow, 
  onDuplicateRow,
  isEditing,
  onEditToggle
}) => {
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Vehicle size options
  const vehicleSizeOptions = [
    { value: 'small', label: 'Small (Up to 1 Ton)' },
    { value: 'medium', label: 'Medium (1-3 Tons)' },
    { value: 'large', label: 'Large (3-7 Tons)' },
    { value: 'extra_large', label: 'Extra Large (7+ Tons)' },
    { value: 'container_20ft', label: 'Container 20ft' },
    { value: 'container_40ft', label: 'Container 40ft' }
  ];

  // Mock frequency options
  const frequencyOptions = [
    { value: '1', label: '1 Trip/Month' },
    { value: '2', label: '2 Trips/Month' },
    { value: '4', label: '4 Trips/Month' },
    { value: '8', label: '8 Trips/Month' },
    { value: '12', label: '12 Trips/Month' },
    { value: '20', label: '20 Trips/Month' },
    { value: 'custom', label: 'Custom' }
  ];

  const handleInputUpdate = (field, value) => {
    onItemUpdate(item?.id, { [field]: value });
  };

  const handleQuoteUpdate = (quoteIndex, field, value) => {
    onQuoteUpdate(item?.id, quoteIndex, { [field]: value });
  };

  // Calculate suggestion (least quoted supplier)
  const getLeastQuotedSupplier = () => {
    if (!quotes?.length) return null;
    
    let minRate = Infinity;
    let bestSupplier = null;
    
    quotes?.forEach((quote, index) => {
      const rate = parseFloat(quote?.rate) || 0;
      if (rate > 0 && rate < minRate) {
        minRate = rate;
        const supplier = suppliers?.find(s => s?.id === quote?.supplierId);
        bestSupplier = supplier?.name || `Supplier ${index + 1}`;
      }
    });
    
    return bestSupplier ? `${bestSupplier} ($${minRate?.toFixed(2)})` : 'No quotes available';
  };

  const calculateAmount = (rate, frequency) => {
    const numericRate = parseFloat(rate) || 0;
    const numericFrequency = parseFloat(frequency) || 1;
    return (numericRate * numericFrequency)?.toFixed(2);
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 group">
      {/* From - Editable with updated positioning */}
      <td className="p-3 bg-card sticky left-0 z-10 border-r border-border min-w-40 w-40">
        {isEditing ? (
          <Input
            type="text"
            value={item?.from || ''}
            onChange={(e) => handleInputUpdate('from', e?.target?.value)}
            placeholder="Enter origin location"
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm font-medium text-foreground truncate">
            {item?.from || 'Enter location'}
          </div>
        )}
      </td>

      {/* To - Editable with updated positioning */}
      <td className="p-3 bg-card sticky left-40 z-10 border-r border-border min-w-40 w-40">
        {isEditing ? (
          <Input
            type="text"
            value={item?.to || ''}
            onChange={(e) => handleInputUpdate('to', e?.target?.value)}
            placeholder="Enter destination"
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm font-medium text-foreground truncate">
            {item?.to || 'Enter destination'}
          </div>
        )}
      </td>

      {/* Vehicle Size - Editable with updated positioning */}
      <td className="p-3 bg-card sticky left-80 z-10 border-r border-border min-w-44 w-44">
        {isEditing ? (
          <Select
            placeholder="Select vehicle size"
            options={vehicleSizeOptions}
            value={item?.vehicleSize}
            onChange={(value) => handleInputUpdate('vehicleSize', value)}
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm text-muted-foreground truncate">
            {vehicleSizeOptions?.find(opt => opt?.value === item?.vehicleSize)?.label || 'Select size'}
          </div>
        )}
      </td>

      {/* Load with updated positioning */}
      <td className="p-3 bg-card sticky left-[21rem] z-10 border-r border-border min-w-36 w-36">
        {isEditing ? (
          <Input
            type="text"
            value={item?.load || ''}
            onChange={(e) => handleInputUpdate('load', e?.target?.value)}
            placeholder="Enter load details"
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm text-muted-foreground truncate">
            {item?.load || 'Enter load'}
          </div>
        )}
      </td>

      {/* Dimensions with updated positioning */}
      <td className="p-3 bg-card sticky left-[30rem] z-10 border-r border-border min-w-40 w-40">
        {isEditing ? (
          <Input
            type="text"
            value={item?.dimensions || ''}
            onChange={(e) => handleInputUpdate('dimensions', e?.target?.value)}
            placeholder="L x W x H"
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm text-muted-foreground truncate">
            {item?.dimensions || 'Enter dimensions'}
          </div>
        )}
      </td>

      {/* Frequency/Month with updated positioning */}
      <td className="p-3 bg-card sticky left-[40rem] z-10 border-r border-border min-w-44 w-44">
        {isEditing ? (
          <Select
            placeholder="Select frequency"
            options={frequencyOptions}
            value={item?.frequency}
            onChange={(value) => handleInputUpdate('frequency', value)}
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm text-muted-foreground truncate">
            {frequencyOptions?.find(opt => opt?.value === item?.frequency)?.label || 'Select frequency'}
          </div>
        )}
      </td>

      {/* Suggestion (auto-fetched) with updated positioning */}
      <td className="p-3 bg-card sticky left-[51rem] z-10 border-r border-border min-w-48 w-48">
        <div className="flex items-center space-x-2">
          <Icon name="Award" size={14} className="text-green-600 flex-shrink-0" />
          <div className="text-sm font-medium text-green-600 truncate">
            {getLeastQuotedSupplier()}
          </div>
        </div>
      </td>

      {/* Dynamic Supplier Columns with consistent width */}
      {quotes?.map((quote, quoteIndex) => {
        const supplier = suppliers?.find(s => s?.id === quote?.supplierId);
        return (
          <td key={quoteIndex} className="p-3 border-r border-border min-w-80 w-80">
            <div className="space-y-3">
              {/* Vendor Name */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">Vendor Name</div>
                <div className="text-sm font-medium text-foreground truncate">
                  {supplier?.name || 'Select Supplier'}
                </div>
              </div>

              {/* Rate */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">Rate</div>
                <Input
                  type="number"
                  value={quote?.rate || ''}
                  onChange={(e) => handleQuoteUpdate(quoteIndex, 'rate', e?.target?.value)}
                  placeholder="0.00"
                  className="w-full text-sm"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Sum Amount */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">Sum Amount</div>
                <div className="text-sm font-bold text-primary">
                  ${calculateAmount(quote?.rate || 0, item?.frequency || 1)}
                </div>
              </div>

              {/* Attachment Status */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium">Attachment</div>
                <div className="flex items-center space-x-1">
                  {quote?.attachment ? (
                    <>
                      <Icon name="CheckCircle" size={12} className="text-green-600" />
                      <span className="text-xs text-green-600">Attached</span>
                    </>
                  ) : (
                    <>
                      <Icon name="AlertCircle" size={12} className="text-orange-500" />
                      <span className="text-xs text-orange-500">No file</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </td>
        );
      })}

      {/* Actions Column with consistent width */}
      <td className="p-3 min-w-32 w-32">
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            iconName={isEditing ? "Check" : "Edit"}
            onClick={() => onEditToggle(item?.id)}
            className="text-muted-foreground hover:text-primary"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Copy"
            onClick={() => onDuplicateRow(item?.id)}
            className="text-muted-foreground hover:text-primary"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            onClick={() => onDeleteRow(item?.id)}
            className="text-muted-foreground hover:text-destructive"
          />
        </div>
      </td>
    </tr>
  );
};

export default TransportItemRow;