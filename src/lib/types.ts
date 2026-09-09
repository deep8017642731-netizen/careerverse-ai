// ============================================================
// CareerVerse AI — Shared Type Definitions
// ============================================================

// --- Assessment Types ---

export type UserStage =
  | 'school'
  | 'undergrad'
  | 'graduate'
  | 'working'
  | 'career-switcher';

export type ValuePriority =
  | 'money'
  | 'stability'
  | 'passion'
  | 'impact'
  | 'fame'
  | 'freedom';

export type WorkStyle = 'solo' | 'team' | 'leadership';

export type Environment =
  | 'office'
  | 'remote'
  | 'field'
  | 'hybrid'
  | 'entrepreneurial';

export type RiskTolerance = 'stable' | 'moderate' | 'high-risk';

export interface AssessmentAnswers {
  // A. Starting from
  currentStage: UserStage;
  fieldOfStudy: string;
  keySkills: string[];

  // B. What you want
  valuePriorities: ValuePriority[]; // ordered by importance
  workStyle: WorkStyle;
  environment: Environment;

  // C. Risk & constraints
  riskTolerance: RiskTolerance;
  financialSituation: string; // e.g., "no dependents" | "supporting family" | "need income soon"
  locationFlexibility: string; // e.g., "willing to relocate anywhere" | "metro cities only" | "rooted"
  timeHorizon: number; // years willing to invest

  // D. Emotional / human
  energizesVsDrains: string; // free-text or selected scenario
  worstCaseTolerance: 'boring-stable' | 'exciting-unstable';
}

// --- Question Flow Types ---

export type QuestionType =
  | 'single-select'
  | 'multi-select'
  | 'ranking'
  | 'free-text'
  | 'scenario'
  | 'slider';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  emoji?: string;
}

export interface AssessmentQuestion {
  id: string;
  category: 'starting' | 'desires' | 'constraints' | 'emotional';
  categoryLabel: string;
  question: string;
  subtitle?: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  required: boolean;
  answerKey: keyof AssessmentAnswers;
}

// --- Candidate Profile & Archetype Types ---

export type CareerArchetype =
  | 'technical'
  | 'business'
  | 'creative'
  | 'entrepreneurial'
  | 'structured';

export interface CandidateProfile {
  summary: string; // 2-3 sentence high-impact summary
  coreStrengths: string[]; // key traits / superpowers
  workingStyle: string;
  valuesRanked: { value: string; label: string; priority: number }[];
  riskAppetite: string;
  keyConstraints: string[];
  energizers: string[];
  drainers: string[];
  archetypeAffinities: { archetype: CareerArchetype; label: string; score: number }[];
  signalScores?: {
    technicalInterest: number;
    analyticalThinking: number;
    creativity: number;
    communication: number;
    leadership: number;
    riskTolerance: number;
    problemSolving: number;
    teamwork: number;
    autonomy: number;
    learningOrientation: number;
    businessInterest: number;
  };
}

export interface MarketResearch {
  marketInsights: string;
  emergingTrends: string[];
  highGrowthAreas: string[];
  skillDemandAnalysis: { skill: string; demand: 'very-high' | 'high' | 'moderate' | 'low'; trend: 'rising' | 'stable' | 'declining' }[];
  salaryBenchmarks: { role: string; entryLPA: number; midLPA: number; seniorLPA: number }[];
  unconventionalPaths: string[];
  riskFactors: string[];
  researchedAt?: string;
  sourceNote?: string;
  sources?: { title: string; url: string }[];
}

// --- Simulation World Types ---

export interface SalaryDataPoint {
  year: number;
  label: string; // "Year 1", "Year 3", etc.
  ctcLPA: number; // CTC in Lakhs Per Annum
  ctcLow: number; // range low
  ctcHigh: number; // range high
}

export interface NetWorthDataPoint {
  year: number;
  netWorthLakhs: number;
  savingsLakhs: number;
  investmentsLakhs: number;
}

export interface HappinessMetrics {
  overall: number; // 0-100
  workLifeBalance: number; // 0-100
  meaningPurpose: number; // 0-100
  stressLevel: number; // 0-100 (lower is better, displayed inverted)
  socialStatus: number; // 0-100
}

export interface SkillGapItem {
  skill: string;
  hasSkill: boolean;
  importance: 'critical' | 'important' | 'nice-to-have';
}

export interface CareerWorld {
  id: string;
  rank: number; // 1-5
  careerTitle: string; // e.g., "Data Analyst → Analytics Manager"
  archetype: CareerArchetype; // Category archetype for color coding & diversification
  field: string; // e.g., "Technology / Analytics"
  tagline: string; // one-line summary
  fitScore: number; // 0-100
  fitReasons: string[]; // why this matches

  salaryTrajectory: SalaryDataPoint[];
  netWorthProjection: NetWorthDataPoint[];
  happinessMetrics: HappinessMetrics;

  jobSecurityScore: number; // 0-100
  jobSecurityReasoning: string;
  demandTrend: 'growing' | 'stable' | 'declining';

  skillGap: SkillGapItem[];

  timelineToComfortable: string; // e.g., "2-3 years"
  timelineToPeak: string; // e.g., "8-12 years"

  exampleCompanies: {
    entryLevel: string[];
    growthStage: string[];
    premium: string[];
  };

  risks: string[]; // at least 2 genuine downsides
  dayInTheLife: string; // 2-3 sentence narrative at year 3

  methodology: string; // how this was determined
  isUnconventional: boolean; // marks the "less obvious" suggestion
}

export type SimulationDifficulty = 'accessible' | 'intermediate' | 'advanced';

