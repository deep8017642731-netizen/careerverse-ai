import type {
  AdaptiveEvaluation,
  AdaptiveScenario,
  AssessmentAnswers,
  CandidateProfile,
  CareerWorld,
  SimulationDecision,
  SimulationDifficulty,
} from '../../src/lib/types.js';
interface ScenarioTemplate {
  id: string;
  title: string;
  focus: string;
  context: string;
  objective: string;
  constraints: string[];
  skills: string[];
  options: AdaptiveScenario['decisionOptions'];
}

const scenarioTemplates: ScenarioTemplate[] = [
  {
    id: 'delivery-risk',
    title: 'The release window',
    focus: 'risk management',
    context: 'A customer-facing release is scheduled for this afternoon. A late test shows a failure in one edge case, while the commercial team has already promised the launch date.',
    objective: 'Choose a path that protects users without losing sight of the business commitment.',
    constraints: ['30 minutes before the go/no-go meeting', 'One engineer is unavailable', 'The failure affects a small but important customer segment'],
    skills: ['risk management', 'prioritization', 'communication'],
    options: [
      { id: 'pause', label: 'Pause the release and reproduce the failure', tradeoff: 'Protects reliability but creates delivery pressure.', signals: ['risk-aware', 'evidence-led'] },
      { id: 'scope', label: 'Ship with the affected feature disabled', tradeoff: 'Preserves the date while reducing product scope.', signals: ['pragmatic', 'communicative'] },
      { id: 'ship', label: 'Ship and monitor the issue after launch', tradeoff: 'Protects momentum but accepts customer risk.', signals: ['decisive', 'high-risk'] },
      { id: 'escalate', label: 'Ask a senior leader to make the call', tradeoff: 'Shares accountability but may slow the response.', signals: ['collaborative', 'low-autonomy'] },
    ],
  },
  {
    id: 'architecture-dispute',
    title: 'Two good architectures',
    focus: 'stakeholder alignment',
    context: 'Two engineers disagree about a service architecture. One option is faster to ship; the other is easier to evolve but needs a week of extra work.',
    objective: 'Turn disagreement into a decision the team can execute with confidence.',
    constraints: ['The deadline is fixed', 'Both engineers have strong evidence', 'The choice will shape the next six months of work'],
    skills: ['communication', 'technical reasoning', 'leadership'],
    options: [
      { id: 'decision-record', label: 'Define decision criteria and run a short review', tradeoff: 'Spends time now to make assumptions explicit.', signals: ['structured', 'inclusive'] },
      { id: 'fast-path', label: 'Choose the faster option and revisit later', tradeoff: 'Creates momentum but may add future migration cost.', signals: ['decisive', 'delivery-focused'] },
      { id: 'consensus', label: 'Keep discussing until both engineers agree', tradeoff: 'Builds buy-in but risks missing the deadline.', signals: ['empathetic', 'consensus-seeking'] },
      { id: 'prototype', label: 'Prototype the riskiest part before deciding', tradeoff: 'Improves evidence quality with a small upfront investment.', signals: ['analytical', 'learning-oriented'] },
    ],
  },
  {
    id: 'ambiguous-brief',
    title: 'The incomplete brief',
    focus: 'problem framing',
    context: 'A director asks for a dashboard that will reduce support volume. The request has a deadline but no agreed definition of success or clear user group.',
    objective: 'Create enough clarity to start useful work without waiting for perfect requirements.',
    constraints: ['The request is visible to leadership', 'Support data is messy', 'A first readout is expected in two weeks'],
    skills: ['problem solving', 'analytical thinking', 'stakeholder communication'],
    options: [
      { id: 'interviews', label: 'Interview support agents and map the highest-cost issues', tradeoff: 'Improves problem definition before solution design.', signals: ['user-centered', 'evidence-led'] },
      { id: 'dashboard', label: 'Build a quick dashboard from the available data', tradeoff: 'Produces a visible artifact quickly but may answer the wrong question.', signals: ['action-oriented', 'execution-focused'] },
      { id: 'clarify', label: 'Request a full product brief before starting', tradeoff: 'Reduces ambiguity but puts momentum on hold.', signals: ['thorough', 'low-ambiguity'] },
      { id: 'hypothesis', label: 'Write two measurable hypotheses and test the cheapest one', tradeoff: 'Balances speed with learning, but needs stakeholder buy-in.', signals: ['experimental', 'strategic'] },
    ],
  },
  {
    id: 'team-capacity',
    title: 'The overloaded team',
    focus: 'prioritization',
    context: 'Your team has capacity for one major initiative this month. Three stakeholders each claim their request is urgent and cite a different business metric.',
    objective: 'Prioritize transparently and keep the team focused when every request sounds important.',
    constraints: ['No additional headcount this month', 'Each stakeholder is influential', 'The team is already showing signs of fatigue'],
    skills: ['prioritization', 'leadership', 'decision quality'],
    options: [
      { id: 'scorecard', label: 'Use a shared impact, confidence, and effort scorecard', tradeoff: 'Makes tradeoffs visible but cannot remove politics entirely.', signals: ['fair', 'analytical'] },
      { id: 'leader', label: 'Ask the executive sponsor to pick one', tradeoff: 'Resolves conflict quickly but weakens team ownership.', signals: ['escalation', 'speed-focused'] },
      { id: 'split', label: 'Split the team across all three requests', tradeoff: 'Keeps everyone moving but increases context switching.', signals: ['accommodating', 'fragmented'] },
      { id: 'capacity', label: 'Protect capacity and negotiate a smaller first milestone', tradeoff: 'Protects sustainability while still creating progress.', signals: ['boundary-setting', 'sustainable'] },
    ],
  },
];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function stableIndex(value: string, length: number): number {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) % length;
}

