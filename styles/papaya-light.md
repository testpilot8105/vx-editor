# Style profile: papaya-light

The look that comes with VX Editor: an off-white canvas with a faint grid for the graphics, kinetic Archivo in mixed
weights (light grey beside bold black), floating rounded cards with soft deep shadows, and one papaya orange accent.
On the talking shots: white captions, centred, with the key word in papaya.

The `json` block below is what the video parts read (scripts/index-videos.mjs). Everything outside it is for people.
Change a value by telling Claude what you want; it edits the block and the reason goes under "Rules learned".

```json
{
  "fonts": [
    { "family": "Archivo", "src": "library/fonts/archivo-latin-wdth-wght.woff2", "weight": "100 900" }
  ],
  "headline": { "family": "Archivo", "weight": 800, "size": 196, "case": "as-is" },
  "caption": {
    "family": "Archivo",
    "weight": 700,
    "size": 72,
    "case": "as-is",
    "style": "lift",
    "y": 0.66,
    "plate": false,
    "maxWords": 3,
    "maxChars": 16,
    "color": "#FFFFFF",
    "band": true
  },
  "body": { "family": "Archivo", "weight": 400 },
  "colors": {
    "background": "#F3F2EF",
    "ink": "#111214",
    "soft": "#A3A3A3",
    "plate": "#111214",
    "accent": "#FF7D24",
    "line": "rgba(17,18,20,0.05)",
    "card": "#FFFFFF"
  },
  "kinetic": { "light": 400, "bold": 700, "lead": 600 },
  "grade": {
    "filter": "contrast(1.0) saturate(1.1) brightness(1.06)",
    "tint": ["rgba(120,170,255,0.18)", "rgba(150,190,255,0.06)", "rgba(60,100,170,0.16)"],
    "lift": 0.1,
    "vignette": 0.3
  },
  "grain": 0.07,
  "radius": 36,
  "edge": 0,
  "feel": "expressive",
  "sound": { "music": 0.065, "sfx": 0.6 }
}
```

## The look in words

- Graphics beats sit on an off-white canvas (`#F3F2EF`) with a faint 72 px grid that fades out at the edges. They
  hard-cut in and out over the talking shots.
- Headlines are kinetic: a light grey regular word beside a bold black one ("Custom" over "animations"), each word
  lifting 40 px out of a short blur on one smooth, no-bounce ease. Two-part titles stack on two big lines.
- Floating cards: white, 34 to 44 px corners, a deep soft shadow, tilted a little in 3D and settling as they land.
- Captions on footage: white, bold, centred, sentence case as spoken, the key word in papaya `#FF7D24`, over a narrow
  soft dark band behind the caption line only.
- Footage: a light cool-neutral grade, a small brightness lift, a soft vignette, fine moving grain over everything.

## Defaults for the intake

| Question | This profile's answer |
|---|---|
| Feel | expressive |
| Format | 9:16 reel |
| Captions | as spoken, Taglish included, from the owner's own words |
| Caption style | word lift (each word out of a soft blur), centred, white, narrow dark band, no plate |
| Key words | papaya accent |
| Motion graphics | hook with the person cut out in front of the type, a card per concept the voice names |
| Sound effects | a soft whoosh when a card cuts in, nothing on plain cuts |
| Music | the owner's track, low under the voice, lifting on the end card |
| Grade | light cool grade, no filter on the face |
| End card | "Follow for more" with a Follow button that gets tapped |
| Speed | 1.1x when the owner asks for pace |

## Rules learned

What this look already knows. Your own notes are added here, newest first, each with its date and the video it came
from.

- A note to make the hook stand out means contrast, not weight. Keep the weights; add a soft dark shadow and a soft
  white wash down from the top behind the type.
- One papaya everywhere, `#FF7D24`. A lighter `#FFB15C` vanishes on a cream wall; a deeper `#FF6A00` reads red.
- End about 0.2 s after the last word, before the hand reaching for the stop button.
- The speaker's head is centred in every shot and every place the footage appears.
- For caption contrast, a narrow soft dark band behind the caption line only, so the rest of the picture stays bright.
- A cooler, gentler grade on faces. No blur or glow on the face; a retouch comes as retouched clips from the owner.
- Speed only when asked: the whole video at 1.1x, pitch kept.
- The end card is a follow call to action, with no tool credits.
- Every concept the voice names gets its own picture.
- No slanted condensed type, halftone, hard colour blocks, tiny labels or corner furniture. The light kinetic look
  above is the one that holds up.
- No gaps or blinks between graphics: hard cuts in and out, nothing half-transparent, no empty panel ever crossing the
  frame.
