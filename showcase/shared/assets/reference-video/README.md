# Video preview fixture

Own generated silent test pattern, not third-party product media. Used to verify
actual decoding, playback, completion and release without an external service.
640×360, 24 fps, 6 seconds, H.264/yuv420p MP4, no audio.

```sh
ffmpeg -f lavfi -i 'testsrc2=size=640x360:rate=24' -t 6 -an -c:v libx264 -pix_fmt yuv420p -crf 30 -movflags +faststart preview.mp4
```

The adjacent visible description is the equivalent text for this silent pattern.
This is not evidence of subtitle selection or audio accessibility. Products must
supply captions/transcripts for their actual media and validate their player host.
The malformed data URI in the preview intentionally triggers a real decoder error
so the retry path uses actual media state instead of a mocked failure message.
