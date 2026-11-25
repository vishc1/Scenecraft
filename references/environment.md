# Environment: sky, ocean, islands, life

`K.env(scene, preset, opts)` turns an empty scene into a place. It adds a sky dome, a hemisphere light and a sun (or moon) light matched to the sky, distance fog in the horizon colour, and, unless told otherwise, an animated ocean with reflections, a ring of sea stacks, and a flock of birds in the daytime presets.

Return the result from `build` as `env` so the engine renders the reflection pass and advances the animation:

```js
build({scene}){ const env=K.env(scene,'dusk',{amp:.7}); /* ... */ return {env, update(st){ /* ... */ }}; }
```

## Presets (`SKYS` in env.js)

| name | look | use for |
|---|---|---|
| `eclipse` | night, stars, a large eclipsed sun with corona | an opening, a moment of awe |
| `night` | dark, stars, no sun | machines and glowing objects; add a moon with `sunI` |
| `predawn` | deep violet horizon, sun just below it | the start of a sunrise blend |
| `blue` | blue hour, purple horizon | calm data scenes, glowing things reflect well |
| `dusk` | orange horizon, low sun, glitter path | warm drama, silhouettes |
| `dawn` | bright warm morning | endings, optimism. Text needs a scrim |

Vary presets across the talk so it has a time-of-day arc.

## Options

Any preset field can be overridden in `opts`:

- `sun:[x,y,z]`: direction to the sun. `y` is its height above the horizon (.05 is low, .3 is high). Move it so it is not behind your labels.
- `sunI`, `sunC`, `sunR`: intensity, colour, disc radius. A moon is `{sunI:.6, sunC:0xc8d6ff, sunR:.028}` on `night`.
- `zen`, `hor`: zenith and horizon colours. `cloudC`, `clouds` (0 to 1), `stars` (0 to 1).
- `deep`, `shal`: water body colours.

Environment options:

- `amp`: wave height. .2 is a near-mirror (best for reflecting monoliths and light strips), .5 to .8 is a living sea, 1 is rolling.
- `level`: the water's height in world units, default 0. Build objects from `y = level` upward. Lower it (for example `level:-15`) to float a subject above the sea and see its reflection; the camera must stay above it.
- `fog`: scene fog density for lit objects, default .0016. `haze`: the ocean's own horizon haze, default .0005.
- `ocean:false`: sky and lights only, for scenes on land or in the air. Add your own ground.
- `life:false`: no sea stacks or birds. `birdAt:[x,0,z]`: centre of the flock's circuit. `seed`: varies stack placement.

## Islands

```js
[[-190,-520,170,70,4],[260,-700,240,110,9],[40,-1300,320,130,6]].forEach(a=>scene.add(K.island(...a)));
```

Arguments: centre x, centre z, radius, peak height, seed. Place them 500 to 1500 units away, mostly behind the subject, with different seeds. If you changed `level`, set each island's `position.y` to it. On land scenes, a ring of large islands at 1500 units makes a mountain horizon.

## What reflects

Anything in the scene reflects in the water automatically: meshes, glowing strips, sprites, the sky. Tall bright vertical things give the best reflections. The mirror pass renders the scene a second time at half resolution, so an ocean scene costs roughly one and a half times a plain one. Keep per-frame JavaScript work modest in those scenes.

Nothing in the scene should extend below the water level except supports meant to disappear into it.

## A sunrise or any sky change

`env.blend(toPreset, k, sunTo)` moves the whole environment toward another preset by `k` (0 to 1) and optionally moves the sun:

```js
update(st){ env.blend('dawn', clamp01(st.P[0]*.3 + st.P[1]*.7), [0,.11,-.99]); }
```

Blending cannot turn the eclipse on or off (it is a switch); start from `predawn` or `night` for a sunrise.

## Adding a preset

Add an entry to `SKYS` from your own scene file before any scene uses it:

```js
SKYS.storm={sun:[.2,.3,-.93],zen:0x0a0e14,hor:0x39424c,sunC:0xcfd8e6,cloudC:0x2a3038,stars:0,clouds:1,ecl:0,sunI:.25,sunR:.03,deep:0x02070c,shal:0x10323a,amb:.5};
```

`amb` is the hemisphere light strength (.2 night, .5 dusk, 1 day). Add `birds:1` for a flock.

## When not to use the ocean

Space scenes (use `K.stars`, a nebula backdrop sphere and a sun sprite), interiors and tunnels, and scenes whose whole point is an abstract object filling the frame. Even then, give the scene a backdrop so the frame is not empty.
