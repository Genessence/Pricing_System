import React from 'react';
import Button from '../../../components/ui/Button';

const WizardFooter = ({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext, 
  onSaveDraft, 
  onSubmit, 
  isValid,
  isSubmitting 
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="bg-card border-t border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            iconName="Save"
            iconPosition="left"
          >
            Save Draft
          </Button>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isSubmitting}
              iconName="ChevronLeft"
              iconPosition="left"
            >
              Previous
            </Button>
          )}

          {isLastStep ? (
            <Button
              variant="default"
              onClick={onSubmit}
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
              iconName="Send"
              iconPosition="left"
            >
              Submit RFQ
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={onNext}
              disabled={!isValid || isSubmitting}
              iconName="ChevronRight"
              iconPosition="right"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardFooter;