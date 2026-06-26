---
name: NextMe Wikimedia App
overview: Build an Expo React Native app showing live Wikimedia recent changes (tabbed list + WebView detail) using TanStack Query with REST polling as the default and an optional SSE "Live mode," plus a TypeScript mock server for deterministic edge-case testing.
todos:
  - id: scaffold
    content: Scaffold Expo app (Expo Router, TS), add TanStack Query provider + persistence, env config (EXPO_PUBLIC_*), and repo layout (/app, /mock-server)
    status: pending
  - id: data-layer
    content: Build typed recentchanges fetcher (User-Agent), useInfiniteQuery per tab with rccontinue cursor pagination + foreground refetchInterval
    status: pending
  - id: merge-util
    content: Implement pure mergeChanges(existing, incoming) dedupe/sort by rcid with unit tests
    status: pending
  - id: list-screen
    content: List screen with FlashList, segmented tabs (All / Articles ns0 / New pages), loading/empty/error/offline states, pull-to-refresh, freshness indicator
    status: pending
  - id: lifecycle
    content: Wire focusManager to AppState and onlineManager to NetInfo for background/foreground/connectivity handling
    status: pending
  - id: smooth-refresh
    content: Distinguish isLoading vs isFetching, keepPreviousData on tab/page change, stable keyExtractor to avoid flicker/blank
    status: pending
  - id: detail
    content: Detail WebView screen with own loading/error/retry and back behavior
    status: pending
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

# NextMe Wikimedia App — Implementation Plan

Full rationale lives in [v1/architecture.md](v1/architecture.md). This is the build plan.

## Confirmed decisions
- Data strategy: **REST polling default + optional foreground SSE "Live mode"** (mirrors Wikimedia's own "Live updates" button).
- Mock server: **in scope** for v1.
- Stack: Expo + Expo Router, TanStack Query, FlashList, react-native-webview; mock server in Express/Hono + TypeScript.

## Repo layout
- `/app` — Expo app
- `/mock-server` — TypeScript mock (REST + SSE + `/mock` scenario panel)
- Root README + AI_USAGE.md

## Core app design
- **Data layer:** typed `recentchanges` fetcher (descriptive `User-Agent`), `useInfiniteQuery` per tab keyed by `['recentchanges', tab]`, cursor pagination via `rccontinue`, head refresh via `refetchInterval` (foreground only).
- **Tabs:** All, Articles (ns 0), New pages (`rctype=new`). In-screen segmented control (light nav).
- **Correctness util:** pure `mergeChanges(existing, incoming)` — sort + dedupe by `rcid`; prepend newer, append older. Unit tested. This is the answer to the "shifting list" criterion (#4).
- **Lifecycle:** `focusManager` ↔ `AppState` (pause/resume + close SSE on background); `onlineManager` ↔ NetInfo (pause/resume on connectivity).
- **Smooth refresh (#3):** `isLoading` skeleton vs `isFetching` subtle indicator; `keepPreviousData` on tab/page changes; FlashList with `rcid` keyExtractor.
- **Offline (#5):** `PersistQueryClientProvider` + AsyncStorage; offline banner with `dataUpdatedAt` relative time; pull-to-refresh.
- **Live mode (optional):** per-screen toggle opening SSE (`experimental_streamedQuery`) only while foregrounded + opted in, client-filtered to active tab, capped via custom `reducer`.

## Detail screen
- `react-native-webview` to the page's canonical URL; own loading/error/retry; stack back behavior.

## Mock server
- `GET /w/api.php?...recentchanges` (matches real JSON incl. `continue.rccontinue`).
- `GET /v2/stream/recentchange` SSE.
- `/mock` panel: 1/sec, burst, slow network, 500, drop connection, duplicate/out-of-order ids, empty.
- App targets it via `EXPO_PUBLIC_API_BASE_URL`.

## Env config
- `EXPO_PUBLIC_*` in `.env` for API base URL; `app.config.ts` `extra` + `expo-constants` for structured config. No secrets bundled.

## Deliverables
- README: run steps, decisions/tradeoffs, freshness approach + how to evolve it, what was cut.
- AI_USAGE.md: tools, one acceleration, one caught mistake, a proud prompt.

## Build order (cut bottom-up if time runs short)
1. App scaffold + env + TanStack provider.
2. List screen, one tab end-to-end (polling + infinite scroll + states).
3. Remaining tabs + freshness indicator + smooth-refresh polish.
4. Detail WebView.
5. Offline persistence + banner; merge/dedupe util + tests.
6. Mock server + scenario panel.
7. SSE Live mode toggle.
8. README + AI_USAGE.md.