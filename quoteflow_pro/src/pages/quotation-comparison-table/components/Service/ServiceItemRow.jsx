import React, { useState } from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";

const ServiceItemRow = ({
  item,
  isEditing,
  onItemChange,
  quotes = [],
  suppliers = [],
  onSupplierChange,
  onRateChange,
  onAmountChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localValues, setLocalValues] = useState({});

  const handleItemChange = (field, value) => {
    console.log("handleItemChange called:", { field, value, itemId: item?.id });
    console.log("Current item state:", item);
    onItemChange(item?.id, field, value);
  };

  const supplierOptions = suppliers?.map((supplier) => ({
    value: supplier?.id,
    label: `${supplier?.vendorCode} - ${supplier?.name}`,
    description: supplier?.location,
  }));

  const calculateAmount = (rate, quantity) => {
    const rateValue = parseFloat(rate) || 0;
    const qtyValue = parseFloat(quantity) || 0;
    const result = (rateValue * qtyValue).toFixed(2);
    console.log("calculateAmount:", {
      rate,
      quantity,
      rateValue,
      qtyValue,
      result,
    });
    return result;
  };

  // Debug: Log the item prop
  console.log("ServiceItemRow render - item prop:", item);

  // Test calculation
  const testCalculation = (2.25 * 1).toFixed(2);
  console.log("Test calculation (2.25 * 1):", testCalculation);

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors h-16">
      {/* Description - Always Editable */}
      <td className="p-3 bg-card sticky left-0 z-10 border-r border-border">
        <input
          type="text"
          value={item?.description || ""}
          onChange={(e) => {
            console.log("Description onChange:", e?.target?.value);
            handleItemChange("description", e?.target?.value);
          }}
          placeholder="Enter description..."
          className="w-full text-sm px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </td>

      {/* Specification - Always Editable */}
      <td className="p-3 bg-card sticky left-52 z-10 border-r border-border">
        <input
          type="text"
          value={item?.specifications || ""}
          onChange={(e) => handleItemChange("specifications", e?.target?.value)}
          placeholder="Enter specification..."
          className="w-full text-sm px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </td>

      {/* UOM - Always Editable */}
      <td className="p-3 bg-card sticky left-112 z-10 border-r border-border">
        <input
          type="text"
          value={item?.uom || ""}
          onChange={(e) => handleItemChange("uom", e?.target?.value)}
          placeholder="Enter UOM..."
          className="w-full text-sm px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </td>

      {/* Required Quantity - Always Editable */}
      <td className="p-3 bg-card sticky left-148 z-10 border-r border-border">
        <input
          type="number"
          value={
            localValues.requiredQuantity !== undefined
              ? localValues.requiredQuantity
              : item?.requiredQuantity || ""
          }
          onChange={(e) => {
            const value = e?.target?.value;
            setLocalValues((prev) => ({ ...prev, requiredQuantity: value }));
          }}
          onBlur={(e) => {
            const value = e?.target?.value;
            handleItemChange("requiredQuantity", value);
            setLocalValues((prev) => ({
              ...prev,
              requiredQuantity: undefined,
            }));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = e?.target?.value;
              handleItemChange("requiredQuantity", value);
              setLocalValues((prev) => ({
                ...prev,
                requiredQuantity: undefined,
              }));
              e.target.blur();
            }
          }}
          placeholder="Enter quantity..."
          className="w-full text-sm px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="0"
          step="0.01"
        />
      </td>

      {/* Rate - Always Editable */}
      <td className="p-3 bg-card sticky left-188 z-10 border-r border-border">
        <input
          type="number"
          value={
            localValues.rate !== undefined ? localValues.rate : item?.rate || ""
          }
          onChange={(e) => {
            const value = e?.target?.value;
            setLocalValues((prev) => ({ ...prev, rate: value }));
          }}
          onBlur={(e) => {
            const value = e?.target?.value;
            handleItemChange("rate", value);
            setLocalValues((prev) => ({ ...prev, rate: undefined }));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = e?.target?.value;
              handleItemChange("rate", value);
              setLocalValues((prev) => ({ ...prev, rate: undefined }));
              e.target.blur();
            }
          }}
          placeholder="Enter rate..."
          className="w-full text-sm px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="0"
          step="0.01"
        />
      </td>

      {/* Supplier Quote Columns - Matching Provided Data Table */}
      {quotes?.map((quote, quoteIndex) => {
        console.log("Quote data:", { quoteIndex, quote, itemId: item?.id });
        return (
          <td key={quoteIndex} className="p-3 border-r border-border">
            <div className="space-y-2 flex justify-evenly">
              {/* Rate Input */}
              <input
                type="number"
                value={
                  localValues[`quote_${quoteIndex}`] !== undefined
                    ? localValues[`quote_${quoteIndex}`]
                    : quote?.rate || ""
                }
                onChange={(e) => {
                  const value = e?.target?.value;
                  setLocalValues((prev) => ({
                    ...prev,
                    [`quote_${quoteIndex}`]: value,
                  }));
                }}
                onBlur={(e) => {
                  const value = e?.target?.value;
                  onRateChange(quoteIndex, value);
                  setLocalValues((prev) => ({
                    ...prev,
                    [`quote_${quoteIndex}`]: undefined,
                  }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = e?.target?.value;
                    onRateChange(quoteIndex, value);
                    setLocalValues((prev) => ({
                      ...prev,
                      [`quote_${quoteIndex}`]: undefined,
                    }));
                    e.target.blur();
                  }
                }}
                placeholder="0.00"
                className="w-24 px-2 py-1 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
                step="0.01"
              />
              {/* Calculated Amount */}
              <div className="text-sm font-medium text-primary">
                ₹{calculateAmount(quote?.rate, item?.requiredQuantity)}
              </div>
            </div>
          </td>
        );
      })}

      {/* Empty cell for Add Quotation button alignment */}
      <td className="p-3 bg-muted/5">
        <div className="text-xs text-muted-foreground text-center">
          {/* Empty for alignment */}
        </div>
      </td>
    </tr>
  );
};

export default ServiceItemRow;
