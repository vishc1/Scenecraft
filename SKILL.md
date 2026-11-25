---
name: scenecraft
description: Build a full-window, cinematic 3D presentation as one HTML page - every "slide" is a live three.js world (ocean, sky, islands, instanced geometry, bloom) with a camera that flies to a new position on each click, text and labels tracked to 3D points, transitions between scenes, and speaker notes. Use this whenever the user wants a presentation, talk, deck, keynote, pitch, explainer, lesson, or story on ANY topic that should feel like a film or a 3D game rather than flat slides - including when they say things like "make it insane", "most amazing presentation", "3D", "like a game", "cinematic", "WebGL", "immersive", "not boring slides", or point at an example of an animated 3D talk. Also use it to extend or restyle a talk that was built with this kit.
---

# Scenecraft

A kit for building a talk where each scene is a small 3D world and the argument is carried by what happens in that world. The engine, the environment (ocean, sky, islands, birds), the post-processing and the presenter controls are already written and tested, and none of it knows anything about a topic. Your job is the part that changes every time: the story, the visual metaphor for each scene, and the worlds themselves. It works the same for a science lesson, a product pitch, a history talk or a personal story.

The output is a single HTML file (about 50 KB of engine plus your scenes) that loads three.js r128 from cdnjs. It runs as a Claude artifact or from disk.

## When this is the right tool

Use it when the user wants spectacle and has a story to tell. If they need a deck they can edit, export to PowerPoint, or hand to a colleague, a normal slides tool is better: say so, and offer this only if they want the cinematic version too.

## Workflow

Work in a scratch folder. Copy nothing from the skill; reference it in place.

1. **Write the story as beats before any code.** List 8 to 14 scenes. For each: a title, the one idea, and 2 to 4 beats (a beat is one click; it reveals text and moves the world). Share the scene list with the user in a few lines and keep going unless the brief is unclear.
2. **Pick a visual metaphor per scene** (see "Choosing the world" below). This is the step that decides whether the talk is good. Spend real thought here.
3. **Pick the look once**: four theme colours in `THEME` (see `references/scene-api.md`), and a sky preset per scene so the talk has a time-of-day arc.
4. **Write scenes** in one or more `scenes-*.js` files. For each scene decide: reuse a world from the library (`WORLDS.name(...)`, thirteen of them, see `references/worlds.md`), adapt one by copying its code, or build a new world. Aim for a mix; a talk made only of library worlds looks like every other talk made with this kit, so design at least a few worlds for this subject. Copy `assets/examples/starter-any-topic.js` into your scratch folder as the starting point: it is a working four-scene talk with placeholder text (title, a list of numbers as towers, one-becomes-many, sunrise close), its own colour theme and a custom sky, so you can build and render it before changing anything. Then look at `assets/examples/example-scenes.js` for three finished scenes from a real talk, including a mechanism that changes on every beat. Read `references/scene-api.md` for the format and the helpers. The starter's four shapes are a floor, not a template for the whole talk: most scenes should be worlds you design for this subject.
5. **Build**: `scripts/build.sh out/talk.html "Talk Title" scenes-a.js scenes-b.js`
6. **Look at every scene** before showing anyone, and watch the important ones move with `scripts/gif.sh out/talk.local.html <sceneId> <beats> shots/x.gif`, which sweeps every beat into a GIF. Stills: `scripts/shot.sh out/talk.local.html <sceneId>.<beat> shots/x.png`, four at a time into `scripts/sheet.sh`. Fix what you see, rebuild, re-shoot. Check two scenes at phone size (`420,860`) and the plain startup path (`shot.sh page "" out.png`).
7. **Publish** the built file (as an artifact if that tool is available) and tell the user plainly what you verified and what you did not. Stills prove the scenes build and are framed; they do not prove motion, transitions or frame rate. Say that.

Read `references/lessons.md` before writing your first scene. It is a short list of the mistakes that cost the most time when this kit was built, each with its fix.

## Choosing the world

Each scene should show the idea happening, with real size, count or motion, so the audience could get the point with the sound off. Ask what physical thing behaves like the claim:

