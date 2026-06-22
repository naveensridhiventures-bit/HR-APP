# Sridhi HR — Hiring Pipeline PWA

A fast, installable hiring-pipeline tracker built for field hiring: Driver,
Field Sales, Housekeeping, Security — or any role you add. Every applicant
moves through a kanban pipeline, every follow-up call is logged, and nothing
falls through the cracks.

**Stack:** React + Vite · Tailwind · Google Sheets as the database (via Apps
Script) · installable PWA · deploys to Vercel for free.

## Features

- **Kanban pipelines** per role — Applied → Screening → Interview → Offer →
  Hired, drag-and-drop between stages, with On Hold / Rejected lanes
- **Roles, managed per pipeline** — keep a real list of open titles (e.g.
  Heavy Vehicle Driver, Light Vehicle Driver under Driver) so Add Candidate
  is a dropdown, not retyped free text every time
- **Status-aware WhatsApp message templates** — one tap opens WhatsApp with
  a message already written for that candidate's exact stage (screening
  invite, interview reminder, offer, etc.), including a template that lists
  every other open role across pipelines for candidates who aren't a fit
  for their original one
- **Today's Register** dashboard — overdue and due-today follow-ups surfaced
  first, with an unmissable banner the moment something is overdue
- **Daily reminder email** — a free, one-time Apps Script trigger emails
  the team every morning with everyone overdue or due today, plus one-tap
  Call/WhatsApp links right inside the email
- **Follow-up history** — a timestamped log per candidate, not just a single note
- **Search, filters, CSV export** on the full candidate list
- **Installable app** — Add to Home Screen on Android/iOS/desktop, works
  offline, has its own icon (no browser address bar)
- **Add pipelines on the fly** — Driver/Field Sales/Housekeeping/Security are
  defaults, add as many as you hire for
- **Works instantly on sample data** — no setup required to try it; connect
  your real Google Sheet whenever you're ready

## 1. Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL. Without any setup the app runs on realistic
sample data stored in your browser, so you can click around immediately.

## 2. Connect your Google Sheet (the real database)

1. Create a new Google Sheet (any name, e.g. "Sridhi HR Data"). You can
   leave it empty — the script creates its own tabs.
2. In the Sheet, open **Extensions → Apps Script**.
3. Delete the placeholder code, then paste in the entire contents of
   [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) from this
   project.
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize the permissions Google asks for (it's your
   own script accessing your own sheet), and copy the **Web app URL** —
   it looks like `https://script.google.com/macros/s/AKfycb.../exec`.
6. Put that URL into `.env` (copy `.env.example` to `.env` first):
   ```
   VITE_API_URL=https://script.google.com/macros/s/AKfycb.../exec
   ```
7. Restart `npm run dev`. The "running on sample data" banner disappears —
   you're now reading and writing the real spreadsheet.

> **Whenever you edit `Code.gs` later**, use **Deploy → Manage deployments
> → Edit → New version**. Saving the file alone does not update the live
> URL.

## 3. Turn on the daily reminder email (free, optional but recommended)

The Follow-ups tab only helps if someone opens the app. To get an automatic
email every morning listing who is overdue and who is due today:

1. Open your Apps Script project (the same one from step 2).
2. At the top of `Code.gs`, set `REMINDER_EMAILS` to your team's email
   addresses, comma-separated, and `COMPANY_NAME` to your company's name.
3. Save, then **Deploy → Manage deployments → Edit → New version** so the
   change is live.
4. In the Apps Script editor, click the clock icon (**Triggers**) in the
   left sidebar → **+ Add Trigger**.
5. Set:
   - Function: `sendDailyReminderEmail`
   - Event source: **Time-driven**
   - Type: **Day timer**, pick an hour (e.g. 8am–9am)
6. Save. Google will now email that list every day automatically, using
   your own free Gmail sending quota — no third-party service, no cost.

The email includes each candidate's name, role, assigned recruiter, and
one-tap Call/WhatsApp links, so a recruiter can act straight from their
inbox without opening the app. If nothing is overdue or due that day, no
email is sent.

## 4. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, **Add New → Project**, import that repo (Vercel auto-detects
   Vite).
3. Under **Settings → Environment Variables**, add:
   - `VITE_API_URL` = your Apps Script Web app URL from step 2 above
4. Deploy. Your team can now open the Vercel URL and install it as an app.

## 5. Install it as an app

- **Android / Desktop Chrome/Edge:** an "Install app" button appears in the
  sidebar and as a banner — tap it.
- **iPhone/iPad (Safari):** tap Share → "Add to Home Screen" (the app walks
  you through this when you tap Install on iOS).

Once installed, Sridhi HR opens full-screen with its own icon, exactly like
a native app, and keeps working without internet for anything already
loaded.

## Customizing

- **Pipeline stages** — edit `STAGES` in `src/lib/constants.js`.
- **Default pipelines** — edit `DEFAULT_DEPARTMENTS` in the same file (also
  update `DEFAULT_DEPARTMENTS` in `Code.gs` if you want them pre-seeded in
  a brand-new sheet).
- **Default roles** — edit `DEFAULT_ROLES` in `src/lib/constants.js` (and
  `DEFAULT_ROLES` in `Code.gs`). Recruiters can also add/remove roles from
  Settings without touching code.
- **WhatsApp message templates** — edit `TEMPLATES` in
  `src/lib/messageTemplates.js`. Each template lists which stages it's
  recommended for and a body string with `{name}`, `{role}`, `{department}`,
  `{recruiter}`, `{company}` placeholders.
- **Company name in messages** — set it once from Settings → Company name;
  it fills the `{company}` placeholder in every template.
- **Colors / fonts** — `tailwind.config.js` and the Google Fonts link in
  `index.html`.
- **App icon** — the current icon (a stamped checkmark) is generated by
  `scripts/generate_icons.py` (`python3 scripts/generate_icons.py`, needs
  Pillow: `pip install pillow`). Edit the colors/shapes there, or replace
  `public/icons/*.png` with your own artwork at 192×192, 512×512 (and a
  512×512 "maskable" version), keeping the same filenames.

## Project structure

```
src/
  components/    UI building blocks (cards, drawer, kanban, nav, install prompt, WhatsApp template menu)
  pages/         Dashboard, Pipeline, Follow-ups, All Candidates, Settings
  store/         React context: data (AppContext) and UI state (UiContext)
  lib/           API client, local fallback store, dates, constants, csv, contact links, message templates
google-apps-script/
  Code.gs        The entire backend — paste into Apps Script, deploy, done.
                 Also includes sendDailyReminderEmail() for the daily digest.
```
