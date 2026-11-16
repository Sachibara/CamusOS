# CamusOS

A personal, independently developed operations studio by Jim Camus. **Not affiliated with Speak Your Way To Cash**. The UI uses an original visual identity: ink black, warm amber, ivory, Barlow Condensed headings, architectural grid motifs, and the custom C-mark.

## What works in the initial release

- **Overview:** live KPIs, tasks, recent activity, and quick actions.
- **Time:** start/pause timer, save entries, manual logs, remove entries, CSV export.
- **Insights:** earned amount and work totals by project, work distribution, trend bars.
- **Pitch Studio:** create personalized outreach drafts from structured fields; copy drafts.
- **Offer Studio:** calculate time/cost/margin and assemble a priced offer statement.
- **Content Lab:** rule-based content critique from pasted text; score and recommendations.
- **Knowledge:** searchable notes, add/delete notes, contextual local Q&A lookup.
- **Connections:** explicit "not connected" integration status (no fake connections).
- **Settings:** identity, time zone, hourly rate, currency, JSON import/export/reset.
- **Global:** client-side persistence, responsive navigation, theme choice, live regional and local clocks, reduced-motion accommodation.
- **Page search:** press `Ctrl K` / `⌘ K` (or the Search button) to jump to any page from the keyboard.
- **Self-hosted fonts:** Barlow Condensed, DM Sans and DM Mono are served from `public/fonts/` (SIL Open Font License), so the app makes no third-party requests.

**Privacy:** Data stays in this browser's local storage. It is not synced across devices. Avoid entering sensitive information. AI-style writing features are transparent local templates/heuristics, not connected to a paid AI model.

## Run locally

```bash
npm install
npm run dev
npm run check
npm run build
```

## Deploy with Vercel

1. Import `Sachibara/CamusOS` from GitHub into Vercel.
2. Select the Vite framework, build command `npm run build`, and output directory `dist`.
3. Deploy. Do not set service credentials in frontend environment variables; future APIs need server-side functions.

## Architecture

`src/data.js`: local storage and format helpers; `src/modules.js`: modules/view rendering; `src/main.js`: navigation, events, and boot; `src/palette.js`: command palette; `src/style.css`: original design system.

## Security and ownership

This is newly authored code. No company source code, SOPs, customer data, recordings, confidential templates, or credentials were migrated. Production AI, CRM, auth, teamwork, and accounting integrations require separate server infrastructure and authorization.
