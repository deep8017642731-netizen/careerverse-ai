import type { AssessmentAnswers, CandidateProfile, CareerWorld, CareerRoadmap } from '../../src/lib/types';
import { SYSTEM_PROMPT, buildRoadmapPrompt } from '../prompts/systemPrompt';
import { callOpenRouter } from './openRouterClient';

function getRealisticFallbackRoadmap(world: CareerWorld, answers: AssessmentAnswers, profile?: CandidateProfile): CareerRoadmap {
  const currentPos = answers.fieldOfStudy 
    ? `Current background in ${answers.fieldOfStudy}`
    : 'Foundation Learner';

  const strengthsSnippet = profile?.coreStrengths?.[0] || 'Analytical Logic';

  return {
    worldId: world.id,
    careerTitle: world.careerTitle,
    archetype: world.archetype,
    currentPosition: currentPos,
    targetPosition: world.careerTitle,
    totalEstimatedTime: world.timelineToComfortable || '18–24 months',
    disclaimer: 'This roadmap is an educational guide. Progress depends on weekly execution, portfolio quality, and hiring market dynamics in India.',
    phases: [
      {
        phase: 1,
        title: 'Phase 1: Foundations & Core Skill Acquisition',
        timeframe: 'Months 1–4',
        description: `Master fundamental toolchains and concepts, leveraging your existing aptitude in ${strengthsSnippet}.`,
        milestones: [
          {
            id: 'p1-m0',
            title: 'Complete Core Theory & Practical Foundations',
            description: 'Work through structured video curriculum and take daily notes on essential concepts and industry standards.',
            isCheckpoint: true,
            estimatedCostINR: '₹0 – Free',
            resources: [
              { name: 'NPTEL / Coursera Core Specialization', type: 'course', provider: 'IIT / Top Universities', costINR: 'Free / ₹3,000' },
              { name: 'Official Documentation & Guides', type: 'book', provider: 'Open Source', costINR: 'Free' }
            ]
          },
          {
            id: 'p1-m1',
            title: 'Build 2 Guided Beginner Projects',
            description: 'Implement real-world examples from scratch to build muscle memory and understand error handling.',
            isCheckpoint: false,
            estimatedCostINR: '₹0',
            resources: [
              { name: 'GitHub Open Repositories & Sandboxes', type: 'platform', provider: 'GitHub', costINR: 'Free' }
            ]
          }
        ]
      },
      {
        phase: 2,
        title: 'Phase 2: Independent Projects & Portfolio Proof',
        timeframe: 'Months 5–8',
        description: 'Transition from tutorials to building 2 end-to-end original capstone projects tailored to Indian market problems.',
        milestones: [
          {
            id: 'p2-m0',
            title: 'Develop Capstone Project with Real Indian Data',
            description: 'Solve an actual market problem (e.g. fintech reconciliation, logistics optimization, vernacular UX) with clear documentation.',
            isCheckpoint: true,
            estimatedCostINR: '₹500 for hosting/domain',
            resources: [
              { name: 'Vercel / AWS Free Tier', type: 'platform', provider: 'Cloud Providers', costINR: 'Free Tier' },
              { name: 'ProductHunt & Peer Review Channels', type: 'community', provider: 'Tech Twitter & Reddit', costINR: 'Free' }
            ]
          },
          {
            id: 'p2-m1',
            title: 'Earn Industry Recognized Credential',
            description: 'Validate your knowledge with a recognized industry certification or standardized assessment score.',
            isCheckpoint: false,
            estimatedCostINR: '₹4,000 – ₹10,000',
            resources: [
              { name: 'Standard Professional Exam / Assessment', type: 'certification', provider: 'Authorized Provider', costINR: '₹5,000' }
            ]
          }
        ]
      },
      {
        phase: 3,
        title: 'Phase 3: Networking, Commercial Exposure & First Role',
        timeframe: 'Months 9–14',
        description: `Get commercial exposure through high-impact internships, freelancing, or full-time junior positions in ${answers.locationFlexibility || 'metro hubs'}.`,
        milestones: [
          {
            id: 'p3-m0',
            title: 'Publish Case Studies & Polish LinkedIn Profile',
            description: 'Format your GitHub, portfolio, and LinkedIn to clearly present measurable business outcomes from your capstones.',
            isCheckpoint: true,
            estimatedCostINR: '₹0',
            resources: [
              { name: 'LinkedIn Networking & Cold Outreach', type: 'action', provider: 'LinkedIn', costINR: 'Free' },
              { name: 'Peer Mentorship & Mock Interviews', type: 'community', provider: 'Topmate / ADPList', costINR: 'Free' }
            ]
          },
          {
            id: 'p3-m1',
            title: 'Secure First Paid Role or High-Impact Internship',
            description: 'Apply targetedly to 5–10 high-growth startups and enterprises per week with tailored portfolio walkthroughs.',
            isCheckpoint: false,
            estimatedCostINR: '₹0',
            resources: [
              { name: 'Wellfound, Instahyre & Cutshort', type: 'platform', provider: 'Startup Job Portals', costINR: 'Free' }
            ]
          }
        ]
      },
      {
        phase: 4,
        title: 'Phase 4: Full-Time Acceleration & Leadership Comp Tiers',
        timeframe: 'Months 15–24+',
        description: 'Step up into cross-functional project ownership, achieve senior performance ratings, and unlock high compensation milestones.',
        milestones: [
          {
            id: 'p4-m0',
            title: 'First Year Performance Review & Promotion Readiness',
            description: 'Demonstrate measurable business ROI, mentor junior team members, and document key wins for appraisals.',
            isCheckpoint: true,
            estimatedCostINR: '₹0',
            resources: [
              { name: 'Internal Leadership Mentorship', type: 'action', provider: 'Workplace', costINR: 'Free' }
            ]
          },
          {
            id: 'p4-m1',
            title: 'Targeted Lateral Transition / Compensation Bump',
            description: 'Negotiate seniority adjustments or leverage external market offers to reach Tier-1 CTC compensation bands.',
            isCheckpoint: false,
            estimatedCostINR: '₹0',
            resources: [
              { name: 'Levels.fyi & System Design / Leadership Prep', type: 'platform', provider: 'Interview Prep', costINR: 'Free / ₹3,000' }
            ]
          }
        ]
      }
    ]
  };
}

