import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BasicInformationStep = ({ formData, onFormChange, errors }) => {
  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const departmentOptions = [
    { value: 'procurement', label: 'Procurement Department' },
    { value: 'operations', label: 'Operations' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'it', label: 'IT Department' },
    { value: 'hr', label: 'Human Resources' }
  ];

  const deliveryTermOptions = [
    { value: 'fob', label: 'FOB (Free on Board)' },
    { value: 'cif', label: 'CIF (Cost, Insurance, Freight)' },
    { value: 'exw', label: 'EXW (Ex Works)' },
    { value: 'dap', label: 'DAP (Delivered at Place)' },
    { value: 'ddp', label: 'DDP (Delivered Duty Paid)' }
  ];

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="RFQ Title"
            type="text"
            placeholder="Enter RFQ title"
            value={formData?.title || ''}
            onChange={(e) => handleInputChange('title', e?.target?.value)}
            error={errors?.title}
            required
            description="Provide a clear, descriptive title for this RFQ"
          />

          <Input
            label="RFQ Number"
            type="text"
            placeholder="Auto-generated: RFQ-2025-001"
            value={formData?.rfqNumber || 'RFQ-2025-001'}
            onChange={(e) => handleInputChange('rfqNumber', e?.target?.value)}
            description="System will auto-generate if left empty"
          />

          <Select
            label="Department"
            placeholder="Select requesting department"
            options={departmentOptions}
            value={formData?.department || ''}
            onChange={(value) => handleInputChange('department', value)}
            error={errors?.department}
            required
          />

          <Select
            label="Priority Level"
            placeholder="Select priority level"
            options={priorityOptions}
            value={formData?.priority || ''}
            onChange={(value) => handleInputChange('priority', value)}
            error={errors?.priority}
            required
          />
        </div>

        <div className="space-y-4">
          <Input
            label="Quote Submission Deadline"
            type="date"
            value={formData?.deadline || ''}
            onChange={(e) => handleInputChange('deadline', e?.target?.value)}
            error={errors?.deadline}
            required
            min={new Date()?.toISOString()?.split('T')?.[0]}
            description="Last date for suppliers to submit quotes"
          />

          <Input
            label="Expected Delivery Date"
            type="date"
            value={formData?.deliveryDate || ''}
            onChange={(e) => handleInputChange('deliveryDate', e?.target?.value)}
            error={errors?.deliveryDate}
            min={new Date()?.toISOString()?.split('T')?.[0]}
            description="When do you need the items delivered?"
          />

          <Input
            label="Delivery Location"
            type="text"
            placeholder="Enter delivery address"
            value={formData?.deliveryLocation || ''}
            onChange={(e) => handleInputChange('deliveryLocation', e?.target?.value)}
            error={errors?.deliveryLocation}
            required
            description="Complete address where items should be delivered"
          />

          <Select
            label="Delivery Terms"
            placeholder="Select delivery terms"
            options={deliveryTermOptions}
            value={formData?.deliveryTerms || ''}
            onChange={(value) => handleInputChange('deliveryTerms', value)}
            description="Specify the delivery terms and conditions"
          />
        </div>
      </div>
      <div className="space-y-4">
        <Input
          label="RFQ Description"
          type="text"
          placeholder="Provide detailed description of requirements"
          value={formData?.description || ''}
          onChange={(e) => handleInputChange('description', e?.target?.value)}
          error={errors?.description}
          required
          description="Detailed description of what you're looking to procure"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Input
            label="Budget Range (USD)"
            type="text"
            placeholder="e.g., $10,000 - $50,000"
            value={formData?.budgetRange || ''}
            onChange={(e) => handleInputChange('budgetRange', e?.target?.value)}
            description="Optional: Provide budget expectations"
          />

          <Input
            label="Contact Person"
            type="text"
            placeholder="Enter contact person name"
            value={formData?.contactPerson || ''}
            onChange={(e) => handleInputChange('contactPerson', e?.target?.value)}
            error={errors?.contactPerson}
            required
            description="Primary contact for supplier queries"
          />
        </div>

        <Input
          label="Special Instructions"
          type="text"
          placeholder="Any special requirements or instructions for suppliers"
          value={formData?.specialInstructions || ''}
          onChange={(e) => handleInputChange('specialInstructions', e?.target?.value)}
          description="Additional requirements, certifications, or special conditions"
        />
      </div>
    </div>
  );
};

export default BasicInformationStep;