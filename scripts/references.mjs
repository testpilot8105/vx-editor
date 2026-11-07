// Downloads reference videos (videos whose editing the owner likes) with yt-dlp, so Claude can study their look: the
// pace, the captions, the colour, the energy, the structure. Inspired by them, never a copy.
// Each link becomes an mp4 of at most 1080p (the short side), named after its title, with a contact sheet of 15 frames
// spread over it (<name>-sheet.jpg) next to it, and its cuts counted for the pace. They go to "02 References" in the
// workspace (the folder above this one, when this one is named "00 System"), else to media/references/ (not in git).
// --cookies <browser>: for a site that wants you logged in (Instagram often does): chrome, safari, firefox, edge...
// --transcript: also hears each reference on this computer (whisper, nothing uploaded) and writes <name>.txt.
// A video file already on this computer can be given in place of a link: it gets its sheet where it is.
// Usage: node scripts/references.mjs <url|file> [<url|file> ...] [--cookies <browser>] [--transcript]
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { contactSheet, ffmpeg, ffmpegTool, hear, MEDIA, probe, ROOT, workspaceDir, ytDlp } from './lib.mjs';

const args = process.argv.slice(2);
const ci = args.indexOf('--cookies');
const cookies = ci >= 0 ? args.splice(ci, 2)[1] : null;
const transcript = args.includes('--transcript');
const urls = args.filter((a) => !a.startsWith('--'));
if (!urls.length) {
  console.error('Usage: node scripts/references.mjs <url|file> [<url|file> ...] [--cookies <browser>] [--transcript]');
  process.exit(1);
}

let bin;
let ff;
try {
  bin = ytDlp();
  [ff] = ffmpegTool();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const dest = workspaceDir('references') ?? join(MEDIA, 'references');
mkdirSync(dest, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'vx-references-'));
const where = (p) => (p.startsWith(ROOT) ? relative(ROOT, p) : p);

/** Where the cuts are, in seconds: frames where the picture changes a lot from the one before. */
const cutsOf = (file) => {
  const { out } = ffmpeg(['-loglevel', 'error', '-i', file, '-an', '-vf', "scale=160:-2,select='gt(scene,0.3)',metadata=print:file=-", '-f', 'null', '-']);
  return out
    .split('\n')
    .map((l) => Number(l.match(/pts_time:([\d.]+)/)?.[1]))
    .filter(Number.isFinite);
};

const failed = [];
for (const [i, url] of urls.entries()) {
  console.log(`\nReference ${i + 1} of ${urls.length}: ${url}`);
  const pathFile = join(tmp, `path-${i}.txt`);
  const local = existsSync(url);
  if (local) writeFileSync(pathFile, resolve(url));
  const r = local ? { status: 0 } : spawnSync(
    bin,
    [
      '--no-playlist',
      '-f', 'bv*+ba/b',
      '-S', 'res:1080,ext:mp4:m4a',
      '--merge-output-format', 'mp4',
      '--remux-video', 'mp4',
      '--windows-filenames',
      '-P', dest,
      '-o', '%(title).70B [%(id)s].%(ext)s',
      '--print-to-file', 'after_move:filepath', pathFile,
      ...(ff !== 'ffmpeg' ? ['--ffmpeg-location', ff] : []),
      ...(cookies ? ['--cookies-from-browser', cookies] : []),
      url,
    ],
    { stdio: 'inherit' },
  );
  const file = existsSync(pathFile) ? readFileSync(pathFile, 'utf8').trim().split('\n').pop() : null;
  if (r.status !== 0 || !file || !existsSync(file)) {
    failed.push(url);
    continue;
  }
  try {
    const p = probe(file);
    const cuts = cutsOf(file);
    const n = 15;
    const last = Math.max(0, Math.floor(p.duration * p.fps) - 1);
    const frames = Array.from({ length: n }, (_, k) => Math.min(last, Math.round(((k + 0.5) * p.duration * p.fps) / n)));
    const sheet = contactSheet(file, frames, file.replace(/\.[^.]+$/, '-sheet.jpg'), { width: p.height > p.width ? 288 : 384, cols: 5 });
    const step = p.duration / n;
    console.log(`${local ? 'File' : 'Saved'}: ${where(file)}`);
    console.log(`  ${p.duration.toFixed(1)} s, ${p.width}x${p.height}, ${p.fps} fps, ${p.audio ? 'with sound' : 'no sound'}`);
    console.log(
      cuts.length
        ? `  Cuts: about ${cuts.length}, one every ${(p.duration / (cuts.length + 1)).toFixed(1)} s on average, at ${cuts.map((t) => t.toFixed(1)).join(', ')} s`
        : '  Cuts: none found, one long shot',
    );
    console.log(`  Sheet: ${where(sheet)} (15 frames, left to right, top to bottom, one every ${step.toFixed(1)} s from ${(step / 2).toFixed(1)} s)`);
    if (transcript && p.audio) {
      const wav = join(tmp, `ref-${i}-16k.wav`);
      ffmpeg(['-y', '-loglevel', 'error', '-i', file, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', wav]);
      const txt = file.replace(/\.[^.]+$/, '.txt');
      writeFileSync(txt, `${(await hear(wav, 0, p.duration)).join(' ')}\n`);
      console.log(`  Words: ${where(txt)}`);
    }
  } catch (e) {
    console.error(`  Downloaded, but the sheet could not be made: ${e.message.trim().split('\n').pop()}`);
    failed.push(url);
  }
}
rmSync(tmp, { recursive: true, force: true });

console.log(`\nReferences are in ${workspaceDir('references') ? `the "02 References" folder: ${dest}` : relative(ROOT, dest)}`);
if (failed.length) {
  console.error(`\nCould not get ${failed.length} of ${urls.length}: ${failed.join(' ')}`);
  console.error(
    'A private or deleted video cannot be downloaded. If the site wants you logged in (Instagram often does), log in to it in your browser and run this again with --cookies chrome (or safari, firefox, edge). Or download the video yourself and drop it into the references folder.',
  );
  process.exit(1);
}
console.log(`Next: read each sheet${transcript ? ' and transcript' : ''}, then write what you take from them into the style profile.`);
