# AEO baseline for AI Accountant

Tracks how often AI assistants (ChatGPT, Gemini, Perplexity) and Google AI Overviews recommend aiaccountant.com in India, and how that relates to website visits, branded search and HubSpot leads.

## What is here

| Folder | Contents |
|---|---|
| `dashboard/` | The Next.js dashboard deployed on Vercel. |
| `docs/` | The decision log (`aeo-plan.md`) and research notes. |
| `lists/` | Every version of the prompt and keyword lists. The live lists are in the database. |
| `scripts/` | Loader and analysis scripts for Search Console and Google Analytics (run through the `treg` CLI). |

## What is not here

- The database (Supabase): tables, views and functions named `aeo_*`. The schema is not exported into this repository.
- The n8n workflows that collect the answers and refresh branded search.
- Any secret. The dashboard reads `DB_PASSWORD` and `UPLOAD_PASSWORD` from the Vercel project's environment variables.

## Run the dashboard

```bash
cd dashboard
npm install
npx next build
```

Deploys are made with the Vercel CLI from `dashboard/`.
