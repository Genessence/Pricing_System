import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SupplierInvitationStep = ({ selectedSuppliers, onSuppliersChange, errors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Mock suppliers data
  const suppliers = [
    {
      id: 'SUP-001',
      name: 'Steel Corp Industries',
      email: 'procurement@steelcorp.com',
      phone: '+1-555-0123',
      location: 'Pittsburgh, PA',
      category: 'Raw Materials',
      certifications: ['ISO 9001', 'ASTM Certified'],
      rating: 4.8,
      responseTime: '2.3 days',
      lastQuoteDate: '2025-01-15',
      totalQuotes: 45,
      successRate: 92
    },
    {
      id: 'SUP-002',
      name: 'Bearing Solutions Ltd',
      email: 'sales@bearingsolutions.com',
      phone: '+1-555-0234',
      location: 'Detroit, MI',
      category: 'Mechanical Parts',
      certifications: ['ISO 9001', 'SKF Authorized'],
      rating: 4.6,
      responseTime: '1.8 days',
      lastQuoteDate: '2025-01-20',
      totalQuotes: 38,
      successRate: 89
    },
    {
      id: 'SUP-003',
      name: 'SafetyFirst Equipment',
      email: 'orders@safetyfirst.com',
      phone: '+1-555-0345',
      location: 'Houston, TX',
      category: 'Safety Equipment',
      certifications: ['ANSI Certified', 'OSHA Compliant'],
      rating: 4.9,
      responseTime: '1.5 days',
      lastQuoteDate: '2025-01-18',
      totalQuotes: 52,
      successRate: 95
    },
    {
      id: 'SUP-004',
      name: 'Industrial Oils Co',
      email: 'sales@industrialoils.com',
      phone: '+1-555-0456',
      location: 'Tulsa, OK',
      category: 'Fluids & Lubricants',
      certifications: ['API Certified', 'ISO 14001'],
      rating: 4.4,
      responseTime: '2.1 days',
      lastQuoteDate: '2025-01-12',
      totalQuotes: 29,
      successRate: 87
    },
    {
      id: 'SUP-005',
      name: 'Fastener World Inc',
      email: 'quotes@fastenerworld.com',
      phone: '+1-555-0567',
      location: 'Cleveland, OH',
      category: 'Fasteners',
      certifications: ['ISO 9001', 'ASTM Certified'],
      rating: 4.7,
      responseTime: '1.9 days',
      lastQuoteDate: '2025-01-22',
      totalQuotes: 41,
      successRate: 91
    },
    {
      id: 'SUP-006',
      name: 'ElectroTech Components',
      email: 'procurement@electrotech.com',
      phone: '+1-555-0678',
      location: 'San Jose, CA',
      category: 'Electrical Components',
      certifications: ['UL Listed', 'RoHS Compliant'],
      rating: 4.5,
      responseTime: '2.0 days',
      lastQuoteDate: '2025-01-19',
      totalQuotes: 33,
      successRate: 88
    }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Raw Materials', label: 'Raw Materials' },
    { value: 'Mechanical Parts', label: 'Mechanical Parts' },
    { value: 'Safety Equipment', label: 'Safety Equipment' },
    { value: 'Fluids & Lubricants', label: 'Fluids & Lubricants' },
    { value: 'Fasteners', label: 'Fasteners' },
    { value: 'Electrical Components', label: 'Electrical Components' }
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'CA', label: 'California' },
    { value: 'TX', label: 'Texas' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'MI', label: 'Michigan' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' }
  ];

  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = supplier?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         supplier?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         supplier?.location?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = !filterCategory || supplier?.category === filterCategory;
    const matchesLocation = !filterLocation || supplier?.location?.includes(filterLocation);
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleSupplierToggle = (supplier) => {
    const isSelected = selectedSuppliers?.some(s => s?.id === supplier?.id);
    if (isSelected) {
      onSuppliersChange(selectedSuppliers?.filter(s => s?.id !== supplier?.id));
    } else {
      onSuppliersChange([...selectedSuppliers, supplier]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSuppliers?.length === filteredSuppliers?.length) {
      onSuppliersChange([]);
    } else {
      onSuppliersChange([...filteredSuppliers]);
    }
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars?.push(<Icon key={i} name="Star" size={12} className="text-warning fill-current" />);
    }
    if (hasHalfStar) {
      stars?.push(<Icon key="half" name="Star" size={12} className="text-warning" />);
    }
    return stars;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Search suppliers by name, email, or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
          <Select
            placeholder="Filter by category"
            options={categoryOptions}
            value={filterCategory}
            onChange={setFilterCategory}
          />
          <Select
            placeholder="Filter by location"
            options={locationOptions}
            value={filterLocation}
            onChange={setFilterLocation}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedSuppliers?.length === filteredSuppliers?.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedSuppliers?.length} of {filteredSuppliers?.length} suppliers selected
            </span>
          </div>
          {errors?.suppliers && (
            <span className="text-sm text-error">{errors?.suppliers}</span>
          )}
        </div>
      </div>
      {/* Suppliers List */}
      <div className="space-y-3">
        {filteredSuppliers?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Building2" size={32} className="mx-auto mb-2 opacity-50" />
            <p>No suppliers found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSuppliers?.map((supplier) => {
              const isSelected = selectedSuppliers?.some(s => s?.id === supplier?.id);
              
              return (
                <div
                  key={supplier?.id}
                  className={`
                    bg-card border rounded-lg p-4 cursor-pointer transition-smooth
                    ${isSelected 
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                    }
                  `}
                  onClick={() => handleSupplierToggle(supplier)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSupplierToggle(supplier)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground truncate">{supplier?.name}</h3>
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {supplier?.id}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Icon name="Mail" size={14} />
                          <span className="truncate">{supplier?.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon name="Phone" size={14} />
                          <span>{supplier?.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon name="MapPin" size={14} />
                          <span>{supplier?.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon name="Tag" size={14} />
                          <span>{supplier?.category}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              {getRatingStars(supplier?.rating)}
                              <span className="text-muted-foreground">({supplier?.rating})</span>
                            </div>
                            <div className="text-muted-foreground">
                              Response: {supplier?.responseTime}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Success: {supplier?.successRate}%
                            </div>
                            <div className="text-muted-foreground">
                              Quotes: {supplier?.totalQuotes}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {supplier?.certifications?.map((cert, index) => (
                              <span
                                key={index}
                                className="text-xs bg-success/10 text-success px-2 py-1 rounded"
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Selected Suppliers Summary */}
      {selectedSuppliers?.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">
            Selected Suppliers ({selectedSuppliers?.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedSuppliers?.map((supplier) => (
              <div
                key={supplier?.id}
                className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
              >
                <span>{supplier?.name}</span>
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleSupplierToggle(supplier);
                  }}
                  className="hover:text-primary/70"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierInvitationStep;