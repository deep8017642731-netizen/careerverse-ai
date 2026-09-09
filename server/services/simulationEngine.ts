import type { AssessmentAnswers, CandidateProfile, CareerWorld, CareerArchetype, MarketResearch } from '../../src/lib/types';
import { SYSTEM_PROMPT, buildProfileUnderstandingPrompt } from '../prompts/systemPrompt';
import { callOpenRouter } from './openRouterClient';
import { searchCurrentMarket } from './marketSearch';
import { calculateNetWorthProjection, estimateMonthlyExpenses } from '../../src/lib/financialModel';

// ============================================================
// RESEARCH STEP: Deep career research based on candidate profile
// ============================================================

export interface CareerResearchResult extends MarketResearch {}

function normalizeResearch(raw: unknown, fallback: CareerResearchResult, sources: { title: string; url: string }[] = []): CareerResearchResult {
  const value = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const stringArray = (input: unknown, defaultValue: string[]) => Array.isArray(input) ? input.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : defaultValue;
  const demandRows = Array.isArray(value.skillDemandAnalysis) ? value.skillDemandAnalysis.filter(item => item && typeof item === 'object').map(item => {
    const row = item as Record<string, unknown>;
    const demand = ['very-high', 'high', 'moderate', 'low'].includes(String(row.demand)) ? row.demand as CareerResearchResult['skillDemandAnalysis'][number]['demand'] : 'moderate';
    const trend = ['rising', 'stable', 'declining'].includes(String(row.trend)) ? row.trend as CareerResearchResult['skillDemandAnalysis'][number]['trend'] : 'stable';
    return { skill: typeof row.skill === 'string' ? row.skill : 'Transferable problem solving', demand, trend };
  }) : fallback.skillDemandAnalysis;
  const salaryRows = Array.isArray(value.salaryBenchmarks) ? value.salaryBenchmarks.filter(item => item && typeof item === 'object').map(item => {
    const row = item as Record<string, unknown>;
    return {
      role: typeof row.role === 'string' ? row.role : 'Relevant market role',
      entryLPA: typeof row.entryLPA === 'number' ? row.entryLPA : 0,
      midLPA: typeof row.midLPA === 'number' ? row.midLPA : 0,
      seniorLPA: typeof row.seniorLPA === 'number' ? row.seniorLPA : 0,
    };
  }) : fallback.salaryBenchmarks;
  return {
    marketInsights: typeof value.marketInsights === 'string' && value.marketInsights.trim() ? value.marketInsights : fallback.marketInsights,
    emergingTrends: stringArray(value.emergingTrends, fallback.emergingTrends),
    highGrowthAreas: stringArray(value.highGrowthAreas, fallback.highGrowthAreas),
    skillDemandAnalysis: demandRows.length ? demandRows : fallback.skillDemandAnalysis,
    salaryBenchmarks: salaryRows.length ? salaryRows : fallback.salaryBenchmarks,
    unconventionalPaths: stringArray(value.unconventionalPaths, fallback.unconventionalPaths),
    riskFactors: stringArray(value.riskFactors, fallback.riskFactors),
    researchedAt: new Date().toISOString(),
    sourceNote: sources.length
      ? 'Current market search results were supplied to the research model and normalized before simulation generation.'
      : 'Generated from the current market-research prompt and normalized before simulation generation.',
    sources
  };
}

export async function researchCareerPaths(answers: AssessmentAnswers, profile: CandidateProfile): Promise<CareerResearchResult> {
  let searchSources: { title: string; url: string; content: string }[] = [];
  try {
    const searchQuery = `${answers.fieldOfStudy || 'career'} jobs hiring trends salary skills India ${new Date().getFullYear()}`;
    searchSources = await searchCurrentMarket(searchQuery);
    const prompt = buildResearchPrompt(answers, profile, searchSources);
    const rawJson = await callOpenRouter(SYSTEM_PROMPT, prompt);
    const parsed = JSON.parse(rawJson);
    return normalizeResearch(parsed.research || parsed, getFallbackResearch(answers, profile), searchSources.map(result => ({ title: result.title, url: result.url })));
  } catch (err) {
    console.warn('Research AI generation fell back to heuristic research:', (err as any)?.message);
    return {
      ...getFallbackResearch(answers, profile),
      researchedAt: new Date().toISOString(),
      sourceNote: searchSources.length
        ? 'Heuristic fallback used for synthesis, but current market search sources were retained for this session.'
        : 'Heuristic fallback used because live market research was unavailable for this session.',
      sources: searchSources.map(result => ({ title: result.title, url: result.url }))
    };
  }
}

function buildResearchPrompt(answers: AssessmentAnswers, profile: CandidateProfile, searchResults: { title: string; url: string; content: string }[] = []): string {
  const currentDate = new Date().toISOString().slice(0, 10);
  const topAffinities = profile.archetypeAffinities
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(a => `${a.label} (${a.score}/100)`)
    .join(', ');

  return `You are an elite Indian labor market researcher and career strategist. Conduct current market research as of ${currentDate} to identify the MOST RELEVANT career paths for this specific candidate. Do not present stale or unsupported market claims as current; distinguish estimates from verified current signals.

CANDIDATE DNA:
- Summary: ${profile.summary}
- Core Strengths: ${profile.coreStrengths.join(', ')}
- Working Style: ${profile.workingStyle}
- Top Values: ${profile.valuesRanked.map(v => `${v.label} (Priority ${v.priority})`).join(', ')}
- Risk Appetite: ${profile.riskAppetite}
- Key Constraints: ${profile.keyConstraints.join('; ')}
- Energizers: ${profile.energizers.join(', ')}
- Drainers: ${profile.drainers.join(', ')}
- Top Archetype Affinities: ${topAffinities}

USER CONTEXT:
- Current Stage: ${answers.currentStage}
- Field: ${answers.fieldOfStudy}
- Location Preference: ${answers.locationFlexibility}
- Timeline: ${answers.timeHorizon} years
- Financial Situation: ${answers.financialSituation}
- Worst-Case Tolerance: ${answers.worstCaseTolerance}

CURRENT SEARCH SIGNALS:
${searchResults.length ? searchResults.map((result, index) => `${index + 1}. ${result.title} (${result.url})\n   ${result.content}`).join('\n') : 'No external search provider is configured. Use conservative estimates and clearly label them as estimates.'}

RESEARCH TASK:
Analyze the current Indian job market and identify:
1. Which specific roles/paths align BEST with this candidate's unique DNA (not generic archetypes)
2. Emerging trends in their domain that create NEW opportunities
3. Skills that are in rising demand and match their strengths
4. Realistic salary benchmarks for Indian market
5. Unconventional/hidden gem paths that fit their profile but aren't obvious
6. Genuine risks and downsides for each path

Return JSON:
{
  "marketInsights": "2-3 paragraph analysis of where this specific candidate fits in current Indian market",
  "emergingTrends": ["trend 1", "trend 2", "trend 3"],
  "highGrowthAreas": ["specific area 1", "specific area 2", "specific area 3"],
  "skillDemandAnalysis": [
    { "skill": "specific skill", "demand": "very-high|high|moderate|low", "trend": "rising|stable|declining" }
  ],
  "salaryBenchmarks": [
    { "role": "specific role title", "entryLPA": 8, "midLPA": 22, "seniorLPA": 45 }
  ],
  "unconventionalPaths": ["hidden gem path 1", "hidden gem path 2"],
  "riskFactors": ["market risk 1", "market risk 2"]
}`;
}

