import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const FilterControls = ({ 
  filters, 
  onFilterChange, 
  onSearch, 
  onClearFilters,
  searchQuery,
  onSearchChange 
}) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Pending', label: 'Pending' },
    { value: 'In Review', label: 'In Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' }
  ];

  const supplierOptions = [
    { value: '', label: 'All Suppliers' },
    { value: 'acme-corp', label: 'ACME Corporation' },
    { value: 'global-supply', label: 'Global Supply Co.' },
    { value: 'tech-solutions', label: 'Tech Solutions Ltd.' },
    { value: 'industrial-parts', label: 'Industrial Parts Inc.' },
    { value: 'quality-materials', label: 'Quality Materials LLC' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'raw-materials', label: 'Raw Materials' },
    { value: 'office-supplies', label: 'Office Supplies' },
    { value: 'safety-equipment', label: 'Safety Equipment' }
  ];

  const hasActiveFilters = filters?.status || filters?.supplier || filters?.dateRange || filters?.category || searchQuery;

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 lg:max-w-md">
          <Input
            type="search"
            placeholder="Search RFQs by ID, description, or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 lg:flex-1 lg:justify-end">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:flex lg:space-x-4">
            <Select
              placeholder="Status"
              options={statusOptions}
              value={filters?.status}
              onChange={(value) => onFilterChange('status', value)}
              className="min-w-[140px]"
            />
            
            <Select
              placeholder="Supplier"
              options={supplierOptions}
              value={filters?.supplier}
              onChange={(value) => onFilterChange('supplier', value)}
              className="min-w-[160px]"
              searchable
            />
            
            <Select
              placeholder="Date Range"
              options={dateRangeOptions}
              value={filters?.dateRange}
              onChange={(value) => onFilterChange('dateRange', value)}
              className="min-w-[140px]"
            />
            
            <Select
              placeholder="Category"
              options={categoryOptions}
              value={filters?.category}
              onChange={(value) => onFilterChange('category', value)}
              className="min-w-[140px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              iconName="Search"
              onClick={onSearch}
            >
              Search
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                iconName="X"
                onClick={onClearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
            
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Search: "{searchQuery}"
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1 hover:text-primary/80"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters?.status && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Status: {statusOptions?.find(opt => opt?.value === filters?.status)?.label}
                <button
                  onClick={() => onFilterChange('status', '')}
                  className="ml-1 hover:text-primary/80"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters?.supplier && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Supplier: {supplierOptions?.find(opt => opt?.value === filters?.supplier)?.label}
                <button
                  onClick={() => onFilterChange('supplier', '')}
                  className="ml-1 hover:text-primary/80"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters?.dateRange && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Date: {dateRangeOptions?.find(opt => opt?.value === filters?.dateRange)?.label}
                <button
                  onClick={() => onFilterChange('dateRange', '')}
                  className="ml-1 hover:text-primary/80"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters?.category && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Category: {categoryOptions?.find(opt => opt?.value === filters?.category)?.label}
                <button
                  onClick={() => onFilterChange('category', '')}
                  className="ml-1 hover:text-primary/80"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;