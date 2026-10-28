import React, { useState, useEffect } from 'react';
import { Video, Users, MessageSquare, Award, Mail, ShieldCheck, ExternalLink, Clock } from 'lucide-react';

interface MeetHeaderProps {
  activeTab: 'stage' | 'assessment' | 'email';
  setActiveTab: (tab: 'stage' | 'assessment' | 'email') => void;
  studentEmail: string;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
  emailDispatched: boolean;
}

export const MeetHeader: React.FC<MeetHeaderProps> = ({
  activeTab,
  setActiveTab,
  studentEmail,
  isAnalyzing,
  hasAnalysis,
  emailDispatched,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#202124] border-b border-[#3c4043] px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
      {/* Zone 1: Meeting Title & Google Classroom Sync */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#303134] text-white px-3 py-1.5 rounded-lg border border-[#4a4e51]">
          <Video className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
            Google Meet
          </span>
        </div>

        <div className="hidden sm:block h-5 w-px bg-[#4a4e51]" />

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-white tracking-tight">
              Google Classroom 1-on-1 Sprint Review
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Classroom Linked
            </span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <span>qaz-hr-sprint</span>
            <span>·</span>
            <span>Senior Engineering Mentor & HR Assessment</span>
          </p>
        </div>
      </div>

      {/* Zone 2: Workspace Navigation Tabs */}
      <div className="flex items-center bg-[#303134] p-1 rounded-xl border border-[#4a4e51] gap-1">
        <button
          onClick={() => setActiveTab('stage')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'stage'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-gray-300 hover:text-white hover:bg-[#3c4043]'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Google Meet Stage</span>
        </button>

        <button
          onClick={() => setActiveTab('assessment')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
            activeTab === 'assessment'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-gray-300 hover:text-white hover:bg-[#3c4043]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>4-Axis Assessment</span>
          {hasAnalysis && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
          {isAnalyzing && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'email'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-gray-300 hover:text-white hover:bg-[#3c4043]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Python Email Dispatcher</span>
          {emailDispatched && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Zone 3: Time & User Email Info */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-300 bg-[#303134] px-3 py-1.5 rounded-lg border border-[#4a4e51]">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono">{time || '06:41 AM'}</span>
        </div>

        <div className="flex items-center gap-2 bg-[#303134] px-3 py-1.5 rounded-lg border border-[#4a4e51] text-xs text-gray-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-medium text-gray-300 truncate max-w-[150px]">
            {studentEmail || 'mithunhari663@gmail.com'}
          </span>
        </div>
      </div>
    </header>
  );
};
