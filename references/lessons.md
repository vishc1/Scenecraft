# Lessons from building the first talk

Each of these cost real time. Read once before you start.

## The picture

**Everything blows out to white.** The first 3D pass was unreadable: emissive values of 7 to 9 plus bloom flooded every frame. Keep `hdr`/`K.glow` multipliers mostly under 5 and sprites under 1, then raise selectively. If a scene is still too hot, lower that scene's `bloom` before touching the engine.

**One object in a black void reads as unfinished.** The user's reaction to abstract scenes on a dark floor grid was that they looked blank; the same scenes placed in an environment (sea, sky, islands, a moon, birds) were accepted. Give every scene a place and some secondary detail.

**Text over a busy world is unreadable.** Burning pages behind a quotation, a city of lights behind a list, a dawn sky behind pale text. Fixes, in order: move the subject with `shift`, move the text zone, add a scrim, dim the world behind the text.

**Black "off" objects show against bright skies.** Unlit materials set to black were invisible on a dark background and became black rings and blobs on a dusk sky. Toggle `visible` for things that switch on.

**Labels end up off screen or on top of each other.** Tags are positioned by projection, so a camera change moves them. After any camera edit, re-shoot. Use the pixels-per-unit formula in scene-api.md to check spacing for rows of labels. Put a label beside its object, on the side away from the sun and other labels.

**Framing is found by looking, not by reasoning.** Expect two or three camera revisions per scene. Typical faults: subject too large and cropped by `shift`; final wide shot too far so objects are specks; camera looking up so the ground and its reflections fall out of frame.

**Water that looks like flat fog is probably not being drawn.** The ocean was invisible for a full iteration because its surface was back-face culled; the scene showed only the sky dome's lower half, which looked like a calm pastel sea. If reflections are missing, suspect that the surface is not rendering before tuning the shading. (Fixed in the kit; the lesson is to test the simplest explanation.)

## The process

**Render stills constantly.** Every claim about how a scene looks should come from a screenshot taken after the last change. Tile four to a sheet so a whole pass costs a few images.

**Debug by showing the intermediate thing.** When reflections were wrong, displaying the mirror camera's render full screen found the cause in one step after a lot of guessing.

**A scripted multi-file edit that fails part-way applies nothing.** A batch of text replacements aborted on the first mismatch, the build ran anyway on the old files, and the screenshots showed no change. If you batch edits in a script, make it stop the build on failure, and beware replacing a short key that is a substring of another (`dawn` inside `predawn`).

**Software rendering is slow, not broken.** A still takes 10 to 30 seconds on SwiftShader. Run four in parallel. It does not tell you the frame rate on a real GPU.

**Say what the stills do not prove.** They show that every scene builds and how it is framed at the end of a beat. They do not show motion, transitions, timing, or performance, and they load three.js from the network, which is a different path from inside a published artifact. Tell the user which of these you have not seen.

## The content

**The metaphor is the work.** Reusing a chart inside a 3D frame adds nothing. The scenes that landed turned the number into a thing: doublings as stairs you climb, a hundred years as a hundred pillars that slide together, a condition as a sun hanging by a thread.

**Do not borrow another talk's scenes.** When the user supplied a reference, the right use was to match its ambition, and to change a scene of ours that had drifted too close to one of theirs.

**Facts from memory need flagging.** Put sources on the scene and in the notes, keep quotations exact or leave them out, label extrapolations and illustrative shapes as such, and tell the user which figures you did not look up.

**Expect the user to raise the bar in steps.** Flat slides, then animated 2D, then real 3D, then environments, then "some parts are blank". Aim one level above what was asked on the first pass: real 3D worlds inside an environment, with every frame filled.
