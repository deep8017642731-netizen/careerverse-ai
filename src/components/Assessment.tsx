import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assessmentQuestions } from '../lib/questions';
import type { AssessmentAnswers } from '../lib/types';

interface AssessmentProps {
  initialAnswers?: Partial<AssessmentAnswers>;
  onComplete: (answers: AssessmentAnswers) => void;
  onBack: () => void;
}

export default function Assessment({ initialAnswers = {}, onComplete, onBack }: AssessmentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>(initialAnswers);
  
  const question = assessmentQuestions[currentIndex];
  const total = assessmentQuestions.length;
  const progress = ((currentIndex) / total) * 100;
  
  const currentAnswer = answers[question.answerKey as keyof AssessmentAnswers];

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(answers as AssessmentAnswers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const isNextDisabled = currentAnswer === undefined || currentAnswer === '' || 
    (Array.isArray(currentAnswer) && currentAnswer.length === 0);

  // Question renderers
  const renderSingleSelect = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {question.options?.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setAnswers(prev => ({ ...prev, [question.answerKey]: opt.value }))}
          className={`text-left p-5 rounded-xl border-2 transition-all flex flex-col h-full
            ${currentAnswer === opt.value 
              ? 'border-[#0d9488] bg-teal-50' 
              : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{opt.emoji}</span>
            <span className="font-bold text-slate-800">{opt.label}</span>
          </div>
          {opt.description && <p className="text-sm text-slate-500 mt-auto">{opt.description}</p>}
        </button>
      ))}
    </div>
  );

  const renderMultiSelect = () => {
    const selected = (currentAnswer as string[]) || [];
    const toggleOption = (val: string) => {
      let newSelected = [...selected];
      if (newSelected.includes(val)) {
        newSelected = newSelected.filter(v => v !== val);
      } else {
        if (newSelected.length < 5) newSelected.push(val);
      }
      setAnswers(prev => ({ ...prev, [question.answerKey]: newSelected }));
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options?.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between
                ${isSelected 
                  ? 'border-[#0d9488] bg-teal-50' 
                  : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{opt.emoji}</span>
                <span className="font-semibold text-slate-800">{opt.label}</span>
              </div>
              <div className={`w-5 h-5 rounded-sm border flex items-center justify-center
                ${isSelected ? 'bg-[#0d9488] border-[#0d9488]' : 'border-slate-300'}`}>
                {isSelected && <span className="text-white text-xs">✓</span>}
              </div>
            </button>
          );
        })}
        <p className="text-sm text-slate-500 col-span-full mt-2">Selected: {selected.length} / 5</p>
      </div>
    );
  };

  const renderRanking = () => {
    const list = (currentAnswer as string[]) || question.options?.map(o => o.value) || [];
    
    // Initialize answer if not set
    if (!currentAnswer && question.options) {
      setTimeout(() => setAnswers(prev => ({ ...prev, [question.answerKey]: list })), 0);
    }

    const moveUp = (index: number) => {
      if (index === 0) return;
      const newList = [...list];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      setAnswers(prev => ({ ...prev, [question.answerKey]: newList }));
    };

    const moveDown = (index: number) => {
      if (index === list.length - 1) return;
      const newList = [...list];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      setAnswers(prev => ({ ...prev, [question.answerKey]: newList }));
    };

    return (
      <div className="space-y-3">
        {list.map((val, idx) => {
          const opt = question.options?.find(o => o.value === val);
          if (!opt) return null;
          return (
            <div key={val} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-teal-600 disabled:opacity-30">&#9650;</button>
                <button onClick={() => moveDown(idx)} disabled={idx === list.length - 1} className="p-1 text-slate-400 hover:text-teal-600 disabled:opacity-30">&#9660;</button>
              </div>
              <div className="font-bold text-slate-400 w-6 text-center">#{idx + 1}</div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="font-bold text-slate-800">{opt.label}</span>
                </div>
                {opt.description && <p className="text-sm text-slate-500">{opt.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFreeText = () => (
    <textarea
      value={(currentAnswer as string) || ''}
      onChange={(e) => setAnswers(prev => ({ ...prev, [question.answerKey]: e.target.value }))}
      placeholder={question.placeholder}
      className="w-full h-40 p-4 border-2 border-slate-200 rounded-xl focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] outline-none transition-all resize-none text-slate-800 text-lg"
    />
  );

  const renderScenario = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {question.options?.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setAnswers(prev => ({ ...prev, [question.answerKey]: opt.value }))}
          className={`text-left p-6 rounded-2xl border-2 transition-all flex flex-col
            ${currentAnswer === opt.value 
              ? 'border-[#0d9488] bg-teal-50' 
              : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'}`}
        >
          <span className="text-4xl mb-4">{opt.emoji}</span>
          <h3 className="font-bold text-xl text-slate-800 mb-3">{opt.label}</h3>
          <p className="text-slate-600 leading-relaxed flex-grow">{opt.description}</p>
        </button>
      ))}
    </div>
  );

  const renderSlider = () => {
    const val = (currentAnswer as number) || question.min || 0;
    
    // Initialize if not set
    if (!currentAnswer) {
      setTimeout(() => setAnswers(prev => ({ ...prev, [question.answerKey]: val })), 0);
    }

    return (
      <div className="pt-8 pb-4 px-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="text-center mb-8">
          <span className="text-4xl font-extrabold text-[#0d9488]">{val}</span>
          <span className="text-xl text-slate-500 ml-2">years</span>
        </div>
        <input
          type="range"
          min={question.min}
          max={question.max}
          step="1"
          value={val}
          onChange={(e) => setAnswers(prev => ({ ...prev, [question.answerKey]: parseInt(e.target.value) }))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0d9488]"
        />
        <div className="flex justify-between text-sm text-slate-500 mt-4 font-medium">
          <span>{question.minLabel}</span>
          <span>{question.maxLabel}</span>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (question.type) {
      case 'single-select': return renderSingleSelect();
      case 'multi-select': return renderMultiSelect();
      case 'ranking': return renderRanking();
      case 'free-text': return renderFreeText();
      case 'scenario': return renderScenario();
      case 'slider': return renderSlider();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#1e293b] flex flex-col font-sans">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="h-1.5 w-full bg-slate-100">
          <motion.div 
            className="h-full bg-[#0d9488]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between text-sm font-medium">
          <button onClick={handlePrev} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
            &larr; Back
          </button>
          <div className="text-slate-400">
            <span className="text-[#0d9488] font-bold">{question.categoryLabel}</span>
            <span className="mx-2">&bull;</span>
            <span>{currentIndex + 1} of {total}</span>
          </div>
          <div className="w-16"></div> {/* Spacer for balance */}
        </div>
      </div>

      <main className="flex-grow pt-24 pb-32 px-4 flex flex-col max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-grow flex flex-col"
          >
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 leading-tight">{question.question}</h2>
              {question.subtitle && <p className="text-lg text-slate-500">{question.subtitle}</p>}
            </div>
            
            <div className="flex-grow">
              {renderContent()}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex justify-end">
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all
              ${isNextDisabled 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-[#0d9488] hover:bg-teal-700 text-white shadow-md'}`}
          >
            {currentIndex === total - 1 ? 'Generate Simulations \u2728' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
