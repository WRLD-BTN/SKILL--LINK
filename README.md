# SkillLink

SkillLink is an MVP marketplace for connecting clients in Zimbabwe with local tradespeople. This starter scaffold includes:

- A React + TypeScript frontend for browsing tradespeople, jobs, dashboards, and profiles
- An Express + TypeScript backend with starter API routes
- A Supabase SQL schema and seed data aligned to the MVP flows

## Project Structure

```text
skilllink-step-by-step-development-plan/
  backend/
  frontend/
  supabase/
```

## Current Flows Covered

- Client registration and login
- Tradesperson registration and profile setup
- Browse tradespeople by skill and suburb
- Post jobs and view applicants
- Apply to jobs
- View simple dashboard summaries
- Notifications scaffold
- Ratings and reviews data model

## Local Setup

### 1. Create a Supabase project

Create a project named `skilllink-zw`, then copy the project URL and anon key.

### 2. Run the SQL schema

Open the Supabase SQL editor and run `supabase/schema.sql`.

### 3. Configure environment variables

Frontend:

```bash
cd frontend
copy .env.example .env
```

Backend:

```bash
cd backend
copy .env.example .env
```

### 4. Install dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 5. Start both apps from one terminal

From the project root:

```bash
npm install
npm run dev
```

This launches the frontend and backend together.

## Notes

- The frontend currently uses mock data for MVP walkthroughs and UI development.
- The Supabase client and backend service client are already wired for real integration.
- WhatsApp contact is modeled as `wa.me` links rather than in-app chat.
- Registration is now phone-first for clients and tradespeople. Email is optional.
- Supabase phone login should be configured with a Send SMS Hook if you want to use Africa's Talking as the SMS provider.
