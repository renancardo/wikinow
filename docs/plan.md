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
    status: pending
  - id: list-screen
    content: List screen with FlashList, tabs (All / Articles ns0 / New pages), loading/empty/error/offline states, pull-to-refresh, freshness indicator
    status: in_progress
  - id: lifecycle
    content: Wire focusManager to AppState and onlineManager to NetInfo for background/foreground/connectivity handling
    status: completed
  - id: smooth-refresh
    content: Distinguish isLoading vs isFetching, keepPreviousData on tab/page change, stable keyExtractor to avoid flicker/blank
    status: pending
  - id: detail
    content: Detail WebView screen with own loading/error/retry and back behavior
    status: completed
  - id: offline
    content: Persist cache to AsyncStorage, offline banner with dataUpdatedAt relative time
    status: pending
  - id: mock-server
    content: "TypeScript mock server: REST + SSE endpoints + /mock scenario panel (1/sec, burst, slow, 500, drop, duplicate/out-of-order, empty)"
    status: pending
  - id: live-mode
    content: Optional foreground-only SSE Live mode toggle using experimental_streamedQuery with capped custom reducer
    status: pending
  - id: docs
    content: Write README (run/decisions/freshness/cuts) and AI_USAGE.md
    status: pending
isProject: false
---

# WikiNow — Implementation Plan

Full rationale lives in [architecture.md](./architecture.md). This is the build plan and **current status tracker**.

**Last updated:** 2026-06-26

---

## Current project status

### Summary

The **UI shell and navigation** are in place. **Real Wikimedia API integration** is live on all three tabs with server-side filters, infinite scroll, and foreground polling. Offline banner and live mode still ahead.

| Area | Status |
|------|--------|
| Expo app scaffold | Done |
| TanStack Query + persistence | Done |
| Env config (`EXPO_PUBLIC_*`) | Done |
| Lifecycle managers (focus/online) | Done |
| Wikimedia API + `useRecentChanges` | Done |
| Tab screens + FlashList (live data) | Done |
| Detail WebView | Done |
| Mock server implementation | Not started |
| Offline banner / live mode | Not started |
| README / AI_USAGE.md | Not started |

### What exists today (`v1/mobile-app/`)

**Navigation**
- Expo Router stack: `(tabs)` → `detail`
- Bottom tabs: **All**, **Articles**, **New pages** (`app/(tabs)/index.tsx`, `articles.tsx`, `new-pages.tsx`)
- Template boilerplate removed (`EditScreenInfo`, `modal`, second default tab)

**List screen (live API)**
- [`hooks/useRecentChanges.ts`](../mobile-app/hooks/useRecentChanges.ts) — `useInfiniteQuery` per tab, 20s foreground refetch
- [`api/recent-changes.ts`](../mobile-app/api/recent-changes.ts) — fetcher with `User-Agent`, `rccontinue` pagination
- [`constants/tabs.ts`](../mobile-app/constants/tabs.ts) — filters: All (none), Articles (`rcnamespace=0`), New pages (`rctype=new`)
- [`components/ChangesList.tsx`](../mobile-app/components/ChangesList.tsx) — loading, error, empty, pull-to-refresh, infinite scroll

**Detail screen**
- [`app/detail.tsx`](../mobile-app/app/detail.tsx):
  - WebView with loading spinner, error + retry
  - Sensible back: WebView history first (Android `BackHandler`, header/swipe via `beforeRemove`)
  - `setSupportMultipleWindows={false}` so in-page links build history
  - iOS `allowsBackForwardNavigationGestures`

**Scaffold / data layer foundation**
- [`providers/QueryProvider.tsx`](../mobile-app/providers/QueryProvider.tsx) — `PersistQueryClientProvider` + devtools
- [`lib/query-client.ts`](../mobile-app/lib/query-client.ts) — shared `QueryClient` defaults
- [`lib/async-storage-persister.ts`](../mobile-app/lib/async-storage-persister.ts) — cache persistence
- [`lib/setup-query-managers.ts`](../mobile-app/lib/setup-query-managers.ts) — `focusManager` + `onlineManager`
- [`constants/env.ts`](../mobile-app/constants/env.ts) — typed `env.apiBaseUrl`, `env.streamBaseUrl`, `env.userAgent`
- [`app.config.ts`](../mobile-app/app.config.ts) + [`.env.example`](../mobile-app/.env.example) — `EXPO_PUBLIC_*` vars
- [`mock-server/`](../mock-server/) — empty placeholder (`.gitkeep`)

