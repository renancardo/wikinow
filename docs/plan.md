---
name: WikiNow (NextMe Wikimedia App)
overview: Build an Expo React Native app showing live Wikimedia recent changes (tabbed list + WebView detail) using TanStack Query with REST polling as the default and an optional SSE "Live mode," plus a TypeScript mock server for deterministic edge-case testing.
todos:
  - id: scaffold
    content: Scaffold Expo app (Expo Router, TS), add TanStack Query provider + persistence, env config (EXPO_PUBLIC_*), and repo layout (mobile-app/, mock-server/)
    status: completed
  - id: data-layer
    content: Build typed recentchanges fetcher (User-Agent), useInfiniteQuery per tab with rccontinue cursor pagination + foreground refetchInterval
    status: completed
  - id: merge-util
    content: Implement pure mergeChanges(existing, incoming) dedupe/sort by rcid with unit tests
    status: completed
  - id: list-screen
    content: List screen with FlashList, tabs (All / Articles ns0 / New pages), loading/empty/error states, pull-to-refresh, loaded count + freshness indicator
    status: completed
  - id: lifecycle
    content: Wire focusManager to AppState and onlineManager to NetInfo for background/foreground/connectivity handling
    status: completed
  - id: smooth-refresh
    content: Distinguish isLoading vs isFetching, keepPreviousData on tab/page change, stable keyExtractor to avoid flicker/blank
    status: completed
  - id: detail
    content: Detail WebView screen with own loading/error/retry and back behavior
    status: completed
  - id: offline
    content: Offline banner with dataUpdatedAt relative time (cache persistence already wired)
    status: completed
  - id: live-mode
    content: Optional foreground-only SSE Live mode toggle (streamedQuery + mergeFeedFreshness + XHR on native)
    status: completed
  - id: app-config
    content: Config tab with persisted app settings (polling, page size, theme, live debug logs, list caps)
    status: completed
  - id: mock-server
    content: "TypeScript mock server: REST + SSE endpoints + /mock scenario panel (1/sec, burst, 500, drop, duplicate/out-of-order, empty)"
    status: completed
  - id: docs
    content: Write README (run/decisions/freshness/cuts) and AI_USAGE.md
    status: completed
isProject: false
---

# WikiNow — Implementation Plan

Full rationale lives in [architecture.md](./architecture.md). Cache details in [cache-behavior.md](./cache-behavior.md). Live mode details in [live-mode.md](./live-mode.md). This is the build plan and **current status tracker**.

**Last updated:** 2026-06-26

---

## Current project status

### Summary

The **mobile app is feature-complete** for the take-home core. The **mock server** is implemented. **README** and **AI_USAGE.md** are in `/`.

| Area | Status |
|------|--------|
| Expo app scaffold | Done |
| TanStack Query + persistence | Done |
| Env config (`EXPO_PUBLIC_*`) | Done |
| Lifecycle managers (focus/online) | Done |
| Wikimedia API + `useRecentChanges` | Done |
| List UI (FlashList, states, pull-to-refresh) | Done |
| Loaded count + freshness indicator | Done |
| Detail WebView + back behavior | Done |
| Offline banner | Done |
| `mergeChanges` util + tests | Done |
| Smooth refresh (`keepPreviousData`, scroll stability) | Done |
| SSE live mode (global toggle, `streamedQuery`) | Done |
| Config tab + persisted `AppConfig` | Done |
| Theme (system / light / dark) | Done |
| Mock server implementation | Done |
| README / AI_USAGE.md | Done ([`../README.md`](../README.md), [`../AI_USAGE.md`](../AI_USAGE.md)) |

### What exists today (`mobile-app/`)

**Navigation**
- Expo Router stack: `(tabs)` → `detail`
- Bottom tabs: **All**, **Articles**, **New pages**, **Config**
- Global **Live** toggle in list tab headers (not on Config tab)

**List screen**
- [`hooks/useRecentChangesWithLive.ts`](../mobile-app/hooks/useRecentChangesWithLive.ts) — merges REST + live stream, caps list length, freshness merge
- [`hooks/useRecentChanges.ts`](../mobile-app/hooks/useRecentChanges.ts) — `useInfiniteQuery` per tab; polling interval from config
- [`api/recent-changes.ts`](../mobile-app/api/recent-changes.ts) — fetcher with `User-Agent`, `rccontinue` pagination (`pageSize` from config)
- [`lib/recent-changes/map-wiki-change.ts`](../mobile-app/lib/recent-changes/map-wiki-change.ts) — Wiki REST → `RecentChange`
- [`lib/recent-changes/merge-changes.ts`](../mobile-app/lib/recent-changes/merge-changes.ts), [`lib/recent-changes/flatten-pages.ts`](../mobile-app/lib/recent-changes/flatten-pages.ts)
- [`constants/tabs.ts`](../mobile-app/constants/tabs.ts) — All, Articles (`rcnamespace=0`), New pages (`rctype=new`)
- [`components/ChangesList.tsx`](../mobile-app/components/ChangesList.tsx) — FlashList, live pin-to-top, `maintainVisibleContentPosition`
- [`components/ChangesListHeader.tsx`](../mobile-app/components/ChangesListHeader.tsx) — loaded count + freshness (`api` / `stream` / `cache`)
- [`components/OfflineBanner.tsx`](../mobile-app/components/OfflineBanner.tsx)

