# ICOBA Voting Site

A voting website for ICOBA Positions and Awards. Voters sign up with email verification, pick one nominee per position/award (auto-saved as drafts), then submit their final ballot. Admins manage categories, nominees, and manually open/close voting.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — auth, PostgreSQL database, optional photo storage

## Features

- Open signup with **email verification** (must verify before voting)
- Collects **first name** and **last name** at signup
- Two sections: **POSITIONS** and **AWARDS**
- Nominee cards with photo, full name, and school house
- **One nominee per position/award** — enforced in the UI and database
- **Auto-save** draft picks on every selection
- **Review & submit** — change picks until final submit; then votes are locked
- **Admin panel** — add/delete positions, awards, nominees; **manually close/open voting**

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Authentication → Providers → Email**, enable email confirmations.
3. In **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:3000` (or your production URL)
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 2. Run the database schema

In Supabase **SQL Editor**, paste and run the contents of:

```
supabase/schema.sql
```

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase keys from **Project Settings → API**:

```bash
cp .env.local.example .env.local
```

### 4. Make yourself an admin

After you sign up and verify your email, run this in the Supabase SQL Editor (replace the email):

```sql
update public.profiles
set is_admin = true
where email = 'your-email@example.com';
```

### 5. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin workflow

1. Sign in as an admin user.
2. Go to **Admin panel** from the voting home page.
3. Add **positions** and **awards**.
4. Add **nominees** (full name, house, optional photo URL) linked to each category.
5. Keep voting **OPEN** while the election runs.
6. Click **Close voting** when the election ends — no new picks or changes allowed.

## Nominee photos

For now, nominees use a **photo URL** (e.g. link to an image hosted on Supabase Storage, Google Drive direct link, or CDN). You can upload images to a public Supabase Storage bucket named `nominee-photos` and paste the public URL when adding nominees.

## Deploy

Deploy to [Vercel](https://vercel.com):

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add the same environment variables.
4. Update Supabase redirect URLs to your production domain.

## Project structure

```
src/app/
  login/ signup/          Auth pages
  vote/                   Voter flow
  admin/                  Admin panel
  api/votes/              Draft save & final submit
  api/admin/              Admin CRUD & election toggle
supabase/schema.sql       Database schema + RLS policies
```
