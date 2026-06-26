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
    content: List screen with FlashList, tabs (All / Articles ns0 / New pages), loading/empty/error states, pull-to-refresh, loaded count + freshness indicator
    status: completed
  - id: lifecycle
    content: Wire focusManager to AppState and onlineManager to NetInfo for background/foreground/connectivity handling
    status: completed
  - id: smooth-refresh
    content: Distinguish isLoading vs isFetching, keepPreviousData on tab/page change, stable keyExtractor to avoid flicker/blank
    status: in_progress
  - id: detail
    content: Detail WebView screen with own loading/error/retry and back behavior
    status: completed
  - id: offline
    content: Offline banner with dataUpdatedAt relative time (cache persistence already wired)
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

Full rationale lives in [architecture.md](./architecture.md). Cache details in [cache-behavior.md](./cache-behavior.md). This is the build plan and **current status tracker**.

**Last updated:** 2026-06-26

---

## Current project status

### Summary

The app is **feature-complete for the core flow**: three filtered tabs with live Wikimedia data, infinite scroll, polling, freshness metadata, and a WebView detail screen with sensible back behavior. Remaining work is polish (offline banner, merge util), mock server, live mode, and deliverables.

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
| Smooth refresh polish (`keepPreviousData`) | Partial |
| Offline banner | Not started |
| `mergeChanges` util + tests | Not started |
| Mock server implementation | Not started |
| SSE live mode | Not started |
| README / AI_USAGE.md | Not started |

### What exists today (`v1/mobile-app/`)

**Navigation**
- Expo Router stack: `(tabs)` → `detail`
- Bottom tabs: **All**, **Articles**, **New pages**
- Template boilerplate removed

**List screen (live API)**
- [`hooks/useRecentChanges.ts`](../mobile-app/hooks/useRecentChanges.ts) — `useInfiniteQuery` per tab, **90s** foreground poll (`REFETCH_INTERVAL_MS`), exposes `freshness` + `loadedCount`
- [`api/recent-changes.ts`](../mobile-app/api/recent-changes.ts) — fetcher with `User-Agent`, `rccontinue` pagination (50/page)
- [`constants/tabs.ts`](../mobile-app/constants/tabs.ts) — filters: All (none), Articles (`rcnamespace=0`), New pages (`rctype=new`)
- [`components/ChangesList.tsx`](../mobile-app/components/ChangesList.tsx) — loading, error, empty, pull-to-refresh, infinite scroll; `isLoading` vs `isFetching` split
- [`components/ChangesListHeader.tsx`](../mobile-app/components/ChangesListHeader.tsx) — **"X changes loaded"** + **"Updated Xm ago"** (or "Updating…" during refetch)
- [`types/feed-freshness.ts`](../mobile-app/types/feed-freshness.ts) — `FeedFreshness` + `mergeFeedFreshness()` ready for stream mode
- [`hooks/useRelativeTime.ts`](../mobile-app/hooks/useRelativeTime.ts) + [`lib/format-relative-time.ts`](../mobile-app/lib/format-relative-time.ts)
- [`lib/recent-changes.ts`](../mobile-app/lib/recent-changes.ts) — API mapping + basic page flatten/dedupe by `rcid`

> **Cache model:** per tab query → pages (one per API request), not per item. See [cache-behavior.md](./cache-behavior.md).

**Detail screen**
- [`app/detail.tsx`](../mobile-app/app/detail.tsx) — WebView, loading/error/retry, WebView-first back (hardware + header/swipe)

**Infrastructure**
- [`providers/QueryProvider.tsx`](../mobile-app/providers/QueryProvider.tsx) — `PersistQueryClientProvider` + devtools
- [`lib/query-client.ts`](../mobile-app/lib/query-client.ts) — defaults (`staleTime` 30s, `gcTime` 24h)
- [`lib/async-storage-persister.ts`](../mobile-app/lib/async-storage-persister.ts) — cache persistence (wired, no offline UI yet)
- [`lib/setup-query-managers.ts`](../mobile-app/lib/setup-query-managers.ts) — `focusManager` + `onlineManager`
- [`constants/env.ts`](../mobile-app/constants/env.ts) + [`app.config.ts`](../mobile-app/app.config.ts) + `.env.example`
- [`mock-server/`](../mock-server/) — empty placeholder (`.gitkeep`)

### Polling / refresh config

| Setting | Location | Value |
|---------|----------|-------|
| Poll interval | `hooks/useRecentChanges.ts` → `REFETCH_INTERVAL_MS` | 90s |
| Background polling | `refetchIntervalInBackground` | `false` |
| Stale time | `lib/query-client.ts` | 90s |
| Refetch on focus / reconnect | `lib/query-client.ts` | enabled |

