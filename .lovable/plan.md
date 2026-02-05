
## What’s happening (root-cause hypotheses based on repo + backend behavior)
From the current implementation, **both “Preview never turns live” and “Watch player doesn’t load” can happen even when OBS shows LIVE**, mainly due to one or both of these:

1) **User is often streaming to an older stream key**
- The app currently allows creating many “draft” streams (started_at=null, ended_at=null).
- OBS commonly “remembers” the previous stream key. If OBS isn’t updated to the newest key, it will show LIVE with bitrate, but the *new* stream’s playbackId will never become active, so preview stays “Waiting for OBS” and Watch never transitions to playback.

2) **Live detection is too strict / wrong signal**
- `check-stream-status` currently treats Livepeer `isActive` as the only truth.
- In practice, Livepeer can show ingest activity via `lastSeen` even when `isActive` is false (or delayed).
- When `useLivepeerStatus` never receives `isActive: true`, Watch stays in `waiting`, and `VideoPlayer` refuses to initialize playback (it only initializes when `streamPhase === 'live'`).

## Goal
Make the Go Live flow “boringly reliable”:
- Streamer cannot accidentally create multiple drafts and then stream to the wrong key.
- Preview flips to “Signal detected” quickly.
- Watch page starts playing automatically as soon as HLS becomes available (no refresh).
- Clear error messaging when OBS is misconfigured.

## Implementation plan (safe + incremental)

### Phase 1 — Fix the “wrong stream key” footgun (most likely cause)
**Change: `create-stream` edge function should reuse an existing draft stream for the same user instead of always creating a new one.**

1. In `supabase/functions/create-stream/index.ts`:
   - Before creating a new Livepeer stream, query `streams` for the current user:
     - Find an “active draft” stream: `streamer_id = auth.uid()`, `ended_at is null`, `is_live = false`, and optionally `started_at is null`.
   - If a draft stream exists:
     - Return that stream’s existing `playback_id`, `playback_url`, `livepeer_stream_id`
     - Retrieve the key securely via `supabase.rpc("get_my_stream_key", { p_stream_id: existingStream.id })` using the **user-context** supabase client (not service role).
     - Return the same RTMP URL + key to the UI.
   - Only if no draft exists: proceed with current behavior (create Livepeer stream + insert DB row + store key).

2. In `src/pages/GoLive.tsx`:
   - Update UI copy after “Stream Ready” to clearly warn:
     - “If OBS was previously configured, it may still be using an old key. Paste THIS key, then stop/start streaming.”
   - Optionally add a small “Using existing stream credentials” indicator when `create-stream` returns a reused stream.

**Why this solves it:** Streamers can click “Create Stream” multiple times, but they’ll keep seeing the same key until they end the stream, so OBS won’t silently stream to the wrong place.

---

### Phase 2 — Make live detection reflect real ingest + HLS readiness
**Change: improve `check-stream-status` so it detects ingest quickly and doesn’t depend solely on `isActive`.**

1. In `supabase/functions/check-stream-status/index.ts`:
   - Parse `lastSeen` from Livepeer `/stream/{id}` response.
   - Determine `hasRecentSignal`:
     - `now - lastSeen < 20_000ms` (tunable)
   - Compute `ingestActive = (isActive === true) OR hasRecentSignal`
   - Add an additional lightweight “HLS manifest reachable” check:
     - `fetch(playbackUrl)` with a short timeout (3–5s)
     - If `200` and contains `#EXTM3U` (and not `#EXT-X-ERROR`), treat `hlsReady = true`
   - Return both:
     - `ingestActive`, `hlsReady`
     - Keep `isActive` as **hlsReady** (so the player only flips to “live playback” when ready), and set `phase` to one of:
       - `waiting` (no signal)
       - `ingesting` (signal present, HLS not ready yet)
       - `live` (HLS ready)

2. Update `src/hooks/useLivepeerStatus.ts` to handle the new semantics:
   - If `phase === 'ingesting'`: keep polling (do not stop).
   - Only stop polling when `phase === 'live'` or stream ended.
   - Surface `phase` and optionally `meta.lastSeen` for debug UI.

**Why this solves it:** The UI can show “OBS connected” fast, then “Starting playback…” until the manifest becomes available, then play without refresh.

---

### Phase 3 — Make the UI resilient even if polling is flaky
**Change: avoid “waiting state blocks playback forever.”**

1. `src/pages/Watch.tsx`
   - Adjust `getStreamPhase()` logic:
     - If `livepeerStatus.phase === 'ingesting'`, treat it as a distinct visible state (e.g., “STARTING (signal detected)”).
     - If `stream.playback_id` exists and `livepeerStatus.phase` is unknown, still allow the player to attempt initialization with a “Starting…” overlay (not a hard “waiting”).

2. `src/components/VideoPlayer.tsx`
   - Allow initializing playback not only in `streamPhase === 'live'`, but also in `streamPhase === 'waiting'`/`ingesting` with safe retry behavior:
     - Add an internal “attempt playback” loop if manifest is 404/stream-not-ready.
     - Keep user-friendly overlay until manifest parses.
   - Ensure no stream key or sensitive info is logged.

3. `src/components/TestStreamPreview.tsx`
   - Display a tiny non-sensitive debug line (behind `import.meta.env.DEV`) showing:
     - “Signal: detected / not detected”
     - “Last seen: Xs ago”
     - “HLS: ready / not ready”
   - This makes it immediately obvious if OBS is hitting the wrong key.

---

### Phase 4 — Add minimal end-to-end verification steps (so we don’t guess)
After implementing, we’ll verify with one controlled run:

1. Go Live → Create Stream (should reuse draft if clicked repeatedly)
2. Paste RTMP + key into OBS
3. Start Streaming
4. Go Live page should show:
   - “Signal detected” within ~3–10s
   - “Playback ready” within ~10–30s (varies)
5. Click Go Live → Watch page should auto-play without refresh

If something still fails, we’ll use:
- Supabase Edge Function logs for `create-stream` and `check-stream-status`
- Network request inspection to confirm the client is calling the correct function and passing `stream_id` + `playback_id`

## Files we will change
- `supabase/functions/create-stream/index.ts` (reuse existing draft + return existing key securely)
- `supabase/functions/check-stream-status/index.ts` (ingest + HLS readiness phases)
- `src/hooks/useLivepeerStatus.ts` (handle `ingesting` vs `live`)
- `src/pages/GoLive.tsx` (clearer messaging; show “reused credentials”)
- `src/pages/Watch.tsx` (phase mapping updates)
- `src/components/VideoPlayer.tsx` (optional: initialize during ingesting/waiting with retries)
- `src/components/TestStreamPreview.tsx` (dev-only diagnostics)

## Risks / edge cases handled
- Multiple draft streams per user: fixed by reuse logic.
- OBS streaming with old key: mitigated by stable credentials + clearer messaging.
- HLS manifest delay: handled via “ingesting” phase + readiness probing + player retry.
- Security: stream keys are only retrieved via `get_my_stream_key` (owner-only), never logged, never exposed publicly.

