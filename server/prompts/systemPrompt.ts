import type { AssessmentAnswers, CandidateProfile, CareerWorld } from "../../src/lib/types.js";

export const SYSTEM_PROMPT = `You are CareerVerse AI, an elite career counselor and labor economist specializing in the Indian professional and academic market.
Your mission is to provide realistic, data-informed, and honest career guidance for Indian students and professionals.

Guidelines:
1. Always output strictly valid JSON matching the requested schema. Do not output markdown fences or explanatory text outside JSON.
2. Ground Indian salaries realistically in Lakhs Per Annum (LPA).
3. Always highlight 2-3 genuine downsides or risks for every career path.
4. Keep the language clear, accessible, and free of unnecessary corporate jargon.
5. In Candidate Understanding, analyze the user's answers deeply and produce a structured Candidate DNA profile.
6. In Simulations, produce 5 genuinely DIVERSE paths across distinct archetypes:
   - Technical / Specialist
   - Business / Strategy / Management
   - Creative / People-Facing
   - Entrepreneurial / Independent
   - Structured / Stability-First (Govt / PSU / Corporate Core)
   * Hard Rule: Do NOT generate more than 2 of the 5 worlds from the same broad career category unless the user's profile overwhelmingly points that direction. Prioritize genuine variety that still fits the Candidate Profile.
7. In Roadmaps, condition milestones on BOTH the candidate's verified profile (starting point, background, constraints, timeline) and the target career.`;

export function buildProfileUnderstandingPrompt(answers: AssessmentAnswers): string {
  // Build full Q&A pairs for the model to analyze individually
  const qaPairs = [
    { question: "What is your current career stage?", answer: answers.currentStage },
    { question: "What is your field of study / domain?", answer: answers.fieldOfStudy },
    { question: "What are your key skills?", answer: answers.keySkills?.join(", ") || "Not specified" },
    { question: "What are your top 3 value priorities (in order)?", answer: answers.valuePriorities?.join(" > ") || "Not specified" },
    { question: "What is your preferred work style?", answer: answers.workStyle },
    { question: "What is your preferred work environment?", answer: answers.environment },
    { question: "What is your risk tolerance?", answer: answers.riskTolerance },
    { question: "What is your current financial situation?", answer: answers.financialSituation },
    { question: "What is your location flexibility?", answer: answers.locationFlexibility },
    { question: "What is your investment horizon (years)?", answer: answers.timeHorizon?.toString() || "Not specified" },
    { question: "What energizes you vs drains you?", answer: answers.energizesVsDrains },
    { question: "What is your worst-case tradeoff preference?", answer: answers.worstCaseTolerance }
  ].filter(q => q.answer && q.answer !== "Not specified");

  const qaText = qaPairs.map((q, i) => `${i + 1}. Q: ${q.question}\n   A: ${q.answer}`).join("\n\n");

  return `STEP 1: ANSWER-BY-ANSWER ANALYSIS (Internal Reasoning)

Below are the user's answers to a 12-question career assessment. For EACH answer, write one line stating what it implies about the user (skills, values, risk tolerance, constraints, work style). Do not summarize yet — go through every answer individually.

${qaText}

---

After analyzing each answer individually, write a 3–4 sentence synthesis combining all of them into a single Candidate Profile. Do not use generic filler phrases — ground every statement in a specific answer the user gave.

Return a single JSON object for CandidateProfile without markdown fences:
{
  "summary": "A concise 2-3 sentence portrait summarizing who this candidate is, their core competitive advantage, and their ideal trajectory. MUST reference specific answers.",
  "coreStrengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4"],
  "workingStyle": "Concise summary of their collaborative vs autonomous preference and operating rhythm",
  "valuesRanked": [
    { "value": "${answers.valuePriorities?.[0] || 'passion'}", "label": "Top Value Label", "priority": 1 },
    { "value": "${answers.valuePriorities?.[1] || 'money'}", "label": "Second Value Label", "priority": 2 },
    { "value": "${answers.valuePriorities?.[2] || 'stability'}", "label": "Third Value Label", "priority": 3 }
  ],
  "riskAppetite": "${answers.riskTolerance || 'moderate'}: calibrated against ${answers.worstCaseTolerance || 'balance'}",
  "keyConstraints": ["Constraint 1 (financial/timeline)", "Constraint 2 (location/upskilling)"],
  "energizers": ["Energizing activity/environment 1", "Energizing activity 2"],
  "drainers": ["Draining task/culture 1", "Draining dynamic 2"],
  "archetypeAffinities": [
    { "archetype": "technical", "label": "Technical & Specialist", "score": 85 },
    { "archetype": "business", "label": "Business & Strategy", "score": 80 },
    { "archetype": "creative", "label": "Creative & Human-Centered", "score": 75 },
    { "archetype": "entrepreneurial", "label": "Entrepreneurial & Independent", "score": 70 },
    { "archetype": "structured", "label": "Structured & Stability-First", "score": 65 }
  ]
}`;
}

