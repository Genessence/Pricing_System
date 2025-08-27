import React, { useState, useRef, useEffect } from 'react';

import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const ERPItemRow = ({ 
  item, 
  quotes, 
  suppliers,
  onItemUpdate, 
  onQuoteUpdate, 
  onDeleteRow, 
  onDuplicateRow,
  erpItems,
  isEditing,
  onEditToggle
}) => {
  const [searchTerm, setSearchTerm] = useState(item?.description || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const filteredERPItems = erpItems?.filter(erpItem =>
    erpItem?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    erpItem?.specifications?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleERPItemSelect = (erpItem) => {
    onItemUpdate(item?.id, {
      description: erpItem?.description,
      vendorCode: erpItem?.vendorCode || '', // Include vendor code when selecting ERP item
      specifications: erpItem?.specifications,
      uom: erpItem?.uom,
      commodity: erpItem?.commodity,
      lastBuyingPrice: erpItem?.lastBuyingPrice,
      lastVendor: erpItem?.lastVendor
    });
    setSearchTerm(erpItem?.description);
    setShowSuggestions(false);
  };

  const handleQuantityChange = (value) => {
    const quantity = parseFloat(value) || 0;
    onItemUpdate(item?.id, { requiredQuantity: quantity });
  };

  const handleQuoteRateChange = (quoteIndex, rate) => {
    const numericRate = parseFloat(rate) || 0;
    onQuoteUpdate(item?.id, quoteIndex, { rate: numericRate });
  };

  const calculateAmount = (rate, quantity) => {
    return (rate * quantity)?.toFixed(2);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <tr className="border-b border-border hover:bg-muted/50 group">
      {/* Fixed Left Columns */}
      <td className="p-3 bg-card sticky left-0 z-10 border-r border-border">
        <div className="relative" ref={searchRef}>
          {isEditing ? (
            <>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e?.target?.value);
                  setShowSuggestions(true);
                }}
                placeholder="Search ERP items..."
                className="w-full"
              />
              {showSuggestions && filteredERPItems?.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg shadow-elevated z-20 max-h-48 overflow-y-auto">
                  {filteredERPItems?.slice(0, 10)?.map((erpItem) => (
                    <div
                      key={erpItem?.id}
                      onClick={() => handleERPItemSelect(erpItem)}
                      className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                    >
                      <div className="font-medium text-sm text-foreground">
                        {erpItem?.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {erpItem?.specifications}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm font-medium text-foreground">
              {item?.description || 'Select ERP Item'}
            </div>
          )}
        </div>
      </td>
      <td className="p-3 bg-card sticky left-48 z-10 border-r border-border">
        <div className="text-sm text-muted-foreground max-w-48 truncate">
          {item?.specifications || '-'}
        </div>
      </td>
             <td className="p-3 bg-card sticky left-96 z-10 border-r border-border">
         <Input
           type="number"
           value={item?.requiredQuantity || ''}
           onChange={(e) => handleQuantityChange(e?.target?.value)}
           placeholder="0"
           className="w-24"
           min="0"
           step="0.01"
         />
       </td>
      <td className="p-3 bg-card sticky left-120 z-10 border-r border-border">
        <div className="text-sm text-muted-foreground">
          {item?.uom || '-'}
        </div>
      </td>
      <td className="p-3 bg-card sticky left-144 z-10 border-r border-border">
        <div className="text-sm font-medium text-foreground">
          ${item?.lastBuyingPrice || '0.00'}
        </div>
      </td>
      <td className="p-3 bg-card sticky left-168 z-10 border-r border-border">
        <div className="text-sm text-muted-foreground">
          {item?.lastVendor || '-'}
        </div>
      </td>
      {/* Dynamic Quote Columns */}
      {quotes?.map((quote, quoteIndex) => (
        <td key={quoteIndex} className="p-3 border-r border-border">
          <div className="space-y-2">
            <Input
              type="number"
              value={quote?.rate || ''}
              onChange={(e) => handleQuoteRateChange(quoteIndex, e?.target?.value)}
              placeholder="0.00"
              className="w-24"
              min="0"
              step="0.01"
            />
            <div className="text-sm font-medium text-primary">
              ${calculateAmount(quote?.rate || 0, item?.requiredQuantity || 0)}
            </div>
          </div>
        </td>
      ))}
      
    </tr>
  );
};

export default ERPItemRow;