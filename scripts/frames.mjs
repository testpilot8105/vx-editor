// One contact sheet of chosen frames from a render, to look at graphics where they land. Frames are output frame
// numbers (seconds times fps), or seconds with an s: 8.2s. Writes out/<file>-frames.jpg.
// Usage: node scripts/frames.mjs <video> <file in out/> <frame|seconds>[,<frame|seconds>...]
import { join } from 'node:path';
import { contactSheet, readJson, videoDir } from './lib.mjs';

const [name, file, list] = process.argv.slice(2);
const dir = videoDir(name);
const { fps } = readJson(join(dir, 'edit.json'));
const frames = list.split(',').map((x) => (x.endsWith('s') ? Math.round(Number(x.slice(0, -1)) * fps) : Number(x)));
const out = join(dir, 'out', `${file.replace(/\.mp4$/, '')}-frames.jpg`);
contactSheet(join(dir, 'out', file), frames, out);
console.log(out);