**Packages installed and wired:**
- `@tanstack/react-query`, `@tanstack/react-query-persist-client`, `@tanstack/query-async-storage-persister`
- `@react-native-async-storage/async-storage`, `@react-native-community/netinfo`
- `@shopify/flash-list`, `react-native-webview`
- `@dev-plugins/react-query` (dev)

### Not started yet

- `mergeChanges` dedupe util + unit tests (basic flatten dedupe in place)
- Offline banner with `dataUpdatedAt` relative time
- Freshness indicator ("Updated X ago")
- Mock server implementation (REST + SSE + scenario panel)
- SSE live mode toggle
- Project README + AI_USAGE.md

---

## Confirmed decisions

- **App name:** WikiNow
- **Data strategy:** REST polling default + optional foreground SSE "Live mode" (mirrors Wikimedia's "Live updates" button).
- **Mock server:** In scope for v1.
- **Stack:** Expo + Expo Router, TanStack Query, FlashList, react-native-webview; mock server in Express/Hono + TypeScript.

---

## Repo layout (actual)

```
v1/
├── docs/
│   ├── architecture.md
│   └── plan.md              ← this file
├── mobile-app/              ← Expo app (WikiNow)
│   ├── app/
│   │   ├── (tabs)/          ← All, Articles, New pages
│   │   └── detail.tsx       ← WebView
│   ├── components/
│   ├── data/                ← dummy-changes.ts (temporary)
│   ├── api/                 ← recent-changes fetcher
│   ├── hooks/               ← useRecentChanges
│   ├── constants/           ← env.ts, tabs.ts
│   ├── lib/                 ← query-client, persister, managers, mappers
│   ├── providers/           ← QueryProvider
│   └── types/
└── mock-server/             ← empty placeholder (.gitkeep)
```

---

## Core app design (target)

- **Data layer:** typed `recentchanges` fetcher (descriptive `User-Agent`), `useInfiniteQuery` per tab keyed by `['recentchanges', tab]`, cursor pagination via `rccontinue`, head refresh via `refetchInterval` (foreground only).
- **Tabs:** All, Articles (ns 0), New pages (`rctype=new`). Currently bottom tabs; segmented control remains an optional UX tweak.
- **Correctness util:** pure `mergeChanges(existing, incoming)` — sort + dedupe by `rcid`; prepend newer, append older. Unit tested.
- **Lifecycle:** `focusManager` ↔ `AppState` (pause/resume + close SSE on background); `onlineManager` ↔ NetInfo (pause/resume on connectivity).
- **Smooth refresh (#3):** `isLoading` skeleton vs `isFetching` subtle indicator; `keepPreviousData` on tab/page changes; FlashList with `rcid` keyExtractor (keyExtractor already in place).
- **Offline (#5):** `PersistQueryClientProvider` + AsyncStorage; offline banner with `dataUpdatedAt` relative time; pull-to-refresh.
- **Live mode (optional):** per-screen toggle opening SSE (`experimental_streamedQuery`) only while foregrounded + opted in, client-filtered to active tab, capped via custom `reducer`.

---

## Detail screen

- [x] `react-native-webview` to page URL
- [x] Loading / error / retry states
- [x] Sensible back behavior (WebView history before popping stack)

---

## Mock server (planned)

- `GET /w/api.php?...recentchanges` (matches real JSON incl. `continue.rccontinue`).
- `GET /v2/stream/recentchange` SSE.
- `/mock` panel: 1/sec, burst, slow network, 500, drop connection, duplicate/out-of-order ids, empty.
- App targets it via `EXPO_PUBLIC_API_BASE_URL`.

---

## Env config

- [x] `EXPO_PUBLIC_*` in `.env` / `.env.example`
- [x] `app.config.ts` `extra` + [`constants/env.ts`](../mobile-app/constants/env.ts)
- Default API: `https://en.wikipedia.org` — override to mock server when ready

---

## Deliverables

- [ ] Source code in git repository
- [ ] README: run steps, decisions/tradeoffs, freshness approach, what was cut
- [ ] AI_USAGE.md

---

## Build order (cut bottom-up if time runs short)

1. ~~App scaffold~~ ✅
2. ~~List screen with real API~~ ✅
3. Freshness indicator + smooth-refresh polish ← **next**
4. ~~Detail WebView~~ ✅
5. Offline banner; merge/dedupe util + tests
6. Mock server + scenario panel
7. SSE Live mode toggle
8. README + AI_USAGE.md

---

## Next up (recommended)

1. Add freshness indicator (`dataUpdatedAt`) and offline banner
2. Extract `mergeChanges` util + unit tests for shifting-list correctness
3. Implement mock server in `mock-server/`
4. SSE live mode toggle