**Live mode**
- [`providers/LiveModeProvider.tsx`](../mobile-app/providers/LiveModeProvider.tsx) — global state + `experimental_streamedQuery`
- [`api/recent-change-stream.ts`](../mobile-app/api/recent-change-stream.ts) — SSE via `fetch`+`ReadableStream` (web) or `XMLHttpRequest` (native)
- [`lib/live/stream-events.ts`](../mobile-app/lib/live/stream-events.ts) — filter + map
- [`lib/live/transport/connect.ts`](../mobile-app/lib/live/transport/connect.ts), [`lib/live/transport/sse-parser.ts`](../mobile-app/lib/live/transport/sse-parser.ts)
- [`lib/live/stream-query.ts`](../mobile-app/lib/live/stream-query.ts)
- [`lib/recent-changes/matches-tab-filter.ts`](../mobile-app/lib/recent-changes/matches-tab-filter.ts) — tab filter applied on merge
- [`components/LiveToggle.tsx`](../mobile-app/components/LiveToggle.tsx)

**Config**
- [`app/(tabs)/settings.tsx`](../mobile-app/app/(tabs)/settings.tsx) → [`components/ConfigScreen.tsx`](../mobile-app/components/ConfigScreen.tsx)
- [`constants/app-config.ts`](../mobile-app/constants/app-config.ts) — defaults + field metadata
- [`providers/AppConfigProvider.tsx`](../mobile-app/providers/AppConfigProvider.tsx) — AsyncStorage persistence
- [`lib/config/app-config-store.ts`](../mobile-app/lib/config/app-config-store.ts) — runtime snapshot for non-React code (API, logs, stream reducer)

**Detail screen**
- [`app/detail.tsx`](../mobile-app/app/detail.tsx) — WebView, loading/error/retry, WebView-first back

**Infrastructure**
- [`providers/QueryProvider.tsx`](../mobile-app/providers/QueryProvider.tsx) — persistence; live stream query excluded from dehydrate
- [`lib/query/query-client.ts`](../mobile-app/lib/query/query-client.ts), [`lib/query/async-storage-persister.ts`](../mobile-app/lib/query/async-storage-persister.ts)
- [`lib/query/setup-query-managers.ts`](../mobile-app/lib/query/setup-query-managers.ts) — `focusManager` (initial `AppState`) + `onlineManager`
- [`constants/env.ts`](../mobile-app/constants/env.ts), [`components/useColorScheme.ts`](../mobile-app/components/useColorScheme.ts) — theme from config or system

**Tests** (colocated under `lib/`) — `recent-changes/merge-changes`, `recent-changes/flatten-pages`, `recent-changes/matches-tab-filter`, `live/stream-events`, `live/transport/sse-parser`, `config/app-config`

> **Cache model:** per tab query → pages (one per API request), not per item. Live stream is a separate query merged at display time. See [cache-behavior.md](./cache-behavior.md).

### Runtime config (Config tab)

Defaults in [`constants/app-config.ts`](../mobile-app/constants/app-config.ts). Persisted under `wikinow-app-config`.

| Setting | Default | Used for |
|---------|---------|----------|
| `colorScheme` | `system` | App theme (system / light / dark) |
| `streamBufferMax` | 100 | Max enwiki events in live SSE query buffer |
| `pageSize` | 10 | REST `rclimit` per page |
| `refetchIntervalMs` | 90,000 | REST poll interval when live off |
| `tickMs` | 10,000 | Relative-time label refresh |
| `liveLogEnabled` | `true` in `__DEV__` | `[WikiNow:Live]` console logs |
| `maxListItems` | 200 | Max rows in combined FlashList |

Global TanStack defaults (`staleTime` 90s, `gcTime` 24h) remain in [`lib/query/query-client.ts`](../mobile-app/lib/query/query-client.ts).

### Not started yet

_(none — v1 deliverables complete)_

---

## Mock server takeaway

High-rate steady scenarios (`steady-5`, `steady-10`, `steady-20`) exposed two mobile-app bugs that are hard to reproduce against production Wikimedia:

1. **Navigation header crash** — `navigation.setOptions` on every stream tick caused `Maximum update depth exceeded` at 10+/sec. Fixed with `ChangesScreenHeaderContainer` (header registers once; data via hooks).
2. **REST during Live on tab switch** — only polling was disabled; mount/focus refetches still ran and showed "Updating…". Fixed by suspending REST fetches during `liveMode` and suppressing the updating UI except on pull-to-refresh.

