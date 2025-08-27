import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import WizardHeader from './components/WizardHeader';
import BasicInformationStep from './components/BasicInformationStep';
import ItemSelectionStep from './components/ItemSelectionStep';
import SupplierInvitationStep from './components/SupplierInvitationStep';
import WizardFooter from './components/WizardFooter';

const RFQCreationWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data state
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    rfqNumber: 'RFQ-2025-001',
    department: '',
    priority: '',
    deadline: '',
    deliveryDate: '',
    deliveryLocation: '',
    deliveryTerms: '',
    description: '',
    budgetRange: '',
    contactPerson: '',
    specialInstructions: ''
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  // Mock user data
  const mockUser = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Procurement Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  };

  // Mock notifications
  const mockNotifications = [
    {
      id: 1,
      type: 'info',
      title: 'RFQ Draft Saved',
      message: 'Your RFQ draft has been automatically saved',
      timestamp: new Date(Date.now() - 300000),
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Supplier Response',
      message: 'Steel Corp Industries submitted a quote for RFQ-2025-045',
      timestamp: new Date(Date.now() - 1800000),
      read: false
    }
  ];

  const totalSteps = 3;

  // Validation functions
  const validateBasicInfo = () => {
    const newErrors = {};
    
    if (!basicInfo?.title?.trim()) {
      newErrors.title = 'RFQ title is required';
    }
    if (!basicInfo?.department) {
      newErrors.department = 'Department is required';
    }
    if (!basicInfo?.priority) {
      newErrors.priority = 'Priority level is required';
    }
    if (!basicInfo?.deadline) {
      newErrors.deadline = 'Quote submission deadline is required';
    }
    if (!basicInfo?.deliveryLocation?.trim()) {
      newErrors.deliveryLocation = 'Delivery location is required';
    }
    if (!basicInfo?.description?.trim()) {
      newErrors.description = 'RFQ description is required';
    }
    if (!basicInfo?.contactPerson?.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    return newErrors;
  };

  const validateItems = () => {
    const newErrors = {};
    
    if (selectedItems?.length === 0) {
      newErrors.items = 'At least one item must be selected';
    }

    return newErrors;
  };

  const validateSuppliers = () => {
    const newErrors = {};
    
    if (selectedSuppliers?.length === 0) {
      newErrors.suppliers = 'At least one supplier must be selected';
    }

    return newErrors;
  };

  const validateCurrentStep = () => {
    let stepErrors = {};
    
    switch (currentStep) {
      case 1:
        stepErrors = validateBasicInfo();
        break;
      case 2:
        stepErrors = validateItems();
        break;
      case 3:
        stepErrors = validateSuppliers();
        break;
      default:
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock save draft logic
    console.log('Draft saved:', {
      basicInfo,
      selectedItems,
      selectedSuppliers,
      step: currentStep
    });
    
    setIsSubmitting(false);
    
    // Show success notification (in real app, this would be handled by notification system)
    alert('Draft saved successfully!');
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock submit logic
    const rfqData = {
      ...basicInfo,
      items: selectedItems,
      suppliers: selectedSuppliers,
      status: 'Published',
      createdAt: new Date()?.toISOString(),
      createdBy: mockUser?.name
    };
    
    console.log('RFQ submitted:', rfqData);
    
    setIsSubmitting(false);
    
    // Navigate to quotation comparison table
    navigate('/quotation-comparison-table', { 
      state: { 
        rfqData,
        message: 'RFQ created successfully! You can now start comparing quotations.' 
      }
    });
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      navigate('/procurement-dashboard');
    }
  };

  const handleLogout = () => {
    navigate('/login-screen');
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (basicInfo?.title || selectedItems?.length > 0 || selectedSuppliers?.length > 0) {
        console.log('Auto-saving draft...');
        // In real app, this would make an API call
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [basicInfo, selectedItems, selectedSuppliers]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInformationStep
            formData={basicInfo}
            onFormChange={setBasicInfo}
            errors={errors}
          />
        );
      case 2:
        return (
          <ItemSelectionStep
            selectedItems={selectedItems}
            onItemsChange={setSelectedItems}
            errors={errors}
          />
        );
      case 3:
        return (
          <SupplierInvitationStep
            selectedSuppliers={selectedSuppliers}
            onSuppliersChange={setSelectedSuppliers}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const customBreadcrumbs = [
    {
      label: 'Dashboard',
      path: '/procurement-dashboard',
      icon: 'BarChart3'
    },
    {
      label: 'Create RFQ',
      path: '/rfq-creation-wizard',
      icon: 'FileText',
      current: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNavigationBar 
        user={mockUser} 
        notifications={mockNotifications}
        onLogout={handleLogout}
      />
      <div className="pt-16">
        <BreadcrumbTrail customBreadcrumbs={customBreadcrumbs} />
        
        {/* Modal Overlay */}
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-elevated w-full max-w-6xl max-h-[90vh] flex flex-col">
            <WizardHeader
              currentStep={currentStep}
              totalSteps={totalSteps}
              onClose={handleClose}
            />
            
            <div className="flex-1 overflow-y-auto">
              {renderCurrentStep()}
            </div>
            
            <WizardFooter
              currentStep={currentStep}
              totalSteps={totalSteps}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
              isValid={Object.keys(errors)?.length === 0}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQCreationWizard;