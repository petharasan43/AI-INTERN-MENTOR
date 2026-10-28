export interface SampleReport {
  id: string;
  title: string;
  category: string;
  author: string;
  email: string;
  content: string;
  summary: string;
}

export const SAMPLE_REPORTS: SampleReport[] = [
  {
    id: 'ecommerce-microservices',
    title: 'Sprint 3: Microservices & E-Commerce Payment Gateway',
    category: 'Full-Stack Web',
    author: 'Alex Rivera',
    email: 'petharasan43@gmail.com',
    summary: 'Node.js Express REST APIs, JWT Auth, Stripe Integration, and React frontend checkout flow.',
    content: `PROJECT STATUS REPORT - SPRINT 3
Project Name: Apex E-Commerce Platform
Student Intern: Alex Rivera (Email: petharasan43@gmail.com)
Mentor: Petharasan (AI Senior Engineering Mentor & HR Reviewer)
Arranged via: Google Classroom Sprint Review

1. SYSTEM ARCHITECTURE & TECH STACK
- Frontend: React 19 + TypeScript + Tailwind CSS with responsive cart state.
- Backend: Express 4 REST API with modular controllers, middleware validation, and router separation.
- Database & Cache: PostgreSQL for relational data schema, Redis for active session caching.
- External Integrations: Stripe Payments API and Nodemailer receipt service.

2. IMPLEMENTATION STATUS VS MILESTONES
- Deployed Features (85% Completed):
  ✓ User registration, login, and JWT access/refresh token rotation.
  ✓ Product catalog querying with category filters and search.
  ✓ Shopping cart state management & Stripe payment checkout intent session.
- Work-In-Progress (15% Remaining):
  ⚡ Real-time inventory sync webhook handling.
  ⚡ Automated order status email notification dispatch.

3. CODE QUALITY, SECURITY & ERROR HANDLING
- Auth Security: HTTP-only cookies for refresh tokens, Bearer authorization header for API requests.
- Environment Configurations: Strict dotenv sanitization and .env.example template.
- Error Handling: Centralized Express error-handling middleware catches standard HTTP status codes (400, 401, 403, 500).

4. BLOCKERS & PROBLEM-SOLVING STRATEGY
- Blocker Encountered: Heavy DB join query latency on checkout orders endpoint under stress testing.
- Resolution Strategy: Implemented indexed foreign keys on orders.user_id and order_items.product_id, alongside Redis query caching for top products, reducing p95 latency from 420ms to 38ms.
`
  },
  {
    id: 'ai-rag-search',
    title: 'Sprint 3: AI Document Search & RAG Ingestion Pipeline',
    category: 'AI & Knowledge Search',
    author: 'Sam Chen',
    email: 'petharasan43@gmail.com',
    summary: 'Gemini API integration, Vector DB semantic search, document parsing, and RAG UI.',
    content: `PROJECT STATUS REPORT - SPRINT 3
Project Name: IntelliDoc AI Knowledge Base
Student Intern: Sam Chen (Email: petharasan43@gmail.com)
Mentor: Petharasan (AI Senior Engineering Mentor & HR Reviewer)
Arranged via: Google Classroom Sprint Review

1. SYSTEM ARCHITECTURE & TECH STACK
- AI Framework: Gemini API (@google/genai SDK) using gemini-3.8-flash for question answering & embeddings.
- Server Architecture: Express server proxying all Gemini API calls server-side for security.
- Storage: Vector Database for chunked PDF/Markdown embeddings + SQLite metadata index.
- UI: React SPA with streaming markdown renderer and source document highlights.

2. IMPLEMENTATION STATUS VS MILESTONES
- Deployed Features (80% Completed):
  ✓ Document ingestion pipeline parsing PDF/TXT files into 512-token chunks.
  ✓ Vector similarity calculation and top-K context retrieval.
  ✓ Gemini 3.8 Flash RAG answer synthesis with inline citation markers.
- Work-In-Progress (20% Remaining):
  ⚡ Hybrid keyword + vector re-ranking model.
  ⚡ Export chat history report as downloadable PDF.

3. CODE QUALITY, SECURITY & ERROR HANDLING
- Security: Zero Gemini API key exposure to browser; server handles all SDK calls with User-Agent telemetry.
- Typing: Strict TypeScript interfaces for RAG context parts and stream chunks.
- Resilience: Retry wrapper with exponential backoff on rate-limited vector operations.

4. BLOCKERS & PROBLEM-SOLVING STRATEGY
- Blocker: Context length exceeding token limits on long multi-page PDFs.
- Resolution Strategy: Switched to sliding window chunking with 10% overlap and metadata payload filtering.
`
  },
  {
    id: 'iot-telemetry-dashboard',
    title: 'Sprint 3: Real-Time IoT Telemetry & Alerting System',
    category: 'IoT & Telemetry',
    author: 'Jordan Taylor',
    email: 'petharasan43@gmail.com',
    summary: 'WebSocket streaming, InfluxDB time-series, live chart visualization, and automated threshold alerts.',
    content: `PROJECT STATUS REPORT - SPRINT 3
Project Name: SensorPulse Industrial Monitor
Student Intern: Jordan Taylor (Email: petharasan43@gmail.com)
Mentor: Petharasan (AI Senior Engineering Mentor & HR Reviewer)
Arranged via: Google Classroom Sprint Review

1. SYSTEM ARCHITECTURE & TECH STACK
- Ingestion Gateway: Node.js WebSocket server bridging high-frequency sensor payloads.
- Time-Series Storage: InfluxDB for storing 100ms temperature/vibration sample ticks.
- Visualization: React + Recharts with live chart buffer update every second.

2. IMPLEMENTATION STATUS VS MILESTONES
- Deployed Features (90% Completed):
  ✓ WebSockets real-time bidirectional telemetry stream.
  ✓ Anomaly threshold detection triggering visual amber/red alert states.
  ✓ Historical metrics aggregation (1-hour, 24-hour, 7-day downsampling).
- Work-In-Progress (10% Remaining):
  ⚡ Automated SMS/Email alerting when threshold exceeded for >5 minutes.

3. CODE QUALITY, SECURITY & ERROR HANDLING
- Socket Reconnection: Auto-reconnect with jitter backoff on socket drop.
- Memory Optimization: Fixed-length rolling ring buffer on client to prevent DOM memory leak during long runs.

4. BLOCKERS & PROBLEM-SOLVING STRATEGY
- Blocker: UI re-renders causing browser lag at 50 updates per second.
- Resolution Strategy: Throttled state updates to 10Hz using requestAnimationFrame buffer batching.
`
  }
];
