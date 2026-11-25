# Scene API

Contents: files and load order · theme · scene fields · beats and state · text layers · tags · cameras and framing · the K helpers · colour and brightness · instancing · custom shaders · transitions · presenter controls · the screenshot URL

## Files and load order

`build.sh` concatenates, inside one script tag: `kit.js`, `env.js`, the world library `worlds.js`, then your scene files in the order given, then `engine.js` in a second tag. Everything shares one global scope. Scene order in the talk is the order of `SC.push` calls.

Your scene files can define their own top-level `const` helpers. Names already taken: `SC, THEME, INK, PAPER, EMBER, ICE, L, hdr, V3, RNG, lerp, clamp01, NZ, K, setI, ext, SKYS, SKY_GL, WAVE_GL, jhash, jnoise, jfbm, WORLDS, finish, seaWorld`, and the scratch objects `_m _q _s _p _e _c`.

`ext(id, {...})` merges more fields into a scene already pushed. Useful for keeping text in one file and worlds in another.

## Theme

At the top of `kit.js`:

```js
const THEME={ink:0x08070d,paper:0xf2ede4,accent:0xff6b2c,accent2:0x4fb8ff};
```

To retheme a talk, do not edit the skill's copy. Put this as the first line of your first scene file:

```js
Object.assign(THEME,{ink:0x06121a,paper:0xeef4f2,accent:0x35d0a5,accent2:0xffc857});
```

The engine copies these to the CSS variables at startup and uses `accent` for transition glows. The constants `INK PAPER EMBER ICE` were read before your override, so in your own scene code use `THEME.accent` etc. when you retheme. Sky presets have their own colours (see environment.md).

Typefaces are set in `head.html` (`--serif`, `--sans`, `--mono`, loaded from Google Fonts). To change them, copy `assets/engine` to your scratch folder, edit, and point a copy of `build.sh` at it.

## Scene fields

| field | meaning |
|---|---|
| `id` | short unique name; used by the screenshot URL |
| `title` | shown in the corner readout and the overview |
| `kind` | transition INTO this scene: 0 fade, 1 iris, 2 burn-through, 3 falling bars, 4 zoom-through |
| `beats` | array of `{dur, note}`; `dur` is seconds for that beat's animation; max 4 beats |
| `layers` | text blocks (below) |
| `tags` | labels pinned to 3D points (below) |
| `cams` | camera poses: `cams[0]` is the pose on arrival, `cams[i+1]` the pose when beat `i` has finished |
| `build({scene,camera})` | create the world; return `{update(st,dt), env}` (both optional) |
| `shift` | 0 to about .28: slides the picture right by that fraction of the frame so the subject sits right of the text. Ignored on narrow screens |
| `drift` | handheld camera sway in world units (0 to .4). Keep small when framing is tight |
| `bloom` | bloom strength, default 1. Lower for bright daylight scenes |
| `exp` | exposure multiplier, default 1 |
| `far` | camera far plane, default 2500. Use 6000 for ocean scenes with distant islands |
| `bg` | background colour if there is no sky dome, default `INK` |
| `fog` / `fogLin` | `[colour, density]` exponential or `[colour, near, far]` linear. `K.env` sets its own fog |
| `light` | `true` for a light-background scene: text and readout turn dark |
| `scrim`, `scrimL`, `scrimS` | dark backing behind text: centred oval, strong left-to-right, soft left-to-right |

## Beats and state

`update(st, dt)` runs every frame.

- `st.P[i]`: eased progress 0..1 of beat `i`. It rises over `beats[i].dur` once the presenter reaches beat `i`, and falls back if they step backward. Drive everything from these: `mesh.material.opacity = st.P[1]`.
- `st.T`: seconds since the scene was entered. Use for idle motion.
- `st.bi`: current beat index.
- `dt`: frame time in seconds. Integrate speeds with it (`angle += dt * speed`) when the speed itself changes with beats.

Stagger several things inside one beat with `clamp01(st.P[0]*n - i)`.

Make the finished state the default: in screenshot mode all reached beats are at 1.

## Text layers

`{b:[from,to], z:'zone', h:'html', s:'css'}`: visible on beats `from..to` inclusive.

Zones on a 1920x1080 stage that scales to fit: `tl` top-left (eyebrow and heading), `ml` middle-left (big titles and numbers), `bl` bottom-left, `tr`, `br`, `bc` (small source line, bottom-left edge), and `free` with your own `s:'left:120px;top:300px;width:640px'`.

Children of a layer appear staggered. A child with `data-b="2"` waits until beat 2, so one layer can build up a list.

Two layers in the same zone on different beats replace each other in place (for example a big number per beat in `ml`).

Classes: `eb` eyebrow, `h1` 168px, `h2` 88px, `h3` 40px, `lede` 40px, `body` 30px, `lab` 24px mono (add `hi` bright, `em` accent, `ice` second accent), `num` 220px numeral, `fig` 88px figure, `<em>` accent italic, `gap`/`gap2` top margin, `pt` a divider-topped block, `vs` a three-column comparison grid, `six` a three-by-two card grid.

Keep text short. One idea per beat. Nothing under 24px.

## Tags

