# BitBuzz

> **Student-powered journalism for science, technology and the ideas shaping tomorrow.**

BitBuzz is a modern, student-focused digital publication built around **Space, Cybersecurity, Technology, Aviation, Biology and Innovation**. The platform combines a polished editorial experience with tools for readers, contributors, student publications and administrators.

🌐 **Live:** https://www.bitbuzz.app/

📦 **Repository:** https://github.com/hridhaan-s/The-BitBuzz-Site

---

## ✨ What is BitBuzz?

BitBuzz is designed to make high-quality science and technology journalism more accessible to students while giving young creators a place to publish, discover opportunities and participate in a wider student media community.

The product is intentionally more than a static news website. It includes a publishing workflow, user authentication, newsletters, reporting tools, opportunities, student publication/ambassador features and administrative tooling backed by Supabase.

### Core editorial areas

- 🚀 **Space** — missions, astronomy, exploration and the future of spaceflight
- 🛡️ **Cybersecurity** — security awareness, phishing education and digital safety
- 💻 **Technology** — computing, AI, software and emerging technology
- ✈️ **Aviation** — aircraft, aerospace and the future of flight
- 🧬 **Biology** — science, life sciences and discovery
- 💡 **Innovation** — inventions, projects, ideas and student-led breakthroughs

---

## 🚀 Product highlights

### Editorial experience

- Modern responsive news interface
- Editorial category exploration
- Article and story submission workflow
- Search and discovery experiences
- Live/breaking-news ticker backed by an API endpoint
- Responsive desktop and mobile navigation
- Dark/light theme support
- Accessible navigation patterns, including a skip-to-content link
- Social links and publication branding throughout the experience

### Reader features

- Account creation and sign-in
- Persistent Supabase authentication sessions
- Password recovery and reset flow
- Newsletter subscription
- Newsletter prompt with browser-level subscription/snooze state
- Opportunities feed
- **Flag It** reporting workflow for scam/security reports
- Profile functionality

### Student publication / Ambassador system

BitBuzz includes infrastructure for student publications and ambassadors, including:

- Publication applications
- Publication profiles
- Publication members
- Article/story submissions
- Ambassador dashboard
- Public ambassador/publication pages
- Administrative application review
- Administrative publication management
- Administrative submission review
- Publication profile synchronization after approval
- Realtime updates for relevant publication/submission tables

### Platform tooling

- **Chanakya AI** experience
- **Tool Box** resources
- Admin tools
- Newsletter administration
- Submission notifications
- Server-side email workflows
- Supabase-backed data and authentication

---

## 🖼️ Project Gallery

A visual look at the BitBuzz product and its interface.

<div align="center">

<img src="https://cdn.hackclub.com/019e8f6d-d6f1-7c09-920b-ad3699495c11/screenshot_2026-06-04_030505.png" width="31%" alt="BitBuzz screenshot 1" />
<img src="https://cdn.hackclub.com/019e8f6d-dd8e-773e-833c-fa755f28c1c2/screenshot_2026-06-04_030516.png" width="31%" alt="BitBuzz screenshot 2" />
<img src="https://cdn.hackclub.com/019e8f6d-dfd3-72de-a23c-7b4dc9e2d9e3/screenshot_2026-06-04_030524.png" width="31%" alt="BitBuzz screenshot 3" />

<img src="https://cdn.hackclub.com/019e8f6d-e1f8-7d63-9bda-c066a1ecbe95/screenshot_2026-06-04_030537.png" width="31%" alt="BitBuzz screenshot 4" />
<img src="https://cdn.hackclub.com/019e8f6d-e456-7355-8802-c23ae113c1ff/screenshot_2026-06-04_030546.png" width="31%" alt="BitBuzz screenshot 5" />
<img src="https://cdn.hackclub.com/019e8f6d-e685-79d1-8a36-4f8bde4e3bf4/screenshot_2026-06-04_030552.png" width="31%" alt="BitBuzz screenshot 6" />

<img src="https://cdn.hackclub.com/019e8f6d-3fcf-76bd-838f-4e49481599d9/screenshot_2026-06-04_030557.png" width="31%" alt="BitBuzz screenshot 7" />
<img src="https://cdn.hackclub.com/019e8f6d-41dd-7c04-b4d2-70d1a62b9dc8/screenshot_2026-06-04_030614.png" width="31%" alt="BitBuzz screenshot 8" />
<img src="https://cdn.hackclub.com/019e8f6d-43ac-75d4-8417-8e2b66e3ce7a/screenshot_2026-06-04_030624.png" width="31%" alt="BitBuzz screenshot 9" />

<img src="https://cdn.hackclub.com/019e8f6d-45b8-7dbb-bb61-8e430b9f2466/screenshot_2026-06-04_030631.png" width="31%" alt="BitBuzz screenshot 10" />
<img src="https://cdn.hackclub.com/019e8f6d-486d-78be-9242-946cceaea221/screenshot_2026-06-04_030641.png" width="31%" alt="BitBuzz screenshot 11" />
<img src="https://cdn.hackclub.com/019e8f6d-4a79-7a52-b8f9-84c1196b65e2/screenshot_2026-06-04_030649.png" width="31%" alt="BitBuzz screenshot 12" />

