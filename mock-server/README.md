# WikiNow Mock Server

Deterministic stand-in for Wikimedia REST + SSE endpoints used by the WikiNow mobile app.

## Quick start

```bash
cd v1/mock-server
npm install
npm run dev
```

Open the control panel at [http://localhost:3000/mock](http://localhost:3000/mock).

## Endpoints

| Route | Purpose |
|-------|---------|
| `GET /w/api.php?action=query&list=recentchanges...` | REST recent changes (paginated) |
| `GET /v2/stream/recentchange` | SSE live stream |
| `GET /mock` | Scenario control panel |
| `GET /mock/status` | JSON status |
| `GET /health` | Health check |
| `GET /wiki/:title` | Minimal WebView stub |

## Connect the mobile app

Set in `v1/mobile-app/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_STREAM_BASE_URL=http://localhost:3000
```

Restart Expo after changing env vars.

- **iOS simulator:** `localhost` works
- **Android emulator:** use `http://10.0.2.2:3000`
- **Physical device:** use your machine's LAN IP

## Scenarios

Use the `/mock` panel to trigger:

- **Normal** — default catalog + idle SSE
- **1/sec steady** — one enwiki SSE event per second
- **Burst** — 10 SSE events on connect, then 1/sec
- **500 error** — next 3 REST requests fail
- **Drop connection** — SSE closes after 3 events
- **Duplicate / out-of-order** — overlapping REST rcids + out-of-order SSE ids
- **Empty** — REST returns no rows
- **Canary / non-enwiki** — filtered SSE noise

See [../docs/mock-server.md](../docs/mock-server.md) for the full plan.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload |
| `npm start` | Start once |
| `npm test` | Run unit tests |

## Configuration

Copy `.env.example` to `.env`:

```env
PORT=3000
BASE_URL=http://localhost:3000
```

`BASE_URL` is used in SSE `title_url` fields and the control panel instructions.
