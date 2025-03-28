import React from 'react';

interface StepperProgressProps {
  currentStep: number;
}

const StepperProgress = ({ currentStep }: StepperProgressProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'
          } font-medium`}>1</div>
          <span className={`text-xs mt-1 ${
            currentStep >= 1 ? 'text-primary-600' : 'text-slate-500'
          } font-medium`}>Patient Info</span>
        </div>
        <div className="h-1 flex-1 mx-2 bg-slate-200 relative">
          <div 
            className="absolute inset-0 bg-primary-600" 
            style={{ 
              width: currentStep === 1 ? '0%' : 
                     currentStep === 2 ? '50%' : '100%' 
            }}
          ></div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'
          } font-medium`}>2</div>
          <span className={`text-xs mt-1 ${
            currentStep >= 2 ? 'text-primary-600' : 'text-slate-500'
          } font-medium`}>Questionnaires</span>
        </div>
        <div className="h-1 flex-1 mx-2 bg-slate-200 relative">
          <div 
            className="absolute inset-0 bg-primary-600" 
            style={{ width: currentStep >= 3 ? '100%' : '0%' }}
          ></div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'
          } font-medium`}>3</div>
          <span className={`text-xs mt-1 ${
            currentStep >= 3 ? 'text-primary-600' : 'text-slate-500'
          } font-medium`}>Finalize</span>
        </div>
      </div>
    </div>
  );
};

export default StepperProgress;