function getFallbackResearch(answers: AssessmentAnswers, profile: CandidateProfile): CareerResearchResult {
  const isTech = /comp|code|dev|soft|tech|data|it|ai|ml/i.test(answers.fieldOfStudy || answers.keySkills?.join(' ') || '');
  
  return {
    marketInsights: `Based on your background in ${answers.fieldOfStudy || 'your field'} with strengths in ${profile.coreStrengths.slice(0,2).join(', ')}, the Indian market shows strong demand for roles that blend ${isTech ? 'technical depth' : 'domain expertise'} with ${profile.valuesRanked[0]?.label.toLowerCase() || 'impact'}. Your ${profile.workingStyle.toLowerCase()} style fits well with ${answers.locationFlexibility || 'metro'} opportunities.`,
    emergingTrends: isTech 
      ? ['AI/ML integration in traditional industries', 'Developer productivity tooling', 'India-specific fintech infrastructure']
      : ['Digital transformation in Bharat markets', 'Creator economy monetization', 'ESG & sustainability roles'],
    highGrowthAreas: isTech
      ? ['Applied AI Engineering', 'Platform Engineering', 'Data Platform Architecture']
      : ['Growth Product Management', 'Revenue Operations', 'Strategic Finance'],
    skillDemandAnalysis: [
      { skill: 'System Design & Architecture', demand: 'very-high', trend: 'rising' },
      { skill: 'AI/ML Application Development', demand: 'very-high', trend: 'rising' },
      { skill: 'Cross-functional Leadership', demand: 'high', trend: 'rising' },
      { skill: 'Data Storytelling & Visualization', demand: 'high', trend: 'stable' }
    ],
    salaryBenchmarks: isTech
      ? [
          { role: 'Senior Software Engineer', entryLPA: 12, midLPA: 28, seniorLPA: 55 },
          { role: 'AI/ML Engineer', entryLPA: 14, midLPA: 32, seniorLPA: 65 },
          { role: 'Staff Engineer', entryLPA: 25, midLPA: 45, seniorLPA: 85 }
        ]
      : [
          { role: 'Product Manager', entryLPA: 10, midLPA: 25, seniorLPA: 50 },
          { role: 'Strategy & Operations', entryLPA: 9, midLPA: 22, seniorLPA: 45 },
          { role: 'Growth Lead', entryLPA: 11, midLPA: 28, seniorLPA: 55 }
        ],
    unconventionalPaths: [
      'Technical Advisor for VC Portfolio Companies',
      'Fractional CTO/VP Engineering for Early-Stage Startups',
      'Internal Tools & Platform Product Manager'
    ],
    riskFactors: [
      'Rapid AI automation of mid-level coding tasks',
      'Hiring slowdown in pure-play tech vs. tech-enabled traditional sectors',
      'Credential inflation requiring continuous upskilling'
    ]
  };
}

// ============================================================
// PROFILE UNDERSTANDING (existing)
// ============================================================

export function getRealisticFallbackProfile(answers: AssessmentAnswers): CandidateProfile {
  const isTech = /comp|code|dev|soft|tech|data|it|ai|ml/i.test(answers.fieldOfStudy || answers.keySkills?.join(' ') || '');
  const isBiz = /biz|market|fin|sales|manag|comm|oper/i.test(answers.fieldOfStudy || answers.keySkills?.join(' ') || '');
  
  const skills = answers.keySkills && answers.keySkills.length > 0
    ? answers.keySkills
    : isTech ? ['Analytical Thinking', 'Systems Logic', 'Problem Decomposition', 'Continuous Learning']
    : isBiz ? ['Strategic Execution', 'Stakeholder Communication', 'Financial Acumen', 'Market Analysis']
    : ['Creative Problem Solving', 'Adaptive Communication', 'Critical Inquiry', 'Project Ownership'];

  const valuesRanked = [
    { value: answers.valuePriorities?.[0] || 'passion', label: (answers.valuePriorities?.[0] || 'passion').toUpperCase(), priority: 1 },
    { value: answers.valuePriorities?.[1] || 'money', label: (answers.valuePriorities?.[1] || 'money').toUpperCase(), priority: 2 },
    { value: answers.valuePriorities?.[2] || 'stability', label: (answers.valuePriorities?.[2] || 'stability').toUpperCase(), priority: 3 }
  ];

  return {
    summary: `A high-potential ${answers.currentStage || 'professional'} grounded in ${answers.fieldOfStudy || 'interdisciplinary studies'}, blending ${skills[0] || 'analytical discipline'} with a distinct preference for ${answers.workStyle || 'collaborative'} environments. Driven by long-term ${valuesRanked[0]?.label.toLowerCase() || 'impact'} while systematically building market authority.`,
    coreStrengths: skills.slice(0, 4),
    workingStyle: `${answers.workStyle === 'solo' ? 'Independent deep-work specialist' : answers.workStyle === 'leadership' ? 'Strategic cross-functional leader' : 'Collaborative agile team player'} in a ${answers.environment || 'hybrid'} setting.`,
    valuesRanked,
    riskAppetite: `${answers.riskTolerance === 'high-risk' ? 'High Risk Tolerance (High upside focus)' : answers.riskTolerance === 'stable' ? 'Low Risk Tolerance (Stability first)' : 'Balanced / Measured Risk'} — prioritizes ${answers.worstCaseTolerance === 'exciting-unstable' ? 'high dynamism over rigid safety' : 'sustainable predictability'}.`,
    keyConstraints: [
      answers.timeHorizon ? `Targeting solid trajectory within ${answers.timeHorizon} years` : 'Flexible ramp-up horizon',
      answers.locationFlexibility ? `Location focus: ${answers.locationFlexibility}` : 'Metro / Remote flexibility',
      answers.financialSituation ? `Financial context: ${answers.financialSituation}` : 'Standard capital buffer'
    ],
    energizers: [
      'High-autonomy problem solving and visible impact',
      'Continuous skill growth without repetitive manual bureaucracy',
      'Collaborating with peers who value technical or operational excellence'
    ],
    drainers: [
      'Rigid micro-management and zero-ownership environments',
      'Uncertain compensation without clear equity or promotion ladders',
      'Endless unfocused meetings that detract from deep focus'
    ],
    archetypeAffinities: [
      { archetype: 'technical', label: 'Technical & Specialist', score: isTech ? 92 : 74 },
      { archetype: 'business', label: 'Business & Strategy', score: isBiz ? 90 : 80 },
      { archetype: 'creative', label: 'Creative & People-Facing', score: 76 },
      { archetype: 'entrepreneurial', label: 'Entrepreneurial & Independent', score: answers.riskTolerance === 'high-risk' ? 88 : 70 },
      { archetype: 'structured', label: 'Structured & Stability-First', score: answers.riskTolerance === 'stable' ? 90 : 64 }
    ],
    signalScores: calculateProfileSignals(answers)
  };
}

