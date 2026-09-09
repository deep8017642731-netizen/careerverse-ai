import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const steps = [
  "Analyzing your profile and preferences...",
  "Researching current market demand and salary signals...",
  "Modeling your risk and financial profile...",
  "Comparing 5 distinct career trajectories...",
  "Generating personalized simulations..."
];

export default function AIResearching() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (currentStepIndex < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-lg w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-16 h-16">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-r-2 border-[#0d9488] rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border-b-2 border-l-2 border-[#d97706] rounded-full opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center text-xl">
                🧠
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-8 text-slate-100">AI Engine Working</h2>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const isPast = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300
                    ${isPast ? 'bg-[#0d9488] text-white' : 
                      isCurrent ? 'bg-amber-500/20 text-amber-500 border border-amber-500' : 
                      'bg-slate-700 border border-slate-600'}`}
                  >
                    {isPast && <span className="text-xs font-bold">✓</span>}
                    {isCurrent && (
                      <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 bg-amber-500 rounded-full"
                      />
                    )}
                  </div>
                  <div className={`text-sm md:text-base transition-all duration-300
                    ${isPast ? 'text-slate-400' : 
                      isCurrent ? 'text-slate-100 font-medium' : 
                      'text-slate-600'}`}
                  >
                    {step}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#0d9488] to-[#d97706]"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
