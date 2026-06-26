# AI Usage

I used **Cursor (Agent + Ask)** with Claude. Every line was reviewed, run, and tested before committing. The project was built step by step so each layer could be validated before moving on.

## Tools

**Cursor** — architecture discussion, implementation, mock-server scenarios, debugging, README/docs.

## Where AI clearly accelerated me

The **initial architecture discussion** ([`docs/architecture.md`](./docs/architecture.md)) was the most valuable step. I came in leaning streaming-first with TanStack `streamedQuery`. AI research on the Wikimedia APIs surfaced that the SSE firehose has **no server-side filtering** and is a poor default for mobile battery/network. That conversation settled the path: **REST polling default + optional foreground Live mode**, `useInfiniteQuery` for pagination, `streamedQuery` only when the user opts in — aligned with eval points #1–#4 in the challenge.

## Something wrong or suboptimal that I caught and fixed

Two issues surfaced only after adding **high-rate mock scenarios** (5–20 events/sec):

1. **`navigation.setOptions` on every stream tick** → React crash (`Maximum update depth exceeded`). Fixed by registering the header once and letting it subscribe via hooks.
2. **REST still refetching on tab switch during Live mode** → spurious "Updating…" UI. Fixed by suspending background REST fetches while live is on.

Both were real integration bugs — only easy to reproduce by running the app against the mock server’s high-rate scenarios. Building that mock tooling with AI was a worthwhile call for debugging.

## Prompt I'm proud of

Early session, before writing code — essentially: *"I have to complete challenge.md; let's discuss approach and architecture first. I want TanStack Query and streamedQuery — alternatives? How do I handle battery (#1), background/foreground (#2), smooth refresh (#3–#4)?"*  

Forcing eval-criteria framing up front produced [`architecture.md`](./docs/architecture.md) and kept later implementation focused instead of reactive.
