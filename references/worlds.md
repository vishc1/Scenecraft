# The world library

`assets/library/worlds.js` is included in every build. It holds fourteen ready-made worlds. A world is the 3D half of a scene: camera poses, the `build` function, labels pinned to 3D points, and framing. You supply the other half: id, title, beats, text.

See them all: `scripts/build.sh out/gallery.html "World gallery" assets/examples/gallery.js`, then open `out/gallery.local.html`. `assets/examples/gallery.js` is also the shortest example of using each one.

## Using a world

Spread the world first, then your own fields, so yours win:

```js
SC.push({...WORLDS.gyro({labels:['Plan','Build','Measure','Learn']}),
  id:'cycle', title:'The cycle', kind:4,
  beats:[{dur:2.4,note:'...'},{dur:2,note:'...'},{dur:2,note:'...'},{dur:4,note:'...'}],
  layers:[{b:[0,3],z:'tl',h:'<p class="eb">How we work</p><h2>The cycle</h2>'}]});
```

Options every world takes:

- `labels:[...]`: replace the text of the world's 3D labels, in the order listed below. Plain strings become small labels; strings containing HTML are used as given; `null` hides that label; leaving an entry `undefined` keeps the default.
- `tags:[...]`: replace the labels entirely with your own tag objects.
- `over:{...}`: override any world field, for example `over:{shift:.1, cams:[...]}`.

The default labels come from the talk the worlds were first built for, so always pass `labels` (or `tags:[]`) for worlds that have them.

Give the scene as many beats as the world animates (the "beats" column). Fewer is fine: later stages simply never play.

## The worlds

| world | what happens | beats | labels, in order |
|---|---|---|---|
| `sea` | A bay at night under an eclipse, islands, a lighthouse with a sweeping beam. With `{sunrise:true}` it starts before dawn and the sun comes up | 2 | none |
| `pages` | A storm of loose pages over a moonlit sea; on beat 1 they catch fire outward from the centre. Good behind a quotation (it sets a text scrim) | 3 | none |
| `planet` | A rotating planet. Each beat lights more of its night side: scattered fires, towns, city networks, then everything, plus an orbital ring | 4 | none |
| `towers` | One tower per item in calm water, heights following your numbers. Pass `items:[{label, value, note, show}]` (2 to 8). The only world whose geometry is set by data | 2 | from `items` |
| `monoliths` | Six monoliths of rising height standing in calm water. They light up two per beat while the camera tracks along, then a wide shot | 3 | 6: one under each monolith |
| `stairs` | A stone staircase out of the sea. Beat 0 lights thirteen steps one by one; beat 1 swings to the side; beat 2 shows nine ghost steps ahead and three glowing gates | 3 | 9: six markers on steps 1, 3, 5, 8, 12, 13, then the three gates |
| `blocks` | Three blocks on rock pedestals. Each cycle they split into more cubes (about 5×, 3× and 280× over the loop); one block arrives per beat | 4 | 3: one under each block |
| `tunnel` | A flight through a tunnel of rings on a ground in the accent colour. For a single statement. Set `light:true` on the scene so text turns dark | 2 | none |
| `gyro` | A seven-ring gyroscope with a glowing core over a moonlit sea. It spins faster on every beat; on the last beat the outer ring fades and the core flares | 4 | 4: top, right, bottom, left of the outer ring |
| `city` | One tower on a plain with a street grid and mountains. The camera rises as it becomes a hundred, ten thousand, then a plain of a million lights | 4 | 4: a counter shown on each beat |
| `scaleTower` | A lattice tower rising from a rock in the sea with four marker rings near its base. Beat 1 pulls far back: the tower runs out of sight | 3 | 6: four markers from the bottom, then a label for the whole cluster, then one high on the tower |
| `ribbons` | Three glowing curves over the sea, one per beat: a straight line, an exponential, and one that turns vertical with a column of light | 3 | 3: one at the end of each curve |
| `pier` | A hundred pillars on a wooden pier, eight of them tall beacons. On beat 1 they slide together into a tenth of the length and glow | 3 | 10: the eight beacons, then the two ends |
| `hangingSun` | A small sun hanging by a thread over one person standing on a rock in a dark sea. The camera drifts round over the beats; on the last the thread frays | 4 | none |

Layout notes: most worlds put the subject right of centre and expect text in `tl` and `bl`. `monoliths`, `blocks`, `ribbons` and `pier` fill the width, so keep text to the top-left. `city`, `gyro` and several others already set a scrim.

## Changing a world

Options change labels and framing. To change what a world is made of (five monoliths instead of six, different step counts, other colours), copy its function from `assets/library/worlds.js` into your scene file under a new name and edit it there. Each one is self-contained and between ten and thirty lines. Do not edit the library in place: other talks build from it.

`assets/examples/starter-any-topic.js` shows the next step up: a towers world whose heights and labels are driven by a `DATA` array.

## Adding your own world to the library

If a world you built is reusable, give it the same shape so it can be shared:

```js
WORLDS.orchard=(o={})=>finish(Object.assign({
  shift:.15, bloom:1, drift:.25, far:6000,
  cams:[{p:[0,3,40],l:[0,4,0],f:40},{p:[10,8,52],l:[0,5,0],f:40}],
  tags:[{b:[0,1],at:()=>[0,9,0],h:'<p class="lab hi">Label</p>'}],
  build({scene}){ const env=K.env(scene,'dawn',{ocean:false});
    /* geometry */
    return {env,update(st,dt){ /* st.P[i] drives the stages */ }}; }
},o.over||{}),o);
```

`finish` applies `labels` and `tags` and strips any text fields, so a world never carries a title or copy of its own. Put it in your own scene file, or in a `worlds-*.js` file passed to `build.sh` before the scenes that use it. Render it with `shot.sh` at every beat, and with `gif.sh` to see it move, before relying on it.

A good library world: has one clear idea, animates across its beats without any text, keeps its subject inside the frame at every pose at both 16:9 and phone size, and uses `THEME` colours and a sky preset so it follows the talk's look.
