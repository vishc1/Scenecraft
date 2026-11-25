# Scenecraft

Turns any topic into a cinematic 3D talk: every slide is a live world with a flying camera, an animated ocean and sky, click-through steps and speaker notes, all in one HTML file.

Scenecraft is a skill for Claude Code. It gives Claude a tested engine and an environment kit, so its effort goes into the story and the worlds, not the plumbing.

## Install

Clone this repository into your personal skills folder:

```sh
git clone https://github.com/vishc1/Scenecraft ~/.claude/skills/scenecraft
```

Then ask for a presentation that should feel like a film or a 3D game, or name the skill directly.

## What is inside

| Path | What it is |
|---|---|
| `SKILL.md` | The instructions Claude follows: story first, one visual idea per scene, build, look at every scene, publish |
| `assets/engine/` | The engine: camera moves per click, bloom and tone mapping, scene transitions, text and labels pinned to 3D points, speaker notes, presenter controls |
| `assets/engine/env.js` | The environment kit: ocean with waves and true reflections, six skies, islands, sea stacks, birds, sunrise blending |
| `assets/examples/starter-any-topic.js` | A working four-scene talk with placeholder text, its own colour theme and a custom sky |
| `assets/examples/example-scenes.js` | Three finished scenes from a real talk |
| `scripts/build.sh` | Assembles one HTML file from the engine and your scene files |
| `scripts/shot.sh`, `scripts/sheet.sh` | Render a still of any scene with headless Chromium, and tile four stills into one image |
| `references/` | The scene format, the environment options, and lessons learned |

## Try it without Claude

```sh
scripts/build.sh out/talk.html "Starter Talk" assets/examples/starter-any-topic.js
open out/talk.local.html
```

Right arrow or click advances, left arrow goes back, N shows speaker notes, O the overview, F full screen.

## Requirements

- A browser with WebGL2. The page loads three.js r128 from cdnjs and three typefaces from Google Fonts, so it needs a network connection.
- For `shot.sh`: a Chromium build (Playwright's cache, Google Chrome, or `CHROMIUM_PATH`). For `sheet.sh`: ffmpeg.

## Notes

- The figures in `example-scenes.js` were written from memory for a demonstration talk. Check them before reusing.
- The engine was verified with still renders on a software renderer. Frame rate depends on your GPU; ocean scenes draw the world twice for reflections.

## License

MIT. See `LICENSE`. three.js is MIT-licensed and is loaded from a CDN, not bundled.
