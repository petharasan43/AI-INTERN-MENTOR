import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Upload, CheckCircle, Mail, Sparkles, AlertCircle, Bot, User, Play, Volume2, Mic, MicOff, Square } from 'lucide-react';
import { SampleReport, SAMPLE_REPORTS } from '../data/sampleReports';

export interface ChatMessage {
  id: string;
  sender: 'mentor' | 'student';
  senderName: string;
  text: string;
  timestamp: string;
  hasAudio?: boolean;
}

interface MeetChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  studentEmail: string;
  setStudentEmail: (email: string) => void;
  onSelectSampleReport: (report: SampleReport) => void;
  onUploadCustomText: (title: string, text: string) => void;
  currentReportTitle?: string;
  onPlayMessageAudio: (text: string) => void;
  isGeneratingAudio: boolean;
}

export const MeetChatPanel: React.FC<MeetChatPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
  studentEmail,
  setStudentEmail,
  onSelectSampleReport,
  onUploadCustomText,
  currentReportTitle,
  onPlayMessageAudio,
  isGeneratingAudio,
}) => {
  const [inputText, setInputText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docUrl, setDocUrl] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(studentEmail);

  // Push-to-Talk Voice Recording State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceInterimText, setVoiceInterimText] = useState('');
  const activeRecognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const togglePushToTalk = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!isRecordingVoice) {
      if (!SpeechRecognition) {
        alert('Voice speech recognition is supported in Chrome or Edge browsers. You can also type directly in the chat!');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecordingVoice(true);
          setVoiceInterimText('Listening... Speak into your microphone now...');
        };

        recognition.onresult = (e: any) => {
          let transcript = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
          }
          setVoiceInterimText(transcript || 'Listening...');
          if (e.results[0] && e.results[0].isFinal) {
            const finalText = e.results[0][0].transcript.trim();
            if (finalText) {
              onSendMessage(finalText);
              setVoiceInterimText('');
              setIsRecordingVoice(false);
            }
          }
        };

        recognition.onerror = () => {
          setIsRecordingVoice(false);
          setVoiceInterimText('');
        };

        recognition.onend = () => {
          setIsRecordingVoice(false);
        };

        recognition.start();
        activeRecognitionRef.current = recognition;
      } catch (err) {
        setIsRecordingVoice(false);
      }
    } else {
      if (activeRecognitionRef.current) {
        try { activeRecognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecordingVoice(false);
      setVoiceInterimText('');
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (docUrl.trim()) {
      const simulatedText = `PROJECT STATUS REPORT - SPRINT 3\nGoogle Doc Link: ${docUrl}\nStudent Email: ${studentEmail}\n\n1. SYSTEM ARCHITECTURE & TECH STACK\nFull stack React + Node.js Express server with PostgreSQL DB and OAuth authentication.\n\n2. IMPLEMENTATION STATUS\n80% features deployed including API endpoints, database schemas, and user auth.\n\n3. CODE QUALITY & SECURITY\nInput sanitization, environment config via .env, and JWT token rotation.\n\n4. BLOCKERS & STRATEGY\nResolved CORS misconfiguration and optimized SQL query indices.`;
      onUploadCustomText(docUrl, simulatedText);
      setShowUploadModal(false);
      setDocUrl('');
    } else if (pasteText.trim()) {
      onUploadCustomText(pasteTitle || 'Custom Sprint Status Report', pasteText);
      setShowUploadModal(false);
      setPasteText('');
      setPasteTitle('');
    }
  };

  const handleSaveEmail = () => {
    if (tempEmail.trim()) {
      setStudentEmail(tempEmail.trim());
      setEditingEmail(false);
      onSendMessage(`My email address is confirmed as: ${tempEmail.trim()}`);
    }
  };

  return (
    <div className="bg-[#28292c] rounded-2xl border border-[#4a4e51] flex flex-col h-full overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3c4043] bg-[#202124] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white">In-Call Chat & Intake</h2>
        </div>

        {/* Email Pill */}
        <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-[#303134] px-2.5 py-1 rounded-lg border border-[#4a4e51]">
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          {editingEmail ? (
            <div className="flex items-center gap-1">
              <input
                type="email"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                className="bg-[#202124] text-white px-1.5 py-0.5 text-xs rounded border border-blue-500 outline-none w-36"
              />
              <button
                onClick={handleSaveEmail}
                className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-semibold"
              >
                Save
              </button>
            </div>
          ) : (
            <span
              onClick={() => setEditingEmail(true)}
              className="cursor-pointer hover:text-white font-mono text-[11px] underline decoration-dashed underline-offset-2"
              title="Click to change email address"
            >
              {studentEmail}
            </span>
          )}
        </div>
      </div>

      {/* Quick Intake Selector Banner */}
      <div className="bg-[#202124]/60 px-4 py-2 border-b border-[#3c4043] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium truncate max-w-[200px]">
            {currentReportTitle ? `Active: ${currentReportTitle}` : 'No report submitted yet'}
          </span>
        </div>

        <button
          onClick={() => setShowUploadModal(false)}
          className="text-blue-400 hover:text-blue-300 font-semibold underline text-xs transition-colors"
        >
          Select Report
        </button>
      </div>

      {/* Voice Push-to-Talk Status Indicator */}
      {isRecordingVoice && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 px-4 py-2 flex items-center justify-between text-xs text-emerald-300 animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span className="font-bold">Microphone Active:</span>
            <span className="italic">{voiceInterimText}</span>
          </div>

          <button
            onClick={togglePushToTalk}
            className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"
          >
            <Square className="w-3 h-3" /> Stop
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 px-1">
              {msg.sender === 'mentor' ? (
                <>
                  <Bot className="w-3 h-3 text-blue-400" />
                  <span className="font-semibold text-blue-300">{msg.senderName}</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-emerald-400" />
                  <span className="font-semibold text-emerald-300">{msg.senderName}</span>
                </>
              )}
              <span>·</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'student'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-[#303134] text-gray-100 border border-[#4a4e51] rounded-tl-none shadow-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Play Audio Button for Mentor turns */}
              {msg.sender === 'mentor' && (
                <div className="mt-2 pt-2 border-t border-[#4a4e51] flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Petharasan's Voice Response</span>
                  <button
                    onClick={() => onPlayMessageAudio(msg.text)}
                    disabled={isGeneratingAudio}
                    className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-white bg-[#202124] px-2 py-0.5 rounded border border-[#4a4e51] transition-colors"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Listen</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-[#303134] p-3 rounded-xl border border-[#4a4e51] max-w-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Petharasan is reviewing your input...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Push-To-Talk Mic Button */}
      <form onSubmit={handleSend} className="p-3 bg-[#202124] border-t border-[#3c4043] flex items-center gap-2">
        <button
          type="button"
          onClick={togglePushToTalk}
          className={`p-2.5 rounded-xl border transition-all shrink-0 ${
            isRecordingVoice
              ? 'bg-red-600 border-red-400 text-white animate-pulse'
              : 'bg-[#303134] hover:bg-[#3c4043] border-[#4a4e51] text-emerald-400'
          }`}
          title={isRecordingVoice ? 'Click to Stop Voice Recording' : 'Click & Speak to Petharasan via Mic'}
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isRecordingVoice ? 'Listening to your voice...' : 'Type or click mic to speak to Petharasan...'}
          className="flex-1 bg-[#303134] text-white text-xs px-3 py-2.5 rounded-xl border border-[#4a4e51] focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-[#303134] disabled:text-gray-500 text-white p-2.5 rounded-xl transition-all shadow-sm shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Modal for Report Intake */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#28292c] border border-[#4a4e51] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#3c4043]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Phase 1: Project Status Report Intake
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Built-in Sample Reports (1-click test) */}
            <div className="my-4">
              <label className="text-xs font-semibold text-gray-300 block mb-2">
                Select Pre-populated Sample Sprint Report:
              </label>
              <div className="space-y-2">
                {SAMPLE_REPORTS.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => {
                      onSelectSampleReport(rep);
                      setShowUploadModal(false);
                    }}
                    className="p-3 bg-[#202124] border border-[#4a4e51] hover:border-blue-500 rounded-xl cursor-pointer transition-all hover:bg-[#303134]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{rep.title}</span>
                      <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800">
                        {rep.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{rep.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Link or Text Paste */}
            <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-[#3c4043] space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Google Doc Link / URL:
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full bg-[#202124] text-xs text-white p-2.5 rounded-lg border border-[#4a4e51] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="text-center text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                — OR Paste Document Content —
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Project Title (e.g. Sprint 3 Microservices)"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  className="w-full bg-[#202124] text-xs text-white p-2.5 rounded-lg border border-[#4a4e51] focus:outline-none focus:border-blue-500 mb-2"
                />
                <textarea
                  rows={4}
                  placeholder="Paste report text here with tech stack, milestones, code quality, and blockers..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="w-full bg-[#202124] text-xs text-white p-2.5 rounded-lg border border-[#4a4e51] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#303134] text-gray-300 text-xs font-medium hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Submit for Analysis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
