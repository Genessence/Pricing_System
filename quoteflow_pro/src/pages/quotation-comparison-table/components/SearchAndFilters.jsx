import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const SearchAndFilters = ({ 
  searchTerm, 
  onSearchChange, 
  selectedSupplier, 
  onSupplierFilter, 
  suppliers,
  onClearFilters 
}) => {
  const supplierOptions = [
    { value: '', label: 'All Suppliers' },
    ...suppliers?.map(supplier => ({
      value: supplier?.id,
      label: supplier?.name,
      description: supplier?.location
    }))
  ];

  const hasActiveFilters = searchTerm || selectedSupplier;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1 max-w-md">
        <Input
          type="search"
          placeholder="Search items, specifications..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e?.target?.value)}
          className="w-full"
        />
      </div>
      <div className="w-64">
        <Select
          placeholder="Filter by supplier"
          options={supplierOptions}
          value={selectedSupplier}
          onChange={onSupplierFilter}
          searchable
        />
      </div>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          iconName="X"
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear
        </Button>
      )}
    </div>
  );
};

export default SearchAndFilters;