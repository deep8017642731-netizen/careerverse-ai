import { jsPDF } from 'jspdf';
import type { CareerWorld, CareerRoadmap } from './types';
import { formatLPA } from './financialModel';

export function generateCareerDossier(world: CareerWorld, roadmap: CareerRoadmap): void {
  const doc = new jsPDF();
  let y = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const addPageIfNeeded = (heightNeeded: number) => {
    if (y + heightNeeded > doc.internal.pageSize.getHeight() - 20) {
      addFooter();
      doc.addPage();
      y = 20;
    }
  };

  const addFooter = () => {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Disclaimer: These are data-informed estimates, not guarantees.', pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  // Title Page
  doc.setFontSize(24);
  doc.setTextColor(13, 148, 136); // Teal 600
  doc.text('Career Dossier', margin, y);
  y += 12;
  
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(world.careerTitle, margin, y);
  y += 10;
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
  y += 20;

  // Section 1: Career Overview
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Career Overview', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(50);
  doc.text(`Field: ${world.field}`, margin, y);
  y += 6;
  doc.text(`Fit Score: ${world.fitScore}%`, margin, y);
  y += 6;
  doc.text(`Tagline: ${world.tagline}`, margin, y);
  y += 10;
  
  const splitDay = doc.splitTextToSize(`Day in the life: ${world.dayInTheLife}`, pageWidth - margin * 2);
  doc.text(splitDay, margin, y);
  y += splitDay.length * 6 + 10;

  // Section 2: Financial Projections
  addPageIfNeeded(40);
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Financial Projections', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(50);
  world.salaryTrajectory.forEach((point) => {
    doc.text(`${point.label}: ${formatLPA(point.ctcLPA)}`, margin, y);
    y += 6;
  });
  y += 10;

  // Section 3: Happiness & Fit Metrics
  addPageIfNeeded(40);
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Happiness & Fit Metrics', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(50);
  doc.text(`Overall Happiness: ${world.happinessMetrics.overall}/100`, margin, y);
  y += 6;
  doc.text(`Work-Life Balance: ${world.happinessMetrics.workLifeBalance}/100`, margin, y);
  y += 6;
  doc.text(`Stress Level: ${world.happinessMetrics.stressLevel}/100`, margin, y);
  y += 10;

  // Section 4: Skill Gap
  addPageIfNeeded(50);
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Skill Gap', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(50);
  world.skillGap.forEach((skill) => {
    doc.text(`• ${skill.skill} (${skill.importance}) - ${skill.hasSkill ? 'Have' : 'Need'}`, margin, y);
    y += 6;
  });
  y += 10;

  // Section 5: Risks & Downsides
  addPageIfNeeded(50);
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Risks & Honest Downsides', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(50);
  world.risks.forEach((risk) => {
    const splitRisk = doc.splitTextToSize(`• ${risk}`, pageWidth - margin * 2);
    doc.text(splitRisk, margin, y);
    y += splitRisk.length * 6 + 2;
  });
  y += 10;

  // Section 6: Roadmap
  addPageIfNeeded(50);
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('6. Roadmap', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.text(`Total Estimated Time: ${roadmap.totalEstimatedTime}`, margin, y);
  y += 10;

  roadmap.phases.forEach((phase) => {
    addPageIfNeeded(40);
    doc.setFontSize(14);
    doc.setTextColor(13, 148, 136);
    doc.text(`Phase ${phase.phase}: ${phase.title} (${phase.timeframe})`, margin, y);
    y += 8;
    
    doc.setFontSize(11);
    doc.setTextColor(50);
    const splitDesc = doc.splitTextToSize(phase.description, pageWidth - margin * 2);
    doc.text(splitDesc, margin, y);
    y += splitDesc.length * 6 + 4;
    
    phase.milestones.forEach((milestone) => {
      addPageIfNeeded(20);
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`- ${milestone.title}${milestone.isCheckpoint ? ' [⭐ Checkpoint]' : ''}`, margin + 5, y);
      y += 6;
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      const splitMilesDesc = doc.splitTextToSize(milestone.description, pageWidth - margin * 2 - 10);
      doc.text(splitMilesDesc, margin + 10, y);
      y += splitMilesDesc.length * 5 + 4;
    });
    y += 6;
  });

  addFooter();
  doc.save(`CareerVerse-Dossier-${world.careerTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
