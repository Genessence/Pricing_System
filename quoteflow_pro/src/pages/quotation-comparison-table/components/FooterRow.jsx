import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FooterRow = ({ 
  label, 
  type, 
  quotes, 
  onFooterUpdate, 
  options = [] 
}) => {
  const handleValueChange = (quoteIndex, value) => {
    onFooterUpdate(quoteIndex, label?.toLowerCase()?.replace(/\s+/g, '_'), value);
  };

  const renderCell = (quote, quoteIndex) => {
    const fieldKey = label?.toLowerCase()?.replace(/\s+/g, '_');
    const currentValue = quote?.footer?.[fieldKey] || '';

    switch (type) {
      case 'select':
        return (
          <Select
            options={options}
            value={currentValue}
            onChange={(value) => handleValueChange(quoteIndex, value)}
            placeholder="Select..."
            className="w-full text-sm"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleValueChange(quoteIndex, e?.target?.value)}
            placeholder="0.00"
            className="w-full text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0"
            step="0.01"
          />
        );
      
      case 'text':
        return (
          <Input
            type="text"
            value={currentValue}
            onChange={(e) => handleValueChange(quoteIndex, e?.target?.value)}
            placeholder="Enter value..."
            className="w-full text-sm"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={currentValue}
            onChange={(e) => handleValueChange(quoteIndex, e?.target?.value)}
            placeholder="Enter remarks..."
            className="w-full p-2.5 text-sm border border-border rounded-md bg-input text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            rows={3}
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={currentValue}
            onChange={(e) => handleValueChange(quoteIndex, e?.target?.value)}
            placeholder="Enter value..."
            className="w-full text-sm"
          />
        );
    }
  };

  return (
    <tr className="border-b border-border bg-muted/20 hover:bg-muted/30 transition-colors duration-150">
      {/* Label Column - Properly aligned with main table structure */}
      <td className="p-4 bg-card sticky left-0 z-10 border-r border-border min-w-48 max-w-48">
        <div className="font-medium text-sm text-foreground flex items-center h-full">
          {label}
        </div>
      </td>
      
      {/* Specifications Column */}
      <td className="p-4 bg-card sticky left-48 z-10 border-r border-border min-w-48 max-w-48">
        <div className="text-xs text-muted-foreground">
          {/* Empty space for alignment */}
        </div>
      </td>
      <td className="p-4 bg-card sticky left-48 z-10 border-r border-border min-w-48 max-w-48">
        <div className="text-xs text-muted-foreground">
          {/* Empty space for alignment */}
        </div>
      </td>
      
      {/* Required Quantity Column */}
      <td className="p-4 bg-card sticky left-96 z-10 border-r border-border min-w-24 max-w-24">
        <div className="text-xs text-muted-foreground">
          {/* Empty space for alignment */}
        </div>
      </td>
      
      {/* UOM Column */}
      <td className="p-4 bg-card sticky left-120 z-10 border-r border-border min-w-20 max-w-20">
        <div className="text-xs text-muted-foreground">
          {/* Empty space for alignment */}
        </div>
      </td>
      
      {/* Last Price Column */}
      <td className="p-4 bg-card sticky left-144 z-10 border-r border-border min-w-24 max-w-24">
        <div className="text-xs text-muted-foreground">
          {/* Empty space for alignment */}
        </div>
      </td>
      
      {/* Last Vendor Column */}
      <td className="p-4 bg-card sticky left-168 z-10 border-r border-border min-w-48 max-w-48">
        <div className="text-xs text-muted-foreground">
          {/* Empty space for alignment */}
        </div>
      </td>

      {/* Dynamic Quote Columns - Properly spaced and styled */}
      {quotes?.map((quote, quoteIndex) => (
        <td key={quoteIndex} className="p-4 border-r border-border min-w-64 max-w-64">
          <div className="w-full">
            {renderCell(quote, quoteIndex)}
          </div>
        </td>
      ))}
      

    </tr>
  );
};

export default FooterRow;