`{b:[from,to], at:(st)=>[x,y,z], h:'html', c:'l|r|w|w2', d:ms}`

`at` returns a world position each frame, so tags follow moving objects and camera moves. `c`: default centred on the point, `l` text starts at the point, `r` text ends at the point, `w` and `w2` are centred wrapping blocks 236px and 420px wide. `d` delays the tag's entrance on its first beat.

Place tags beside objects, not on them, and check them in a still: a tag whose point is off screen or behind the camera simply does not show.

## Cameras and framing

Pose: `{p:[x,y,z], l:[x,y,z], f:fovDegrees}`. With `n` beats give `n+1` poses.

To frame something of height `h` at distance `d` with vertical fov `f`: it fills `h / (2·d·tan(f/2))` of the frame height. On the 1080px stage one world unit is `1080 / (2·d·tan(f/2))` pixels, so you can check that six labels 236px wide fit before rendering.

On screens narrower than 16:9 the engine widens the fov to keep the horizontal framing, and stacks text at top and bottom.

Good moves: a slow push-in on a title; a track along a row; a crane up and back to reveal scale; swinging to the side to show a profile. One move per beat.

## The K helpers

- `K.env(scene, preset, opts)`: sky, ocean, lights, fog, sea stacks, birds. See environment.md.
- `K.island(cx, cz, radius, height, seed)`: low-poly mountain island mesh; add it to the scene yourself.
- `K.stars(n, radius, seed)`: point-sprite star field for space scenes without a sky dome.
- `K.std(hex, opts)`: lit `MeshStandardMaterial` (pass `{roughness, metalness, emissive, flatShading}`).
- `K.glow(hex, k)`: unlit material at `k` times brightness; above about 1.05 it blooms.
- `K.sprite(hex, k, size)`: additive soft glow billboard.
- `K.points(Float32Array, colour, size, opacity)`: additive glowing points; update the array and set `geometry.attributes.position.needsUpdate=true` to animate.
- `K.inst(geometry, material, count)`: `InstancedMesh`; position instances with `setI`.
- `K.floor(size, hex, opts)`, `K.grid(size, divisions, opacity)`: a ground plane and grid, for scenes that are deliberately abstract.
- `setI(mesh, i, x,y,z, sx,sy,sz, rx,ry,rz)`: set one instance's transform. After changing any, set `mesh.instanceMatrix.needsUpdate=true`.
- `RNG(seed)`: returns a deterministic `rand()`; always use it instead of `Math.random()` so stills are repeatable.
- `L(hex)`: sRGB hex to a linear `THREE.Color`. `hdr(hex,k)`: the same, times `k`.
- `NZ`: GLSL source for `hash`, `noise`, `fbm` to prepend to your fragment shaders.
- `jnoise(x,y)`, `jfbm(x,y)`: the same noise in JavaScript.

## Colour and brightness

Rendering is linear HDR with bloom and ACES tone mapping. Always pass colours through `L()` or `hdr()`; raw hex in a `THREE.Color` will look washed out.

Brightness guide for `hdr`/`K.glow`: 1 to 2 reads as lit, 3 to 5 glows clearly, 6 to 10 is a light source. Sprites: .2 to 1. Anything larger floods the frame after bloom. Start low and raise.

An unlit material set to black is a black silhouette, which is visible against a bright sky. For things that "switch on", set `mesh.visible = on > .02` as well as scaling the colour.

## Instancing

Use `K.inst` for anything over about fifty copies. To reveal instances progressively at no cost, sort them once and animate `mesh.count`. Per-instance colour: `mesh.setColorAt(i, color)` then `mesh.instanceColor.needsUpdate=true`.

Updating a few thousand matrices per frame is fine; tens of thousands is not, so use `count` or a shader for those.

## Custom shaders

`THREE.ShaderMaterial` with GLSL1-style code (`varying`, `texture2D`, `gl_FragColor`). Built-ins such as `cameraPosition`, `modelMatrix`, `viewMatrix`, `projectionMatrix` are provided; for `InstancedMesh` multiply by `instanceMatrix` yourself. Scene fog does not apply to shader materials: fade by distance in the shader.

A plane you turn to lie flat by remapping coordinates in the vertex shader will be back-face culled from above. Use `side: THREE.DoubleSide`.

## Presenter controls (built in)

Right arrow, space or click advances; left arrow goes back; N speaker notes; O overview; F full screen; ? help. Swipe on touch. The address hash `#s5` opens scene 5.

## The screenshot URL

`page.local.html?shot=<id>.<beat>.<time>` jumps to that scene with all beats up to `<beat>` finished and the clock at `<time>` seconds (default 9), hides the controls, and prints any shader or build error on the page in red. `scripts/shot.sh` wraps this with headless Chromium on a software renderer, which is slow (10 to 30 seconds a shot) but needs no GPU. Run up to four in parallel with `&` and `wait`.

A second form, `?shot=<id>:<beat>:<time>:<fraction>`, uses colons so the time can be fractional, and freezes the current beat part-way (fraction 0 to 1). `scripts/gif.sh <page> <id> <beats> <out.gif>` uses it to render a whole scene in motion: every beat from start to finish while the clock runs. Use it to check camera moves and staged reveals, which stills cannot show.
