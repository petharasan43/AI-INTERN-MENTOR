import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System Prompt for Petharasan
const PETHARASAN_SYSTEM_INSTRUCTION = `You are "petharasan", an autonomous AI Senior Engineering Mentor and HR Reviewer conducting a 1-on-1 sprint review with an intern student on Google Meet (initiated via Google Classroom).

Voice & Persona:
- Empathetic, supportive, technically sharp, articulate, and conversational.
- ALWAYS respond directly and uniquely to the user's latest statement, question, or comment.
- NEVER repeat fixed canned phrases or generic templates. React specifically to the technical details mentioned by the student (e.g. React, Express, database schemas, API endpoints, CORS, OAuth, payment gateways, testing, or blockers).
- Keep spoken responses concise and natural (2 to 4 sentences per turn).
- Use natural spoken transitions ("Awesome," "Got it," "Let's take a look," "That makes sense," "Good point").

Workflow Guidance:
Phase 1: Greeting & Document Intake
- Greet the intern warmly. Acknowledge that the call was arranged via Google Classroom.
- Ask them how their sprint went and request their Project Status Report (uploaded PDF, document text, or Google Doc link) in the chat.
- Confirm their email address early (default: petharasan43@gmail.com).

Phase 2: Live Technical Review & Deep Dive
- When a report or technical query is shared, analyze across the 4 technical axes:
  1. System Architecture & Tech Stack (API design, database schemas, framework choices)
  2. Implementation Status vs Milestones
  3. Code Quality, Security & Error Handling
  4. Blockers and Problem-Solving Strategy
- Highlight 2 concrete strengths and 2 actionable improvements dynamically.
- Ask follow-up technical questions ("How did you handle token refresh?", "What database index did you add?", "How does that sound? Do you want to dive deeper into any of those suggestions?").

Phase 3: Automated Email Trigger
- When wrapping up the review, inform the intern that you are generating their structured report and executing the send_student_review_email tool call.

Current User Email context: petharasan43@gmail.com.
`;

// Helper to sanitize Gemini multi-turn contents format
function sanitizeGeminiContents(rawMessages: Array<{ role: string; text: string }>) {
  if (!rawMessages || rawMessages.length === 0) {
    return [{ role: 'user', parts: [{ text: 'Hello Petharasan, I am ready for our 1-on-1 sprint review.' }] }];
  }

  const sanitized: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of rawMessages) {
    const role: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
    const text = (msg.text || '').trim();
    if (!text) continue;

    if (sanitized.length === 0) {
      if (role === 'model') {
        sanitized.push({ role: 'user', parts: [{ text: 'Hello Petharasan, I am joining our Google Meet sprint review.' }] });
        sanitized.push({ role: 'model', parts: [{ text }] });
      } else {
        sanitized.push({ role: 'user', parts: [{ text }] });
      }
    } else {
      const lastRole = sanitized[sanitized.length - 1].role;
      if (lastRole === role) {
        sanitized[sanitized.length - 1].parts[0].text += `\n${text}`;
      } else {
        sanitized.push({ role, parts: [{ text }] });
      }
    }
  }

  if (sanitized.length === 0) {
    return [{ role: 'user', parts: [{ text: 'Hello Petharasan, ready for our 1-on-1 sprint review.' }] }];
  }

  return sanitized;
}

// Resilient helper to handle transient 503 model spikes with 5-model fallback chain & graceful local response
async function generateWithModelFallback(contents: any, config: any) {
  const models = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
  ];
  let lastErr = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastErr = err;
      console.warn(`Model ${model} notice (${err?.status || err?.message}), trying next model...`);
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.warn('Gemini API experiencing high demand spike. Returning local mentor fallback response.');
  return {
    text: "Awesome! Got it. Thanks for sharing that with me. Let's take a look at your sprint progress and status report! How did your core features and database setup go this week?"
  };
}

// Endpoint 1: Meeting Chat with Petharasan
app.post('/api/meet/chat', async (req, res) => {
  try {
    const { messages, reportText, studentEmail, phase } = req.body;

    const formattedContents = sanitizeGeminiContents(messages || []);

    // Append context to the last user message
    let promptAddition = '';
    if (reportText) {
      promptAddition += `\n[INTERNAL CONTEXT - PROJECT STATUS REPORT PROVIDED BY INTERN]:\n${reportText}\n`;
    }
    if (studentEmail) {
      promptAddition += `\n[STUDENT CONFIRMED EMAIL]: ${studentEmail}\n`;
    }
    if (phase) {
      promptAddition += `\n[CURRENT WORKFLOW PHASE]: ${phase}\n`;
    }

    if (promptAddition && formattedContents.length > 0) {
      const lastMsg = formattedContents[formattedContents.length - 1];
      if (lastMsg.role === 'user') {
        lastMsg.parts[0].text += promptAddition;
      } else {
        formattedContents.push({ role: 'user', parts: [{ text: promptAddition }] });
      }
    }

    const response = await generateWithModelFallback(formattedContents, {
      systemInstruction: PETHARASAN_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    });

    const replyText = response.text?.trim() || "Awesome! I'm doing well, thank you! How did your sprint go this week, and could you share your Project Status Report?";

    res.json({ text: replyText });
  } catch (error: any) {
    console.error('Chat error details:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to generate mentor chat response.' });
  }
});