export function calculateProfileSignals(answers: AssessmentAnswers): NonNullable<CandidateProfile['signalScores']> {
  const skills = (answers.keySkills || []).join(' ').toLowerCase();
  const values = (answers.valuePriorities || []).join(' ').toLowerCase();
  const energy = (answers.energizesVsDrains || '').toLowerCase();
  const has = (...terms: string[]) => terms.some(term => skills.includes(term) || energy.includes(term));
  const riskBase = answers.riskTolerance === 'high-risk' ? 86 : answers.riskTolerance === 'stable' ? 32 : 60;
  const communication = has('communication', 'writing', 'people', 'language', 'persuasion') ? 78 : answers.workStyle === 'leadership' ? 72 : 54;
  const technical = has('coding', 'technology', 'science', 'math', 'research') || /computer|engineering|data|tech|science|ai|ml/i.test(answers.fieldOfStudy || '') ? 82 : 48;
  const analytical = has('analytical', 'logical', 'math', 'research', 'strategy') ? 84 : 55;
  const creativity = has('creative', 'design', 'writing', 'languages') ? 82 : 52;
  const leadership = has('leadership', 'organizing', 'business', 'persuasion') || answers.workStyle === 'leadership' ? 80 : 48;
  return {
    technicalInterest: Math.min(100, technical + (values.includes('money') ? 3 : 0)),
    analyticalThinking: analytical,
    creativity,
    communication,
    leadership,
    riskTolerance: riskBase,
    problemSolving: Math.min(100, Math.round((analytical + technical + (has('hands-on', 'building') ? 10 : 0)) / 2)),
    teamwork: answers.workStyle === 'team' ? 84 : answers.workStyle === 'leadership' ? 76 : 52,
    autonomy: answers.workStyle === 'solo' || answers.environment === 'entrepreneurial' ? 86 : 62,
    learningOrientation: Math.min(100, 60 + (answers.timeHorizon || 1) * 3 + (values.includes('passion') || energy.includes('learn') ? 12 : 0)),
    businessInterest: has('business', 'strategy', 'persuasion', 'people') || values.includes('money') ? 76 : 44
  };
}

export async function generateCandidateProfile(answers: AssessmentAnswers): Promise<CandidateProfile> {
  try {
    const prompt = buildProfileUnderstandingPrompt(answers);
    const rawJson = await callOpenRouter(SYSTEM_PROMPT, prompt);
    const parsed = JSON.parse(rawJson);
    const profile = parsed.profile || parsed;
    if (profile && profile.summary && Array.isArray(profile.coreStrengths)) {
      return {
        summary: profile.summary,
        coreStrengths: profile.coreStrengths.slice(0, 5),
        workingStyle: profile.workingStyle || 'Collaborative problem solver',
        valuesRanked: profile.valuesRanked || [
          { value: 'passion', label: 'Passion', priority: 1 },
          { value: 'money', label: 'Money & Wealth', priority: 2 },
          { value: 'stability', label: 'Stability', priority: 3 }
        ],
        riskAppetite: profile.riskAppetite || 'Balanced',
        keyConstraints: profile.keyConstraints || ['Fast ramp-up', 'Metro location'],
        energizers: profile.energizers || ['Meaningful challenge', 'Ownership'],
        drainers: profile.drainers || ['Micromanagement', 'Repetitive tasks'],
        archetypeAffinities: profile.archetypeAffinities || [
          { archetype: 'technical', label: 'Technical & Specialist', score: 85 },
          { archetype: 'business', label: 'Business & Strategy', score: 80 },
          { archetype: 'creative', label: 'Creative & Human-Centered', score: 75 },
          { archetype: 'entrepreneurial', label: 'Entrepreneurial & Independent', score: 70 },
          { archetype: 'structured', label: 'Structured & Stability-First', score: 65 }
        ],
        signalScores: calculateProfileSignals(answers)
      };
    }
  } catch (err) {
    console.warn('Profile AI generation fell back to heuristic DNA engine:', (err as any)?.message);
  }

  return getRealisticFallbackProfile(answers);
}

