# GenUI — Generative UI for Dynamic Workflows

> Describe a workflow in plain English. Get a real, working dashboard — instantly.

---

## The Problem

Most business tools are static: someone builds an app, picks the charts, writes the layout, and ships it. That process takes days or weeks, and the result only fits the exact use case it was designed for.

GenUI flips this. Instead of a static app, an ML model generates a **custom user interface on the fly** from a natural language request. Type *"Set up a dashboard to track my startup's burn rate"* and within seconds you have a live, working UI — real charts, KPI cards, tables — tailored to that specific business context. No code. No templates. No waiting.

---

## What It Does

- **User types a plain-English request** describing the dashboard or workflow they need — no forms, no dropdowns, just a prompt.
- **The app identifies the business domain** and sends it to an LLM (Claude), which generates a structured UI Schema — a constrained JSON blueprint, not raw code.
- **The schema is validated and rendered** into a real, interactive dashboard with charts, KPI cards, data tables, forms, kanban boards, and more — populated with live-feeling mock data.
- **Each business domain gets a structurally different layout** — a hospital operations dashboard looks nothing like a food delivery console or a startup burn rate tracker. No reused templates.

  Supported domains out of the box:
  - 🚀 Startup finance / burn rate
  - 🏥 Hospital operations
  - 🛵 Food delivery console
  - 🛒 E-commerce store
  - 📊 Sales pipeline
  - 📅 Event RSVP tracker
  - 📦 Inventory tracking
  - ✅ Habit tracker

- **Sign in with Clerk** to save generated dashboards and revisit them later from a History panel, backed by a Postgres database (Neon).
- **Never breaks in a demo** — if the live AI call fails or times out, a validated fallback library serves a pre-built example for the detected domain instantly.

---

## Why This Approach

The LLM does **not** generate raw HTML or JSX. That would be fragile, unsafe, and unpredictable.

Instead, the LLM generates a **constrained JSON "UI Schema"** — a declarative description of which widgets to render and what data to show. That schema is then:

1. **Validated by Zod** — malformed or incomplete schemas are repaired or replaced with a known-good fallback.
2. **Rendered by a fixed component library** — the schema is mapped to hand-built React components. The AI can only ever produce a valid combination of pre-approved widgets.

This bounds the AI's output space. It can produce thousands of different, meaningful UIs — but it cannot produce broken layouts, dangerous code, or unexpected crashes. Flexibility and reliability, together.

```
User prompt
    │
    ▼
LLM (Claude) generates UI Schema (JSON)
    │
    ▼
Zod validates schema ──► auto-repair or domain fallback on failure
    │
    ▼
Renderer maps schema nodes → React components
    │
    ▼
Live dashboard rendered in browser
    │
    ▼
(If signed in) Schema + metadata saved to Postgres via Prisma
    │
    ▼
Revisit anytime from History panel
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Charts | Recharts |
| Animation | Framer Motion |
| AI / Schema Gen | Anthropic API (Claude) |
| Schema Validation | Zod |
| Authentication | Clerk |
| Database | Neon (Postgres) + Prisma |
| Deployment | <!-- TODO: Add your deployment platform, e.g. Vercel --> |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Srihari-tech21/Generative-UI.git
cd Generative-UI
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Authentication — get these from your Clerk dashboard at clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database — get your connection string from neon.tech
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# AI — get your API key from console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...

# Optional: serve cached example dashboards without calling the live AI
# Useful for demos without network access
OFFLINE_MODE=false
```

### 3. Set up the database

```bash
npx prisma migrate dev
```

### 4. Run the development server

```bash
npm run dev
```

Open [https://generative-ui-orpin.vercel.app/](https://generative-ui-orpin.vercel.app/) in your browser.

> **Offline/demo mode:** Set `OFFLINE_MODE=true` in your `.env.local` to skip live AI calls entirely. The app will serve pre-validated example dashboards for each domain instantly — useful for demoing without network or API key dependency.

---

## Example Prompts to Try

Copy and paste any of these into the prompt box:

1. `Set up a dashboard to track my startup's monthly burn rate and runway`
2. `Build a hospital operations console showing bed occupancy, admissions, and ER wait times`
3. `Create a food delivery dashboard for tracking active riders, orders, and average delivery time`
4. `I need an e-commerce dashboard with daily GMV, top products, and conversion rate`
5. `Show me a sales pipeline tracker with deal stages, win rate, and revenue forecast`
6. `Build a daily habit tracker with streaks, completion rates, and a weekly heatmap`

---

## What's Next

- **Conversational editing** — follow-up prompts to modify an already-generated dashboard (e.g. *"Add a revenue chart"* or *"Change the time range to this quarter"*)
- **Real data source integration** — CSV upload or Google Sheets connection so dashboards show actual data, not mock data
- **Sharing and exporting** — shareable links and PDF/PNG export of generated dashboards
- **More domain templates** — logistics, HR analytics, SaaS metrics, personal finance, and more

---

## Team & Hackathon

> Built by **[AEVIXA]** for **[INNOGENESIS]**, [7TH - 8TH AUGUST].

<!-- TODO: Fill in team name, hackathon name, and date before submitting -->

---

<p align="center">
  Made with ☕ and too many LLM tokens.
</p>