// Endpoint 2: Gemini TTS Audio Synthesis for Petharasan's voice
app.post('/api/meet/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Zephyr' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text parameter is required for speech synthesis.' });
    }

    // Truncate to reasonable spoken length if very long
    const cleanText = text.replace(/[*_#`]/g, '').slice(0, 800);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Empathetic, clear, professional software engineering mentor',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      res.json({ audio: base64Audio, mimeType: 'audio/wav' });
    } else {
      res.json({ fallbackToWebSpeech: true, text: cleanText });
    }
  } catch (error: any) {
    console.warn('TTS model quota or API notice, using Web Speech Synthesis fallback:', error?.message || error);
    // Return fallbackToWebSpeech so the frontend automatically speaks aloud using Web Speech API with zero quota limits!
    const cleanText = (req.body?.text || '').replace(/[*_#`]/g, '').slice(0, 800);
    res.json({ fallbackToWebSpeech: true, text: cleanText, isQuotaExceeded: true });
  }
});

// Endpoint 3: Deep 4-Axis Analysis of Project Status Report
app.post('/api/meet/analyze', async (req, res) => {
  try {
    const { reportText, studentName = 'Intern Student', studentEmail = 'petharasan43@gmail.com' } = req.body;

    if (!reportText) {
      return res.status(400).json({ error: 'Project status report content is required.' });
    }

    const prompt = `Analyze the following Project Status Report for student intern "${studentName}" (${studentEmail}) across the 4 required technical axes:
1. System Architecture & Tech Stack (API design, database schemas, framework choices)
2. Implementation Status vs. Milestones (what is deployed vs work-in-progress)
3. Code Quality, Security & Error Handling (auth, env configs, edge cases)
4. Blockers and Problem-Solving Strategy

Format your response strictly as valid JSON matching this structure:
{
  "studentName": "${studentName}",
  "studentEmail": "${studentEmail}",
  "projectTitle": "Extracted or inferred project title",
  "overallGrade": "A- / High Pass",
  "axes": {
    "architecture": "Summary statement for System Architecture",
    "milestones": "Summary statement for Milestones vs Implementation",
    "codeQuality": "Summary statement for Code Quality & Security",
    "blockers": "Summary statement for Blockers & Problem-Solving Strategy"
  },
  "scores": {
    "architecture": 88,
    "milestones": 82,
    "codeQuality": 90,
    "blockers": 85
  },
  "strengths": [
    "Concrete strength #1 with specific engineering rationale",
    "Concrete strength #2 with specific engineering rationale"
  ],
  "improvements": [
    "Actionable improvement #1 with concrete solution proposal",
    "Actionable improvement #2 with concrete solution proposal"
  ],
  "mentorSpokenSummary": "2 to 3 sentences summary that Petharasan will speak aloud during the meeting."
}

Report Content:
${reportText}
`;

    const response = await generateWithModelFallback([{ role: 'user', parts: [{ text: prompt }] }], {
      responseMimeType: 'application/json',
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

// Endpoint 4: Python Tool Execution - send_student_review_email
app.post('/api/tools/send_student_review_email', async (req, res) => {
  try {
    const payload = req.body;

    const inputData = {
      student_name: payload.studentName || 'Intern Student',
      student_email: payload.studentEmail || 'petharasan43@gmail.com',
      project_title: payload.projectTitle || 'Sprint Status Report',
      mentor_name: 'Petharasan (AI Senior Engineering Mentor & HR Reviewer)',
      strengths: payload.strengths || [
        'Robust API architecture with clean controller-service separation',
        'Strong environment variable validation and error handling'
      ],
      improvements: payload.improvements || [
        'Implement rate limiting middleware on exposed auth endpoints',
        'Add indexed columns for heavy database relational joins'
      ],
      axes: payload.axes || {
        architecture: 'Solid microservice layout with Express and React standard routing.',
        milestones: 'Completed 85% of core user stories within sprint timeline.',
        code_quality: 'Clean TypeScript contracts with strict mode enabled.',
        blockers: 'Resolved OAuth callback state mismatch through standard PKCE strategy.'
      }
    };

    const pythonScript = path.resolve('server/send_email.py');
    const inputJson = JSON.stringify(inputData);

    // Run Python process passing JSON via stdin
    const child = exec(`python3 "${pythonScript}"`, (err, stdout, stderr) => {
      if (err) {
        console.error('Python execution error:', err, stderr);
        return res.status(500).json({
          success: false,
          error: stderr || err.message,
          message: 'Failed to execute Python email dispatcher.'
        });
      }

      try {
        const pyResult = JSON.parse(stdout);
        res.json(pyResult);
      } catch (parseErr) {
        res.json({
          success: true,
          rawOutput: stdout,
          message: `Email dispatched to ${inputData.student_email} via Python script.`
        });
      }
    });

    child.stdin?.write(inputJson);
    child.stdin?.end();

  } catch (error: any) {
    console.error('Email trigger error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint 5: Fetch Email Dispatch Logs
app.get('/api/tools/email_logs', (req, res) => {
  try {
    const logFile = path.resolve('server/logs/email_dispatches.json');
    if (fs.existsSync(logFile)) {
      const logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      res.json(logs);
    } else {
      res.json([]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 6: Create real Google Meet space using Google Meet API
app.post('/api/meet/create-space', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const googleRes = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (googleRes.ok) {
        const meetData = await googleRes.json();
        return res.json({
          success: true,
          meetUri: meetData.meetingUri || (meetData.name ? `https://meet.google.com/${meetData.name.split('/')[1]}` : 'https://meet.google.com/qaz-hr-sprint'),
          raw: meetData,
        });
      }
    }

    const randomCode = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
    res.json({
      success: true,
      meetUri: `https://meet.google.com/${randomCode}`,
      isGeneratedLink: true,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Middleware for Development
async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve('dist')));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
