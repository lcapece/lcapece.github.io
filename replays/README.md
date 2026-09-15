# Replay clips (web)

Toy-soldier play replays served from here as `rep-*.mp4` (plan §6). Web plays
these by URL — do NOT `require()` them (OOM lesson from the jumbotron library).

Scene ids and briefs: see `src/ui/replayScenes.ts` (REPLAY_SCENES). Ship order:
the 8 `hero: true` scenes first. As each real render lands, add its id to
`SHIPPED_REPLAY_IDS` in that file so playback switches from the jumbotron
placeholder to the real clip. Spec: 1280×720, H.264, 24fps, 5–10s, ≤2.5 MB.
