import React from 'react';
import { Mic, MicOff, Camera, CameraOff, Hand, Share2, MessageSquare, PhoneOff, Mail, FileUp, Sparkles, Award } from 'lucide-react';

interface MeetFooterControlsProps {
  micOn: boolean;
  setMicOn: (on: boolean) => void;
  cameraOn: boolean;
  setCameraOn: (on: boolean) => void;
  handRaised: boolean;
  setHandRaised: (raised: boolean) => void;
  activeTab: 'stage' | 'assessment' | 'email';
  setActiveTab: (tab: 'stage' | 'assessment' | 'email') => void;
  onOpenUploadModal: () => void;
  onTriggerEmail: () => void;
  hasAnalysis: boolean;
  emailDispatched: boolean;
}

export const MeetFooterControls: React.FC<MeetFooterControlsProps> = ({
  micOn,
  setMicOn,
  cameraOn,
  setCameraOn,
  handRaised,
  setHandRaised,
  activeTab,
  setActiveTab,
  onOpenUploadModal,
  onTriggerEmail,
  hasAnalysis,
  emailDispatched,
}) => {
  return (
    <footer className="bg-[#202124] border-t border-[#3c4043] px-4 py-3 flex items-center justify-between gap-4">
      {/* Left: Meeting Code & Time */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300">
        <span className="font-semibold text-white">qaz-hr-sprint</span>
        <span className="text-gray-500">|</span>
        <span className="text-gray-400">1-on-1 Google Classroom Review</span>
      </div>

      {/* Center: Google Meet Standard Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 mx-auto">
        {/* Mic */}
        <button
          onClick={() => setMicOn(!micOn)}
          className={`p-3 rounded-full border transition-all ${
            micOn
              ? 'bg-[#303134] hover:bg-[#3c4043] border-[#4a4e51] text-gray-200'
              : 'bg-red-600 border-red-500 text-white'
          }`}
          title={micOn ? 'Mute Mic' : 'Unmute Mic'}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Camera */}
        <button
          onClick={() => setCameraOn(!cameraOn)}
          className={`p-3 rounded-full border transition-all ${
            cameraOn
              ? 'bg-[#303134] hover:bg-[#3c4043] border-[#4a4e51] text-gray-200'
              : 'bg-red-600 border-red-500 text-white'
          }`}
          title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {cameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
        </button>

        {/* Hand Raise */}
        <button
          onClick={() => setHandRaised(!handRaised)}
          className={`p-3 rounded-full border transition-all ${
            handRaised
              ? 'bg-amber-600 border-amber-500 text-white'
              : 'bg-[#303134] hover:bg-[#3c4043] border-[#4a4e51] text-gray-200'
          }`}
          title={handRaised ? 'Lower Hand' : 'Raise Hand'}
        >
          <Hand className="w-5 h-5" />
        </button>

        {/* Upload / Share Report */}
        <button
          onClick={onOpenUploadModal}
          className="p-3 rounded-full bg-[#303134] hover:bg-[#3c4043] border border-[#4a4e51] text-blue-400 hover:text-blue-300 transition-all"
          title="Upload or Select Project Status Report"
        >
          <FileUp className="w-5 h-5" />
        </button>

        {/* Phase 3 Email Trigger Button */}
        <button
          onClick={onTriggerEmail}
          className={`px-4 py-2.5 rounded-full border font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
            emailDispatched
              ? 'bg-emerald-900/80 border-emerald-700 text-emerald-200'
              : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white'
          }`}
          title="Trigger Python send_student_review_email tool call"
        >
          <Mail className="w-4 h-4" />
          <span className="hidden md:inline">
            {emailDispatched ? 'Email Report Sent' : 'Phase 3: Dispatch Email'}
          </span>
        </button>

        {/* Leave Call */}
        <button
          onClick={onTriggerEmail}
          className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white border border-red-400 transition-all shadow-lg"
          title="Finish Sprint Review & Send Report"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Tab Quick Switch */}
      <div className="hidden lg:flex items-center gap-2">
        <button
          onClick={() => setActiveTab('stage')}
          className={`p-2 rounded-lg border text-xs font-semibold ${
            activeTab === 'stage'
              ? 'bg-blue-600 border-blue-400 text-white'
              : 'bg-[#303134] border-[#4a4e51] text-gray-300'
          }`}
        >
          Stage
        </button>
        <button
          onClick={() => setActiveTab('assessment')}
          className={`p-2 rounded-lg border text-xs font-semibold ${
            activeTab === 'assessment'
              ? 'bg-blue-600 border-blue-400 text-white'
              : 'bg-[#303134] border-[#4a4e51] text-gray-300'
          }`}
        >
          Assessment
        </button>
      </div>
    </footer>
  );
};
