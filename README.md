# ✨ Lumen — a futuristic Bible study app

Lumen is a beautiful, premium daily Bible study experience: daily readings,
AI‑powered insights, streaks, reflections, favorites, verse memory, a friends
reading circle, a prayer board, statistics, and a weekly digest — wrapped in a
clean, glassy, navy‑and‑teal aesthetic with smooth motion and full dark/light
support.

> Built with React + Vite. All data lives in `localStorage`, so it works
> immediately, offline, with a fully populated sample profile.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build
```

No backend or environment variables are required to run.

## Features

| Area | What you get |
| --- | --- |
| **Daily Reading** | Today’s passage from a reading plan, clear scripture typography, one‑tap **Mark complete** with a satisfying animation, AI devotional line, and tap‑to‑favorite verses. |
| **AI Insights** | A 2–3 sentence explanation of each passage’s meaning + practical application, generated with **Claude Sonnet** and cached after first use. Thoughtful built‑in samples are used when no API key is set. |
| **Reading Plans** | One Year Bible, New Testament in 90 Days, Psalms & Proverbs, and a Custom plan — switch any time from the reading screen. |
| **Progress** | Animated streak counter with milestone celebrations (7 / 30 / 100 / 365), completion ring, and a beautiful calendar of completed days (tap to backfill). |
| **Reflections** | Auto‑saving daily notes (no save button), fully searchable, with per‑entry word counts. |
| **Favorites** | Heart any verse, organize with tags, search, and share. |
| **Verse Memory** | Verse of the week + a flip‑style flashcard review with mastery tracking. |
| **Theology Deep‑Dives** | Explore concepts (grace, covenant, redemption…) across Scripture, with live cross‑references. |
| **Cross‑Reference Explorer** | Related passages surfaced beneath every reading; tap to jump. |
| **Friends Circle** | A sample reading group with a shared weekly completion grid, per‑day chat, and an invite‑code + shareable link (`?invite=CODE`). |
| **Prayer Board** | Add requests, mark “I’ll pray,” and celebrate answered prayers with confetti; archive of answered prayers. |
| **Sharing** | Copy a verse, generate an aesthetic shareable image, or post straight to your circle. |
| **Weekly Digest** | A summary of your reflections, your circle’s top insights, the week’s themes, and prayer/praise — copy, export, or email it. |
| **Statistics** | Verses read, longest streak, favorite books, recurring reflection themes, days this month/year, and average reflection length. |
| **Design** | Deep navy background, teal/cyan + soft purple gradients, Inter + Fraunces type, glassmorphism, micro‑interactions, and mobile‑responsive layout with a bottom nav. |

## Connecting Claude (optional)

Open **Settings → AI Insights** and paste an Anthropic API key
(`console.anthropic.com`). The app calls `claude-sonnet-4-6` directly from the
browser to generate live passage explanations and devotional lines. The key is
stored only in your browser’s `localStorage`. Without a key, Lumen falls back to
high‑quality built‑in sample insights so every feature still works.

## Tech notes

- **Stack:** React 18, Vite, Framer Motion, lucide‑react, canvas‑confetti.
- **Scripture text:** World English Bible (public domain), bundled for offline
  use, with `bible-api.com` as a fallback for custom references.
- **Data model:** plain JSON in `localStorage` (`src/data/seed.js` builds the
  sample state) — designed to migrate cleanly to a backend later.

## Project structure

```
src/
  data/        reading plans, bundled scripture, theology + cross-refs, seed
  lib/         dates, storage, bible + Claude clients, sharing, confetti
  context/     global app state (AppContext) + navigation
  components/  shared UI (cards, modal, toasts, scripture view, insights…)
  pages/       Daily Reading, Progress, Reflections, Favorites, Memory,
               Group, Prayer Board, Stats, Theology, Digest, Settings
```
