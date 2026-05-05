# Twoweek — Vercel-compatible rewrite

This is a standard React SPA (Vite + React Router v6) rewrite of the original TanStack Start app.
It works on Vercel out of the box.

## What changed
- Removed `@tanstack/react-start`, `@cloudflare/vite-plugin`, `@lovable.dev/vite-tanstack-config`
- Replaced TanStack Router with **React Router v6**
- Standard `vite.config.ts` (no Cloudflare/Start plugins)
- `vercel.json` handles SPA routing

## Setup steps

### 1. Copy these files into your GitHub repo
Replace the existing files. Key ones:
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `vercel.json`
- `index.html`
- `src/main.tsx`
- `src/styles.css`
- `src/routes/` (all files)
- `src/components/site-header.tsx`
- `src/components/marquee.tsx`
- `src/integrations/supabase/client.ts`
- `src/lib/exercise-images.ts`

### 2. Keep your assets
Keep all files in `src/assets/` — the images are referenced the same way.
Also move `hero.png` to the `public/` folder (root level) so it loads correctly.

### 3. Set environment variables in Vercel
Go to Vercel → your project → Settings → Environment Variables and add:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — your Supabase anon key

### 4. Deploy
Push to GitHub → Vercel auto-deploys. Done.

Vercel rebuild
