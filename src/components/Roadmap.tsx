import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CandidateProfile, CareerRoadmap, CareerWorld, RoadmapPhase } from '../lib/types';
import { saveRoadmapProgress, toggleMilestoneCheck } from '../lib/storage';

interface RoadmapProps {
  roadmap: CareerRoadmap;
  world: CareerWorld;
  candidateProfile?: CandidateProfile;
  onBack: () => void;
  onExport: () => void;
}

export const Roadmap: React.FC<RoadmapProps> = ({ roadmap, world, candidateProfile, onBack, onExport }) => {
  const [completedMilestones, setCompletedMilestones] = React.useState<string[]>(roadmap.completedMilestones || []);

  React.useEffect(() => {
    saveRoadmapProgress(roadmap, world, completedMilestones, candidateProfile);
  }, [roadmap, world, candidateProfile, completedMilestones]);

  const handleMilestoneToggle = (milestoneId: string) => {
    const result = toggleMilestoneCheck(world.id, milestoneId);
    setCompletedMilestones(current => result.completed ? [...current, milestoneId] : current.filter(id => id !== milestoneId));
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto px-4 py-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-teal-600 hover:text-teal-700 font-medium mb-4 inline-flex items-center"
          >
            ← Back to Worlds
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Your Roadmap: <span className="text-teal-600">{roadmap.currentPosition}</span> →{' '}
            <span className="text-amber-600">{roadmap.targetPosition}</span>
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Total estimated time:{' '}
            <span className="font-semibold px-2 py-1 bg-slate-100 rounded-md">
              {roadmap.totalEstimatedTime}
            </span>
          </p>
        </div>
        <button
          onClick={onExport}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition shadow-sm"
        >
          Download Career Dossier (PDF)
        </button>
      </div>

      <div className="relative border-l-4 border-slate-200 ml-4 md:ml-8 space-y-12 pb-12">
        {roadmap.phases.map((phase, index) => (
          <PhaseCard
            key={phase.phase}
            phase={phase}
            index={index}
            completedMilestones={completedMilestones}
            onToggleMilestone={handleMilestoneToggle}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
        <p>
          <strong>Disclaimer:</strong> {roadmap.disclaimer}
        </p>
      </div>
    </motion.div>
  );
};

const PhaseCard: React.FC<{
  phase: RoadmapPhase;
  index: number;
  completedMilestones: string[];
  onToggleMilestone: (milestoneId: string) => void;
}> = ({ phase, index, completedMilestones, onToggleMilestone }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
      className="relative pl-8 md:pl-12"
    >
      {/* Timeline dot */}
      <div className="absolute -left-[14px] top-6 w-6 h-6 rounded-full bg-teal-500 border-4 border-white shadow-sm"></div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition text-left"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                Phase {phase.phase}
              </span>
              <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {phase.timeframe}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{phase.title}</h3>
          </div>
          <div className="text-slate-400">
            {isExpanded ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6"
            >
              <p className="text-slate-700 mb-6 mt-4">{phase.description}</p>

              <div className="space-y-4">
                {phase.milestones.map((milestone, idx) => {
                  const milestoneId = milestone.id || `p${phase.phase}-m${idx}`;
                  return (
                  <div
                    key={milestoneId}
                    className={`p-4 rounded-lg border ${
                      milestone.isCheckpoint
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-slate-100 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={completedMilestones.includes(milestoneId)}
                          onChange={() => onToggleMilestone(milestoneId)}
                          className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          {milestone.title}
                          {milestone.isCheckpoint && (
                            <span title="Key Checkpoint">⭐</span>
                          )}
                        </h4>
                        <p className="text-slate-600 text-sm mt-1">{milestone.description}</p>

                        {milestone.resources.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {milestone.resources.map((res, rIdx) => {
                              const icons: Record<string, string> = {
                                course: '📚',
                                certification: '📜',
                                exam: '📝',
                                platform: '💻',
                                book: '📖',
                                community: '🤝',
                                action: '⚡',
                              };
                              return (
                                <span
                                  key={rIdx}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  <span>{icons[res.type] || '📌'}</span>
                                  <span>{res.name}</span>
                                  {(res.provider || res.costINR) && (
                                    <span className="text-slate-500 border-l border-slate-300 pl-1.5 ml-0.5">
                                      {res.provider} {res.costINR && `(${res.costINR})`}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {milestone.estimatedCostINR && (
                          <div className="mt-2 text-sm font-medium text-amber-700">
                            Estimated Cost: {milestone.estimatedCostINR}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
