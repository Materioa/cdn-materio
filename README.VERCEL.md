Vercel deployment notes

- API endpoint (edge): `/api/health`
- `vercel.json` contains headers mapped from `_headers` (CORS enabled)

Quick deploy

```powershell
# Install Vercel CLI (optional)
npm i -g vercel

# From repo root
vercel login
vercel --prod
```

Local dev

```powershell
# Start Vercel dev server
vercel dev
# then open http://localhost:3000/api/health
```

Notes

- The API is an Edge function (low latency). It returns a tiny JSON: `{ "status": "ok", "ts": 123456789 }`.
- `vercel.json` applies the CORS header site-wide. If you need more specific rules, edit `vercel.json`.