export interface SimulationDecisionOption {
  id: string;
  label: string;
  tradeoff: string;
  signals: string[];
}

export interface AdaptiveScenario {
  simulationId: string;
  scenarioId: string;
  career: string;
  title: string;
  difficulty: SimulationDifficulty;
  scenario: string;
  context: string;
  objective: string;
  constraints: string[];
  decisionOptions: SimulationDecisionOption[];
  skillsTested: string[];
  expectedReasoningSignals: string[];
  progress: number;
  totalSteps: number;
}

export interface SimulationDecision {
  scenarioId: string;
  optionId: string;
  reflection: string;
}

export interface AdaptiveEvaluation {
  summary: string;
  strengths: string[];
  developmentAreas: string[];
  skillScores: Record<string, number>;
  nextScenarioFocus: string;
  outcome: string;
}

export interface AdaptiveSimulationResponse {
  scenario: AdaptiveScenario;
  evaluation?: AdaptiveEvaluation;
  completed: boolean;
  disclaimer: string;
}

export interface SimulationDecisionRecord {
  scenario: AdaptiveScenario;
  optionId: string;
  reflection: string;
  evaluation?: AdaptiveEvaluation;
  answeredAt: string;
}

export interface FinalCareerAnalysis {
  overallFitScore: number;
  topCareerMatches: { careerTitle: string; fitScore: number; why: string; evidence: string[] }[];
  strengths: string[];
  developmentAreas: string[];
  recommendedSkills: string[];
  marketRelevance: string[];
  simulationPerformance: { decisionsCompleted: number; averageScore: number; strongestSignals: string[] };
  nextActions: string[];
  generatedAt: string;
}

// --- Comparison Types ---

export interface ComparisonAxis {
  label: string;
  key: string;
}

export interface RadarDataPoint {
  axis: string;
  [worldId: string]: number | string;
}

// --- Roadmap Types ---

export interface RoadmapMilestone {
  id?: string;
  title: string;
  description: string;
  resources: RoadmapResource[];
  estimatedCostINR?: string;
  isCheckpoint: boolean;
}

export interface RoadmapResource {
  name: string;
  type: 'course' | 'certification' | 'exam' | 'platform' | 'book' | 'community' | 'action';
  url?: string;
  provider?: string;
  costINR?: string;
}

export interface RoadmapPhase {
  phase: number;
  title: string; // e.g., "Foundation (0–6 months)"
  timeframe: string;
  description: string;
  milestones: RoadmapMilestone[];
}

export interface CareerRoadmap {
  id?: string;
  worldId: string;
  careerTitle: string;
  archetype?: CareerArchetype;
  currentPosition: string;
  targetPosition: string;
  totalEstimatedTime: string;
  phases: RoadmapPhase[];
  disclaimer: string;
  completedMilestones?: string[]; // array of milestone IDs/keys that are checked
  lastUpdated?: string;
}

// --- API Types ---

export interface ProfileRequest {
  answers: AssessmentAnswers;
}

export interface ProfileResponse {
  profile: CandidateProfile;
}

export interface SimulationRequest {
  answers: AssessmentAnswers;
  candidateProfile?: CandidateProfile;
}

export interface SimulationResponse {
  profile: CandidateProfile;
  worlds: CareerWorld[];
  generatedAt: string;
  disclaimer: string;
  research?: MarketResearch;
}

export interface RoadmapRequest {
  worldId: string;
  world: CareerWorld;
  answers: AssessmentAnswers;
  candidateProfile?: CandidateProfile;
}

export interface RoadmapResponse {
  roadmap: CareerRoadmap;
}

// --- History / Saved Session / Record / Settings Types ---

export interface SavedRecord {
  id: string; // unique record id
  worldId: string;
  sessionId?: string;
  world: CareerWorld;
  candidateProfile?: CandidateProfile;
  savedAt: string;
  note?: string;
}

export interface SavedRoadmapItem {
  id: string; // unique roadmap instance id
  worldId: string;
  careerTitle: string;
  archetype?: CareerArchetype;
  roadmap: CareerRoadmap;
  world: CareerWorld;
  candidateProfile?: CandidateProfile;
  completedMilestoneIds: string[]; // e.g. "p1-m0", "p2-m1"
  createdAt: string;
  lastUpdated: string;
}

export interface SimulationRecord {
  id: string;
  careerTitle: string;
  field?: string;
  date: string; // ISO string
  fitScore: number;
  tagline?: string;
  recommendation?: string;
  candidateProfile?: CandidateProfile;
  worlds: CareerWorld[];
  answers: AssessmentAnswers;
  selectedWorldId?: string;
  research?: MarketResearch;
  decisions?: SimulationDecisionRecord[];
  finalAnalysis?: FinalCareerAnalysis;
  roadmap?: CareerRoadmap;
  currentStep?: AppScreen;
  startedAt?: string;
  completedAt?: string;
}

export interface UserSettings {
  name: string;
  email: string;
  headline: string;
  targetLocation: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  milestoneReminders: boolean;
  dataPrivacyConsent: boolean;
}

// --- App State & Navigation ---

export type AppNavTab = 'home' | 'simulation' | 'history' | 'records' | 'roadmaps' | 'settings' | 'help';

export type AssessmentStep = 'assessment' | 'profile' | 'researching' | 'worlds' | 'comparison' | 'deep-dive' | 'roadmap';

export type AppScreen =
  | 'landing'
  | 'assessment'
  | 'researching'
  | 'worlds'
  | 'comparison'
  | 'deep-dive'
  | 'roadmap'
  | 'adaptive-simulation'
  | 'history'
  | 'about';


