import { lazy, Suspense, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
const Landing = lazy(() => import('./components/Landing'));
const Assessment = lazy(() => import('./components/Assessment'));
const AIResearching = lazy(() => import('./components/AIResearching'));
const WorldsOverview = lazy(() => import('./components/WorldsOverview').then(module => ({ default: module.WorldsOverview })));
const Comparison = lazy(() => import('./components/Comparison').then(module => ({ default: module.Comparison })));
const WorldDeepDive = lazy(() => import('./components/WorldDeepDive').then(module => ({ default: module.WorldDeepDive })));
const Roadmap = lazy(() => import('./components/Roadmap').then(module => ({ default: module.Roadmap })));
const About = lazy(() => import('./components/About').then(module => ({ default: module.About })));
const AdaptiveSimulation = lazy(() => import('./components/AdaptiveSimulation'));
const HistoryPage = lazy(() => import('./components/HistoryPage'));
import { generateSimulation, generateRoadmap, understandCandidate, researchCareerPaths } from './lib/api';
import { getSimulationHistory, saveSimulationToHistory, updateJourneySession } from './lib/storage';
import type { AppScreen, AssessmentAnswers, CareerWorld, CareerRoadmap, SimulationRecord, CandidateProfile, MarketResearch, SimulationDecisionRecord, FinalCareerAnalysis } from './lib/types';

function buildFinalAnalysis(worlds: CareerWorld[], profile: CandidateProfile | null, research: MarketResearch | null, decisions: SimulationDecisionRecord[]): FinalCareerAnalysis {
  const scores = decisions.flatMap(decision => Object.values(decision.evaluation?.skillScores || {}));
  const averageScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const strongestSignals = decisions.flatMap(decision => decision.evaluation?.strengths || []).filter((value, index, values) => values.indexOf(value) === index).slice(0, 3);
  const topWorlds = worlds.slice(0, 3).map(world => ({
    careerTitle: world.careerTitle,
    fitScore: world.fitScore,
    why: world.fitReasons[0] || world.tagline,
    evidence: [...world.fitReasons.slice(0, 2), ...(profile?.coreStrengths.slice(0, 1) || [])]
  }));
  const developmentAreas = decisions.flatMap(decision => decision.evaluation?.developmentAreas || []).filter((value, index, values) => values.indexOf(value) === index).slice(0, 4);
  return {
    overallFitScore: worlds[0]?.fitScore || 0,
    topCareerMatches: topWorlds,
    strengths: profile?.coreStrengths.slice(0, 4) || [],
    developmentAreas: developmentAreas.length ? developmentAreas : worlds[0]?.skillGap.filter(item => !item.hasSkill).map(item => item.skill).slice(0, 4) || [],
    recommendedSkills: research?.skillDemandAnalysis.filter(item => item.trend === 'rising').map(item => item.skill).slice(0, 5) || [],
    marketRelevance: [research?.marketInsights || 'Market research was not available for this session.', ...(research?.emergingTrends || []).slice(0, 2)],
    simulationPerformance: { decisionsCompleted: decisions.length, averageScore, strongestSignals },
    nextActions: [...(developmentAreas.length ? developmentAreas : ['Complete one more scenario to strengthen the evidence trail']), 'Review the roadmap milestones against your current constraints'],
    generatedAt: new Date().toISOString()
  };
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [assessmentAnswers, setAssessmentAnswers] = useState<Partial<AssessmentAnswers>>({});
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [research, setResearch] = useState<MarketResearch | null>(null);
  const [worlds, setWorlds] = useState<CareerWorld[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<SimulationDecisionRecord[]>([]);

  const handleStartNewAssessment = () => {
    setAssessmentAnswers({});
    setCandidateProfile(null);
    setResearch(null);
    setWorlds([]);
    setSelectedWorldId(null);
    setRoadmap(null);
    setSessionId(null);
    setDecisions([]);
    setError(null);
    setCurrentScreen('assessment');
  };

  const handleAssessmentComplete = async (answers: AssessmentAnswers) => {
    setAssessmentAnswers(answers);
    setCurrentScreen('researching');
    setError(null);
    try {
      const profileResponse = await understandCandidate(answers);
      setCandidateProfile(profileResponse.profile);
      const researchResponse = await researchCareerPaths(answers, profileResponse.profile);
      setResearch(researchResponse.research);
      const response = await generateSimulation(answers, profileResponse.profile, researchResponse.research);
      setWorlds(response.worlds);
      const record = saveSimulationToHistory(response.worlds, answers, profileResponse.profile, undefined, researchResponse.research);
      setSessionId(record?.id || null);
      setDecisions([]);
      const analysis = buildFinalAnalysis(response.worlds, profileResponse.profile, researchResponse.research, []);
      if (record?.id) updateJourneySession(record.id, { finalAnalysis: analysis });
      setCurrentScreen('worlds');
    } catch (err: any) {
      setError(err.message || 'Failed to generate simulation');
      setCurrentScreen('landing');
    }
  };

  const handleViewSimulation = (record: SimulationRecord) => {
    if (record.worlds && record.worlds.length > 0) {
      setWorlds(record.worlds);
      setAssessmentAnswers(record.answers || {});
      setCandidateProfile(record.candidateProfile || null);
      setResearch(record.research || null);
      setSessionId(record.id);
      setDecisions(record.decisions || []);
      setSelectedWorldId(record.selectedWorldId || record.roadmap?.worldId || null);
      setRoadmap(record.roadmap || null);
      setCurrentScreen('worlds');
    }
  };

  const handleDecision = (decision: SimulationDecisionRecord) => {
    const updated = [...decisions, decision];
    const analysis = buildFinalAnalysis(worlds, candidateProfile, research, updated);
    setDecisions(updated);
    if (sessionId) updateJourneySession(sessionId, { decisions: updated, finalAnalysis: analysis, currentStep: 'adaptive-simulation' });
  };


  const handleBuildRoadmap = async () => {
    if (!selectedWorldId) return;
    const world = worlds.find(w => w.id === selectedWorldId);
    if (!world) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await generateRoadmap(world, assessmentAnswers as AssessmentAnswers, candidateProfile || undefined);
      setRoadmap(response.roadmap);
      const analysis = buildFinalAnalysis(worlds, candidateProfile, research, decisions);
      if (sessionId) updateJourneySession(sessionId, { roadmap: response.roadmap, finalAnalysis: analysis, selectedWorldId, completedAt: new Date().toISOString(), currentStep: 'roadmap' });
      setCurrentScreen('roadmap');
    } catch (err: any) {
      setError(err.message || 'Failed to build roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWorld = worlds.find(w => w.id === selectedWorldId);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 relative">
      {/* Floating About link */}
      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => setCurrentScreen('history')} className="mr-4 text-sm font-medium text-slate-500 hover:text-teal-600 transition">My Journey</button>
        <button
          onClick={() => setCurrentScreen('about')}
          className="text-sm font-medium text-slate-500 hover:text-teal-600 transition"
        >
          About / Methodology
        </button>
      </div>

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md flex items-center">
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="ml-4 font-bold">×</button>
        </div>
      )}

      {isLoading && (
        <div className="fixed bottom-4 left-4 bg-teal-50 text-teal-700 px-4 py-2 rounded shadow-sm border border-teal-200">
          Loading...
        </div>
      )}

      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f5f7f6] text-sm font-semibold text-slate-600">Loading your workspace...</div>}>
      <AnimatePresence mode="wait">
        {currentScreen === 'landing' && (
          <Landing 
            key="landing" 
            onStart={handleStartNewAssessment}
            onViewSimulation={handleViewSimulation}
          />
        )}
        
        {currentScreen === 'assessment' && (
          <Assessment
            key="assessment"
            initialAnswers={assessmentAnswers}
            onComplete={handleAssessmentComplete}
            onBack={() => setCurrentScreen('landing')}
          />
        )}
        
        {currentScreen === 'researching' && (
          <AIResearching key="researching" />
        )}
        
        {currentScreen === 'worlds' && (
          <WorldsOverview
            key="worlds"
            worlds={worlds}
            profile={candidateProfile}
            research={research}
            analysis={sessionId ? buildFinalAnalysis(worlds, candidateProfile, research, decisions) : null}
            onSelectWorld={(id: string) => {
              setSelectedWorldId(id);
              if (sessionId) updateJourneySession(sessionId, { selectedWorldId: id, currentStep: 'deep-dive' });
              setCurrentScreen('deep-dive');
            }}
            onCompare={() => setCurrentScreen('comparison')}
          />
        )}
        
        {currentScreen === 'comparison' && (
          <Comparison
            key="comparison"
            worlds={worlds}
            onSelectWorld={(id: string) => {
              setSelectedWorldId(id);
              if (sessionId) updateJourneySession(sessionId, { selectedWorldId: id, currentStep: 'deep-dive' });
              setCurrentScreen('deep-dive');
            }}
            onBack={() => setCurrentScreen('worlds')}
          />
        )}
        
        {currentScreen === 'deep-dive' && selectedWorld && (
          <WorldDeepDive
            key="deep-dive"
            world={selectedWorld}
            onBack={() => setCurrentScreen('worlds')}
            onBuildRoadmap={handleBuildRoadmap}
            onStartAdaptiveSimulation={() => setCurrentScreen('adaptive-simulation')}
          />
        )}

        {currentScreen === 'adaptive-simulation' && selectedWorld && candidateProfile && (
          <AdaptiveSimulation
            key="adaptive-simulation"
            answers={assessmentAnswers as AssessmentAnswers}
            profile={candidateProfile}
            world={selectedWorld}
            onBack={() => setCurrentScreen('deep-dive')}
            onDecision={handleDecision}
          />
        )}

        {currentScreen === 'history' && (
          <HistoryPage
            sessions={getSimulationHistory()}
            onOpen={handleViewSimulation}
            onNew={handleStartNewAssessment}
            onBack={() => setCurrentScreen('landing')}
          />
        )}
        
        {currentScreen === 'roadmap' && roadmap && selectedWorld && (
          <Roadmap
            key="roadmap"
            roadmap={roadmap}
            world={selectedWorld}
            candidateProfile={candidateProfile || undefined}
            onBack={() => setCurrentScreen('deep-dive')}
            onExport={async () => {
              const { generateCareerDossier } = await import('./lib/exportPDF');
              await generateCareerDossier(selectedWorld, roadmap);
            }}
          />
        )}
        
        {currentScreen === 'about' && (
          <About key="about" onBack={() => setCurrentScreen('landing')} />
        )}
      </AnimatePresence>
      </Suspense>
    </div>
  );
}
