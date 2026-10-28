import React from 'react';
import { Mic, MicOff, Camera, CameraOff, Upload, FileText, CheckCircle2, User } from 'lucide-react';

interface InternVideoCardProps {
  studentName: string;
  studentEmail: string;
  setStudentEmail: (email: string) => void;
  micOn: boolean;
  setMicOn: (on: boolean) => void;
  cameraOn: boolean;
  setCameraOn: (on: boolean) => void;
  hasUploadedReport: boolean;
  onOpenUploadModal: () => void;
}

export const InternVideoCard: React.FC<InternVideoCardProps> = ({
  studentName,
  studentEmail,
  setStudentEmail,
  micOn,
  setMicOn,
  cameraOn,
  setCameraOn,
  hasUploadedReport,
  onOpenUploadModal,
}) => {
  return (
    <div className="relative bg-[#303134] rounded-2xl border border-[#4a4e51] overflow-hidden flex flex-col justify-between p-4 min-h-[300px] lg:min-h-[360px] shadow-xl">
      {/* Top Bar Overlay */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-[#202124]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#4a4e51] text-xs text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="font-semibold">{studentName || 'Intern Student'}</span>
          <span className="text-gray-400">(You)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`p-2 rounded-full border transition-all ${
              micOn
                ? 'bg-[#303134] border-[#4a4e51] text-gray-200 hover:text-white'
                : 'bg-red-600 border-red-500 text-white'
            }`}
            title={micOn ? 'Microphone Active' : 'Microphone Muted'}
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setCameraOn(!cameraOn)}
            className={`p-2 rounded-full border transition-all ${
              cameraOn
                ? 'bg-[#303134] border-[#4a4e51] text-gray-200 hover:text-white'
                : 'bg-red-600 border-red-500 text-white'
            }`}
            title={cameraOn ? 'Camera Active' : 'Camera Off'}
          >
            {cameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Center Viewport */}
      <div className="flex flex-col items-center justify-center my-auto py-6">
        {cameraOn ? (
          <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-tr from-emerald-700 via-teal-800 to-slate-900 border-4 border-emerald-500/80 flex items-center justify-center shadow-lg relative">
            <User className="w-14 h-14 text-emerald-200" />
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#303134]" />
          </div>
        ) : (
          <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-[#202124] border-2 border-dashed border-[#4a4e51] flex items-center justify-center text-gray-400">
            <CameraOff className="w-10 h-10" />
          </div>
        )}

        <div className="mt-4 text-center">
          <h3 className="text-sm font-bold text-white">{studentName || 'Intern Student'}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{studentEmail || 'mithunhari663@gmail.com'}</p>
        </div>
      </div>

      {/* Bottom Document Status Card */}
      <div className="bg-[#202124]/90 backdrop-blur-md rounded-xl p-3 border border-[#4a4e51] z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`p-2 rounded-lg border shrink-0 ${
              hasUploadedReport
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                : 'bg-amber-950/60 border-amber-800/80 text-amber-400'
            }`}
          >
            <FileText className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
              {hasUploadedReport ? 'Project Status Report Uploaded' : 'No Report Submitted Yet'}
              {hasUploadedReport && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </div>
            <p className="text-[11px] text-gray-400 truncate">
              {hasUploadedReport ? 'Ready for 4-axis technical analysis' : 'Upload PDF, Doc link, or select sample'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{hasUploadedReport ? 'Change' : 'Upload'}</span>
        </button>
      </div>
    </div>
  );
};
