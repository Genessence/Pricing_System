import React from "react";
import Select from "../../../../components/ui/Select";

const QuotationFormDropdowns = ({
  selectedCommodity,
  selectedProductType,
  selectedWorkType,
  onCommodityChange,
  onProductTypeChange,
  onWorkTypeChange,
}) => {
  // Dropdown options
  const commodityOptions = [
    { value: "provided_data", label: "Indent Items" },
    {
      value: "service",
      label: "Service Request ( Repair, Civil , Fabrication etc)",
    },
    { value: "transport", label: "Transport Request" },
  ];

  const productTypeOptions = [
    { value: "standard", label: "Standard" },
    { value: "non_standard", label: "Non Standard" },
    { value: "original_maker", label: "Original Maker" },
  ];

  // Dynamic work type options based on commodity selection
  const getWorkTypeOptions = () => {
    const baseOptions = [{ value: "normal", label: "Normal (TAT 2 Days)" }];

    // Only show "Urgent" option if Transport is NOT selected
    if (selectedCommodity !== "transport") {
      baseOptions.push({
        value: "urgent",
        label: "Urgent (Plant Head Sir Approval Required)",
      });
    }

    return baseOptions;
  };

  const workTypeOptions = getWorkTypeOptions();

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Quotation Configuration
        </h3>
        <div className="text-sm text-muted-foreground">
          Select form type and configuration options
        </div>
      </div>

      <div
        className={`grid gap-6 ${
          selectedCommodity === "transport"
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-3"
        }`}
      >
        {/* Commodity Dropdown */}
        <div>
          <Select
            label="Commodity"
            placeholder="Select Commodity"
            value={selectedCommodity}
            onChange={onCommodityChange}
            options={commodityOptions}
            className="w-full"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Determines which form will be displayed below
          </p>
        </div>

        {/* Product Type Dropdown
        <div>
          <Select
            label="Product Type"
            placeholder="Select Product Type"
            value={selectedProductType}
            onChange={onProductTypeChange}
            options={productTypeOptions}
            className="w-full"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Classification of the product category
          </p>
        </div> */}

        {/* Type of Work Dropdown - Hidden for Transport */}
        {selectedCommodity !== "transport" && (
          <div>
            <Select
              label="Type of Work"
              placeholder="Select Work Type"
              value={selectedWorkType}
              onChange={onWorkTypeChange}
              options={workTypeOptions}
              className="w-full"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {selectedWorkType === "urgent"
                ? "Requires special approval"
                : "Standard processing time"}
            </p>
          </div>
        )}
      </div>

      {/* Transport Notice */}
      {selectedCommodity === "transport" && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-orange-800">
                Transport Configuration
              </h4>
              <div className="mt-1 text-sm text-orange-700">
                <p>
                  Type of Work field is not available for Transport commodity
                  type. Transport quotations use standard processing time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationFormDropdowns;
