import React from 'react';
import { ShieldCheck, Cpu, CheckCircle2, AlertTriangle, Award, Layers, Code, Play, RefreshCw, Volume2, Sparkles } from 'lucide-react';

export interface AnalysisData {
  studentName: string;
  studentEmail: string;
  projectTitle: string;
  overallGrade: string;
  axes: {
    architecture: string;
    milestones: string;
    codeQuality: string;
    blockers: string;
  };
  scores: {
    architecture: number;
    milestones: number;
    codeQuality: number;
    blockers: number;
  };
  strengths: string[];
  improvements: string[];
  mentorSpokenSummary: string;
}

interface TechnicalAxesViewProps {
  analysis: AnalysisData | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  onPlaySpeech: (text: string) => void;
  onTriggerEmailTab: () => void;
}

export const TechnicalAxesView: React.FC<TechnicalAxesViewProps> = ({
  analysis,
  isAnalyzing,
  onRunAnalysis,
  onPlaySpeech,
  onTriggerEmailTab,
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-[#28292c] rounded-2xl border border-[#4a4e51] p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
          <Cpu className="w-8 h-8 text-blue-400 absolute inset-0 m-auto" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Analyzing Project Status Report...</h3>
        <p className="text-xs text-gray-400 max-w-md">
          Evaluating across the 4 Technical Axes: System Architecture, Implementation Status, Code Quality & Security, and Blockers Strategy.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-[#28292c] rounded-2xl border border-[#4a4e51] p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <Award className="w-12 h-12 text-blue-400 mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Phase 2: Live Technical Analysis Ready</h3>
        <p className="text-xs text-gray-400 max-w-md mb-4">
          Submit or select a Project Status Report in the Google Meet Chat panel to trigger live multi-axis evaluation and strengths breakdown.
        </p>
        <button
          onClick={onRunAnalysis}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run Live 4-Axis Technical Review</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#28292c] rounded-2xl border border-[#4a4e51] p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] shadow-xl">
      {/* Top Banner: Project Title & Grade */}
      <div className="bg-[#202124] p-4 rounded-xl border border-[#4a4e51] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" /> 4-Axis Engineering Evaluation
          </div>
          <h2 className="text-lg font-extrabold text-white">{analysis.projectTitle}</h2>
          <p className="text-xs text-gray-400">
            Student: <span className="text-gray-200 font-semibold">{analysis.studentName}</span> ({analysis.studentEmail})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-950/80 border border-blue-800 text-blue-300 px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Overall Grade</div>
            <div className="text-lg font-extrabold text-white">{analysis.overallGrade}</div>
          </div>

          <button
            onClick={onRunAnalysis}
            className="p-2.5 rounded-xl bg-[#303134] hover:bg-[#3c4043] border border-[#4a4e51] text-gray-300 hover:text-white transition-colors"
            title="Re-run Analysis"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mentor Spoken Feedback Audio Card */}
      <div className="bg-gradient-to-r from-blue-950/90 via-[#202124] to-[#202124] p-4 rounded-xl border border-blue-800/60 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-full bg-blue-600 text-white shrink-0 mt-0.5">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
              <span>Petharasan's Verbal Feedback</span>
              <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full">Spoken in Meet</span>
            </div>
            <p className="text-xs text-gray-100 font-medium italic mt-1 leading-relaxed">
              "{analysis.mentorSpokenSummary}"
            </p>
          </div>
        </div>

        <button
          onClick={() => onPlaySpeech(analysis.mentorSpokenSummary)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Speak Aloud</span>
        </button>
      </div>

      {/* The 4 Technical Axes Grid */}
      <div>
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-400" /> 4 Technical Assessment Axes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Axis 1: Architecture */}
          <div className="bg-[#202124] p-4 rounded-xl border border-[#4a4e51]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                1. System Architecture & Tech Stack
              </span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {analysis.scores.architecture}/100
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {analysis.axes.architecture}
            </p>
          </div>

          {/* Axis 2: Milestones */}
          <div className="bg-[#202124] p-4 rounded-xl border border-[#4a4e51]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                2. Implementation vs. Milestones
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {analysis.scores.milestones}/100
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {analysis.axes.milestones}
            </p>
          </div>

          {/* Axis 3: Code Quality */}
          <div className="bg-[#202124] p-4 rounded-xl border border-[#4a4e51]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                3. Code Quality, Security & Error Handling
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {analysis.scores.codeQuality}/100
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {analysis.axes.codeQuality}
            </p>
          </div>

          {/* Axis 4: Blockers */}
          <div className="bg-[#202124] p-4 rounded-xl border border-[#4a4e51]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                4. Blockers & Problem-Solving Strategy
              </span>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {analysis.scores.blockers}/100
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {analysis.axes.blockers}
            </p>
          </div>
        </div>
      </div>

      {/* Strengths (2 Concrete) & Improvements (2 Actionable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths Card */}
        <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/80">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 2 Concrete Technical Strengths
          </h4>
          <ul className="space-y-2.5">
            {analysis.strengths.slice(0, 2).map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-gray-200">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements Card */}
        <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-800/80">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> 2 Actionable Improvements
          </h4>
          <ul className="space-y-2.5">
            {analysis.improvements.slice(0, 2).map((i, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-gray-200">
                <span className="text-amber-400 font-bold mt-0.5">⚡</span>
                <span className="leading-relaxed">{i}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer trigger to Phase 3 Email Dispatcher */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onTriggerEmailTab}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <span>Proceed to Phase 3: Generate & Dispatch Email Report</span>
        </button>
      </div>
    </div>
  );
};
