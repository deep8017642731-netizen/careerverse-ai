// ============================================================
// CareerVerse AI — Deterministic Financial Model
// ============================================================
// This runs REAL MATH for net worth projections — never LLM-generated.

import type { SalaryDataPoint, NetWorthDataPoint } from './types';

interface FinancialParams {
  salaryTrajectory: SalaryDataPoint[];
  savingsRatePercent: number; // e.g., 30
  annualInflationPercent: number; // e.g., 6
  investmentReturnPercent: number; // e.g., 12 (Indian equity avg)
  monthlyExpensesLakhs: number; // estimated monthly spend
  yearsToProject: number;
}

/**
 * Interpolate salary for any given year from the sparse trajectory data points.
 */
function interpolateSalary(trajectory: SalaryDataPoint[], year: number): number {
  if (year <= trajectory[0].year) return trajectory[0].ctcLPA;
  if (year >= trajectory[trajectory.length - 1].year)
    return trajectory[trajectory.length - 1].ctcLPA;

  for (let i = 0; i < trajectory.length - 1; i++) {
    const curr = trajectory[i];
    const next = trajectory[i + 1];
    if (year >= curr.year && year <= next.year) {
      const fraction = (year - curr.year) / (next.year - curr.year);
      return curr.ctcLPA + fraction * (next.ctcLPA - curr.ctcLPA);
    }
  }
  return trajectory[trajectory.length - 1].ctcLPA;
}

/**
 * Calculate net worth projection using realistic Indian financial assumptions.
 * Uses compound interest on investments, adjusts for inflation and expenses.
 */
export function calculateNetWorthProjection(params: FinancialParams): NetWorthDataPoint[] {
  const {
    salaryTrajectory,
    savingsRatePercent,
    annualInflationPercent,
    investmentReturnPercent,
    yearsToProject,
  } = params;

  const projection: NetWorthDataPoint[] = [];
  let totalSavings = 0;
  let totalInvestments = 0;

  for (let year = 1; year <= yearsToProject; year++) {
    const annualSalaryLPA = interpolateSalary(salaryTrajectory, year);

    // In-hand is roughly 70-75% of CTC after tax + deductions for Indian salaries
    const taxRate = annualSalaryLPA > 15 ? 0.30 : annualSalaryLPA > 10 ? 0.25 : annualSalaryLPA > 7 ? 0.20 : 0.10;
    const inHandLPA = annualSalaryLPA * (1 - taxRate);

    // Annual expenses (inflation-adjusted)
    const inflationMultiplier = Math.pow(1 + annualInflationPercent / 100, year - 1);
    const annualExpensesLPA = params.monthlyExpensesLakhs * 12 * inflationMultiplier;

    // Savings = in-hand - expenses (but at minimum, savingsRate% of in-hand)
    const savingsFromIncome = Math.max(
      inHandLPA - annualExpensesLPA,
      inHandLPA * (savingsRatePercent / 100)
    );

    // Split savings: 40% liquid savings, 60% invested (SIP-style)
    const liquidSaving = savingsFromIncome * 0.4;
    const investedAmount = savingsFromIncome * 0.6;

    totalSavings += liquidSaving;
    // Investments grow with compound returns
    totalInvestments = (totalInvestments + investedAmount) * (1 + investmentReturnPercent / 100);

    projection.push({
      year,
      netWorthLakhs: Math.round((totalSavings + totalInvestments) * 100) / 100,
      savingsLakhs: Math.round(totalSavings * 100) / 100,
      investmentsLakhs: Math.round(totalInvestments * 100) / 100,
    });
  }

  return projection;
}

/**
 * Estimate monthly expenses based on location and lifestyle tier.
 */
export function estimateMonthlyExpenses(
  locationTier: 'metro' | 'tier2' | 'tier3' | 'remote',
  lifestyleTier: 'frugal' | 'moderate' | 'comfortable'
): number {
  const baseExpenses: Record<string, Record<string, number>> = {
    metro: { frugal: 0.25, moderate: 0.40, comfortable: 0.65 },
    tier2: { frugal: 0.15, moderate: 0.25, comfortable: 0.40 },
    tier3: { frugal: 0.10, moderate: 0.18, comfortable: 0.30 },
    remote: { frugal: 0.12, moderate: 0.22, comfortable: 0.35 },
  };
  return baseExpenses[locationTier]?.[lifestyleTier] ?? 0.30;
}

/**
 * Format INR values in Indian notation (Lakhs/Crores).
 */
export function formatINR(lakhs: number): string {
  if (lakhs >= 100) {
    const crores = lakhs / 100;
    return `₹${crores.toFixed(crores >= 10 ? 1 : 2)} Cr`;
  }
  return `₹${lakhs.toFixed(lakhs >= 10 ? 1 : 2)} L`;
}

/**
 * Format salary as LPA string.
 */
export function formatLPA(lpa: number): string {
  if (lpa >= 100) {
    return `₹${(lpa / 100).toFixed(2)} Cr PA`;
  }
  return `₹${lpa.toFixed(1)} LPA`;
}