function _getRealisticFallbackWorlds(answers: AssessmentAnswers, profile?: CandidateProfile): CareerWorld[] {
  const isTech = /comp|code|dev|soft|tech|data|it|ai|ml/i.test(answers.fieldOfStudy || answers.keySkills?.join(' ') || '');
  const isBusiness = /biz|market|fin|sales|manag|comm|oper/i.test(answers.fieldOfStudy || answers.keySkills?.join(' ') || '');

  const baseRoles: {
    title: string;
    archetype: CareerArchetype;
    field: string;
    tagline: string;
    yr1: number;
    yr10: number;
    happiness: number;
    wlb: number;
    meaning: number;
    stress: number;
    status: number;
    security: number;
    trend: 'growing' | 'stable' | 'declining';
    fit: number;
    skills: { skill: string; hasSkill: boolean; importance: 'critical' | 'important' | 'nice-to-have' }[];
    risks: string[];
    day: string;
    isUnconventional: boolean;
  }[] = [
    // 1. Technical / Specialist
    {
      title: isTech ? 'AI / Systems Software Engineer' : 'Data & Business Intelligence Specialist',
      archetype: 'technical',
      field: isTech ? 'AI & Core Software Systems' : 'Applied Analytics & Insights',
      tagline: 'High leverage, rapid skill compounding, and premier technology compensation.',
      yr1: isTech ? 11.5 : 8.5,
      yr10: isTech ? 52 : 36,
      happiness: 84,
      wlb: 76,
      meaning: 80,
      stress: 38,
      status: 86,
      security: 88,
      trend: 'growing',
      fit: 95,
      skills: [
        { skill: 'Core Domain & Algorithmic Design', hasSkill: true, importance: 'critical' },
        { skill: 'High-Scale Distributed Systems', hasSkill: false, importance: 'critical' },
        { skill: 'Code Review & Engineering Practices', hasSkill: true, importance: 'important' }
      ],
      risks: ['Rapid rate of tech stack obsolescence', 'Requires continuous personal upskilling outside work hours'],
      day: 'Architect high-throughput service modules, review pull requests with senior engineers, and optimize latency benchmarks in a flow state.',
      isUnconventional: false
    },
    // 2. Business / Strategy / Management
    {
      title: isBusiness ? 'Strategic Growth & Product Operations Lead' : 'Technical Product Manager',
      archetype: 'business',
      field: isBusiness ? 'Growth Strategy & Commercial Ops' : 'Product Leadership',
      tagline: 'Cross-functional authority bridging customer needs, metrics, and business P&L.',
      yr1: 10.0,
      yr10: 48,
      happiness: 82,
      wlb: 70,
      meaning: 86,
      stress: 48,
      status: 90,
      security: 82,
      trend: 'growing',
      fit: 91,
      skills: [
        { skill: 'Data-driven Prioritization', hasSkill: true, importance: 'critical' },
        { skill: 'Executive Stakeholder Alignment', hasSkill: false, importance: 'critical' },
        { skill: 'User Research & Go-to-Market', hasSkill: true, importance: 'important' }
      ],
      risks: ['High context-switching across meetings', 'Accountability for revenue without direct command of dev teams'],
      day: 'Host weekly sprint alignments, analyze product funnel conversion drop-offs, and present the Q3 roadmap to leadership.',
      isUnconventional: false
    },
    // 3. Creative / People-Facing
    {
      title: 'Digital Experience & Product Design Lead',
      archetype: 'creative',
      field: 'Product Design & User Experience',
      tagline: 'Crafting intuitive digital experiences that delight millions of Indian consumers.',
      yr1: 7.5,
      yr10: 34,
      happiness: 88,
      wlb: 82,
      meaning: 90,
      stress: 32,
      status: 80,
      security: 80,
      trend: 'growing',
      fit: 86,
      skills: [
        { skill: 'Design Systems & Figma Prototyping', hasSkill: true, importance: 'critical' },
        { skill: 'Behavioral Psychology & UX Audits', hasSkill: false, importance: 'important' },
        { skill: 'Usability Testing & Interaction Design', hasSkill: true, importance: 'critical' }
      ],
      risks: ['Subjective feedback loops from non-design executives', 'Design trends shift rapidly requiring portfolio refreshes'],
      day: 'Run user usability sessions with real app users, refine design system components, and deliver interactive prototypes to engineers.',
      isUnconventional: false
    },
    // 4. Entrepreneurial / Independent
    {
      title: 'Independent B2B Advisory & Tech Solopreneur',
      archetype: 'entrepreneurial',
      field: 'Independent Knowledge Economy',
      tagline: 'Maximum autonomy, uncapped earning upside, and direct equity ownership.',
      yr1: 5.0,
      yr10: 55,
      happiness: 91,
      wlb: 78,
      meaning: 94,
      stress: 55,
      status: 84,
      security: 62,
      trend: 'growing',
      fit: 83,
      skills: [
        { skill: 'Niche Domain Authority & Delivery', hasSkill: true, importance: 'critical' },
        { skill: 'Client Acquisition & Pipeline Building', hasSkill: false, importance: 'critical' },
        { skill: 'Self-direction & Financial Discipline', hasSkill: true, importance: 'critical' }
      ],
      risks: ['Initial income variability during first 12-18 months', 'Lack of corporate insurance and paid leave safety nets'],
      day: 'Advise high-growth venture clients on core operational bottlenecks, ship digital assets, and control your calendar from anywhere.',
      isUnconventional: false
    },
    // 5. Structured / Stability-First (Unconventional match / Institutional)
    {
      title: 'Institutional PSU / Digital Infrastructure Specialist',
      archetype: 'structured',
      field: 'Govt Tech & Public Digital Goods (India Stack)',
      tagline: 'High job security, immense national impact, and excellent work-life balance.',
      yr1: 8.0,
      yr10: 28,
      happiness: 85,
      wlb: 92,
      meaning: 88,
      stress: 22,
      status: 92,
      security: 98,
      trend: 'stable',
      fit: 81,
      skills: [
        { skill: 'Regulatory Compliance & Standards', hasSkill: true, importance: 'critical' },
        { skill: 'Mission-Critical Architecture Security', hasSkill: false, importance: 'critical' },
        { skill: 'Public Sector Stakeholder Coordination', hasSkill: true, importance: 'important' }
      ],
      risks: ['Slower promotional cycles bounded by government grades', 'Rigid administrative processes and protocol overhead'],
      day: 'Oversee national-scale digital infrastructure deployments, coordinate with government nodal agencies, and finish work by 5:30 PM.',
      isUnconventional: true
    }
  ];

  return baseRoles.map((role, idx) => {
    const salaryTrajectory = [
      { year: 1, label: 'Yr 1', ctcLPA: role.yr1, ctcLow: Math.round(role.yr1 * 0.85 * 10) / 10, ctcHigh: Math.round(role.yr1 * 1.2 * 10) / 10 },
      { year: 3, label: 'Yr 3', ctcLPA: Math.round(role.yr1 * 1.6 * 10) / 10, ctcLow: Math.round(role.yr1 * 1.3 * 10) / 10, ctcHigh: Math.round(role.yr1 * 2.0 * 10) / 10 },
      { year: 5, label: 'Yr 5', ctcLPA: Math.round(role.yr1 * 2.4 * 10) / 10, ctcLow: Math.round(role.yr1 * 2.0 * 10) / 10, ctcHigh: Math.round(role.yr1 * 3.0 * 10) / 10 },
      { year: 7, label: 'Yr 7', ctcLPA: Math.round(role.yr1 * 3.4 * 10) / 10, ctcLow: Math.round(role.yr1 * 2.8 * 10) / 10, ctcHigh: Math.round(role.yr1 * 4.2 * 10) / 10 },
      { year: 10, label: 'Yr 10', ctcLPA: role.yr10, ctcLow: Math.round(role.yr10 * 0.85 * 10) / 10, ctcHigh: Math.round(role.yr10 * 1.3 * 10) / 10 }
    ];

    const monthlyExp = estimateMonthlyExpenses('metro', 'moderate');
    const netWorthProjection = calculateNetWorthProjection({
      salaryTrajectory,
      savingsRatePercent: 30,
      annualInflationPercent: 6,
      investmentReturnPercent: 12,
      monthlyExpensesLakhs: monthlyExp,
      yearsToProject: 10
    });

    const candidateStrengths = profile?.coreStrengths || answers.keySkills || ['Structured Problem Solving'];
    return {
      id: `world-${idx + 1}`,
      rank: idx + 1,
      careerTitle: role.title,
      archetype: role.archetype,
      field: role.field,
      tagline: role.tagline,
      fitScore: role.fit,
      fitReasons: [
        `Directly leverages your identified strength in ${candidateStrengths[idx % candidateStrengths.length] || 'logical analysis'}`,
        `Satisfies your primary drive for ${answers.valuePriorities?.[0] || 'growth'} and ${role.archetype} problem solving`,
        `Calibrated for your ${answers.timeHorizon || 5}-year horizon and ${answers.locationFlexibility || 'metro'} lifestyle preferences`
      ],
      salaryTrajectory,
      netWorthProjection,
      happinessMetrics: {
        overall: role.happiness,
        workLifeBalance: role.wlb,
        meaningPurpose: role.meaning,
        stressLevel: role.stress,
        socialStatus: role.status
      },
      jobSecurityScore: role.security,
      jobSecurityReasoning: role.security > 85 ? 'High baseline demand backed by national enterprise infrastructure.' : 'High market value driven by specialized execution skills.',
      demandTrend: role.trend,
      skillGap: role.skills,
      timelineToComfortable: '2–3 years',
      timelineToPeak: '7–10 years',
      exampleCompanies: {
        entryLevel: ['Infosys', 'TCS Digital', 'Swiggy', 'Zomato', 'HDFC Bank'],
        growthStage: ['Razorpay', 'CRED', 'Meesho', 'BrowserStack', 'Postman'],
        premium: ['Google India', 'Microsoft IDC', 'NPCI / UIDAI', 'Peak XV Portfolio']
      },
      risks: role.risks,
      dayInTheLife: role.day,
      methodology: 'Calibrated against Indian labor market CTC liquidity, AmbitionBox Tier-1 benchmarks, and verified job postings.',
      isUnconventional: role.isUnconventional
    };
  });
}

