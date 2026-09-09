import React from 'react';
import { motion } from 'framer-motion';
import type { CandidateProfile, CareerWorld, FinalCareerAnalysis, MarketResearch } from '../lib/types';
import { formatLPA } from '../lib/financialModel';

interface WorldsOverviewProps {
  worlds: CareerWorld[];
  onSelectWorld: (id: string) => void;
  onCompare: () => void;
  profile?: CandidateProfile | null;
  research?: MarketResearch | null;
  analysis?: FinalCareerAnalysis | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const WorldsOverview: React.FC<WorldsOverviewProps> = ({
  worlds,
  onSelectWorld,
  onCompare,
  profile,
  research,
  analysis,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Your Top 5 Career Worlds</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          We've simulated hundreds of possibilities based on your profile, values, and constraints. Here are your best matches.
        </p>
      </div>

      <div className="mb-10 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Your calculated profile</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{profile?.summary || 'Your profile was calculated from your assessment answers and used to select these paths.'}</p>
          {profile?.signalScores && <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">{Object.entries(profile.signalScores).slice(0, 6).map(([label, score]) => <div key={label}><div className="mb-1 flex justify-between text-[11px] text-slate-500"><span>{label.replace(/([A-Z])/g, ' $1')}</span><strong className="text-slate-900">{score}</strong></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${score}%` }} /></div></div>)}</div>}
        </section>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Current market signal</p>
          <p className="mt-3 text-sm leading-6 text-amber-950">{research?.marketInsights || 'Market research is being used to calibrate role fit, skill demand, and salary context.'}</p>
          <div className="mt-4 flex flex-wrap gap-2">{(research?.highGrowthAreas || []).slice(0, 3).map(area => <span key={area} className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-amber-900">{area}</span>)}</div>
          {analysis && <p className="mt-4 text-xs font-semibold text-amber-900">Simulation evidence: {analysis.simulationPerformance.decisionsCompleted} decisions, average {analysis.simulationPerformance.averageScore || 'pending'}</p>}
        </section>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
      >
        {worlds.map((world) => {
          const yr1Salary = world.salaryTrajectory[0]?.ctcLPA || 0;
          const yr10Salary = world.salaryTrajectory[world.salaryTrajectory.length - 1]?.ctcLPA || 0;

          return (
            <motion.div
              key={world.id}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              className={`relative bg-white rounded-xl border border-slate-200 p-6 flex flex-col h-full shadow-sm ${
                world.isUnconventional ? 'border-amber-300' : ''
              }`}
            >
              {world.isUnconventional && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200 flex items-center shadow-sm">
                  <span className="mr-1">💡</span> Unexpected Fit
                </div>
              )}

              <div className="absolute top-4 left-4 text-slate-300 font-black text-5xl opacity-40 select-none">
                {world.rank}
              </div>

              <div className="flex justify-end mb-4 relative z-10">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-teal-50 border-2 border-teal-500">
                  <span className="text-teal-700 font-bold text-lg leading-tight">{world.fitScore}</span>
                  <span className="text-teal-600 text-[10px] leading-tight uppercase font-semibold">Fit</span>
                </div>
              </div>

              <div className="mt-2 mb-4 relative z-10">
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">{world.field}</p>
                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">{world.careerTitle}</h3>
                <p className="text-sm text-slate-600 italic">{world.tagline}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-3 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Salary (Yr 1 → 10)</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatLPA(yr1Salary)} → {formatLPA(yr10Salary)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Happiness Index</span>
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 rounded-full" 
                      style={{ width: `${world.happinessMetrics.overall}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Job Security</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-slate-700">{world.jobSecurityScore}/100</span>
                    <span className="text-xs">
                      {world.demandTrend === 'growing' ? '📈' : world.demandTrend === 'stable' ? '➖' : '📉'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6 text-sm text-slate-600 border-l-2 border-slate-200 pl-3 italic">
                "{world.dayInTheLife}"
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button
                  onClick={() => onSelectWorld(world.id)}
                  className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Explore World
                </button>
                <button
                  onClick={onCompare}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                >
                  Compare
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="flex flex-col items-center justify-center space-y-4">
        <button
          onClick={onCompare}
          className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-8 rounded-lg font-semibold transition-colors shadow-md text-lg"
        >
          Compare All {worlds.length} Worlds
        </button>
        <p className="text-xs text-slate-400">
          * These are data-informed estimates, not guarantees. Real outcomes vary.
        </p>
      </div>
    </div>
  );
};
