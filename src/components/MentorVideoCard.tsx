import React, { useState, useEffect } from 'react';
import { Mic, Volume2, VolumeX, Sparkles, ShieldCheck, Award, MessageSquare } from 'lucide-react';

interface MentorVideoCardProps {
  latestSpokenText: string;
  isSpeaking: boolean;
  isPlayingAudio: boolean;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  onReplaySpeech: () => void;
}

export const MentorVideoCard: React.FC<MentorVideoCardProps> = ({
  latestSpokenText,
  isSpeaking,
  isPlayingAudio,
  audioEnabled,
  setAudioEnabled,
  onReplaySpeech,
}) => {
  return (
    <div className="relative bg-[#303134] rounded-2xl border border-[#4a4e51] overflow-hidden flex flex-col justify-between p-4 min-h-[300px] lg:min-h-[360px] shadow-xl group">
      {/* Top Overlay Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-[#202124]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#4a4e51] text-xs text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-gray-100">Petharasan</span>
          <span className="text-gray-400">·</span>
          <span className="text-blue-300 font-medium">Senior Engineering Mentor & HR Reviewer</span>
        </div>

        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-2 rounded-full border transition-all ${
            audioEnabled
              ? 'bg-blue-600/90 border-blue-400 text-white hover:bg-blue-500'
              : 'bg-[#202124]/80 border-[#4a4e51] text-gray-400 hover:text-white'
          }`}
          title={audioEnabled ? 'Petharasan Audio Voice ON' : 'Petharasan Audio Voice Muted'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Center Avatar & Visualizer */}
      <div className="flex flex-col items-center justify-center my-auto py-6">
        <div className="relative">
          {/* Active Voice Wave Pulse Ring */}
          {(isSpeaking || isPlayingAudio) && (
            <div className="absolute -inset-4 rounded-full bg-blue-500/20 border-2 border-blue-400 animate-ping opacity-75" />
          )}

          {/* Avatar Container */}
          <div
            className={`w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 border-4 ${
              isSpeaking || isPlayingAudio ? 'border-blue-400 shadow-lg shadow-blue-500/30' : 'border-[#4a4e51]'
            } flex items-center justify-center relative overflow-hidden transition-all duration-300`}
          >
            <div className="text-center">
              <span className="text-3xl font-extrabold text-white tracking-wider">P</span>
              <div className="text-[10px] uppercase font-bold text-blue-300 tracking-widest mt-0.5">Mentor</div>
            </div>

            {/* Subtle glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
          </div>

          {/* Speaking Indicator Badge */}
          {(isSpeaking || isPlayingAudio) && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-300 shadow-md flex items-center gap-1">
              <Mic className="w-3 h-3 animate-bounce" /> Speaking
            </div>
          )}
        </div>

        {/* Name & Title Label */}
        <div className="mt-4 text-center">
          <h2 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
            Petharasan <ShieldCheck className="w-4 h-4 text-blue-400" />
          </h2>
          <p className="text-xs text-gray-300 font-medium mt-0.5">
            AI Senior Engineering Mentor & HR Reviewer
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[11px] text-gray-400 bg-[#202124] px-2.5 py-0.5 rounded-full border border-[#3c4043]">
              Google Classroom Reviewer
            </span>
            <span className="text-[11px] text-blue-300 bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-800/80">
              1-on-1 Sprint Evaluation
            </span>
          </div>
        </div>
      </div>

      {/* Subtitle / Spoken Captions Bar */}
      <div className="bg-[#202124]/90 backdrop-blur-md rounded-xl p-3 border border-[#4a4e51] z-10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Live Mentor Captions
          </span>
          {latestSpokenText && (
            <button
              onClick={onReplaySpeech}
              className="text-[11px] text-gray-300 hover:text-white bg-[#303134] px-2 py-0.5 rounded border border-[#4a4e51] transition-colors"
            >
              Replay Audio
            </button>
          )}
        </div>

        <p className="text-xs text-gray-200 leading-relaxed font-normal italic min-h-[38px] line-clamp-3">
          "{latestSpokenText || "Welcome to our 1-on-1 sprint review! How did your sprint go, and could you share your Project Status Report in the chat?"}"
        </p>
      </div>
    </div>
  );
};