<img src="https://cdn.hackclub.com/019e8f6d-4c6a-7f96-8feb-7d4c6cdc792a/screenshot_2026-06-04_030659.png" width="31%" alt="BitBuzz screenshot 13" />

</div>

---

## 🧱 Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 3 + project CSS |
| Backend / Database | Supabase |
| Authentication | Supabase Auth |
| Email | Resend |
| Hosting | Vercel |
| API routes | Vercel/serverless endpoints |
| Version control | Git + GitHub |

The dependency set is intentionally lightweight. The application currently uses React, React DOM, Supabase JS, Vite, TypeScript, Tailwind CSS, PostCSS and Autoprefixer.

---

## 📁 Project structure

```text
The-BitBuzz-Site/
├── api/                    # Server/API endpoints
├── public/                 # Static public assets
├── src/
│   ├── lib/                # Shared application utilities and Supabase client
│   ├── App.tsx             # Main application shell/home experience
│   ├── AuthPage.tsx        # Authentication UI
│   ├── NewsletterSignup.tsx# Newsletter signup/prompt
│   ├── NewsletterDesk.tsx  # Newsletter experience
│   ├── NewsletterAdminPanel.tsx
│   ├── MagazineViewer.tsx
│   ├── AmbassadorSubmit.tsx
│   ├── AmbassadorsPublic.tsx
│   ├── AmbassadorsDashboardSafe.tsx
│   ├── AmbassadorsDashboardFinal.tsx
│   ├── AdminAmbassadorsSafe.tsx
│   ├── AdminAmbassadorSubmissions.tsx
│   └── ...                 # Additional pages and components
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.ts
├── vite.config.ts
├── postcss.config.js
├── tsconfig*.json
└── vercel.json
```

The repository uses Vercel rewrites so client-side routes such as `/home`, `/blog`, `/submit`, `/opportunities`, `/flagit`, `/ambassadors`, category pages and `/admin` resolve through the Vite application.

---

## 🛠️ Getting started

### Requirements

Install the following before working on the project:

- **Node.js** — use a current LTS release
- **npm**
- **Git**

### Clone the repository