### Not started yet

- Offline banner ("Offline — showing data from Xm ago") using `onlineManager` + persisted cache
- Full `mergeChanges` util + unit tests (basic dedupe in `flattenRecentChangesPages` only)
- `placeholderData: keepPreviousData` for explicit tab-switch smoothness
- Mock server (REST + SSE + `/mock` scenario panel)
- SSE live mode toggle (`streamedQuery` + `mergeFeedFreshness`)
- README + AI_USAGE.md

---

## Confirmed decisions

- **App name:** WikiNow
- **Data strategy:** REST polling default + optional foreground SSE "Live mode"
- **Mock server:** In scope for v1
- **Stack:** Expo + Expo Router, TanStack Query, FlashList, react-native-webview; mock server in Express/Hono + TypeScript
- **"Changes loaded"** = rows currently in the list (fetched pages), not a cumulative local database

---

## Repo layout (actual)

```
v1/
├── docs/
│   ├── architecture.md
│   ├── cache-behavior.md    ← TanStack Query cache model
│   └── plan.md              ← this file
├── mobile-app/              ← Expo app (WikiNow)
│   ├── app/
│   │   ├── (tabs)/          ← All, Articles, New pages
│   │   └── detail.tsx       ← WebView
│   ├── api/                 ← recent-changes fetcher
│   ├── components/          ← ChangesList, ChangesListHeader, ChangeListItem
│   ├── constants/           ← env.ts, tabs.ts
│   ├── hooks/               ← useRecentChanges, useRelativeTime
│   ├── lib/                 ← query-client, persister, mappers, format-relative-time
│   ├── providers/           ← QueryProvider
│   └── types/               ← recent-change, feed-freshness
└── mock-server/             ← empty placeholder (.gitkeep)
```

---

## Core app design (target vs actual)

| Design point | Status |
|--------------|--------|
| `useInfiniteQuery` + `rccontinue` pagination | Done |
| Server-side tab filters | Done |
| Foreground `refetchInterval` polling | Done |
| `mergeChanges` for shifting list | Partial (flatten dedupe only) |
| Freshness indicator | Done |
| Offline banner | Pending |
| Live SSE mode | Pending |

---

## Detail screen

- [x] `react-native-webview` to page URL
- [x] Loading / error / retry states
- [x] Sensible back behavior (WebView history before popping stack)

---

## Mock server (planned)

- `GET /w/api.php?...recentchanges` (matches real JSON incl. `continue.rccontinue`)
- `GET /v2/stream/recentchange` SSE
- `/mock` panel: 1/sec, burst, slow network, 500, drop connection, duplicate/out-of-order ids, empty
- App targets it via `EXPO_PUBLIC_API_BASE_URL`

---

## Env config

- [x] `EXPO_PUBLIC_*` in `.env` / `.env.example`
- [x] `app.config.ts` `extra` + [`constants/env.ts`](../mobile-app/constants/env.ts)
- Default API: `https://en.wikipedia.org` — override to mock server when ready

---

## Deliverables

- [x] Source code in git repository (in progress locally)
- [ ] README: run steps, decisions/tradeoffs, freshness approach, what was cut
- [ ] AI_USAGE.md

---

## Build order (cut bottom-up if time runs short)

1. ~~App scaffold~~ ✅
2. ~~List screen with real API~~ ✅
3. ~~Freshness indicator + loaded count~~ ✅
4. ~~Detail WebView~~ ✅
5. Offline banner; `mergeChanges` util + tests ← **next**
6. Smooth-refresh polish (`keepPreviousData`)
7. Mock server + scenario panel
8. SSE Live mode toggle
9. README + AI_USAGE.md

---

## Related docs

| Doc | Contents |
|-----|----------|
| [architecture.md](./architecture.md) | REST vs SSE strategy, eval criteria, stack decisions |
| [cache-behavior.md](./cache-behavior.md) | How TanStack Query caches per tab/page, timing, persistence, “changes loaded” semantics |
| [plan.md](./plan.md) | This file — status tracker and build order |

---

## Next up (recommended)

1. Offline banner wired to `onlineManager` + `freshness.lastUpdatedAt`
2. Extract `mergeChanges` util + unit tests for head-refresh / pagination correctness
3. Implement mock server in `mock-server/`
4. SSE live mode toggle using `mergeFeedFreshness`
5. README + AI_USAGE.md