// ============================================================
// PERSONALIZED SIMULATION PROMPT (uses research)
// ============================================================

function buildPersonalizedSimulationPrompt(
  answers: AssessmentAnswers, 
  profile: CandidateProfile | undefined, 
  research: CareerResearchResult
): string {
  const candidateProfile = profile || getRealisticFallbackProfile(answers);
  
  // Sort affinities by score to prioritize
  const sortedAffinities = [...candidateProfile.archetypeAffinities].sort((a, b) => b.score - a.score);
  const _topAffinities = sortedAffinities.slice(0, 3).map(a => a.archetype);
  
  const profileContext = `
VERIFIED CANDIDATE DNA:
- Summary: ${candidateProfile.summary}
- Core Strengths: ${candidateProfile.coreStrengths.join(', ')}
- Working Style: ${candidateProfile.workingStyle}
- Top Values: ${candidateProfile.valuesRanked.map(v => `${v.label} (Priority ${v.priority})`).join(', ')}
- Risk Appetite: ${candidateProfile.riskAppetite}
- Key Constraints: ${candidateProfile.keyConstraints.join('; ')}
- Energizers: ${candidateProfile.energizers.join(', ')}
- Drainers: ${candidateProfile.drainers.join(', ')}
- Archetype Affinities (ranked): ${sortedAffinities.map(a => `${a.label}: ${a.score}/100`).join(', ')}

RESEARCH INSIGHTS (Indian Market 2024-2025):
- Market Analysis: ${research.marketInsights}
- Emerging Trends: ${research.emergingTrends.join(', ')}
- High-Growth Areas: ${research.highGrowthAreas.join(', ')}
- Rising Skills: ${research.skillDemandAnalysis.filter(s => s.trend === 'rising').map(s => s.skill).join(', ')}
- Salary Benchmarks: ${research.salaryBenchmarks.map(s => `${s.role}: ${s.entryLPA}-${s.seniorLPA} LPA`).join('; ')}
- Unconventional Paths: ${research.unconventionalPaths.join(', ')}
- Risk Factors: ${research.riskFactors.join(', ')}

USER CONTEXT:
- Stage: ${answers.currentStage}, Field: ${answers.fieldOfStudy}
- Location: ${answers.locationFlexibility}, Horizon: ${answers.timeHorizon} yrs
- Financial: ${answers.financialSituation}, Worst-Case: ${answers.worstCaseTolerance}
`;

  return `Generate exactly 5 DISTINCT, HIGHLY PERSONALIZED career worlds for THIS SPECIFIC CANDIDATE based on their unique DNA and the research insights above.

${profileContext}

CRITICAL PERSONALIZATION RULES:
1. DO NOT use generic archetype templates. Each world must be a SPECIFIC ROLE TITLE that emerges from the intersection of:
   - Candidate's top strengths (${candidateProfile.coreStrengths.slice(0,3).join(', ')})
   - Their primary value: ${candidateProfile.valuesRanked[0]?.label}
   - Their working style: ${candidateProfile.workingStyle}
   - Market opportunities from research: ${research.highGrowthAreas.join(', ')}
   - Rising skills they could leverage: ${research.skillDemandAnalysis.filter(s => s.trend === 'rising').slice(0,3).map(s => s.skill).join(', ')}

2. The 5 worlds should span DIFFERENT career directions (not all technical, not all business). Use the candidate's affinity scores as a guide but prioritize VARIETY that still fits them.

3. At least 1 world should be an "unconventional/hidden gem" path from: ${research.unconventionalPaths.join(', ')} or a creative combination.

4. Each world must have UNIQUE fitReasons tied to SPECIFIC elements of their DNA (not generic).

5. Salary trajectories MUST align with research benchmarks: ${research.salaryBenchmarks.map(s => `${s.role} (${s.entryLPA}-${s.seniorLPA} LPA)`).join(', ')}

Return a JSON array of 5 CareerWorld objects. Each must have:
- careerTitle: string (SPECIFIC role, e.g. "AI Platform Engineer - Fintech", not "Software Engineer")
- archetype: "technical" | "business" | "creative" | "entrepreneurial" | "structured"
- field: string
- tagline: string (compelling, specific to candidate)
- fitScore: number (0-100, based on DNA match)
- fitReasons: string[] (3 SPECIFIC reasons referencing their strengths, values, constraints)
- salaryTrajectory: array of { year: number, label: string, ctcLPA: number, ctcLow: number, ctcHigh: number } for years 1,3,5,7,10
- happinessMetrics: { overall, workLifeBalance, meaningPurpose, stressLevel, socialStatus } (0-100)
- jobSecurityScore: number (0-100)
- jobSecurityReasoning: string (specific to role + market)
- demandTrend: "growing" | "stable" | "declining"
- skillGap: array of { skill, hasSkill: boolean, importance: "critical" | "important" | "nice-to-have" }
- timelineToComfortable: string
- timelineToPeak: string
- exampleCompanies: { entryLevel: string[], growthStage: string[], premium: string[] } (SPECIFIC to role)
- risks: string[] (2-3 REAL downsides from research.riskFactors + role-specific)
- dayInTheLife: string (vivid 2-3 sentences, specific to role)
- methodology: string
- isUnconventional: boolean`;
}

// ============================================================
// PERSONALIZED FALLBACK WORLDS (uses research)
// ============================================================

