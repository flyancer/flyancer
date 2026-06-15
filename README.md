# Flyancer – Jobs AI Platform 🚀

> *Land your next job in seconds, not weeks.*

A clean, animated coming-soon landing page for **Flyancer** — the AI-powered jobs platform featuring:

- **AI Resume Builder** — chat-to-resume in under 30 seconds
- **Resume Upgrade** — paste your old resume, get it transformed
- **FitScore™** — paste a JD, score your resume against it
- **Flyancer for Good** — serving people with special needs, refugees, long-time unemployed, and students

---

## 📁 Project Structure

```
flyancer/
├── index.html     ← Main landing page
├── style.css      ← All styles
├── script.js      ← Animations, nav, waitlist logic
└── README.md      ← This file
```

---

## 🚀 Deploy on GitHub Pages (Free)

### Step 1 — Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click **New repository** (the green button)
3. Name it: `flyancer` (or `flyancer-website`)
4. Set it to **Public**
5. Click **Create repository**

### Step 2 — Upload the files

**Option A — Via browser (easiest):**
1. In your new repository, click **Add file → Upload files**
2. Drag all 4 files (`index.html`, `style.css`, `script.js`, `README.md`) into the upload area
3. Scroll down and click **Commit changes**

**Option B — Via Git (if you have Git installed):**
```bash
git clone https://github.com/YOUR_USERNAME/flyancer.git
cd flyancer
# Copy your files here, then:
git add .
git commit -m "Initial Flyancer landing page"
git push origin main
```

### Step 3 — Enable GitHub Pages

1. In your repository, go to **Settings** (top tab)
2. Scroll down to **Pages** (left sidebar)
3. Under **Source**, select **Deploy from a branch**
4. Set branch to **main** and folder to **/ (root)**
5. Click **Save**

### Step 4 — Your site is live! 🎉

After 1–2 minutes, your site will be live at:
```
https://YOUR_USERNAME.github.io/flyancer/
```

---

## 🌐 Connect Your GoDaddy Domain

Once the GitHub Pages site is live:

1. Go to **GoDaddy → My Products → DNS**
2. Add a **CNAME record**:
   - Name: `www`
   - Value: `YOUR_USERNAME.github.io`
3. Add an **A record** (for root domain):
   - Name: `@`
   - Value: `185.199.108.153` (GitHub Pages IP)
   - Also add: `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. In GitHub Pages Settings, under **Custom domain**, enter: `www.flyancer.com`
5. Wait 24 hours for DNS to propagate ✓

---

## 🔧 Customise

| What | Where |
|------|-------|
| Brand colors | `style.css` → `:root` variables |
| Hero headline | `index.html` → `.hero-headline` |
| Waitlist email capture | Replace `localStorage` in `script.js` with a Mailchimp/Airtable API call |
| Add Google Analytics | Paste GA tag in `<head>` of `index.html` |

---

## 📬 Collecting Waitlist Emails (Production)

The current form stores signups in the browser's `localStorage`. For real email collection, replace the `handleWaitlist` function in `script.js` with a call to:
- **Mailchimp** — free up to 500 contacts
- **Airtable** — free tier, easy to manage
- **Formspree** — paste one endpoint, done

---

Built with ♥ for every job seeker on Earth.
