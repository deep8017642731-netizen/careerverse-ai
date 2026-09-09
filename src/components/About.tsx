import React from 'react';
import { motion } from 'framer-motion';

interface AboutProps {
  onBack: () => void;
}

export const About: React.FC<AboutProps> = ({ onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <button
        onClick={onBack}
        className="text-teal-600 hover:text-teal-700 font-medium mb-6 inline-flex items-center"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold text-slate-900 mb-8">How CareerVerse AI Works</h1>

      <div className="space-y-8 text-slate-700">
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span>📊</span> Data Sources
          </h2>
          <p className="leading-relaxed">
            CareerVerse AI grounds its projections in real-world data. We use aggregated salary benchmarks, labor market research, and industry-standard compensation reports to ensure our models reflect current market realities in India. We do not generate arbitrary numbers; instead, we map your career trajectory based on historical and projected market trends.
          </p>
        </section>

        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span>🧠</span> The Assessment
          </h2>
          <p className="leading-relaxed">
            Our 12-question assessment evaluates not just your current skills, but your foundational values, work style preferences, and risk tolerance. We use a multifaceted approach to ensure we are matching you to a career that aligns with your personality, not just what's popular or profitable.
          </p>
        </section>

        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span>⚙️</span> Simulation Engine
          </h2>
          <p className="leading-relaxed">
            We generate up to 5 unique career worlds tailored to your profile. This process combines AI-driven qualitative research with deterministic financial mathematics. We look for diverse paths, including conventional choices, high-growth sectors, and at least one "unconventional" match that fits your underlying traits.
          </p>
        </section>

        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span>⚖️</span> Bias Mitigation
          </h2>
          <p className="leading-relaxed">
            We are committed to fair and unbiased career guidance. Our models do not favor prestigious careers by default. We scrub for gender, name, and geographic biases during the assessment matching phase. Crucially, we always include honest downsides and risks for every career path—no career is perfect.
          </p>
        </section>

        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span>📈</span> Financial Model
          </h2>
          <p className="leading-relaxed">
            Our financial projections use deterministic compound interest math, Indian tax brackets, and inflation adjustments. These numbers are NOT AI-generated guesses. We apply rigorous calculations to model your potential net worth, factoring in conservative savings rates and realistic equity returns in the Indian market.
          </p>
        </section>

        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span>⚠️</span> Limitations & Disclaimer
          </h2>
          <p className="leading-relaxed mb-4">
            While we strive for accuracy, CareerVerse AI is an educational tool. We cannot predict individual economic downturns, specific job market fluctuations, or personal life events. The salaries and net worth projections are estimates based on aggregated data and assumed savings rates.
          </p>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            These are data-informed estimates, not guarantees.
          </p>
        </section>
      </div>
    </motion.div>
  );
};
