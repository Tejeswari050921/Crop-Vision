import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { ProcessingStep } from '../types';
import { PROCESSING_STEPS } from '../constants';

interface ProcessingViewProps {
  onComplete: () => void;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ onComplete }) => {
  const [steps, setSteps] = useState<ProcessingStep[]>(
    PROCESSING_STEPS.map(s => ({ ...s, status: 'pending' }))
  );

  useEffect(() => {
    let currentStepIndex = 0;

    const interval = setInterval(() => {
      // Capture the index for this tick to avoid closure staleness/async issues
      const indexForTick = currentStepIndex;

      setSteps(prev => {
        // Deep copy to ensure state immutability
        const newSteps = prev.map(s => ({ ...s }));
        
        // Mark previous step as completed
        if (indexForTick > 0) {
          const prevIndex = indexForTick - 1;
          if (prevIndex < newSteps.length) {
            newSteps[prevIndex].status = 'completed';
          }
        }
        
        // Mark current step as processing
        if (indexForTick < newSteps.length) {
          newSteps[indexForTick].status = 'processing';
        }

        return newSteps;
      });

      currentStepIndex++;

      // Finish after the last step is processed and marked completed
      // We go one step past length to ensure the last item is marked completed
      if (currentStepIndex > PROCESSING_STEPS.length) {
        clearInterval(interval);
        setTimeout(onComplete, 800); 
      }
    }, 1500); 

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Loader2 className="animate-spin text-green-600" />
        Analyzing Harvest...
      </h3>
      
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex items-center gap-4">
            {/* Connector Line */}
            {index !== steps.length - 1 && (
              <div className={`absolute left-[15px] top-[28px] w-0.5 h-8 ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
            
            <div className="flex-shrink-0 z-10 bg-white">
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-8 h-8 text-green-500 fill-green-50" />
              ) : step.status === 'processing' ? (
                <div className="w-8 h-8 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
              ) : (
                <Circle className="w-8 h-8 text-gray-300" />
              )}
            </div>
            
            <div className="flex-1">
              <p className={`font-medium ${
                step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'
              }`}>
                {step.label}
              </p>
              {step.status === 'processing' && (
                <p className="text-xs text-green-600 animate-pulse mt-1">Processing...</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingView;