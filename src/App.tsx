import React, { useState, useEffect, useRef } from 'react';
import { MeetHeader } from './components/MeetHeader';
import { MentorVideoCard } from './components/MentorVideoCard';
import { InternVideoCard } from './components/InternVideoCard';
import { MeetChatPanel, ChatMessage } from './components/MeetChatPanel';
import { TechnicalAxesView, AnalysisData } from './components/TechnicalAxesView';
import { EmailTriggerPanel } from './components/EmailTriggerPanel';
import { MeetFooterControls } from './components/MeetFooterControls';
import { GoogleMeetLinkBridge } from './components/GoogleMeetLinkBridge';
import { SampleReport, SAMPLE_REPORTS } from './data/sampleReports';

export default function App() {
  const [activeTab, setActiveTab] = useState<'stage' | 'assessment' | 'email'>('stage');
  const [studentName, setStudentName] = useState<string>('Intern Student');
  const [studentEmail, setStudentEmail] = useState<string>('petharasan43@gmail.com');
  const [currentReport, setCurrentReport] = useState<SampleReport | null>(SAMPLE_REPORTS[0]);
  const [reportText, setReportText] = useState<string>(SAMPLE_REPORTS[0].content);

  // Real Google Meet Connection Link State
  const [realMeetUrl, setRealMeetUrl] = useState<string>('https://meet.google.com/qaz-hr-sprint');
  const [isConnectedToMeet, setIsConnectedToMeet] = useState<boolean>(true);

  // Audio & Video State
  const [micOn, setMicOn] = useState<boolean>(true);
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [handRaised, setHandRaised] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [latestSpokenText, setLatestSpokenText] = useState<string>(
    "Awesome! Welcome to our 1-on-1 Google Classroom sprint review. How did your sprint go, and could you share your status report or confirm your email address?"
  );

  // Throttled Speech Recognition State
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [liveSpeechTranscript, setLiveSpeechTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);

  // Chat & Workflow Phase State
  const [workflowPhase, setWorkflowPhase] = useState<'phase1' | 'phase2' | 'phase3'>('phase1');
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'mentor',
      senderName: 'Petharasan (AI Senior Mentor)',
      text: "Awesome! Welcome to our 1-on-1 sprint review! I see this call was arranged via Google Classroom. How did your sprint go, and could you share your Project Status Report in the chat? Also, please confirm if your email address is petharasan43@gmail.com.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Analysis & Email Trigger State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailResult, setEmailResult] = useState<any>(null);
  const [emailDispatched, setEmailDispatched] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Safe Throttled Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && micOn && isVoiceListening) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Using single-sentence mode prevents runaway loops
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              const finalPhrase = event.results[i][0].transcript.trim();
              if (finalPhrase && finalPhrase.length > 2) {
                setLiveSpeechTranscript('');
                handleSendMessage(finalPhrase);
              }
            } else {
              setLiveSpeechTranscript(currentTranscript);
            }
          }
        };

        // Suppress errors without console warnings
        recognition.onerror = () => {
          setLiveSpeechTranscript('');
        };

        recognition.onend = () => {
          if (micOn && isVoiceListening) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = setTimeout(() => {
              try { recognition.start(); } catch (e) {}
            }, 1000); // 1-second backoff prevents high-frequency loops
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {}
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    }

    return () => {
      clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [micOn, isVoiceListening]);

  // Audio Playback Helper using Web Audio / WAV decoding
  const playBase64Audio = async (base64Data: string) => {
    try {
      if (!audioEnabled) return;
      setIsPlayingAudio(true);
      setIsSpeaking(true);

      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const buffer = await audioCtx.decodeAudioData(bytes.buffer);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      source.onended = () => {
        setIsPlayingAudio(false);
        setIsSpeaking(false);
      };

      source.start(0);
    } catch (err) {
      console.warn('Audio playback fallback:', err);
      setIsPlayingAudio(false);
      setIsSpeaking(false);
    }
  };

  // Web Speech Synthesis Fallback (Natural Spoken English Voice)
  const speakViaWebSpeechSynthesis = (text: string) => {
    try {
      if (!audioEnabled) return;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ''));
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Alex') || v.name.includes('en-US'))
        ) || voices.find((v) => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          setIsPlayingAudio(true);
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsPlayingAudio(false);
          setIsSpeaking(false);
        };

        utterance.onerror = () => {
          setIsPlayingAudio(false);
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
        setIsSpeaking(false);
      }
    } catch (e) {
      setIsPlayingAudio(false);
      setIsSpeaking(false);
    }
  };

  // Generate and Play Gemini TTS Audio with Web Speech Fallback
  const playMithunVoice = async (text: string) => {
    try {
      setIsGeneratingAudio(true);
      setLatestSpokenText(text);

      const res = await fetch('/api/meet/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Zephyr' }),
      });

      const data = await res.json();
      setIsGeneratingAudio(false);

      if (data.audio) {
        await playBase64Audio(data.audio);
      } else {
        speakViaWebSpeechSynthesis(text);
      }
    } catch (err) {
      setIsGeneratingAudio(false);
      speakViaWebSpeechSynthesis(text);
    }
  };

  // Create real Google Meet Space via Google Meet API
  const handleCreateNewMeetSpace = async (): Promise<string> => {
    try {
      const res = await fetch('/api/meet/create-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      return data.meetUri || 'https://meet.google.com/qaz-hr-sprint';
    } catch (err) {
      return 'https://meet.google.com/qaz-hr-sprint';
    }
  };

  // Perform Phase 2 Analysis
  const runReportAnalysis = async (reportContent: string) => {
    try {
      setIsAnalyzing(true);
      const res = await fetch('/api/meet/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText: reportContent,
          studentName,
          studentEmail,
        }),
      });

      const data: AnalysisData = await res.json();
      setIsAnalyzing(false);
      setAnalysis(data);
      setWorkflowPhase('phase2');

      // Add Mithun's Phase 2 verbal review turn to chat
      const mentorSpokenText = `Got it! Let's take a look at your status report. Two concrete strengths: ${data.strengths[0]} and ${data.strengths[1]}. Two actionable improvements: ${data.improvements[0]} and ${data.improvements[1]}. How does that sound? Do you want to dive deeper into any of those suggestions?`;

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          sender: 'mentor',
          senderName: 'Petharasan (AI Senior Mentor)',
          text: mentorSpokenText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (audioEnabled) {
        playMithunVoice(mentorSpokenText);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
    }
  };

  // Send Chat Message to Mithun
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'student',
      senderName: studentName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoadingChat(true);

    try {
      const formattedHistory = newHistory.map((m) => ({
        role: m.sender === 'student' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/meet/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedHistory,
          reportText,
          studentEmail,
          phase: workflowPhase,
        }),
      });

      const data = await res.json();
      setIsLoadingChat(false);

      const replyText = data.text || "Awesome! Thanks for sharing that details.";

      const mentorMsg: ChatMessage = {
        id: `msg_m_${Date.now()}`,
        sender: 'mentor',
        senderName: 'Petharasan (AI Senior Mentor)',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, mentorMsg]);

      if (audioEnabled) {
        playMithunVoice(replyText);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setIsLoadingChat(false);
    }
  };

  // Select Built-in Sample Report
  const handleSelectSampleReport = (report: SampleReport) => {
    setCurrentReport(report);
    setReportText(report.content);
    setStudentName(report.author);
    if (report.email) setStudentEmail(report.email);

    const userSubmitMsg: ChatMessage = {
      id: `msg_rep_${Date.now()}`,
      sender: 'student',
      senderName: report.author,
      text: `Uploaded Project Status Report: "${report.title}". Email address confirmed as: ${report.email}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userSubmitMsg]);
    runReportAnalysis(report.content);
  };

  // Upload Custom Text or Link
  const handleUploadCustomText = (title: string, text: string) => {
    const customRep: SampleReport = {
      id: `custom_${Date.now()}`,
      title,
      category: 'Custom Upload',
      author: studentName,
      email: studentEmail,
      summary: title,
      content: text,
    };

    setCurrentReport(customRep);
    setReportText(text);

    const userSubmitMsg: ChatMessage = {
      id: `msg_custom_${Date.now()}`,
      sender: 'student',
      senderName: studentName,
      text: `Uploaded Project Status Report: "${title}". Email confirmed: ${studentEmail}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userSubmitMsg]);
    runReportAnalysis(text);
  };

  // Trigger Phase 3 Python Email Tool
  const handleSendEmailReport = async () => {
    try {
      setIsSendingEmail(true);
      setActiveTab('email');

      const payload = {
        studentName,
        studentEmail,
        projectTitle: currentReport?.title || 'Sprint Status Report',
        axes: analysis?.axes || {
          architecture: 'Solid REST API structure with React frontend.',
          milestones: '85% sprint user stories deployed.',
          codeQuality: 'Strict TypeScript typing and input validation.',
          blockers: 'Resolved CORS and DB foreign key index bottlenecks.',
        },
        strengths: analysis?.strengths || [
          'Modular controller-service API separation',
          'Proactive environment variable validation and error handling',
        ],
        improvements: analysis?.improvements || [
          'Implement rate limiting middleware on auth endpoints',
          'Add indexed columns for heavy database joins',
        ],
      };

      const res = await fetch('/api/tools/send_student_review_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSendingEmail(false);
      setEmailResult(data);
      setEmailDispatched(true);
      setWorkflowPhase('phase3');

      const wrapUpSpokenText = `Awesome! That makes sense. I have generated your structured review report and executed the send_student_review_email tool call. The full report has been dispatched to ${studentEmail}. Great job on this sprint!`;

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_final_${Date.now()}`,
          sender: 'mentor',
          senderName: 'Petharasan (AI Senior Mentor)',
          text: wrapUpSpokenText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (audioEnabled) {
        playMithunVoice(wrapUpSpokenText);
      }

      return data;
    } catch (err) {
      console.error('Email trigger error:', err);
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#202124] text-gray-100 flex flex-col font-sans antialiased select-none">
      {/* Top Header Bar */}
      <MeetHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studentEmail={studentEmail}
        isAnalyzing={isAnalyzing}
        hasAnalysis={!!analysis}
        emailDispatched={emailDispatched}
      />

      {/* Voice Mode Toggle Bar */}
      <div className="bg-[#28292c] px-4 py-2 border-b border-[#3c4043] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isVoiceListening ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className="font-semibold text-white">
            {isVoiceListening ? 'Continuous Microphone Listening: Active' : 'Microphone Auto-Listen: Off (Click to Enable)'}
          </span>
          {liveSpeechTranscript && (
            <span className="text-emerald-300 font-mono italic truncate max-w-md">
              "{liveSpeechTranscript}"
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoiceListening(!isVoiceListening)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isVoiceListening
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                : 'bg-[#303134] hover:bg-[#3c4043] border border-[#4a4e51] text-gray-300'
            }`}
          >
            {isVoiceListening ? 'Mic Auto-Listen: ON' : 'Turn Mic Auto-Listen ON'}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <main className="flex-1 p-3 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {activeTab === 'stage' && (
          <>
            {/* Left Column: Real Google Meet Link Bridge & Video Stage */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
              {/* Real Google Meet Connection Bridge */}
              <GoogleMeetLinkBridge
                realMeetUrl={realMeetUrl}
                setRealMeetUrl={setRealMeetUrl}
                isConnectedToMeet={isConnectedToMeet}
                setIsConnectedToMeet={setIsConnectedToMeet}
                onCreateNewMeetSpace={handleCreateNewMeetSpace}
                onTriggerMithunSpeech={(text) => playMithunVoice(text)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mithun Mentor Video Card */}
                <MentorVideoCard
                  latestSpokenText={latestSpokenText}
                  isSpeaking={isSpeaking}
                  isPlayingAudio={isPlayingAudio}
                  audioEnabled={audioEnabled}
                  setAudioEnabled={setAudioEnabled}
                  onReplaySpeech={() => playMithunVoice(latestSpokenText)}
                />

                {/* Intern Video Card */}
                <InternVideoCard
                  studentName={studentName}
                  studentEmail={studentEmail}
                  setStudentEmail={setStudentEmail}
                  micOn={micOn}
                  setMicOn={setMicOn}
                  cameraOn={cameraOn}
                  setCameraOn={setCameraOn}
                  hasUploadedReport={!!currentReport}
                  onOpenUploadModal={() => {
                    const chatEl = document.getElementById('chat-panel-container');
                    if (chatEl) chatEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </div>

              {/* Quick Assessment Metrics Bar */}
              {analysis && (
                <div className="bg-[#28292c] p-4 rounded-2xl border border-[#4a4e51] flex flex-wrap items-center justify-between gap-3 shadow-lg">
                  <div>
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                      Live Assessment Ready
                    </span>
                    <span className="text-xs text-white font-semibold">
                      {analysis.projectTitle} · Overall Grade: {analysis.overallGrade}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('assessment')}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      View 4-Axis Analysis
                    </button>
                    <button
                      onClick={handleSendEmailReport}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Dispatch Email
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Google Meet Chat & Document Intake */}
            <div id="chat-panel-container" className="lg:col-span-5 xl:col-span-4 h-[calc(100vh-140px)] min-h-[500px]">
              <MeetChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoadingChat}
                studentEmail={studentEmail}
                setStudentEmail={setStudentEmail}
                onSelectSampleReport={handleSelectSampleReport}
                onUploadCustomText={handleUploadCustomText}
                currentReportTitle={currentReport?.title}
                onPlayMessageAudio={(text) => playMithunVoice(text)}
                isGeneratingAudio={isGeneratingAudio}
              />
            </div>
          </>
        )}

        {/* Tab 2: 4-Axis Technical Assessment */}
        {activeTab === 'assessment' && (
          <div className="lg:col-span-12">
            <TechnicalAxesView
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              onRunAnalysis={() => runReportAnalysis(reportText)}
              onPlaySpeech={(text) => playMithunVoice(text)}
              onTriggerEmailTab={handleSendEmailReport}
            />
          </div>
        )}

        {/* Tab 3: Python Email Dispatcher & Execution Log */}
        {activeTab === 'email' && (
          <div className="lg:col-span-12">
            <EmailTriggerPanel
              analysis={analysis}
              studentEmail={studentEmail}
              onSendEmail={handleSendEmailReport}
              isSendingEmail={isSendingEmail}
              emailResult={emailResult}
            />
          </div>
        )}
      </main>

      {/* Bottom Google Meet Controls Bar */}
      <MeetFooterControls
        micOn={micOn}
        setMicOn={setMicOn}
        cameraOn={cameraOn}
        setCameraOn={setCameraOn}
        handRaised={handRaised}
        setHandRaised={setHandRaised}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUploadModal={() => setActiveTab('stage')}
        onTriggerEmail={handleSendEmailReport}
        hasAnalysis={!!analysis}
        emailDispatched={emailDispatched}
      />
    </div>
  );
}
