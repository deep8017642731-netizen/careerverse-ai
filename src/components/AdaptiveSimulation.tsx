import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, Target } from 'lucide-react';
import { startAdaptiveSimulation, submitAdaptiveDecision } from '../lib/api';
import type {
  AdaptiveEvaluation,
  AdaptiveScenario,
  AssessmentAnswers,
  CandidateProfile,
  CareerWorld,
  SimulationDecisionRecord,
} from '../lib/types';

interface AdaptiveSimulationProps {
  answers: AssessmentAnswers;
  profile: CandidateProfile;
  world: CareerWorld;
  onBack: () => void;
  onDecision?: (record: SimulationDecisionRecord) => void;
}

export default function AdaptiveSimulation({ answers, profile, world, onBack, onDecision }: AdaptiveSimulationProps) {
  const [scenario, setScenario] = useState<AdaptiveScenario | null>(null);
  const [evaluation, setEvaluation] = useState<AdaptiveEvaluation | undefined>();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const begin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await startAdaptiveSimulation(answers, profile, world, history);
      setScenario(response.scenario);
      setCompleted(response.completed);
      setSelectedOption(null);
      setReflection('');
    } catch (err: any) {
      setError(err.message || 'Unable to start the simulation');
    } finally {
      setIsLoading(false);
    }
  };

  const submit = async () => {
    if (!scenario || !selectedOption) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await submitAdaptiveDecision(
        answers,
        profile,
        world,
        scenario,
        { optionId: selectedOption, reflection },
        history,
      );
      setEvaluation(response.evaluation);
      onDecision?.({
        scenario,
        optionId: selectedOption,
        reflection,
        evaluation: response.evaluation,
        answeredAt: new Date().toISOString(),
      });
      setHistory(current => [...current, scenario.scenarioId]);
      setCompleted(response.completed);
      setScenario(response.scenario);
      setSelectedOption(null);
      setReflection('');
    } catch (err: any) {
      setError(err.message || 'Unable to evaluate that decision');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <button onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft size={16} /> Back to {world.careerTitle}
        </button>

        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
                <Target size={14} /> Adaptive career simulation
              </div>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">Your decisions shape what comes next.</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">This is a short workplace scenario journey for {world.careerTitle}. Each response changes the next challenge and the skills we examine.</p>
            </div>
            <div className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Journey design</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p><span className="text-teal-300">01</span> Profile-calibrated scenario</p>
                <p><span className="text-teal-300">02</span> Decision with real tradeoffs</p>
                <p><span className="text-teal-300">03</span> Follow-up based on your reasoning</p>
              </div>
            </div>
          </div>
        </section>

        {!scenario && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">Built from your profile</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">A realistic work moment, not a quiz.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">Your assessment signals, chosen career path, and previous decisions determine the context, difficulty, and follow-up focus. There are no “correct personality” answers.</p>
              <button onClick={begin} disabled={isLoading} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60">
                {isLoading ? 'Preparing your scenario...' : 'Begin the first scenario'} <ChevronRight size={17} />
              </button>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Signal focus</p>
              <p className="mt-3 text-lg font-semibold text-amber-950">{profile.coreStrengths.slice(0, 2).join(' + ')}</p>
              <p className="mt-2 text-sm leading-6 text-amber-900/80">We will pressure-test these strengths against the constraints of this path.</p>
            </div>
          </section>
        )}

        {scenario && !completed && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Scenario {scenario.progress} of {scenario.totalSteps}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{scenario.title}</h2>
              </div>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">{scenario.difficulty}</span>
            </div>
            <div className="mt-7 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-lg leading-8 text-slate-800">{scenario.scenario}</p>
                <div className="mt-6 rounded-xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Your objective</p>
                  <p className="mt-2 leading-7 text-slate-700">{scenario.objective}</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {scenario.constraints.map(constraint => <li key={constraint} className="flex gap-2"><span className="text-amber-600">•</span>{constraint}</li>)}
                  </ul>
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">What do you do?</p>
                <div className="space-y-3">
                  {scenario.decisionOptions.map(option => (
                    <button key={option.id} onClick={() => setSelectedOption(option.id)} className={`w-full rounded-xl border p-4 text-left transition ${selectedOption === option.id ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/10' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}>
                      <span className="font-semibold text-slate-900">{option.label}</span>
                      <span className="mt-1 block text-sm leading-5 text-slate-500">{option.tradeoff}</span>
                    </button>
                  ))}
                </div>
                <label className="mt-5 block text-sm font-semibold text-slate-700">What informed your decision? <span className="font-normal text-slate-400">Optional, but useful</span>
                  <textarea value={reflection} onChange={event => setReflection(event.target.value)} rows={3} placeholder="Name the risk, constraint, or signal you prioritized..." className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-3 font-normal text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" />
                </label>
                <button onClick={submit} disabled={!selectedOption || isLoading} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40">
                  {isLoading ? 'Evaluating...' : 'Commit decision'} <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </section>
        )}

        {evaluation && (
          <section className="mt-8 rounded-2xl border border-teal-200 bg-teal-50/60 p-6 sm:p-8">
            <div className="flex items-start gap-3"><div className="rounded-full bg-teal-700 p-2 text-white"><Check size={16} /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Decision readout</p><h2 className="mt-2 text-2xl font-semibold text-slate-950">{evaluation.summary}</h2></div></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {Object.entries(evaluation.skillScores).map(([skill, score]) => <div key={skill} className="rounded-xl border border-white bg-white/80 p-4"><p className="text-sm text-slate-600">{skill}</p><p className="mt-1 text-2xl font-semibold text-slate-950">{score}</p></div>)}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-700"><strong>Next focus:</strong> {evaluation.nextScenarioFocus}. {evaluation.outcome}</p>
          </section>
        )}

        {completed && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Journey complete</p><h2 className="mt-3 text-2xl font-semibold text-slate-950">You have a clearer evidence trail for this path.</h2><p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">Your choices are signals to reflect on, not a verdict. Use the readouts to decide what skill or environment you want to test next.</p><button onClick={onBack} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-teal-800">Return to career world</button></section>
        )}

        {error && <p className="mt-5 text-center text-sm font-medium text-rose-700">{error}</p>}
      </div>
    </motion.main>
  );
}