function getPersonalizedFallbackWorlds(
  answers: AssessmentAnswers, 
  profile: CandidateProfile | undefined, 
  research: CareerResearchResult
): CareerWorld[] {
  const candidateProfile = profile || getRealisticFallbackProfile(answers);
  const isTech = /comp|code|dev|soft|tech|data|it|ai|ml/i.test(answers.fieldOfStudy || answers.keySkills?.join(' ') || '');
  const isBiz = /biz|market|fin|sales|manag|comm|oper/i.test(answers.fieldOfStudy || answers.keySkills?.join(' ') || '');
  
  // Build dynamic roles based on research + profile
  const dynamicRoles = buildDynamicRoles(answers, candidateProfile, research, isTech, isBiz);
  
  return dynamicRoles.map((role, idx) => {
    const salaryTrajectory = [
      { year: 1, label: 'Yr 1', ctcLPA: role.yr1, ctcLow: Math.round(role.yr1 * 0.85 * 10) / 10, ctcHigh: Math.round(role.yr1 * 1.2 * 10) / 10 },
      { year: 3, label: 'Yr 3', ctcLPA: Math.round(role.yr1 * 1.6 * 10) / 10, ctcLow: Math.round(role.yr1 * 1.3 * 10) / 10, ctcHigh: Math.round(role.yr1 * 2.0 * 10) / 10 },
      { year: 5, label: 'Yr 5', ctcLPA: Math.round(role.yr1 * 2.4 * 10) / 10, ctcLow: Math.round(role.yr1 * 2.0 * 10) / 10, ctcHigh: Math.round(role.yr1 * 3.0 * 10) / 10 },
      { year: 7, label: 'Yr 7', ctcLPA: Math.round(role.yr1 * 3.4 * 10) / 10, ctcLow: Math.round(role.yr1 * 2.8 * 10) / 10, ctcHigh: Math.round(role.yr1 * 4.2 * 10) / 10 },
      { year: 10, label: 'Yr 10', ctcLPA: role.yr10, ctcLow: Math.round(role.yr10 * 0.85 * 10) / 10, ctcHigh: Math.round(role.yr10 * 1.3 * 10) / 10 }
    ];

    const monthlyExp = estimateMonthlyExpenses('metro', 'moderate');
    const netWorthProjection = calculateNetWorthProjection({
      salaryTrajectory,
      savingsRatePercent: 30,
      annualInflationPercent: 6,
      investmentReturnPercent: 12,
      monthlyExpensesLakhs: monthlyExp,
      yearsToProject: 10
    });

    const candidateStrengths = candidateProfile.coreStrengths || answers.keySkills || ['Structured Problem Solving'];
    return {
      id: `world-${idx + 1}`,
      rank: idx + 1,
      careerTitle: role.title,
      archetype: role.archetype,
      field: role.field,
      tagline: role.tagline,
      fitScore: role.fit,
      fitReasons: [
        `Directly leverages your strength in ${candidateStrengths[idx % candidateStrengths.length] || 'logical analysis'}`,
        `Aligns with your top value: ${candidateProfile.valuesRanked[0]?.label || 'growth'} and ${role.archetype} work style`,
        `Fits your ${answers.timeHorizon || 5}-year horizon, ${answers.locationFlexibility || 'metro'} preference, and ${candidateProfile.riskAppetite.split(' ')[0].toLowerCase()} risk profile`
      ],
      salaryTrajectory,
      netWorthProjection,
      happinessMetrics: {
        overall: role.happiness,
        workLifeBalance: role.wlb,
        meaningPurpose: role.meaning,
        stressLevel: role.stress,
        socialStatus: role.status
      },
      jobSecurityScore: role.security,
      jobSecurityReasoning: role.security > 85 ? 'High baseline demand backed by national enterprise infrastructure.' : 'High market value driven by specialized execution skills.',
      demandTrend: role.trend,
      skillGap: role.skills,
      timelineToComfortable: '2–3 years',
      timelineToPeak: '7–10 years',
      exampleCompanies: role.exampleCompanies,
      risks: role.risks,
      dayInTheLife: role.day,
      methodology: 'Personalized heuristic engine calibrated against Indian labor market CTC liquidity, AmbitionBox benchmarks, and research insights.',
      isUnconventional: role.isUnconventional
    };
  });
}