function difficultyFor(profile: CandidateProfile, answers: AssessmentAnswers, progress: number): SimulationDifficulty {
  const affinity = Math.max(...(profile.archetypeAffinities || []).map(item => item.score), 60);
  if (progress > 1 || affinity >= 86 || answers.timeHorizon >= 7) return 'advanced';
  if (affinity >= 72 || answers.riskTolerance === 'moderate') return 'intermediate';
  return 'accessible';
}

function chooseTemplate(profile: CandidateProfile, world: CareerWorld, history: string[]): ScenarioTemplate {
  const preferred = profile.coreStrengths.join(' ').toLowerCase();
  const ranked = scenarioTemplates
    .filter(template => !history.includes(template.id))
    .sort((left, right) => {
      const leftScore = left.skills.filter(skill => preferred.includes(skill.split(' ')[0])).length;
      const rightScore = right.skills.filter(skill => preferred.includes(skill.split(' ')[0])).length;
      return rightScore - leftScore;
    });
  return ranked[stableIndex(`${world.id}:${profile.summary}`, ranked.length || 1)] || scenarioTemplates[0];
}

export function createAdaptiveScenario(
  answers: AssessmentAnswers,
  profile: CandidateProfile,
  world: CareerWorld,
  history: string[] = []
): AdaptiveScenario {
  const template = chooseTemplate(profile, world, history);
  const progress = history.length + 1;
  const difficulty = difficultyFor(profile, answers, progress);

  return {
    simulationId: `sim-${world.id}`,
    scenarioId: template.id,
    career: world.careerTitle,
    title: template.title,
    difficulty,
    scenario: `You are working toward ${world.careerTitle}. ${template.context}`,
    context: `This tests how your ${profile.workingStyle.toLowerCase()} style responds to ${template.focus} in a realistic ${world.field} setting.`,
    objective: template.objective,
    constraints: template.constraints,
    decisionOptions: template.options,
    skillsTested: template.skills,
    expectedReasoningSignals: profile.coreStrengths.slice(0, 3),
    progress,
    totalSteps: 3,
  };
}

export function evaluateAdaptiveDecision(
  scenario: AdaptiveScenario,
  decision: SimulationDecision,
  profile: CandidateProfile
): AdaptiveEvaluation {
  const selected = scenario.decisionOptions.find(option => option.id === decision.optionId);
  const reflectionQuality = decision.reflection.trim().length >= 40 ? 8 : decision.reflection.trim().length >= 15 ? 4 : 0;
  const profileAlignment = profile.coreStrengths.some(strength => scenario.skillsTested.some(skill => strength.toLowerCase().includes(skill.split(' ')[0]))) ? 5 : 0;
  const base = (selected?.signals.includes('risk-aware') || selected?.signals.includes('evidence-led') ? 78 : 68) + profileAlignment;
  const score = clamp(base + reflectionQuality);
  const communication = clamp(score + (selected?.signals.includes('communicative') || selected?.signals.includes('inclusive') ? 8 : -4));
  const reasoning = clamp(score + (selected?.signals.includes('analytical') || selected?.signals.includes('structured') ? 8 : 0));
  const risk = clamp(score + (selected?.signals.includes('high-risk') ? -16 : selected?.signals.includes('sustainable') ? 10 : 2));
  const nextScenarioFocus = risk < 65 ? 'risk assessment' : communication < 68 ? 'stakeholder communication' : reasoning < 72 ? 'evidence-based problem solving' : 'technical depth under pressure';

  return {
    summary: `Your choice favored ${selected?.tradeoff.toLowerCase() || 'a deliberate tradeoff'}. The reflection ${reflectionQuality ? 'showed a clear decision rationale' : 'would benefit from a more explicit rationale'}.`,
    strengths: [selected?.signals[0] || 'decisive action', 'engagement with constraints'],
    developmentAreas: [nextScenarioFocus],
    skillScores: {
      'Decision quality': score,
      Communication: communication,
      'Risk management': risk,
      'Problem solving': reasoning,
    },
    nextScenarioFocus,
    outcome: selected?.tradeoff || 'The team moves forward and records the decision for review.',
  };
}