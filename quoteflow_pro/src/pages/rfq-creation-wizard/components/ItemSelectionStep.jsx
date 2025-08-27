import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ItemSelectionStep = ({ selectedItems, onItemsChange, errors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    description: '',
    specifications: '',
    quantity: '',
    uom: '',
    category: ''
  });

  // Mock ERP items data
  const erpItems = [
    {
      id: 'ERP-001',
      description: 'Industrial Grade Steel Pipes',
      specifications: 'ASTM A106 Grade B, 6 inch diameter, 20 feet length',
      uom: 'Pieces',
      category: 'Raw Materials',
      lastBuyingPrice: 245.50,
      lastVendor: 'Steel Corp Industries'
    },
    {
      id: 'ERP-002',
      description: 'High-Performance Ball Bearings',
      specifications: 'SKF 6205-2RS1, Deep groove, Sealed, 25mm bore',
      uom: 'Pieces',
      category: 'Mechanical Parts',
      lastBuyingPrice: 18.75,
      lastVendor: 'Bearing Solutions Ltd'
    },
    {
      id: 'ERP-003',
      description: 'Industrial Safety Helmets',
      specifications: 'ANSI Z89.1 Type I Class E, White, Adjustable',
      uom: 'Pieces',
      category: 'Safety Equipment',
      lastBuyingPrice: 32.90,
      lastVendor: 'SafetyFirst Equipment'
    },
    {
      id: 'ERP-004',
      description: 'Hydraulic Fluid ISO 46',
      specifications: 'Anti-wear hydraulic oil, 208L drum, ISO VG 46',
      uom: 'Drums',
      category: 'Fluids & Lubricants',
      lastBuyingPrice: 189.00,
      lastVendor: 'Industrial Oils Co'
    },
    {
      id: 'ERP-005',
      description: 'Stainless Steel Bolts M12x50',
      specifications: 'Grade 316, Hex head, Full thread, Metric',
      uom: 'Pieces',
      category: 'Fasteners',
      lastBuyingPrice: 2.45,
      lastVendor: 'Fastener World Inc'
    }
  ];

  const categoryOptions = [
    { value: 'raw-materials', label: 'Raw Materials' },
    { value: 'mechanical-parts', label: 'Mechanical Parts' },
    { value: 'safety-equipment', label: 'Safety Equipment' },
    { value: 'fluids-lubricants', label: 'Fluids & Lubricants' },
    { value: 'fasteners', label: 'Fasteners' },
    { value: 'electrical', label: 'Electrical Components' },
    { value: 'tools', label: 'Tools & Equipment' }
  ];

  const uomOptions = [
    { value: 'pieces', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'meters', label: 'Meters' },
    { value: 'liters', label: 'Liters' },
    { value: 'drums', label: 'Drums' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'sets', label: 'Sets' }
  ];

  const filteredItems = erpItems?.filter(item =>
    item?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    item?.specifications?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    item?.id?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleAddErpItem = (erpItem) => {
    const newSelectedItem = {
      id: `selected-${Date.now()}`,
      erpId: erpItem?.id,
      description: erpItem?.description,
      specifications: erpItem?.specifications,
      quantity: 1,
      uom: erpItem?.uom,
      category: erpItem?.category,
      lastBuyingPrice: erpItem?.lastBuyingPrice,
      lastVendor: erpItem?.lastVendor
    };
    onItemsChange([...selectedItems, newSelectedItem]);
  };

  const handleAddCustomItem = () => {
    if (!newItem?.description || !newItem?.quantity || !newItem?.uom) return;

    const customItem = {
      id: `custom-${Date.now()}`,
      erpId: 'CUSTOM',
      description: newItem?.description,
      specifications: newItem?.specifications,
      quantity: parseInt(newItem?.quantity),
      uom: newItem?.uom,
      category: newItem?.category,
      lastBuyingPrice: 0,
      lastVendor: 'N/A'
    };

    onItemsChange([...selectedItems, customItem]);
    setNewItem({ description: '', specifications: '', quantity: '', uom: '', category: '' });
    setShowAddForm(false);
  };

  const handleUpdateItem = (itemId, field, value) => {
    const updatedItems = selectedItems?.map(item =>
      item?.id === itemId ? { ...item, [field]: value } : item
    );
    onItemsChange(updatedItems);
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = selectedItems?.filter(item => item?.id !== itemId);
    onItemsChange(updatedItems);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search ERP items by description, ID, or specifications"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
        </div>
        <Button
          variant="outline"
          iconName="Plus"
          iconPosition="left"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Custom Item
        </Button>
      </div>
      {/* Custom Item Form */}
      {showAddForm && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-foreground">Add Custom Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Description"
              type="text"
              placeholder="Enter item description"
              value={newItem?.description}
              onChange={(e) => setNewItem({ ...newItem, description: e?.target?.value })}
              required
            />
            <Input
              label="Specifications"
              type="text"
              placeholder="Enter specifications"
              value={newItem?.specifications}
              onChange={(e) => setNewItem({ ...newItem, specifications: e?.target?.value })}
            />
            <Input
              label="Quantity"
              type="number"
              placeholder="Enter quantity"
              value={newItem?.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e?.target?.value })}
              required
              min="1"
            />
            <Select
              label="Unit of Measure"
              placeholder="Select UOM"
              options={uomOptions}
              value={newItem?.uom}
              onChange={(value) => setNewItem({ ...newItem, uom: value })}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button variant="default" onClick={handleAddCustomItem}>
              Add Item
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      {/* ERP Items List */}
      {searchTerm && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Available ERP Items</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredItems?.map((item) => (
              <div key={item?.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {item?.id}
                      </span>
                      <span className="text-xs text-muted-foreground">{item?.category}</span>
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{item?.description}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{item?.specifications}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>UOM: {item?.uom}</span>
                      <span>Last Price: ${item?.lastBuyingPrice}</span>
                      <span>Last Vendor: {item?.lastVendor}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    onClick={() => handleAddErpItem(item)}
                    disabled={selectedItems?.some(selected => selected?.erpId === item?.id)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Selected Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Selected Items ({selectedItems?.length})</h3>
          {errors?.items && (
            <span className="text-sm text-error">{errors?.items}</span>
          )}
        </div>

        {selectedItems?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Package" size={32} className="mx-auto mb-2 opacity-50" />
            <p>No items selected yet</p>
            <p className="text-sm">Search and add ERP items or create custom items</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedItems?.map((item) => (
              <div key={item?.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {item?.erpId}
                      </span>
                      <span className="text-xs text-muted-foreground">{item?.category}</span>
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{item?.description}</h4>
                    <p className="text-sm text-muted-foreground">{item?.specifications}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Trash2"
                    onClick={() => handleRemoveItem(item?.id)}
                    className="text-error hover:text-error"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Quantity"
                    type="number"
                    value={item?.quantity}
                    onChange={(e) => handleUpdateItem(item?.id, 'quantity', parseInt(e?.target?.value))}
                    min="1"
                    required
                  />
                  <Input
                    label="Unit of Measure"
                    type="text"
                    value={item?.uom}
                    onChange={(e) => handleUpdateItem(item?.id, 'uom', e?.target?.value)}
                    required
                  />
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Last Buying Price</label>
                    <div className="text-sm text-muted-foreground">
                      ${item?.lastBuyingPrice} ({item?.lastVendor})
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemSelectionStep;