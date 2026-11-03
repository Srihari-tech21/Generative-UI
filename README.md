# GenUI — AI-Powered Generative Dashboard Platform

> Transform natural language questions into data-backed, interactive dashboards with transparent source attribution and multi-page PDF reports.

---

## 1. Product Overview

GenUI interprets natural language analytical requests, identifies relevant data sources, retrieves verified information across external APIs and user datasets, validates and calculates metrics, and generates interactive, tailored dashboards on the fly.

Unlike static dashboard templates or generic mockup tools, GenUI operates on a **zero-fabrication principle**: every number, time series, and table row is grounded in verified online telemetry or user-provided data, accompanied by clear source attribution, retrieval timestamps, and methodology notes.

### Core Capabilities
- **Online Data Intelligence System**: Connectors for real-time weather & numerical models (Open-Meteo), macroeconomic & demographic statistics (The World Bank), national clean mobility registries (VAHAN / BEE), audited financial disclosures (SEC EDGAR), and in-memory custom CSV/JSON analysis.
- **AI-Powered Schema Generation**: Strict JSON UI Schema engine validated via Zod schemas, mapping declarative blueprints to a fixed, hand-crafted React component library (preventing arbitrary code execution).
- **Prompt-Centered 3D Dark Interface**: Modern deep navy/charcoal UI featuring depth, atmospheric lighting, multiline prompt console, and responsive visual layout.
- **Multi-page PDF Report Export**: Client-side high-resolution A4 PDF document generator complete with headers, footers, pagination, and data limitations.
- **Security-First Architecture**: Server-side credential isolation, strict HTTPS enforcement, SSRF protection with domain allowlisting, and ephemeral in-memory user file parsing.

---

## 2. Architecture & Pipeline

```
User Prompt or Uploaded Dataset (CSV/JSON)
                    │
                    ▼
          Requirement Analysis
     (Entity, Domain, Geography, Time Window)
                    │
                    ▼
         Data-Source Orchestration
     (Selects matching connector from registry)
                    │
                    ▼
         External API Retrieval
   (Open-Meteo / World Bank / VAHAN / SEC / CSV)
  [Protected by SSRF Allowlist & Timeout Guards]
                    │
                    ▼
     Normalization & Metric Calculation
  (Sums, averages, YoY deltas, unit conversions)
                    │
                    ▼
        AI Dashboard Schema Generation
(Claude 3.5 Sonnet or Deterministic Live Compiler)
                    │
                    ▼
           Zod Schema Validation
                    │
                    ▼
         Dynamic Component Rendering
 (KPI Cards, Recharts, Searchable Tables, Sources)
                    │
                    ▼
       Multi-page PDF Document Export
```

---

## 3. Supported Data Connectors

| Connector | Domain | Type | Key Metrics & Data |
|---|---|---|---|
| **Open-Meteo Meteorological Service** | Weather & Climate | Live REST API | 7-day temperature models, precipitation volume, humidity, wind velocity for global coordinates & Indian states (e.g. Andhra Pradesh, Delhi, Mumbai). |
| **The World Bank Open Data Group** | Macroeconomics & Demographics | Live REST API | GDP trajectories, annual growth rates, national population trends, renewable electricity share, CO2 emissions per capita across 200+ countries. |
| **VAHAN & BEE Clean Mobility Registry** | Clean Mobility & Automotive | Verified Registry | Indian EV sales trajectories (2020–2025), 2W vs 3W vs 4W segment splits, state-wise adoption leaderboard, and public charging network density. |
| **SEC Filings & Market Intelligence** | Corporate Performance | Audited Filings | Big-tech comparative financial matrix (Apple, Microsoft, NVIDIA, Alphabet, Amazon, Meta) and startup unit economics (MRR, burn rate, runway, orders). |
| **In-Memory File Processor** | Custom User Data | Ephemeral Stream | In-memory CSV and JSON parser with automated column typing, mathematical aggregations, category grouping, and tabular previews up to 5MB. |

---

## 4. Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + Vanilla CSS animations
- **Visualizations**: Recharts v3 (Responsive Line, Bar, Area, Donut, and Pie charts)
- **Motion & Micro-interactions**: Framer Motion v13
- **Schema Validation**: Zod v4
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React
- **AI Engine**: Anthropic Claude API (Claude 3.5 Sonnet)

---

## 5. Getting Started Locally

### 1. Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm or pnpm

### 2. Clone and Install
```bash
git clone https://github.com/Srihari-tech21/Generative-UI.git
cd Generative-UI
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:
```env
# Optional: Anthropic API Key for AI synthesis
# If omitted, GenUI runs in Direct Data Compilation mode with live online data
ANTHROPIC_API_KEY=your_key_here

# Optional: External Provider Keys
ALPHA_VANTAGE_API_KEY=
OPENWEATHER_API_KEY=
```

> **Note on API Keys:** The Open-Meteo, World Bank, and internal Indian EV / Corporate connectors are active out of the box without requiring API keys. An Anthropic API key enables Claude 3.5 Sonnet dynamic layout planning and qualitative insight generation.

### 4. Run Development Server
```bash
npm run dev
```
<<<<<<< HEAD
Open [http://localhost:3000](http://localhost:3000) in your browser.
=======

Open [https://generative-ui-orpin.vercel.app/](https://generative-ui-orpin.vercel.app/) in your browser.
>>>>>>> 2fedb0a98d9e14d49561f7028b372544ff082796

### 5. Run Verification & Lint Checks
```bash
# Verify TypeScript types
npx tsc --noEmit

# Run ESLint
npm run lint

# Run Live Connector & Pipeline Test Suite
npx tsx src/lib/testPipeline.ts

# Production build check
npm run build
```

---

## 6. Security & Production Principles

1. **Server-Side Key Isolation**: Private keys (`ANTHROPIC_API_KEY`) reside strictly on the server and are never bundled into client JavaScript.
2. **SSRF Guard & Allowlist**: Outgoing HTTP requests from server connectors are restricted to an approved allowlist (`api.open-meteo.com`, `api.worldbank.org`, `www.alphavantage.co`, `query1.finance.yahoo.com`). Requests to localhost, private IP subnets (`10.x`, `192.168.x`, `172.16.x`), and cloud metadata endpoints (`169.254.169.254`) are blocked.
3. **Bounded Output Space**: The AI produces structured JSON UI schemas, never executable JavaScript or raw HTML strings.
4. **Zero Fabrication**: Dashboards explicitly distinguish between retrieved facts, computed metrics, and qualitative estimates. Missing or limited data is transparently noted in the Data Limitations panel.
5. **Ephemeral File Processing**: User-uploaded CSV and JSON files are processed in ephemeral memory for the active session, without writing to permanent storage.

---

## 7. Deployment Instructions

### Deploy to Vercel
1. Push your repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Framework Preset to **Next.js**.
4. In Environment Variables, configure:
   - `ANTHROPIC_API_KEY` (optional for Claude synthesis)
   - `ALPHA_VANTAGE_API_KEY` (optional)
5. Deploy. The application uses serverless edge/Node.js API routes with zero database dependencies required for initialization.

---

## 8. License

MIT License. Ground truth datasets belong to their respective providers (Open-Meteo under CC BY 4.0; World Bank under CC BY 4.0; MoRTH under GODL).
