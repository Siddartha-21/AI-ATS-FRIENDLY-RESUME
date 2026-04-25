# System Blueprint: AI-Powered ATS-Friendly Resume Analyzer & Generator

## 1. System Architecture
To ensure scalability, high performance, and seamless AI integration, we will use a decoupled microservices-inspired architecture.

*   **Frontend (Client):** Next.js (React) for Server-Side Rendering (SSR), optimized SEO, and fast initial page loads.
*   **Backend (API & Core Logic):** Python with FastAPI. Python is native to AI/NLP ecosystems, and FastAPI provides high-speed, asynchronous request handling.
*   **Database:** PostgreSQL (for structured data: users, resume schemas, history) paired with Redis (for rate limiting, caching active sessions, and queue management).
*   **Storage:** AWS S3 (or Cloudflare R2 for cheaper egress) to store uploaded original resumes and exported files securely.
*   **AI/LLM Layer:** OpenAI API (GPT-4o for complex rewriting, GPT-4o-mini for fast entity extraction).
*   **Authentication:** Clerk or Supabase Auth (Email OTP and Magic Links).

---

## 2. User Flow
The flow is designed to be frictionless and progressive.

1.  **Authentication:** User enters email -> receives OTP/Magic Link -> Authenticated. No passwords.
2.  **Job Context Setup:** User pastes the target Job Description (JD) text or provides a URL.
3.  **Resume Ingestion (Two Paths):**
    *   *Path A (Upload):* User uploads an existing resume (PDF/DOCX). System extracts text.
    *   *Path B (AI Builder):* User answers progressive, structured questions via a chat-like UI to generate a base resume from scratch.
4.  **Analysis Phase:** System parses data, processes it through the AI layer, and returns an "ATS Compatibility Score" in seconds.
5.  **Review & Optimization Phase:** User reviews detected skill gaps and keyword matches. User clicks "Auto-Optimize". The AI rewrites bullet points to contextually integrate missing keywords without lying.
6.  **Preview & Export:** User previews the final generated ATS-compliant layout and exports it in their preferred format.

---

## 3. ATS Analysis Logic
ATS systems typically use primitive parsing. Our analysis must mimic and beat them.

*   **Parser Module:** Use `pdfplumber` or `PyMuPDF` (Python) to safely extract text and layout metadata. If the PDF is an image/scanned, fallback to OCR (`pytesseract`).
*   **Keyword Extraction:** Use NLP (spaCy) + LLM to extract Hard Skills, Soft Skills, and Action Verbs from the JD.
*   **Matching Algorithm:** Compute Semantic Similarity and Exact Keyword Match rate. Exact matches are crucial as older ATS rely strictly on string matching.
*   **Skill Gap Detection:** Diff the JD skills against the Resume skills. Flag missing, partial, and matched skills.
*   **Formatting Checks:** Rule-based validation to ensure no tables, columns, or complex graphics are present, ensuring classic ATS horizontal read-flow compatibility.

---

## 4. Dynamic Resume Generation
To ensure the output is exactly what an ATS wants:

*   **Data Normalization:** All inputs (upload or chat) are normalized into a strict JSON schema (`ResumeSchema`).
*   **Template Engine:** Use Jinja2 to map the JSON schema to semantic HTML structured with simple `<h1>`, `<h2>`, and bullet points. Standard fonts (Arial, Times New Roman, Calibri) are strictly enforced.

---

## 5. Export Engine (PDF, DOCX, JPG)
*   **PDF Export:** Convert the semantic HTML to PDF using Headless Chromium (via Playwright or WeasyPrint). This ensures text is fully selectable and structured.
*   **Word (.DOCX) Export:** Use `python-docx` to programmatically build the document from the JSON schema, applying native Word styles for ATS readability.
*   **JPG Export:** Use `pdf2image` to convert the generated PDF into a high-res image (useful for sharing or specific localized platforms).

---

## 6. Performance & Error Handling
*   **Asynchronous Processing:** Heavy tasks (PDF parsing, Image OCR) are sent to a background worker queue (Celery + Redis). The frontend polls or uses Server-Sent Events (SSE) for updates.
*   **Streaming Responses:** LLM generation (like rewriting bullet points) is streamed directly to the UI to reduce perceived latency.
*   **Error Boundaries:** Graceful fallbacks for hallucinated JSON from LLMs using `instructor` or Outlines to enforce strict schema outputs.
*   **Rate Limiting:** IP and User-level rate limits on AI generation routes to prevent API abuse.

---

## 7. Recommended Tech Stack Summary
*   **Frontend:** Next.js, React, Tailwind CSS, Zustand (state), Framer Motion (micro-interactions).
*   **Backend:** Python 3.11+, FastAPI, Celery, SQLAlchemy.
*   **AI / NLP:** OpenAI API, LangChain/LlamaIndex (for chunking), spaCy.
*   **Database:** PostgreSQL, Redis.
*   **Infrastructure:** Render/Railway (Backend apps), Vercel (Frontend), AWS S3.

---

## 8. Basic UI/UX Wireframe Description
*   **View Style:** 3-Pane Split View Workspace.
*   **Left Pane (Input):** Job Description text area and File Upload / Chat block.
*   **Middle Pane (Insights):** A large circular ATS Score out of 100. Below it, tabbed sections for "Missing Keywords" (red chips), "Found Keywords" (green chips), and "Format Fixes".
*   **Right Pane (Preview):** Live WYSIWYG preview of the document. A floating action bar at the top right contains `[Download PDF]`, `[Download DOCX]`, `[Export JPG]`.

---

## 9. Sample API Endpoints & Data Flow

### POST `/api/v1/auth/verify`
*   **Payload:** `{ "email": "user@example.com", "code": "123456" }`
*   **Response:** JWT token + User metadata.

### POST `/api/v1/analyze`
*   **Payload (FormData):** `resume_file` (Binary), `job_description` (String).
*   **Flow:** Extracts text -> Sends to LLM for extraction -> Diffs against JD -> Saves to DB.
*   **Response:** `{ "ats_score": 68, "matched_skills": [...], "missing_skills": [...], "format_errors": [...] }`

### POST `/api/v1/optimize`
*   **Payload:** `{ "missing_skills": ["Docker", "Kubernetes"], "target_bullet_ids": ["exp_1_b1"] }`
*   **Flow:** Streams LLM completion rewriting the bullet point to include the skills naturally.
*   **Response (Streamed):** Text chunks of the optimized bullet point.

### GET `/api/v1/export/{resume_id}?format=pdf`
*   **Flow:** Retrieves JSON from DB -> Renders to HTML -> Converts to requested format -> Streams binary to client.
*   **Response:** `File Download (application/pdf)`