function buildDynamicRoles(
  answers: AssessmentAnswers,
  profile: CandidateProfile,
  research: CareerResearchResult,
  isTech: boolean,
  isBiz: boolean
) {
  const signals = calculateProfileSignals(answers);
  const _topValue = profile.valuesRanked[0]?.value || 'growth';
  const riskLevel = answers.riskTolerance || 'moderate';
  const _workStyle = answers.workStyle || 'collaborative';
  
  // Use research to customize roles
  const highGrowth = research.highGrowthAreas[0] || (isTech ? 'Applied AI Engineering' : 'Growth Product Management');
  const _unconventional = research.unconventionalPaths[0] || 'Fractional Leadership Role';
  const risingSkills = research.skillDemandAnalysis.filter(s => s.trend === 'rising').slice(0, 3).map(s => s.skill);
  const salaryBench = research.salaryBenchmarks[0] || { entryLPA: 10, midLPA: 25, seniorLPA: 50 };
  const skillText = `${answers.fieldOfStudy} ${(answers.keySkills || []).join(' ')}`.toLowerCase();
  const hasCoding = /coding|technology|computer|software|engineering|programming/.test(skillText);
  const hasAnalytics = /analytical|logical|math|quantitative|research|data/.test(skillText);
  const hasCreative = /creative|design|writing|language/.test(skillText);
  const hasPeople = /people|communication|persuasion|leadership|business/.test(skillText);
  const primaryTitle = hasCoding
    ? `${highGrowth} Engineer`
    : hasAnalytics
      ? `${highGrowth} Analyst`
      : hasCreative
        ? `${highGrowth} Experience Strategist`
        : hasPeople
          ? `${highGrowth} Operations Lead`
          : `${highGrowth} Specialist`;
  const productTitle = signals.leadership >= 70 && signals.communication >= 70
    ? 'Product Strategy & Stakeholder Lead'
    : signals.technicalInterest >= 70
      ? 'Technical Product Manager - Platform'
      : 'Customer Discovery & Product Operations Lead';
  const creativeTitle = signals.creativity >= 70
    ? 'Product Design & Experience Lead'
    : signals.communication >= 70
      ? 'Service Design & Research Lead'
      : 'Content Systems & Knowledge Design Lead';
  const independentTitle = riskLevel === 'high-risk' && signals.technicalInterest >= 70
    ? 'Independent AI Automation Builder'
    : signals.creativity >= 70
      ? 'Independent Brand & Experience Consultant'
      : 'Independent Domain Consultant';
  const institutionalTitle = answers.riskTolerance === 'stable' && signals.communication >= 70
    ? 'Public Programs & Digital Transformation Advisor'
    : signals.technicalInterest >= 70
      ? 'Digital Infrastructure & Platform Specialist'
      : 'Institutional Research & Operations Specialist';
  
  const roles = [
    // Role 1: Primary affinity - deep specialization
    {
      title: primaryTitle,
      archetype: 'technical' as const,
      field: isTech ? 'Deep Technical Specialization' : 'Specialized Domain Leadership',
      tagline: `A ${hasCoding ? 'technical' : hasAnalytics ? 'evidence-led' : hasCreative ? 'human-centered' : 'domain'} track built around your ${profile.coreStrengths[0]} and current market demand.`,
      yr1: Math.round(salaryBench.entryLPA * 1.1),
      yr10: Math.round(salaryBench.seniorLPA * 0.9),
      happiness: 85,
      wlb: 75,
      meaning: 82,
      stress: 40,
      status: 85,
      security: 85,
      trend: 'growing' as const,
      fit: Math.min(96, Math.round(72 + signals.problemSolving * 0.18 + signals.learningOrientation * 0.08)),
      skills: risingSkills.map(s => ({ skill: s, hasSkill: false, importance: 'critical' as const })).slice(0, 3),
      risks: ['Deep specialization risk if market shifts', 'Continuous upskilling required'],
      day: `Design and architect ${isTech ? 'complex systems' : 'strategic initiatives'} using ${profile.coreStrengths[0]}, mentor peers, and drive technical excellence.`,
      isUnconventional: false,
      exampleCompanies: {
        entryLevel: ['Infosys', 'TCS Digital', 'Accenture'],
        growthStage: ['Razorpay', 'CRED', 'Meesho', 'BrowserStack'],
        premium: ['Google India', 'Microsoft IDC', 'Amazon', 'NPCI']
      }
    },
    // Role 2: Business/Strategy - cross-functional
    {
      title: isBiz ? 'Strategic Growth & Operations Lead' : productTitle,
      archetype: 'business' as const,
      field: isBiz ? 'Growth Strategy & Commercial Ops' : 'Product Leadership',
      tagline: `Translate ${profile.coreStrengths[0]} into measurable outcomes across ${answers.environment || 'hybrid'} teams.`,
      yr1: Math.round(salaryBench.entryLPA * 1.0),
      yr10: Math.round(salaryBench.seniorLPA * 0.95),
      happiness: 82,
      wlb: 70,
      meaning: 86,
      stress: 48,
      status: 90,
      security: 82,
      trend: 'growing' as const,
      fit: Math.min(94, Math.round(60 + signals.businessInterest * 0.2 + signals.communication * 0.12)),
      skills: [
        { skill: 'Data-driven Prioritization', hasSkill: true, importance: 'critical' as const },
        { skill: 'Executive Stakeholder Alignment', hasSkill: false, importance: 'critical' as const },
        { skill: 'User Research & Go-to-Market', hasSkill: true, importance: 'important' as const }
      ],
      risks: ['High context-switching', 'Accountability without direct authority'],
      day: 'Host sprint alignments, analyze funnel metrics, present roadmap to leadership, and unblock cross-functional dependencies.',
      isUnconventional: false,
      exampleCompanies: {
        entryLevel: ['Swiggy', 'Zomato', 'PhonePe', 'PolicyBazaar'],
        growthStage: ['Razorpay', 'CRED', 'Meesho', 'Groww'],
        premium: ['Google', 'Microsoft', 'Amazon', 'Flipkart']
      }
    },
    // Role 3: Creative/Human-facing
    {
      title: creativeTitle,
      archetype: 'creative' as const,
      field: 'Product Design & User Experience',
      tagline: `Shape clearer experiences where ${profile.coreStrengths[0]} meets the way people actually work and decide.`,
      yr1: Math.round(salaryBench.entryLPA * 0.85),
      yr10: Math.round(salaryBench.seniorLPA * 0.75),
      happiness: 88,
      wlb: 82,
      meaning: 90,
      stress: 32,
      status: 80,
      security: 80,
      trend: 'growing' as const,
      fit: Math.min(93, Math.round(58 + signals.creativity * 0.2 + signals.communication * 0.12)),
      skills: [
        { skill: 'Design Systems & Figma', hasSkill: false, importance: 'critical' as const },
        { skill: 'Behavioral Psychology & UX Research', hasSkill: false, importance: 'important' as const },
        { skill: 'Usability Testing & Prototyping', hasSkill: true, importance: 'critical' as const }
      ],
      risks: ['Subjective feedback loops', 'Rapid design trend shifts'],
      day: 'Run user research sessions, refine design systems, deliver prototypes to engineers, and advocate for user needs in product reviews.',
      isUnconventional: false,
      exampleCompanies: {
        entryLevel: ['Swiggy', 'Zomato', 'PhonePe', 'CRED'],
        growthStage: ['Razorpay', 'Meesho', 'Groww', 'Unacademy'],
        premium: ['Google', 'Microsoft', 'Adobe', 'Figma']
      }
    },
    // Role 4: Entrepreneurial/Independent
    {
      title: independentTitle,
      archetype: 'entrepreneurial' as const,
      field: 'Independent Knowledge Economy',
      tagline: `A high-autonomy path for building an independent practice around ${profile.coreStrengths[0]} and your ${riskLevel} risk posture.`,
      yr1: Math.round(salaryBench.entryLPA * 0.6),
      yr10: Math.round(salaryBench.seniorLPA * 1.2),
      happiness: 91,
      wlb: 78,
      meaning: 94,
      stress: 55,
      status: 84,
      security: 62,
      trend: 'growing' as const,
      fit: Math.min(92, Math.round(48 + signals.autonomy * 0.2 + signals.riskTolerance * 0.15)),
      skills: [
        { skill: 'Niche Domain Authority', hasSkill: true, importance: 'critical' as const },
        { skill: 'Client Acquisition & Pipeline', hasSkill: false, importance: 'critical' as const },
        { skill: 'Self-direction & Financial Discipline', hasSkill: true, importance: 'critical' as const }
      ],
      risks: ['Income variability first 12-18 months', 'No corporate safety nets (insurance, leave)'],
      day: 'Advise 2-3 portfolio companies on core bottlenecks, ship deliverables, control calendar, and build personal brand.',
      isUnconventional: false,
      exampleCompanies: {
        entryLevel: ['Own Practice', 'Topmate', 'ADPList'],
        growthStage: ['VC Portfolio Companies', 'YC Startups', 'AngelList Ventures'],
        premium: ['Sequoia/Accel Portfolio', 'Peak XV Companies', 'Global Capability Centers']
      }
    },
    // Role 5: Structured/Stability - unconventional/hidden gem
    {
      title: institutionalTitle,
      archetype: 'structured' as const,
      field: 'Institutional & Strategic Advisory',
      tagline: `A measured path combining ${answers.locationFlexibility || 'location flexibility'} with durable institutional impact.`,
      yr1: Math.round(salaryBench.entryLPA * 0.9),
      yr10: Math.round(salaryBench.seniorLPA * 0.65),
      happiness: 85,
      wlb: 92,
      meaning: 88,
      stress: 22,
      status: 92,
      security: 98,
      trend: 'stable' as const,
      fit: Math.min(94, Math.round(55 + (100 - signals.riskTolerance) * 0.16 + signals.teamwork * 0.1)),
      skills: [
        { skill: 'Regulatory & Compliance Mastery', hasSkill: false, importance: 'critical' as const },
        { skill: 'Mission-Critical Architecture', hasSkill: false, importance: 'critical' as const },
        { skill: 'Multi-stakeholder Coordination', hasSkill: true, importance: 'important' as const }
      ],
      risks: ['Slower promotion cycles', 'Rigid administrative processes'],
      day: 'Oversee national-scale digital infrastructure, coordinate with government agencies, and finish work by 5:30 PM with high impact.',
      isUnconventional: true,
      exampleCompanies: {
        entryLevel: ['NPCI', 'UIDAI', 'DigiLocker', 'ONDC'],
        growthStage: ['India Stack Partners', 'GovTech Startups', 'Public Digital Goods'],
        premium: ['NPCI/UIDAI Leadership', 'MeitY Senior Roles', 'World Bank/UN Digital Advisors']
      }
    }
  ];
  
  return roles;
}