export async function generateRoadmap(world: CareerWorld, answers: AssessmentAnswers, profile?: CandidateProfile): Promise<CareerRoadmap> {
  try {
    const prompt = buildRoadmapPrompt(world, answers, profile);
    const rawJson = await callOpenRouter(SYSTEM_PROMPT, prompt);
    const parsed = JSON.parse(rawJson);
    const roadmap = parsed.roadmap || parsed;
    if (roadmap && roadmap.phases && Array.isArray(roadmap.phases) && roadmap.phases.length >= 3) {
      // Ensure milestones have stable IDs
      const formattedPhases = roadmap.phases.slice(0, 4).map((phase: any, pIdx: number) => ({
        ...phase,
        phase: pIdx + 1,
        milestones: (phase.milestones || []).map((m: any, mIdx: number) => ({
          ...m,
          id: m.id || `p${pIdx + 1}-m${mIdx}`
        }))
      }));

      return {
        worldId: world.id,
        careerTitle: world.careerTitle,
        archetype: world.archetype,
        currentPosition: roadmap.currentPosition || (answers.fieldOfStudy ? `Background in ${answers.fieldOfStudy}` : 'Foundation Learner'),
        targetPosition: world.careerTitle,
        totalEstimatedTime: roadmap.totalEstimatedTime || world.timelineToComfortable || '2 years',
        disclaimer: roadmap.disclaimer || 'This roadmap is an educational guide. Actual milestones vary.',
        phases: formattedPhases
      };
    }
  } catch (err) {
    console.warn('OpenRouter roadmap generation fell back to high-fidelity local engine:', (err as any)?.message);
  }

  return getRealisticFallbackRoadmap(world, answers, profile);
}