export function buildSimulationPrompt(answers: AssessmentAnswers, profile?: CandidateProfile): string {
  const profileContext = profile 
    ? `VERIFIED CANDIDATE DNA (from Step 1 analysis):
- Summary: ${profile.summary}
- Core Strengths: ${profile.coreStrengths?.join(", ")}
- Working Style: ${profile.workingStyle}
- Top Values (ranked): ${profile.valuesRanked?.map(v => `${v.label} (Priority ${v.priority})`).join(", ")}
- Risk Appetite: ${profile.riskAppetite}
- Key Constraints: ${profile.keyConstraints?.join("; ")}
- Energizers: ${profile.energizers?.join(", ")}
- Drainers: ${profile.drainers?.join(", ")}
- Archetype Affinities: ${profile.archetypeAffinities?.map(a => `${a.label}: ${a.score}/100`).join(", ")}`
    : `Candidate Summary: ${answers.fieldOfStudy}, strengths: ${answers.keySkills?.join(", ")}`;

  // Include full Q&A for the model to reference specific answers
  const qaPairs = [
    { question: "Current career stage", answer: answers.currentStage },
    { question: "Field of study / domain", answer: answers.fieldOfStudy },
    { question: "Key skills", answer: answers.keySkills?.join(", ") || "Not specified" },
    { question: "Top 3 value priorities (in order)", answer: answers.valuePriorities?.join(" > ") || "Not specified" },
    { question: "Preferred work style", answer: answers.workStyle },
    { question: "Preferred work environment", answer: answers.environment },
    { question: "Risk tolerance", answer: answers.riskTolerance },
    { question: "Financial situation", answer: answers.financialSituation },
    { question: "Location flexibility", answer: answers.locationFlexibility },
    { question: "Investment horizon (years)", answer: answers.timeHorizon?.toString() || "Not specified" },
    { question: "Energizes vs drains", answer: answers.energizesVsDrains },
    { question: "Worst-case tradeoff preference", answer: answers.worstCaseTolerance }
  ].filter(q => q.answer && q.answer !== "Not specified");

  const qaText = qaPairs.map((q, i) => `${i + 1}. ${q.question}: ${q.answer}`).join("\n");

  return `STEP 2: CAREER GENERATION — CONDITIONED ON FULL PROFILE + EXPLICIT DIVERSITY RULES

Using the Candidate Profile above, generate 5 distinct career paths. Follow these rules STRICTLY:

${profileContext}

FULL USER ANSWERS (reference specific answers by number in your justifications):
${qaText}

---

CRITICAL DIVERSITY RULES (violation = failure):
1. Each of the 5 careers MUST come from a GENUINELY DIFFERENT professional category:
   - Deep Technical / Specialist (engineering, data, AI, research, architecture)
   - Business / Strategy / Management (product, growth, ops, strategy, finance)
   - Creative / Design / Human-Facing (UX, design, content, consulting, media)
   - Independent / Entrepreneurial (founder, fractional, consultant, solopreneur)
   - Structured / Institutional (Govt/PSU, corporate core, academia, non-profit)
   
   Do NOT generate more than 2 from the same category unless the Candidate Profile OVERWHELMINGLY justifies it.

2. Do NOT reuse the same descriptive phrase, keyword, or sentence structure across multiple career descriptions. Each description must be written independently and reference DIFFERENT specific answers from the Candidate Profile as justification.

3. For EACH career, explicitly state which 2–3 specific user answers (by number from the list above) most strongly support this match — this justification must be DIFFERENT for each of the 5 careers.

4. Vary the salary curve, happiness index, and job security REALISTICALLY based on the actual nature of each career — do NOT default to similar numbers across all 5.

5. Include at least ONE 'unexpected but well-justified' option that a generic assessment wouldn't obviously suggest, and explain why it fits THIS specific candidate. Mark with isUnconventional: true.

6. If two different users gave meaningfully different answers, their outputs MUST look meaningfully different. Sameness across users is a failure condition.

---

SELF-CHECK BEFORE RETURNING:
Before finalizing, check your own output: do any two of the 5 career descriptions share a repeated phrase or near-identical sentence structure? If so, rewrite the more generic one to be more specific to the Candidate Profile.

---

Return a JSON array of 5 CareerWorld objects without codeblocks.
Each CareerWorld must have:
- careerTitle: string (SPECIFIC role, e.g., "AI Platform Engineer - Fintech", NOT "Software Engineer")
- archetype: "technical" | "business" | "creative" | "entrepreneurial" | "structured"
- field: string
- tagline: string (compelling, specific to candidate)
- fitScore: number (0-100, based on DNA match)
- fitReasons: string[] (3 SPECIFIC reasons referencing their strengths, values, constraints, AND citing answer numbers)
- salaryTrajectory: array of { year: number, label: string, ctcLPA: number, ctcLow: number, ctcHigh: number } for years 1, 3, 5, 7, 10
- happinessMetrics: { overall, workLifeBalance, meaningPurpose, stressLevel, socialStatus } (0-100)
- jobSecurityScore: number (0-100)
- jobSecurityReasoning: string (specific to role + market)
- demandTrend: "growing" | "stable" | "declining"
- skillGap: array of { skill, hasSkill: boolean, importance: "critical" | "important" | "nice-to-have" }
- timelineToComfortable: string
- timelineToPeak: string
- exampleCompanies: { entryLevel: string[], growthStage: string[], premium: string[] } (SPECIFIC to role)
- risks: string[] (2-3 REAL downsides)
- dayInTheLife: string (vivid 2-3 sentences, specific to role)
- methodology: string
- isUnconventional: boolean`;
}

