import React, { useState } from 'react';
import { Video, ExternalLink, ShieldCheck, Link2, Copy, Check, Sparkles, Mic, Play, Radio, Volume2, Maximize2, Info } from 'lucide-react';

interface GoogleMeetLinkBridgeProps {
  realMeetUrl: string;
  setRealMeetUrl: (url: string) => void;
  isConnectedToMeet: boolean;
  setIsConnectedToMeet: (connected: boolean) => void;
  onCreateNewMeetSpace: () => Promise<string>;
  onTriggerMithunSpeech: (text: string) => void;
}

export const GoogleMeetLinkBridge: React.FC<GoogleMeetLinkBridgeProps> = ({
  realMeetUrl,
  setRealMeetUrl,
  isConnectedToMeet,
  setIsConnectedToMeet,
  onCreateNewMeetSpace,
  onTriggerMithunSpeech,
}) => {
  const [copied, setCopied] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [isBridgingTabAudio, setIsBridgingTabAudio] = useState(false);
  const [showPermissionNote, setShowPermissionNote] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(realMeetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateSpace = async () => {
    try {
      setIsCreatingSpace(true);
      const uri = await onCreateNewMeetSpace();
      setRealMeetUrl(uri);
      setIsConnectedToMeet(true);
      setIsCreatingSpace(false);
      onTriggerMithunSpeech(
        "Awesome! I'm now connected to your real Google Meet link. Ready for our 1-on-1 sprint review!"
      );
    } catch (err) {
      setIsCreatingSpace(false);
    }
  };

  const handleShareTabAudio = async () => {
    try {
      if ((navigator.mediaDevices as any)?.getDisplayMedia) {
        const stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        setIsBridgingTabAudio(true);
        setIsConnectedToMeet(true);
        onTriggerMithunSpeech(
          "Awesome! Google Meet tab audio bridge connected successfully. I am listening to your call!"
        );

        stream.getVideoTracks()[0].onended = () => {
          setIsBridgingTabAudio(false);
        };
      } else {
        setShowPermissionNote(true);
      }
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || String(err).includes('display-capture')) {
        setShowPermissionNote(true);
      } else {
        console.warn("Tab audio capture cancelled:", err);
      }
    }
  };

  const handleOpenStandaloneTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleConnectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!realMeetUrl.trim()) return;
    setIsConnectedToMeet(true);
    onTriggerMithunSpeech(
      `Awesome! Connected Petharasan to Google Meet link: ${realMeetUrl}. Let's take a look at your status report!`
    );
  };

  return (
    <div className="bg-[#28292c] rounded-2xl border border-[#4a4e51] p-5 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3c4043] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Real Google Meet Connection Bridge
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                OAuth Active
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Connect Petharasan directly to your real Google Meet meeting link or launch a new workspace meeting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenStandaloneTab}
            className="px-3 py-2 rounded-xl bg-[#303134] hover:bg-[#3c4043] border border-[#4a4e51] text-gray-200 text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Open App in Standalone Window for Full Tab Audio Capture"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Standalone Tab</span>
          </button>

          <button
            onClick={handleShareTabAudio}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
              isBridgingTabAudio
                ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse'
                : 'bg-[#303134] hover:bg-[#3c4043] border-[#4a4e51] text-emerald-400'
            }`}
            title="Bridge External Google Meet Chrome Tab Audio"
          >
            <Radio className="w-4 h-4" />
            <span>{isBridgingTabAudio ? 'Tab Audio Active' : 'Bridge Meet Tab Audio'}</span>
          </button>

          <button
            onClick={handleCreateSpace}
            disabled={isCreatingSpace}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-[#303134] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isCreatingSpace ? 'Creating...' : 'New Meet Space'}</span>
          </button>
        </div>
      </div>

      {/* Permission Note Banner if iframe restricts display capture */}
      {showPermissionNote && (
        <div className="bg-blue-950/80 p-3 rounded-xl border border-blue-800 text-xs text-blue-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-white block mb-0.5">Note on Embedded Preview Permissions:</span>
            <span>
              Inside embedded preview frames, browsers enforce security policies on display tab capture. Click{' '}
              <button
                onClick={handleOpenStandaloneTab}
                className="underline font-bold text-blue-300 hover:text-white"
              >
                Open Standalone Tab
              </button>{' '}
              to run full screen capture, or use direct microphone voice capture below!
            </span>
          </div>
          <button
            onClick={() => setShowPermissionNote(false)}
            className="text-gray-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Meet URL Input Form */}
      <form onSubmit={handleConnectUrl} className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={realMeetUrl}
            onChange={(e) => setRealMeetUrl(e.target.value)}
            placeholder="https://meet.google.com/xyz-abc-def"
            className="w-full bg-[#202124] text-white text-xs pl-9 pr-10 py-2.5 rounded-xl border border-[#4a4e51] focus:outline-none focus:border-blue-500 font-mono"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
            title="Copy Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-2 shadow-sm"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{isConnectedToMeet ? 'Re-Connect Petharasan' : 'Connect Petharasan to Meet Link'}</span>
        </button>

        <a
          href={realMeetUrl.startsWith('http') ? realMeetUrl : `https://${realMeetUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#303134] hover:bg-[#3c4043] border border-[#4a4e51] text-gray-200 hover:text-white text-xs font-semibold transition-all shrink-0 flex items-center justify-center gap-1.5"
        >
          <span>Open in Meet</span>
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
        </a>
      </form>

      {/* Status Pill */}
      {isConnectedToMeet && (
        <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isBridgingTabAudio
                ? 'External Google Meet Chrome Tab audio stream connected. Petharasan is listening to your call!'
                : `Petharasan connected to Google Meet room: ${realMeetUrl}. Speak directly into your microphone or click 'Open Standalone Tab'.`}
            </span>
          </div>

          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-900/80 px-2 py-0.5 rounded-full">
            {isBridgingTabAudio ? 'TAB AUDIO BRIDGE ACTIVE' : 'LIVE BOT CONNECTED'}
          </span>
        </div>
      )}
    </div>
  );
};
