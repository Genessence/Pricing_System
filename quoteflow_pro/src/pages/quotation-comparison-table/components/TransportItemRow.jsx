import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TransportItemRow = ({ 
  item, 
  quotes, 
  suppliers, 
  onItemChange, 
  onQuoteUpdate, 
  onRemoveItem,
  isEditing = false 
}) => {
  const [localItem, setLocalItem] = useState(item || {});

  const handleItemChange = (field, value) => {
    const updatedItem = { ...localItem, [field]: value };
    setLocalItem(updatedItem);
    onItemChange?.(updatedItem);
  };

  const handleQuoteUpdate = (quoteIndex, field, value) => {
    onQuoteUpdate?.(quoteIndex, field, value);
  };

  const calculateAmount = (rate, frequency) => {
    const numRate = parseFloat(rate) || 0;
    const numFreq = parseInt(frequency) || 1;
    return (numRate * numFreq).toFixed(2);
  };

  const vehicleSizeOptions = [
    { value: 'small', label: 'Small (1-2 tons)' },
    { value: 'medium', label: 'Medium (3-5 tons)' },
    { value: 'large', label: 'Large (6-10 tons)' },
    { value: 'xl', label: 'Extra Large (10+ tons)' }
  ];

  const frequencyOptions = [
    { value: 1, label: '1 time/month' },
    { value: 2, label: '2 times/month' },
    { value: 3, label: '3 times/month' },
    { value: 4, label: '4 times/month' },
    { value: 5, label: '5 times/month' },
    { value: 6, label: '6 times/month' },
    { value: 8, label: '8 times/month' },
    { value: 10, label: '10 times/month' },
    { value: 12, label: '12 times/month' },
    { value: 15, label: '15 times/month' },
    { value: 20, label: '20 times/month' },
    { value: 25, label: '25 times/month' },
    { value: 30, label: '30 times/month' }
  ];

  return (
    <tr className="border-b border-border hover:bg-muted/50 group">
      {/* From - Fixed positioning */}
      <td className="p-3 bg-card sticky left-0 z-10 border-r border-border min-w-40">
        {isEditing ? (
          <Input
            type="text"
            value={localItem?.from || ''}
            onChange={(e) => handleItemChange('from', e?.target?.value)}
            placeholder="Enter source location..."
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm font-medium text-foreground">
            {localItem?.from || 'Not specified'}
          </div>
        )}
      </td>

      {/* To - Fixed positioning */}
      <td className="p-3 bg-card sticky left-40 z-10 border-r border-border min-w-40">
        {isEditing ? (
          <Input
            type="text"
            value={localItem?.to || ''}
            onChange={(e) => handleItemChange('to', e?.target?.value)}
            placeholder="Enter destination..."
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm font-medium text-foreground">
            {localItem?.to || 'Not specified'}
          </div>
        )}
      </td>

      {/* Vehicle Size - Fixed positioning */}
      <td className="p-3 bg-card sticky left-80 z-10 border-r border-border min-w-44">
        {isEditing ? (
          <Select
            placeholder="Select vehicle size..."
            options={vehicleSizeOptions}
            value={localItem?.vehicleSize}
            onChange={(value) => handleItemChange('vehicleSize', value)}
            className="text-sm"
          />
        ) : (
          <div className="text-sm font-medium text-foreground">
            {vehicleSizeOptions?.find(opt => opt?.value === localItem?.vehicleSize)?.label || 'Not specified'}
          </div>
        )}
      </td>

      {/* Load with updated positioning */}
      <td className="p-3 bg-card sticky left-[21rem] z-10 border-r border-border min-w-36">
        {isEditing ? (
          <Input
            type="text"
            value={localItem?.load || ''}
            onChange={(e) => handleItemChange('load', e?.target?.value)}
            placeholder="Enter load details..."
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm font-medium text-foreground">
            {localItem?.load || 'Not specified'}
          </div>
        )}
      </td>

      {/* Dimensions with updated positioning */}
      <td className="p-3 bg-card sticky left-[30rem] z-10 border-r border-border min-w-40">
        {isEditing ? (
          <Input
            type="text"
            value={localItem?.dimensions || ''}
            onChange={(e) => handleItemChange('dimensions', e?.target?.value)}
            placeholder="L x W x H..."
            className="w-full text-sm"
          />
        ) : (
          <div className="text-sm font-medium text-foreground">
            {localItem?.dimensions || 'Not specified'}
          </div>
        )}
      </td>

      {/* Frequency/Month with updated positioning */}
      <td className="p-3 bg-card sticky left-[40rem] z-10 border-r border-border min-w-44">
        {isEditing ? (
          <Select
            placeholder="Select frequency..."
            options={frequencyOptions}
            value={localItem?.frequency}
            onChange={(value) => handleItemChange('frequency', value)}
            className="text-sm"
          />
        ) : (
          <div className="text-sm font-medium text-foreground">
            {frequencyOptions?.find(opt => opt?.value === localItem?.frequency)?.label || 'Not specified'}
          </div>
        )}
      </td>

      {/* Suggestion (auto-fetched) with updated positioning */}
      <td className="p-3 bg-card sticky left-[51rem] z-30 border-r border-border min-w-48">
        <div className="flex items-center space-x-2">
          <Icon name="Award" size={14} className="text-green-600 flex-shrink-0" />
          <div className="text-sm text-foreground">
            {localItem?.suggestion || 'Auto-generated based on route and load'}
          </div>
        </div>
      </td>

      {/* Dynamic Supplier Columns - Matching Provided Data and Service Layout */}
      {quotes?.map((quote, quoteIndex) => (
        <td key={quoteIndex} className="p-3 border-r border-border min-w-64 bg-background relative z-0">
          <div className="space-y-2">
            {/* Rate Input */}
            <Input
              type="number"
              value={quote?.rate || ''}
              onChange={(e) => handleQuoteUpdate(quoteIndex, 'rate', e?.target?.value)}
              placeholder="0.00"
              className="w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              step="0.01"
            />
            {/* Calculated Amount */}
            <div className="text-sm font-medium text-primary">
              ₹{calculateAmount(quote?.rate || 0, localItem?.frequency || 1)}
            </div>
          </div>
        </td>
      ))}

      {/* Empty cell for Add Quotation button alignment */}
      <td className="p-3 bg-muted/5 min-w-48 bg-background relative z-0">
        <div className="text-xs text-muted-foreground text-center">
          {/* Empty for alignment */}
        </div>
      </td>
    </tr>
  );
};

export default TransportItemRow;