import React from 'react';
import { Check } from 'lucide-react';

const steps = ["Details", "Pricing", "Media", "Services", "Payment", "Legal"];

export default function ProgressBar({ currentStep, totalSteps }) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted ? 'bg-blue-600 text-white' : ''}
                    ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
                    ${!isCompleted && !isActive ? 'bg-slate-200 text-slate-500' : ''}
                  `}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : stepNumber}
                </div>
                <p 
                  className={`
                    mt-2 text-sm font-medium transition-colors duration-300
                    ${isActive || isCompleted ? 'text-blue-600' : 'text-slate-500'}
                  `}
                >
                  {step}
                </p>
              </div>

              {index < totalSteps - 1 && (
                <div 
                  className={`
                    flex-1 h-1 mx-2 transition-colors duration-500
                    ${isCompleted || isActive ? 'bg-blue-500' : 'bg-slate-200'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}