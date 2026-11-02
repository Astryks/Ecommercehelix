# Daily Seminars — video production plan (NOT started; needs Sid's approval)

Scope: 46 seminars x 19 min = ~874 min narration (~2,700 words each, ~124k words total).
Engine: /workspace/reports/helix/teen-course/final/engine (build.py scene timeline, captions, wipes, SFX, render pipeline), reused as-is.

Per episode: script from curriculum.ts sections (intro 2, concepts 12, example 3, action/recap 2) -> TTS whole passages -> faster-whisper word check -> scenes reuse course chapters' props/scenes listed in `chapters` -> render 1080p -> upload to COURSE_VIDEO_BASE_URL/seminars/<id>.mp4.

## TTS cost estimate
| Option | Rate | 874 min | With ~1.7x re-rolls |
|---|---|---|---|
| Local Kokoro-82M (kokoro-onnx, box/Mac) | $0 | $0 | $0 (compute ~1-2 h CPU total) |
| Gemini 2.5 Pro TTS Algenib (current course voice, gcloud on Sid's Mac, credits) | ~US$0.03/min audio (~1.5k tokens/min @ $20/M) + negligible text | ~US$26 | ~US$45 (from existing ~US$300 credit cap) |
| Other cloud TTS (reference) | 1.5-3c/min | $13-26 | $22-45 |

Recommendation: keep the Algenib voice for consistency with the course (paid from existing Google credits, ~US$45), or Kokoro at $0 if Sid wants zero spend (voice will differ from the course).

## Time
- Script per episode: ~30-45 min agent (curriculum outline exists).
- Scenes: mostly reuse chapter scenes; ~45-75 min new scene code per episode.
- Render: ~15-25 min per 19-min video.
- Total: ~2-2.5 h/episode -> ~90-115 h for 46; first 14 (two weeks' buffer) ~30 h.
- Hosting: 46 x ~19 min 1080p ~ 46 x 400 MB ~ 18 GB; existing video base URL host TBD (open question).
