# Neon Ali Institute Registration

## What this project contains
- `index.html` — neon-styled registration form
- `style.css` — neon look + animation
- `script.js` — client logic
- `viewer.html` — simple data viewer that talks to serverless APIs
- `api/upload.js` — Vercel serverless function that writes JSON + appends monthly VCF into the repo
- `api/list.js` — lists saved entries (reads `entries/`)
- `api/get.js` — fetch specific file by path
- `README.md`, `.env.example`

## Deploy (recommended on Vercel)
1. Create a GitHub repo and push this project.
2. Add Vercel project and set environment variables:
   - `GITHUB_TOKEN` (Personal Access Token with `repo` scope)
   - `GITHUB_REPO` (owner/repo) e.g. `youruser/ali-registration`
3. Deploy on Vercel — the `api/*.js` files will run as serverless functions.

## File output
- JSON files: `entries/{name}_{phone}_{timestamp}.json`
- Monthly vCard files: `vcf/{Month}_{Year}.vcf`

## Security
Keep `GITHUB_TOKEN` secret — do NOT commit it. Use Vercel's Environment Variables to store it.
