import React, { useState, useRef, useEffect } from "react";

import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Button from "../../../../components/ui/Button";

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
  onEditToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState(item?.itemCode || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const searchRef = useRef(null);

  // const filteredERPItems = erpItems?.filter(
  //   (erpItem) =>
  //     erpItem?.item_code?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
  //     erpItem?.description
  //       ?.toLowerCase()
  //       ?.includes(searchTerm?.toLowerCase()) ||
  //     erpItem?.specifications
  //       ?.toLowerCase()
  //       ?.includes(searchTerm?.toLowerCase())
  // );

  const filteredERPItems = React.useMemo(() => {
    if (!erpItems || !Array.isArray(erpItems)) return [];
    return erpItems
      .filter(
        (erpItem) =>
          erpItem?.item_code
            ?.toLowerCase()
            ?.includes(searchTerm?.toLowerCase()) ||
          erpItem?.description
            ?.toLowerCase()
            ?.includes(searchTerm?.toLowerCase()) ||
          erpItem?.specifications
            ?.toLowerCase()
            ?.includes(searchTerm?.toLowerCase())
      )
      .sort((a, b) =>
        (a?.item_code || "").localeCompare(b?.item_code || "", undefined, {
          sensitivity: "base",
        })
      );
  }, [erpItems, searchTerm]);

  const handleERPItemSelect = (erpItem) => {
    onItemUpdate(item?.id, {
      itemCode: erpItem?.item_code,
      description: erpItem?.description,
      specifications: erpItem?.specifications,
      uom: erpItem?.unit_of_measure,
      erpItemId: erpItem?.id,
      last_buying_price: erpItem?.last_buying_price,
      last_vendor: erpItem?.last_vendor,
    });
    setSearchTerm(erpItem?.item_code);
    setShowSuggestions(false);
    setIsManualEntry(false);
  };

  const handleQuantityChange = (value) => {
    const quantity = parseFloat(value) || 0;
    onItemUpdate(item?.id, { requiredQuantity: quantity });
  };

  const handleManualEntry = () => {
    setIsManualEntry(true);
    setShowSuggestions(false);
    // Clear auto-filled data when switching to manual entry
    onItemUpdate(item?.id, {
      description: "",
      specifications: "",
      uom: "",
      erpItemId: null,
    });
  };

  const handleManualFieldChange = (field, value) => {
    onItemUpdate(item?.id, { [field]: value });
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className="border-b border-border hover:bg-muted/50 group">
      {/* Item Column - Search ERP Items */}
      <td className="sticky p-3 bg-card left-0 border-r border-border min-w-48">
        <div className="" ref={searchRef}>
          {isEditing ? (
            <>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e?.target?.value);
                  setShowSuggestions(true);
                }}
                placeholder="Search ERP Items..."
                className="w-full"
              />
              {showSuggestions && filteredERPItems?.length > 0 && (
                <div className="top-full left-0 right-0 bg-popover border border-border rounded-lg shadow-elevated z-20 max-h-48 overflow-y-auto">
                  {filteredERPItems?.slice(0, 10)?.map((erpItem) => (
                    <div
                      key={erpItem?.id}
                      onClick={() => handleERPItemSelect(erpItem)}
                      className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                    >
                      <div className="font-medium text-sm text-foreground">
                        {erpItem?.item_code} - {erpItem?.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {erpItem?.specifications}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showSuggestions &&
                filteredERPItems?.length === 0 &&
                searchTerm && (
                  <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg shadow-elevated z-20 p-3">
                    <div className="text-sm text-muted-foreground mb-2">
                      No ERP item found
                    </div>
                    <Button
                      onClick={handleManualEntry}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Add New Item Manually
                    </Button>
                  </div>
                )}
            </>
          ) : (
            <div className="text-sm font-medium text-foreground">
              {item?.itemCode || "Search ERP Items"}
            </div>
          )}
        </div>
      </td>

      {/* Description Column - Auto-filled or Manual Entry */}
      <td className="p-3 bg-card sticky left-48 z-10 border-r border-border min-w-48">
        {isEditing ? (
          <Input
            type="text"
            value={item?.description || ""}
            onChange={(e) =>
              handleManualFieldChange("description", e?.target?.value)
            }
            placeholder="Description"
            className="w-full"
            disabled={!isManualEntry && item?.erpItemId}
          />
        ) : (
          <div className="text-sm text-foreground">
            {item?.description || "-"}
          </div>
        )}
      </td>
      {/* Specifications Column - Auto-filled or Manual Entry */}
      <td className="p-3 bg-card sticky left-96 z-10 border-r border-border min-w-48">
        {isEditing ? (
          <Input
            type="text"
            value={item?.specifications || ""}
            onChange={(e) =>
              handleManualFieldChange("specifications", e?.target?.value)
            }
            placeholder="Specifications"
            className="w-full"
            disabled={!isManualEntry && item?.erpItemId}
          />
        ) : (
          <div className="text-sm text-muted-foreground max-w-48 truncate">
            {item?.specifications || "-"}
          </div>
        )}
      </td>

      {/* Quantity Column */}
      <td className="p-3 bg-card sticky left-144 z-10 border-r border-border min-w-24">
        <Input
          type="number"
          value={item?.requiredQuantity || ""}
          onChange={(e) => handleQuantityChange(e?.target?.value)}
          placeholder="0"
          className="w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="0"
          step="0.01"
        />
      </td>

      {/* UOM Column - Auto-filled or Manual Entry */}
      <td className="p-3 bg-card sticky left-168 z-10 border-r border-border min-w-24">
        {isEditing ? (
          <Input
            type="text"
            value={item?.uom || ""}
            onChange={(e) => handleManualFieldChange("uom", e?.target?.value)}
            placeholder="UOM"
            className="w-full"
            disabled={!isManualEntry && item?.erpItemId}
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            {item?.uom || "-"}
          </div>
        )}
      </td>
      <td className="p-3 bg-card sticky left-192 z-10 border-r border-border min-w-32">
        <div className="text-sm font-medium text-center text-foreground">
          ₹
          {typeof item?.last_buying_price === "number"
            ? item?.last_buying_price?.toFixed(2)
            : item?.last_buying_price || "0.00"}
        </div>
      </td>
      <td className="p-3 bg-card sticky left-224 z-10 border-r border-border min-w-48">
        <div className="text-sm text-muted-foreground">
          {item?.last_vendor || "-"}
        </div>
      </td>
      {/* Dynamic Quote Columns */}
      {quotes?.map((quote, quoteIndex) => (
        <td key={quoteIndex} className="p-3 border-r border-border">
          <div className="space-y-2 flex justify-evenly">
            <Input
              type="number"
              value={quote?.rate || ""}
              onChange={(e) =>
                handleQuoteRateChange(quoteIndex, e?.target?.value)
              }
              placeholder="0.00"
              className="w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              step="0.01"
            />
            <div className="text-sm font-medium text-primary">
              ₹{calculateAmount(quote?.rate || 0, item?.requiredQuantity || 0)}
            </div>
          </div>
        </td>
      ))}
    </tr>
  );
};

export default ERPItemRow;
