# Sridhi HR — Live Setup Guide

Follow these steps in order. Takes about 15 minutes total.

---

## PART 1 — Google Sheet + Apps Script (the database)

### Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and click **Blank spreadsheet**
2. Name it **Sridhi HR Data** (top left)
3. Leave it open — you'll need its URL later

### Step 2 — Open Apps Script

1. In the sheet, click **Extensions** (top menu) → **Apps Script**
2. A new tab opens with a code editor

### Step 3 — Paste the script

1. Delete everything in the editor (Ctrl+A, Delete)
2. Open the file `google-apps-script/Code.gs` from this project folder
3. Copy its entire contents and paste into the editor
4. Edit line 8 — replace the example emails with your real recruiter emails:
   ```
   const REMINDER_EMAILS = 'priya@yourcompany.com, anitha@yourcompany.com'
   ```
5. Click **Save** (💾 or Ctrl+S) — name the project **Sridhi HR**

### Step 4 — Deploy as Web App

1. Click **Deploy** (top right) → **New deployment**
2. Click the gear icon ⚙️ next to "Type" → select **Web app**
3. Fill in:
   - **Description:** `Sridhi HR v2`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`   ← important, otherwise the app can't reach it
4. Click **Deploy**
5. If asked, click **Authorize access** → choose your Google account → click **Allow**
6. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycbXXXXXXXXX/exec
   ```
   Save this — you'll need it in Part 2.

### Step 5 — Test the script (optional but recommended)

In the Apps Script editor, select the function `handleList` from the dropdown at the top, then click **▶ Run**. If it runs without error, the sheet is ready.

---

## PART 2 — Deploy the web app (two options)

### Option A — Netlify (easiest, free)

1. Go to [netlify.com](https://netlify.com) → sign up / log in
2. Click **Add new site** → **Deploy manually**
3. Build the app first (on your computer, run):
   ```
   cd sridhi-enhanced
   VITE_API_URL="https://script.google.com/macros/s/YOUR_ID/exec" npm run build
   ```
   Replace `YOUR_ID` with your actual Apps Script URL.
4. Drag the **`dist`** folder into the Netlify deploy area
5. Your app is live at a `*.netlify.app` URL instantly

**To update later:** Re-run the build command and drag the new `dist` folder to Netlify.

---

### Option B — Vercel (also free)

1. Push this project folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. In the project settings, add an **Environment Variable**:
   - Name: `VITE_API_URL`
   - Value: your Apps Script URL
4. Click **Deploy** — Vercel builds and hosts it automatically

**To update later:** Push changes to GitHub — Vercel auto-deploys.

---

### Option C — Run locally (for testing)

1. Create a file called `.env` in the `sridhi-enhanced` folder:
   ```
   VITE_API_URL=https://script.google.com/macros/s/YOUR_ID/exec
   ```
2. Run:
   ```
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser

---

## PART 3 — Daily email reminders (optional)

This sends a morning email with overdue and due-today follow-ups.

1. In the Apps Script editor, click the **clock icon** (⏰) on the left sidebar → **Triggers**
2. Click **+ Add Trigger** (bottom right)
3. Set:
   - Function: `sendDailyReminderEmail`
   - Event source: `Time-driven`
   - Type: `Day timer`
   - Time: `7am to 8am` (or when you prefer)
4. Click **Save**

That's it — free daily digest, no third-party service needed.

---

## After deployment — first-time use

- Open the live app URL
- The Google Sheet will automatically create these tabs:
  - **Candidates**, **FollowUps**, **CallLogs**, **Departments**, **Roles**, **HRList**, **Config**
- Any data added in the app appears in the sheet in real time
- You can also add/edit rows directly in the sheet — the app will reflect them on next load

---

## Troubleshooting

| Problem | Fix |
|---|---|
| App loads but shows no data | Check the VITE_API_URL — must end in `/exec` |
| "Who has access" warning | In Apps Script deploy settings, set access to **Anyone** |
| Changes not saving to sheet | Re-deploy the Apps Script (Deploy → Manage deployments → ✏️ edit → update version) |
| Old data showing after script update | Always create a **New Deployment** not edit the old one |

