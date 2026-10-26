# Course videos: hosting and switching them on

The 41 course videos (Intro + chapters 1 to 40, about 14 GB) live on the build machine at
`/workspace/reports/helix/teen-course/final/Helix-*.mp4`. They are **not** in git.

Config: `src/lib/course-videos.ts` (`VIDEOS`, one entry per file). The Learn page (`/dashboard/learn`)
shows a "Course videos" player once `COURSE_VIDEO_BASE_URL` is set, or once an entry has its own `url`.

## Needs Sid's OK first (storage and bandwidth cost)
Vercel Blob is billed for storage and data transfer. 14 GB stored plus every play streamed costs money,
so nothing has been uploaded. Options: Vercel Blob (simplest), Cloudflare R2 (no egress fee), Bunny Stream, or YouTube unlisted.

## Steps (Vercel Blob)
1. Vercel dashboard > Storage > Create > Blob store, connect it to the ecommerce-helix project (adds `BLOB_READ_WRITE_TOKEN`).
2. Upload (from the machine with the files):
   ```bash
   cd /workspace/reports/helix/teen-course/final
   # check the exact flags with `npx vercel blob put --help` first
   for f in Helix-*.mp4; do npx vercel blob put "$f" --pathname "course/$f"; done
   ```
   (Or `@vercel/blob` `put("course/"+f, stream, { access: "public", addRandomSuffix: false })`.)
3. Copy the folder URL (e.g. `https://<id>.public.blob.vercel-storage.com/course`) into Vercel env
   `COURSE_VIDEO_BASE_URL` (Production + Preview), then redeploy.
4. Optional: re-encode to 720p H.264 first to cut size and bandwidth (`ffmpeg -i in.mp4 -vf scale=-2:720 -c:v libx264 -crf 26 -c:a aac -b:a 96k out.mp4`).