```bash
git clone https://github.com/hridhaan-s/The-BitBuzz-Site.git
cd The-BitBuzz-Site
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will print the local development URL in the terminal.

### Create a production build

```bash
npm run build
```

### Preview the production build locally

```bash
npm run preview
```

The project exposes the standard Vite commands through `package.json`: `dev`, `build` and `preview`.

---

## 🔐 Environment variables

The browser application can use Vercel/environment configuration for Supabase:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

The Supabase client reads these variables and also contains a production fallback so the frontend does not silently lose its authentication client when the Vite environment variables are absent.

### ⚠️ Never expose server secrets

Do **not** put any of the following in frontend source code, README files, commits or public environment variables:

- Supabase service-role keys
- Resend API keys
- SMTP credentials
- Database passwords
- Private tokens
- Other server-side secrets

A browser-facing Supabase publishable/anon key is designed to be used client-side; authorization must still be enforced through Supabase policies/functions.

---

## 🗄️ Supabase architecture

Supabase is used as the application's data and authentication layer.

The project contains data flows around:

- Users and authentication
- Publications
- Publication applications
- Publication members
- Submissions
- Newsletter subscribers
- Opportunities
- Flag It reports
- Administrative workflows

The frontend uses a shared Supabase client in `src/lib/supabase.ts`. That client also contains submission notification handling for supported tables and a password-recovery request path.

### Realtime

Realtime is used for parts of the publication/ambassador workflow so dashboards can react to database changes without requiring a manual refresh.

When changing database behavior, keep **Row Level Security (RLS), RPC authorization and service-role boundaries** in mind. Administrative operations should never be made publicly callable just to make the frontend easier to implement.

---

## ✉️ Email & newsletter architecture

BitBuzz uses **Resend** for email delivery.

The platform separates transactional email from newsletter delivery:

### Transactional email

Used for application events such as:

- Welcome emails
- Submission notifications
- Authentication/OTP-related messages
- Password recovery infrastructure

### Newsletter

The newsletter flow handles:

- Subscriber creation/update
- Publication-specific subscription context
- Resend contacts/segments/topics
- Welcome emails
- Newsletter campaign administration

The client-side newsletter prompt is deliberately conservative: after a successful subscription it stores a browser flag, while closing the prompt temporarily snoozes it before it can appear again.

---

## 📰 Live news ticker

The main application can request live headlines from:

```text
/api/news
```

The UI duplicates the returned headline list to create a continuous ticker and pauses the animation while the user hovers over it. If the feed is unavailable, the ticker remains hidden rather than rendering broken content.

---

## 🔒 Security principles

BitBuzz handles authentication, submissions and administrative data, so security is treated as a product requirement rather than an afterthought.

### Current principles

1. **Keep server secrets server-side.**
2. **Use Supabase Auth for identity/session management.**
3. **Protect administrative operations with authenticated authorization checks.**
4. **Use database-level policies/RPC authorization rather than trusting the browser.**
5. **Validate user-controlled submission/profile data.**
6. **Use HTTPS in production.**
7. **Avoid exposing sensitive database rows to anonymous clients.**
8. **Treat email delivery credentials as secrets.**
9. **Review database changes before deploying them to production.**

If you add a new privileged action, implement the authorization boundary in the database/server layer first and only then wire the UI to it.

---

## 🎨 Design philosophy

BitBuzz aims for an editorial product that feels closer to a premium modern publication than a traditional school website.

The interface prioritizes:

- Strong typography
- Large editorial imagery
- High information density without visual clutter
- Responsive layouts
- Clear hierarchy
- Subtle motion
- Dark-first visual language with light-theme support
- Accessible interactive states
- Mobile-friendly navigation

The goal is simple: **make serious science and technology journalism feel exciting to a student audience.**

---

## 🧭 Main routes

The application currently supports routes including:

| Route | Purpose |
| --- | --- |
| `/home` | Main BitBuzz experience |
| `/signup` | Account/signup experience |
| `/reset-password` | Password reset flow |
| `/privacy` | Privacy page |
| `/profile` | User profile |
| `/blog` | Blog/article experience |
| `/categories` | Category discovery |
| `/about` | About BitBuzz |
| `/submit` | Submit content |
| `/opportunities` | Opportunities feed |
| `/flagit` | Flag It reporting |
| `/ambassadors` | Ambassador/publication experience |
| `/admin` | Administrative tools |
| `/space` | Space content |
| `/cybersecurity` | Cybersecurity content |
| `/tech` | Technology content |
| `/aviation` | Aviation content |
| `/biobuzz` | Biology content |
| `/innovation` | Innovation content |
| `/search` | Search experience |

These routes are backed by the SPA rewrite configuration in `vercel.json`.

---

## 🚢 Deployment

BitBuzz is designed to deploy to **Vercel**.

### Recommended deployment flow

1. Push changes to GitHub.
2. Connect the repository to Vercel.
3. Set the required environment variables in Vercel.
4. Deploy the `main` branch.
5. Verify the production build.
6. Test authentication, submissions, email and database-backed features.
7. Check the browser console and Vercel function logs for runtime errors.

### Production checklist

Before calling a deployment production-ready:

- [ ] `npm run build` succeeds
- [ ] Homepage loads without console errors
- [ ] Mobile navigation works
- [ ] Theme switching works
- [ ] Authentication works
- [ ] Password recovery works
- [ ] Newsletter signup works
- [ ] Article submission works
- [ ] Flag It submission works
- [ ] Opportunities load correctly
- [ ] Ambassador/publication flows work
- [ ] Admin authorization is enforced
- [ ] Email delivery is verified
- [ ] Supabase RLS/policies are reviewed
- [ ] No secrets are committed
- [ ] Vercel rewrites resolve all public routes

---

## 🤝 Contributing

Contributions should preserve the reliability of the production application.

### Suggested workflow

```bash
git checkout -b feature/your-change
npm install
npm run build
```

Make the smallest safe change possible, test it locally, then commit and push:

```bash
git add .
git commit -m "feat: describe the change"
git push -u origin feature/your-change
```

For larger changes:

1. Explain the problem being solved.
2. Describe the implementation.
3. Identify affected frontend/backend/database areas.
4. Test production-critical flows.
5. Check for security and authorization regressions.
6. Keep unrelated UI/backend behavior unchanged.

---

## 🧪 Testing philosophy

The project should be tested at three levels:

### 1. Build validation

```bash
npm run build
```

This catches TypeScript/Vite compilation problems and many broken imports.

### 2. Browser validation

Check the affected flow on both desktop and mobile widths. Pay particular attention to authentication modals, forms, responsive navigation and database-backed pages.

### 3. Production validation

After deployment, verify the real Vercel/Supabase/Resend integration rather than relying only on local mocks.

---

## 📝 Commit conventions

Prefer clear, focused commits such as:

```text
feat: add publication profile editing
fix: prevent duplicate newsletter prompts
docs: update deployment instructions
refactor: simplify article submission flow
security: harden admin publication access
```

Avoid mixing unrelated UI redesigns, database migrations and infrastructure changes into one opaque commit.

---

## 🌍 Project vision

BitBuzz is being built around a simple idea:

> **Students shouldn't only consume the future. They should understand it, question it and build it.**

The platform is intended to become a home for student-led science and technology journalism, giving young writers, researchers, builders and creators a professional place to share what they are learning and making.

---

## 📬 Contact & links

- **Website:** https://www.bitbuzz.app/
- **GitHub:** https://github.com/hridhaan-s/The-BitBuzz-Site
- **LinkedIn:** https://www.linkedin.com/company/bitbuzzspace/
- **Instagram:** https://www.instagram.com/bitbuzz_CLUB/
- **YouTube:** https://www.youtube.com/@Bitbuzz-club

---

## 📄 License

No open-source license is currently declared in this repository. Unless a license is added, the source code should not be assumed to be freely reusable under an open-source license.

---

<p align="center">
  <strong>BitBuzz</strong><br />
  Science. Technology. Innovation. Built for the next generation.
</p>
