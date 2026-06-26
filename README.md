# WikiNow

Expo React Native app that shows recent English Wikipedia changes in tabbed lists, with optional SSE **Live mode**, offline cache, and a TypeScript mock server for deterministic testing.

**Screens**

1. **Changes list** — tabs (All / Articles / New pages), infinite scroll via `rccontinue`, pull-to-refresh, loading/empty/error/offline states, and a freshness indicator in the header.
2. **Detail** — opens the selected page in a WebView with its own loading, error/retry, and back behavior (including WebView history on Android).

---

## Quick start

### Mobile app

```bash
cd mobile-app
npm install
cp .env.example .env   # optional — defaults point at production Wikimedia
npx expo start
```

Open **All**, **Articles**, or **New pages**. Toggle **Live** in the header for real-time stream updates (foreground + online only).

### Mock server (recommended for development)

```bash
cd mock-server
npm install
npm run dev
```

Open the control panel at [http://localhost:3000/mock](http://localhost:3000/mock).

Point the app at the mock in `mobile-app/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_STREAM_BASE_URL=http://localhost:3000
```

Restart Expo after changing env vars.

| Target | Base URL |
|--------|----------|
| iOS simulator | `http://localhost:3000` |
| Android emulator | `http://10.0.2.2:3000` |
| Physical device | Your machine's LAN IP |

### Tests

```bash
cd mobile-app && npm test
cd mock-server && npm test
```

---

## Repo layout

```
/
├── README.md              ← this file
├── AI_USAGE.md            ← how AI tools were used
├── docs/                  ← architecture, cache, live mode, plan
├── mobile-app/            ← Expo app (Expo Router + TanStack Query)
└── mock-server/           ← Hono REST + SSE + /mock scenario panel
```

Deeper docs: [architecture](./docs/architecture.md) · [cache behavior](./docs/cache-behavior.md) · [live mode](./docs/live-mode.md) · [mock server](./docs/mock-server.md) · [plan / status](./docs/plan.md)

---

## Key decisions & tradeoffs

| Decision | Rationale |
|----------|-----------|
| **REST polling as default** | Server-side tab filters, predictable battery/network use, clean pagination via `rccontinue`. |
| **SSE as optional Live mode** | Global firehose has no server filter; kept foreground-only and user-opt-in. |
| **TanStack Query everywhere** | `useInfiniteQuery` for REST; `experimental_streamedQuery` for SSE; AsyncStorage persistence for offline. |
| **One SSE connection, client-side tab filter** | Simpler lifecycle than three streams; tab filters applied on merge. |
| **XHR on native for SSE** | React Native `fetch` does not stream SSE reliably; `fetch` + `ReadableStream` on web. |
| **FlashList** | Rendering performance for shifting list heads during live updates. |
| **Hono mock server** | Single-process TypeScript server with scenario panel — lighter than Nest for this scope. |

---

## Freshness approach

The header shows **loaded count** and a **freshness label** driven by [`FeedFreshness`](./mobile-app/types/feed-freshness.ts):

| Source | When | Label example |
|--------|------|----------------|
| `api` | REST poll succeeded (live off, or live on with cached REST) | `Updated 2m ago` |
| `stream` | Live mode active and stream events received | `Live · updated just now` |
| `cache` | Offline with persisted data | `Cached · updated 5m ago` |

Implementation:

- REST freshness from `query.dataUpdatedAt` per tab.
- Stream freshness merged via `mergeFeedFreshness` when Live is on.
- Relative-time labels refresh on a configurable tick (`tickMs`, default 10s).
- During Live mode, REST polling and background refetches are suspended; the stream is the source of truth for the list head. Pull-to-refresh still triggers an explicit REST refetch.

Background/foreground and connectivity are wired through TanStack Query's `focusManager` (AppState) and `onlineManager` (NetInfo): polling pauses when backgrounded or offline, and resumes on foreground.

See [cache-behavior.md](./docs/cache-behavior.md) and [live-mode.md](./docs/live-mode.md) for details.

---

## Mock server takeaway

The real Wikimedia stream is slow and non-deterministic. The mock server's **steady-rate scenarios** (1/sec → 5 → 10 → 20/sec) turned "works on my machine" into repeatable stress tests and exposed two production bugs in the mobile app.


## What was cut / out of scope

- Automated E2E tests against Expo
- Full MediaWiki API parity in the mock
- Rich wiki HTML for the detail WebView (minimal stub only)
- Server-side SSE filtering (client filters enwiki + drops canary)
- Per-tab SSE connections
- Zod runtime validation of API responses
- Debug cache inspector screen

Built in priority order (see [architecture.md §9](./docs/architecture.md)); mock server and live mode were stretch goals that shipped.

---

## With more time

**List performance in Live mode.** The mock server's **20/sec** scenario still makes FlashList feel sluggish. I'd profile re-renders and list updates there. That said, nobody reads 20 wiki titles per second — production traffic is far lower — so the current tradeoff (correct merge/dedupe, pin-to-top, capped buffer) feels fair for this scope.

**Evolve the cache strategy.** Today REST data is cached **by page** per tab (`useInfiniteQuery` pages keyed by API request — see [cache-behavior.md](./docs/cache-behavior.md)). That maps cleanly onto Wikimedia's `rccontinue` pagination, but the same `rcid` can sit in multiple tab caches and live/REST merges happen at display time. As requirements or scale change, a better long-term shape is a **normalized cache keyed by item (`rcid`)**, with tab views as filtered projections — less duplication and simpler live prepend, at the cost of more custom cache logic than TanStack's infinite-query defaults.

**Other natural extensions:** E2E tests (Detox/Maestro), Zod validation on API responses, richer mock HTML for the detail WebView, and adaptive polling intervals based on tab activity or battery state.

---

## Configuration

Runtime settings live in the **Config** tab and persist to AsyncStorage. Defaults in [`mobile-app/constants/app-config.ts`](./mobile-app/constants/app-config.ts):

| Setting | Default | Purpose |
|---------|---------|---------|
| `refetchIntervalMs` | 90,000 | REST poll interval when Live is off |
| `pageSize` | 10 | REST `rclimit` |
| `streamBufferMax` | 100 | Max events in live SSE buffer |
| `maxListItems` | 200 | Max rows shown after merge |
| `tickMs` | 10,000 | Relative-time label refresh |
| `colorScheme` | `system` | Light / dark / system |
| `liveLogEnabled` | `true` in dev | `[WikiNow:Live]` console logs |

---

## License / attribution

Learning project for the NextMe Wikimedia take-home. Uses public Wikimedia REST and EventStreams APIs. Set `EXPO_PUBLIC_USER_AGENT` to a descriptive value before hitting production.