- **A quantity that grows**: a staircase where each step is one doubling; towers whose count jumps 1, 100, 10,000 as the camera rises; blocks that subdivide.
- **A sequence in time**: monoliths or beacons along a line that light up as the camera tracks past; pillars on a pier, one per year.
- **A mechanism or loop**: a machine with moving parts whose speed, count or brightness changes on each beat.
- **A comparison of scale**: a tower with markers near the base whose top is out of sight; a ruler you zoom out from.
- **A risk or dependency**: something heavy hanging from something thin.
- **A mood or a claim with no data**: let the environment carry it. A night sea under an eclipse to open, the same bay at sunrise to close, gives a talk an arc for free.

Use real numbers to drive geometry whenever the scene is about data (heights, counts, spacing), and put the source in a small label and in the speaker notes. Never invent a statistic or a quotation; if you do not have a figure, make the scene qualitative and label illustrative shapes as illustrative.

Give the talk rhythm: mix environment-led scenes with data scenes, vary the time of day, and include one scene in a different palette as the turning point.

Do not recreate another person's presentation scene for scene. If the user points at a reference, match its ambition and craft, and find your own metaphors.

## What a scene is

```js
SC.push({
  id:'stairs', title:'A staircase of doublings', kind:3,          // kind = transition into this scene (0-4)
  beats:[{dur:3, note:'What the presenter says on this click.'}, {dur:3, note:'...'}],
  layers:[{b:[0,1], z:'tl', h:'<p class="eb">The trend</p><h2>Headline</h2>'},   // text zones, visible on beats b[0]..b[1]
          {b:[1,1], z:'bl', h:'<p class="lede">Shown on the second click.</p>'}],
  tags:[{b:[0,1], c:'r', at:()=>[12,6,0], h:'<p class="lab hi">Label pinned to a 3D point</p>'}],
  cams:[{p:[-10,2,14],l:[8,5,0],f:40}, {p:[8,12,46],l:[16,6,0],f:40}, {p:[30,13,27],l:[24,9,0],f:40}],  // start pose, then one per beat
  shift:.15, drift:.3, bloom:1, scrimS:true,
  build({scene}){
    const env=K.env(scene,'dusk',{amp:.7});               // sky + ocean + reflections + islands' fog colour + birds
    /* add meshes, instanced meshes, lights, sprites */
    return {env, update(st,dt){ /* st.P[i] is the eased 0..1 progress of beat i; st.T is seconds in scene */ }};
  }
});
```

To reuse a library world instead of writing `cams` and `build`, spread it first and add your text: `SC.push({...WORLDS.gyro({labels:['Plan','Build','Measure','Learn']}), id:'cycle', title:'The cycle', kind:4, beats:[...], layers:[...]})`.

The engine blends the camera through `cams` as beats complete, projects `tags` every frame, fades text in and out, renders the mirror pass for water reflections when you return `env`, and runs bloom, tone mapping, grain and the transition. Full details and every helper are in `references/scene-api.md`.

## Standards to hold

- **Text must stay readable over the world.** Put the subject on one side with `shift` and the text on the other. Over busy or bright backgrounds add a scrim (`scrim`, `scrimL`, `scrimS`). If a label sits on a bright object, move the label.
- **Every beat should change the picture**, not only the text: a camera move, something lighting up, a count jumping.
- **Fill the frame with a place, not a void.** A scene in black space with one object reads as unfinished. Give it an environment, a horizon, a ground or a backdrop, and a few secondary details (islands, rocks, a lighthouse, birds, a moon). Users notice blank areas quickly.
- **Stay honest in the notes.** Speaker notes carry sources and the caveats ("arithmetic on a trend, not a forecast").
- **No flashing** faster than three times a second, and keep fast rotation small on screen.

## Reference files

- `references/scene-api.md`: the scene format, text zones and classes, camera and framing maths, the `K` helpers, HDR colour, instancing, transitions, the screenshot URL. Read before writing scenes.
- `references/worlds.md`: the thirteen ready-made worlds, their beats and labels, how to adapt one, and how to add your own to the library. Read when choosing worlds.
- `references/environment.md`: `K.env` options, the sky presets and how to add one, ocean level and wave height, islands, blending two skies for a sunrise, when not to use the ocean. Read when a scene needs a place.
- `references/lessons.md`: failure modes and fixes (overexposure, invisible water, tags off screen, black unlit objects against bright skies, patch scripts that silently fail). Read once at the start.
- `assets/examples/starter-any-topic.js`: a working, topic-neutral four-scene talk to start from.
- `assets/examples/gallery.js`: every library world in one talk, with placeholder text.
- `assets/examples/example-scenes.js`: three finished scenes from a real talk, to copy patterns from.
