import React from 'react';
import Select from '../../../components/ui/Select';

const QuotationFormDropdowns = ({ 
  selectedCommodity, 
  selectedProductType, 
  selectedWorkType, 
  onCommodityChange, 
  onProductTypeChange, 
  onWorkTypeChange 
}) => {
  // Dropdown options
  const commodityOptions = [
    { value: 'provided_data', label: 'Provided Data' },
    { value: 'service', label: 'Service' },
    { value: 'transport', label: 'Transport' }
  ];

  const productTypeOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'non_standard', label: 'Non Standard' },
    { value: 'original_maker', label: 'Original Maker' }
  ];

  const workTypeOptions = [
    { value: 'normal', label: 'Normal (TAT 2 Days)' },
    { value: 'urgent', label: 'Urgent (Plant Head Sir Approval Required)' }
  ];

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Product Type Dropdown */}
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
        </div>

        {/* Type of Work Dropdown */}
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
            {selectedWorkType === 'urgent' ? 'Requires special approval' : 'Standard processing time'}
          </p>
        </div>
      </div>

      {/* Information Banner */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">
              Form Configuration
            </h4>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                {selectedCommodity === 'provided_data' && 'Currently showing: Provided Data quotation form (default)'}
                {selectedCommodity === 'service' && 'Service quotation form will be available in future updates'}
                {selectedCommodity === 'transport' && 'Transport quotation form will be available in future updates'}
                {!selectedCommodity && 'Please select a commodity to view the appropriate quotation form'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      {(selectedCommodity === 'service' || selectedCommodity === 'transport') && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                {selectedCommodity === 'transport' ? 'Transport Form Active' : 'Coming Soon'}
              </h4>
              <div className="mt-1 text-sm text-yellow-700">
                <p>
                  {selectedCommodity === 'service' ? 'Service quotation form is under development. For now, you can use the current "Provided Data" form below.' : 'Transport quotation form is now available with columns for From, To, Vehicle Size, Load, Dimensions, Frequency/Month, Suggestion, and supplier data fields.'}
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