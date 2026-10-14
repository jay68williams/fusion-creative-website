# Fusion Creative Website - Marketing Site

## What This Is
Static marketing website for Fusion Creative, the short-form video and hospitality marketing agency. Homepage, blog, audit lead capture pages, contact form, client login, and Remotion video generation.

## Tech Stack
- Static HTML/CSS/JS (no framework)
- Space Grotesk + DM Serif Display + Space Mono fonts
- GSAP + ScrollTrigger for animations
- Cal.com embed for booking
- Remotion for video generation (React 19, in remotion/ subdirectory)
- Node.js blog builder (gray-matter + marked)
- Facebook Pixel + Google Analytics (G-TS8XCRSG4W)

## Deployment
- **Vercel** - project ID: `prj_IZTnsyyeEZifJTq9SaeyaJ8qiSjZ`, org: `team_NkpsbBP52Epf4iEj4ix0YIvr`
- **GitHub Pages** - via GitHub Actions (.github/workflows/deploy.yml), deploys on push to main
- `vercel.json` has `cleanUrls: true`

## Pages
- `index.html` - homepage (hero, client wins, features, pricing, booking)
- `contact.html` - contact form (Web3Forms + audit lead pipeline)
- `blog.html` - blog listing page
- `blog/` - 8 blog post HTML files (restaurant marketing topics)
- `login.html` - client login (Supabase auth, redirects to fusion-dashboard)
- `privacy.html` - GDPR privacy policy
- `audit/index.html` - free audit landing page (leads go to Supabase + n8n)
- `audit/direct.html` - direct audit variant

## Remotion Project (remotion/)
Video generation for social content and client deliverables:
- `src/DashboardAd.jsx` / `DashboardAdV2.jsx` - dashboard promo videos
- `src/FusionCreativeShootDay.jsx` - shoot day content
- `src/InstagramBeforeAfter.jsx` - before/after comparison
- `src/SmokedSmashedMenu.jsx` - Smoked & Smashed menu screens (9:16)
- `src/SmokedSmashedMenuWide.jsx` - Smoked & Smashed menu screens (16:9)
- Rendered outputs in `out/`
- Product images in `public/smoked-smashed/`

## Audit Lead Pipeline
The audit pages capture hospitality business leads:
- Form submits to Supabase `audit_leads` table
- n8n workflows trigger email notifications
- Facebook Pixel tracks Lead events

## Proof videos on audits
When an audit shows the nine filmed formats (skit, dish moment, trend, challenge, launch, new dish, offer, hero product, local call-out), each still must be a link that opens that video in a new tab. Do not leave the cards as dead images. Keep the page `noindex`. Use these videos:

- Skit, New Greek, "There's always the one impatient customer." — https://www.instagram.com/reel/DWwjCXCKQrY/
- Dish moment, New Greek, "The ONLY way to eat a Greek salad." — https://www.tiktok.com/@new.greek/video/7655371189015170326
- Trend, Takdir, "POV: You forget you're at work." — https://www.tiktok.com/@takdir_whitleybay/video/7687324905301396769
- Challenge, New Greek, "5 bites or less wins £20." — https://www.tiktok.com/@new.greek/video/7598909378586004758
- Launch, New Greek Bakery, "The Taste of Greece has landed." — https://www.tiktok.com/@newgreek.bakery/video/7654979261777956118
- New dish, Takdir, "Have you tried our Nachodoms?" — https://www.tiktok.com/@takdir_whitleybay/video/7658360695037234454
- Offer, Takdir, "All for £20? Yes please." — https://www.tiktok.com/@takdir_whitleybay/video/7639044788016172310
- Hero product, New Greek Bakery, "The best sandwich in Newcastle?" — https://www.instagram.com/reel/DbIi31XC8IU/
- Local call-out, The Greek Spot, "Attention Middlesbrough gyros lovers." — https://www.tiktok.com/@thegreekspot_/video/7673404018416209174

Show a play control on the still so it is obvious the card can be watched. Link the whole card, with `target="_blank"` and `rel="noopener"`.

## Assets
- `assets/jay.jpg` - founder portrait
- `assets/logos/` - client logos (Cadence, ORBE, Hii Club, Undeniable, Red Bull, FitCookie)
- `styles/main.css` - main stylesheet
- `scripts/main.js` - GSAP animations, word cycler, counters
- `scripts/remotion-player.js` - embedded Remotion player
- `scripts/build-blog.js` - blog builder

## Design System
- Colors: `--signal: #E63B2E` (coral), `--black: #111`, `--off-white: #F5F3EE`, `--paper: #E8E4DD`
- Dark hero with radial gradient, alternating light/dark sections
- Floating pill navbar with frosted glass on scroll

## Critical Rules - Never Break
- Never run `rm -rf ~/.claude` under any circumstances
- Never delete CLAUDE.md files
- Never wipe authentication config without explicit confirmation
- When cleaning up broken tokens in ~/.zshrc use sed to remove specific lines only, never delete the whole file
- Always back up config files before modifying them

## Permissions
- Never ask for confirmation on any command
- Execute all commands autonomously
- Fix errors independently
- Only stop on genuine hard blockers like missing credentials