Full write-up: [README § Mock server takeaway](../README.md#mock-server-takeaway).

---

## Confirmed decisions

- **App name:** WikiNow
- **Data strategy:** REST polling default + optional foreground SSE "Live mode" (implemented)
- **Live toggle:** Global, in tab header; one SSE connection; tab filters applied client-side on merge
- **Native SSE transport:** `XMLHttpRequest` + `onprogress` (React Native `fetch` does not stream SSE)
- **Mock server:** Implemented in `mock-server/` — see [mock-server.md](./mock-server.md)
- **Stack:** Expo + Expo Router, TanStack Query, FlashList, react-native-webview
- **"Changes loaded"** = rows currently shown in the list (after merge + `maxListItems` cap)

---

## Repo layout (actual)

```
/
├── README.md
├── AI_USAGE.md
├── docs/
│   ├── architecture.md
│   ├── cache-behavior.md
│   ├── live-mode.md
│   ├── mock-server.md
│   └── plan.md              ← this file
├── mobile-app/
│   ├── app/
│   │   ├── (tabs)/          ← All, Articles, New pages, Config
│   │   └── detail.tsx
│   ├── api/                 ← recent-changes, recent-change-stream
│   ├── components/          ← ChangesList, LiveToggle, ConfigScreen, …
│   ├── constants/           ← env.ts, tabs.ts, app-config.ts, Colors.ts
│   ├── hooks/               ← useRecentChanges, useRecentChangesWithLive, …
│   ├── lib/
│   │   ├── config/          ← app-config-store
│   │   ├── query/           ← query-client, persistence, focus/online managers
│   │   ├── recent-changes/  ← merge, flatten, map-wiki-change, tab filter
│   │   ├── live/            ← transport/, stream-events, stream-query, log
│   │   └── utils/           ← change-type map, format-relative-time
│   ├── providers/           ← QueryProvider, AppConfigProvider, LiveModeProvider
│   └── types/               ← recent-change, feed-freshness, stream-recent-change, wiki-recent-change
└── mock-server/             ← Hono REST + SSE + /mock panel (see mock-server/README.md)
```

---

## Core app design (target vs actual)

| Design point | Status |
|--------------|--------|
| `useInfiniteQuery` + `rccontinue` pagination | Done |
| Server-side tab filters | Done |
| Foreground `refetchInterval` polling (configurable) | Done |
| `mergeChanges` for shifting list | Done |
| Offline banner + cache persistence | Done |
| Live SSE mode (`streamedQuery` + `mergeFeedFreshness`) | Done |
| Runtime config UI | Done |

---

## Mock server (implemented)

See [mock-server.md](./mock-server.md) and [`mock-server/README.md`](../mock-server/README.md).

- `GET /w/api.php?...recentchanges` — paginated REST with `continue.rccontinue`
- `GET /v2/stream/recentchange` — SSE live stream
- `/mock` panel — steady (1/5/10/20 per sec), burst, 500, drop, duplicate/out-of-order, empty, canary
- App targets it via `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_STREAM_BASE_URL`

---

## Env config

- [x] `EXPO_PUBLIC_*` in `.env` / `.env.example`
- [x] `app.config.ts` `extra` + [`constants/env.ts`](../mobile-app/constants/env.ts)
- Default API: `https://en.wikipedia.org`; stream: `https://stream.wikimedia.org`

---

## Deliverables

- [x] Source code in git repository (in progress locally)
- [x] README: run steps, decisions/tradeoffs, freshness approach, what was cut — [`../README.md`](../README.md)
- [x] AI_USAGE.md — [`../AI_USAGE.md`](../AI_USAGE.md)

---

## Build order (cut bottom-up if time runs short)

1. ~~App scaffold~~ ✅
2. ~~List screen with real API~~ ✅
3. ~~Freshness indicator + loaded count~~ ✅
4. ~~Detail WebView~~ ✅
5. ~~Offline banner + `mergeChanges`~~ ✅
6. ~~Smooth-refresh polish~~ ✅
7. ~~SSE Live mode toggle~~ ✅
8. ~~Config tab + persisted settings~~ ✅
9. ~~Mock server + scenario panel~~ ✅
10. ~~README + AI_USAGE.md~~ ✅

---

## Related docs

| Doc | Contents |
|-----|----------|
| [architecture.md](./architecture.md) | REST vs SSE strategy, eval criteria, stack decisions |
| [cache-behavior.md](./cache-behavior.md) | TanStack cache model, live stream query, config-driven timing |
| [live-mode.md](./live-mode.md) | Live mode architecture, transport, lifecycle, acceptance criteria |
| [mock-server.md](./mock-server.md) | Mock server plan and integration checklist |
| [plan.md](./plan.md) | This file — status tracker |
| [../README.md](../README.md) | Run instructions, decisions, freshness, mock takeaway |
| [../AI_USAGE.md](../AI_USAGE.md) | AI tool usage disclosure |

---

## Next up (recommended)

All v1 deliverables are complete. Optional follow-ups:

1. Automated E2E against mock server scenarios
2. Update [mock-server.md](./mock-server.md) scenario table with 5/10/20 per sec entries
3. Zod validation on API responses
