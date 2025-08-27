import React from 'react';
import Icon from '../../../components/AppIcon';

const WizardHeader = ({ currentStep, totalSteps, onClose }) => {
  const steps = [
    { number: 1, title: 'Basic Information', description: 'RFQ details and requirements' },
    { number: 2, title: 'Item Selection', description: 'Add ERP items to RFQ' },
    { number: 3, title: 'Supplier Invitation', description: 'Select suppliers to invite' }
  ];

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <Icon name="FileText" size={20} color="white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Create New RFQ</h1>
            <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          aria-label="Close wizard"
        >
          <Icon name="X" size={20} strokeWidth={2} />
        </button>
      </div>
      {/* Progress Steps */}
      <div className="flex items-center space-x-4">
        {steps?.map((step, index) => (
          <div key={step?.number} className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-smooth
                ${step?.number <= currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {step?.number < currentStep ? (
                  <Icon name="Check" size={16} strokeWidth={2} />
                ) : (
                  step?.number
                )}
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-medium ${
                  step?.number <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step?.title}
                </p>
                <p className="text-xs text-muted-foreground">{step?.description}</p>
              </div>
            </div>
            {index < steps?.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-4 transition-smooth
                ${step?.number < currentStep ? 'bg-primary' : 'bg-border'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WizardHeader;