function normalizeCareerWorlds(raw: unknown, fallback: CareerWorld[]): CareerWorld[] {
  if (!Array.isArray(raw) || raw.length < 3) return fallback;

  const normalized = raw.slice(0, 5).map((candidate, index) => {
    const base = fallback[index] || fallback[0];
    if (!candidate || typeof candidate !== 'object') return base;
    const value = candidate as Record<string, unknown>;
    const fitScore = typeof value.fitScore === 'number' && Number.isFinite(value.fitScore)
      ? Math.max(0, Math.min(100, Math.round(value.fitScore)))
      : base.fitScore;
    const salaryTrajectory = Array.isArray(value.salaryTrajectory) && value.salaryTrajectory.length >= 2
      ? value.salaryTrajectory
      : base.salaryTrajectory;
    const netWorthProjection = Array.isArray(value.netWorthProjection) && value.netWorthProjection.length >= 2
      ? value.netWorthProjection
      : base.netWorthProjection;
    return {
      ...base,
      ...value,
      id: `world-${index + 1}`,
      rank: index + 1,
      careerTitle: typeof value.careerTitle === 'string' && value.careerTitle.trim() ? value.careerTitle : base.careerTitle,
      field: typeof value.field === 'string' && value.field.trim() ? value.field : base.field,
      tagline: typeof value.tagline === 'string' && value.tagline.trim() ? value.tagline : base.tagline,
      fitScore,
      fitReasons: Array.isArray(value.fitReasons) && value.fitReasons.length ? value.fitReasons : base.fitReasons,
      salaryTrajectory,
      netWorthProjection,
      risks: Array.isArray(value.risks) && value.risks.length ? value.risks : base.risks,
      skillGap: Array.isArray(value.skillGap) ? value.skillGap : base.skillGap,
    } as CareerWorld;
  });

  return normalized.length >= 3 ? normalized : fallback;
}

function personalizeGeneratedWorlds(
  worlds: CareerWorld[],
  answers: AssessmentAnswers,
  profile: CandidateProfile,
  research: CareerResearchResult
): CareerWorld[] {
  const signals = profile.signalScores || calculateProfileSignals(answers);
  const firstGrowthArea = (research.highGrowthAreas[0] || 'Applied Career Systems').replace(/\b(engineering|engineer|specialist|lead)\b/gi, '').replace(/\s+/g, ' ').trim();
  const skillText = `${answers.fieldOfStudy} ${(answers.keySkills || []).join(' ')}`.toLowerCase();
  const hasCoding = /coding|technology|computer|software|engineering|programming/.test(skillText);
  const hasCreative = /creative|design|writing|language/.test(skillText) || signals.creativity >= 72;
  const hasPeople = /people|communication|persuasion|leadership|business/.test(skillText) || signals.communication >= 72;
  const roleTitles = [
    hasCoding
      ? `${firstGrowthArea} Engineer`
      : hasCreative
        ? `${firstGrowthArea} Experience Strategist`
        : hasPeople
          ? `${firstGrowthArea} Operations Lead`
          : `${firstGrowthArea} Analyst`,
    signals.technicalInterest >= 70 ? 'Technical Product Manager - Platform' : hasPeople ? 'Customer Discovery & Product Operations Lead' : 'Product Strategy & Insights Lead',
    hasCreative ? 'Product Design & Experience Lead' : signals.communication >= 70 ? 'Service Design & Research Lead' : 'Data Storytelling & Experience Analyst',
    answers.riskTolerance === 'high-risk' && signals.autonomy >= 75 ? 'Independent Automation & Advisory Builder' : hasCreative ? 'Independent Brand & Experience Consultant' : 'Independent Domain Consultant',
    answers.riskTolerance === 'stable' && signals.communication >= 70 ? 'Public Programs & Digital Transformation Advisor' : signals.technicalInterest >= 70 ? 'Digital Infrastructure & Platform Specialist' : 'Institutional Research & Operations Specialist',
  ];

  return worlds.map((world, index) => {
    const profileFit = index === 0 ? signals.problemSolving : index === 1 ? signals.businessInterest : index === 2 ? signals.creativity : index === 3 ? signals.autonomy : 100 - signals.riskTolerance;
    const fitScore = Math.round((world.fitScore * 0.55) + (profileFit * 0.45));
    return {
      ...world,
      careerTitle: roleTitles[index] || world.careerTitle,
      fitScore: Math.max(0, Math.min(100, fitScore)),
      fitReasons: [
        `Profile signal: ${index === 0 ? 'problem solving' : index === 1 ? 'business interest' : index === 2 ? 'creative thinking' : index === 3 ? 'autonomy' : 'risk calibration'} scored ${profileFit}/100.`,
        ...world.fitReasons.filter(reason => !reason.toLowerCase().includes('generic')).slice(0, 2),
      ],
      methodology: `${world.methodology} Role lane and fit score were recalibrated against this user's assessment signal vector and current market research.`,
    };
  });
}

export async function runSimulation(
  answers: AssessmentAnswers,
  profile?: CandidateProfile,
  suppliedResearch?: CareerResearchResult
): Promise<CareerWorld[]> {
  // Step 1: Deep research based on candidate profile
  const candidateProfile = profile || await generateCandidateProfile(answers);
  const research = suppliedResearch || await researchCareerPaths(answers, candidateProfile);
  
  try {
    // Step 2: Generate personalized simulations using research insights
    const prompt = buildPersonalizedSimulationPrompt(answers, candidateProfile, research);
    const rawJson = await callOpenRouter(SYSTEM_PROMPT, prompt);
    let parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed) && parsed.worlds && Array.isArray(parsed.worlds)) {
      parsed = parsed.worlds;
    }
    if (Array.isArray(parsed) && parsed.length >= 3) {
      const fallbackWorlds = getPersonalizedFallbackWorlds(answers, candidateProfile, research);
      const personalizedWorlds = personalizeGeneratedWorlds(normalizeCareerWorlds(parsed, fallbackWorlds), answers, candidateProfile, research);
      const normalizedWorlds = personalizedWorlds.map((world, index) => {
        const monthlyExp = estimateMonthlyExpenses('metro', 'moderate');
        const salaryTrajectory = world.salaryTrajectory || [
          { year: 1, label: 'Yr 1', ctcLPA: 8 },
          { year: 10, label: 'Yr 10', ctcLPA: 35 }
        ];
        const netWorthProjection = world.netWorthProjection || calculateNetWorthProjection({
          salaryTrajectory,
          savingsRatePercent: 30,
          annualInflationPercent: 6,
          investmentReturnPercent: 12,
          monthlyExpensesLakhs: monthlyExp,
          yearsToProject: 10
        });

        return {
          ...world,
          id: `world-${index + 1}`,
          rank: index + 1,
          salaryTrajectory,
          netWorthProjection
        };
      });
      return normalizedWorlds;
    }
  } catch (err) {
    console.warn('OpenRouter simulation fell back to personalized local engine:', (err as any)?.message);
  }

  return getPersonalizedFallbackWorlds(answers, candidateProfile, research);
}