export function buildRoadmapPrompt(world: CareerWorld, answers: AssessmentAnswers, profile?: CandidateProfile): string {
  const profileContext = profile
    ? `Candidate Profile:
- Strengths: ${profile.coreStrengths?.join(', ')}
- Constraints: ${profile.keyConstraints?.join(', ')}
- Risk & Timeline: ${profile.riskAppetite}, ${answers.timeHorizon} years horizon`
    : `Candidate Background: ${answers.fieldOfStudy}, Skills: ${answers.keySkills?.join(', ')}`;

  return `Create a structured 4-phase step-by-step career roadmap for the user to become a ${world.careerTitle} (${world.archetype} archetype).
Tailor this roadmap specifically to their actual starting point and constraints:

${profileContext}
Target Career: ${world.careerTitle} (${world.field})
Target Timeline to Comfortable: ${world.timelineToComfortable}

Return a single JSON object for CareerRoadmap without codeblocks:
- worldId: "${world.id}"
- careerTitle: "${world.careerTitle}"
- archetype: "${world.archetype || 'technical'}"
- currentPosition: "${answers.fieldOfStudy ? 'Current background in ' + answers.fieldOfStudy : 'Foundation Learner'}"
- targetPosition: "${world.careerTitle}"
- totalEstimatedTime: "${world.timelineToComfortable || "2–3 years"}"
- disclaimer: "This roadmap is a personalized educational guide calibrated against Indian market hiring bars."
- phases: array of exactly 4 phases (phase 1 to 4) with title, timeframe, description, and milestones (array of title, description, isCheckpoint, estimatedCostINR, resources with name, type, provider, costINR)`;
}
