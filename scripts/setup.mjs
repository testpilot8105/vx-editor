// Gets this folder ready to edit on a Mac or a Windows PC (Linux too), and checks each step: Node, ffmpeg, yt-dlp, the
// headless browser, the speech engine and its model, the video list, and one test render. Safe to run again; it only
// fetches what is missing. Run it after `pnpm install`.
// In a workspace (this folder is named exactly "00 System", inside the project folder the owner opens in Claude Code,
// which can have any name), it also makes the owner's folders next to it (01 Raw Footage, 02 References, 03 Exports)
// and the files that let Claude Code find the editor from there: CLAUDE.md, .claude/skills/vx-edit-video/SKILL.md and .claude/settings.json. A file the
// owner has changed is never overwritten.
// Usage: node scripts/setup.mjs
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ffmpeg, ffprobe, remotion, ROOT, run, whisperBinary, whisperModel } from './lib.mjs';

const SYSTEM = '00 System';
const HERE = resolve(fileURLToPath(new URL('..', import.meta.url)));
const WORKSPACE = basename(HERE) === SYSTEM ? dirname(HERE) : null;

let n = 0;
const step = (text) => console.log(`\n[${++n}/${WORKSPACE ? 8 : 7}] ${text}`);
const fail = (msg) => {
  console.error(`\nSetup stopped: ${msg}`);
  process.exit(1);
};

step('Node');
const major = Number(process.versions.node.split('.')[0]);
if (major < 20) fail(`Node ${process.versions.node} is too old; install Node 20 or newer from nodejs.org.`);
console.log(`Node ${process.versions.node}, ${process.platform} ${process.arch}`);

if (WORKSPACE) {
  step(`Your folders, in ${WORKSPACE}`);
  for (const f of ['01 Raw Footage', '02 References', '03 Exports']) {
    if (existsSync(join(WORKSPACE, f))) console.log(`${f}: already there`);
    else {
      mkdirSync(join(WORKSPACE, f));
      console.log(`${f}: made`);
    }
  }

  // The root files carry this line while setup owns them. Without it (the owner took it out or wrote their own), the
  // file is left as it is.
  const MARK = `Written by ${SYSTEM}/scripts/setup.mjs. While this line is here, setup refreshes this file; delete the line to keep your own changes.`;
  const writeOwn = (file, text, ours = (old) => old.includes(MARK)) => {
    const name = relative(WORKSPACE, file).split('\\').join('/');
    const old = existsSync(file) ? readFileSync(file, 'utf8') : null;
    if (old === text) return console.log(`${name}: up to date`);
    if (old !== null && !ours(old)) return console.log(`${name}: kept as it is (it has your own changes)`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
    console.log(`${name}: ${old === null ? 'written' : 'updated'}`);
  };

  const folders = (indent = '') =>
    [
      `- \`01 Raw Footage\`: the videos the owner filmed. Raw videos come from here.`,
      `- \`02 References\`: reference videos, the ones the owner wants an edit to look or feel like. Reference videos go here.`,
      `- \`03 Exports\`: finished videos land here.`,
    ]
      .map((l) => indent + l)
      .join('\n');

  writeOwn(
    join(WORKSPACE, 'CLAUDE.md'),
    `<!-- ${MARK} -->

# ${basename(WORKSPACE)}

The owner's project folder for VX Editor, their video editor. They are not technical: plain words, short paragraphs,
no code unless they ask.

- \`${SYSTEM}\`: VX Editor itself. Its rules are in \`${SYSTEM}/CLAUDE.md\`; read them before any video work.
${folders()}

Any video work (a new video, "edit this into a reel", notes on a draft) goes through the \`/vx-edit-video\` skill. Run
every \`node\` and \`pnpm\` command from inside \`${SYSTEM}\`. Footage is copied in, never moved, renamed or deleted.
`,
  );

  // The skill Claude Code finds from this folder: the same name and description as the real one, pointing to it.
  const inner = join(HERE, '.claude', 'skills', 'vx-edit-video', 'SKILL.md');
  const front = (existsSync(inner) ? readFileSync(inner, 'utf8').replace(/\r\n/g, '\n') : '').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const field = (k) => {
    const v = front.match(new RegExp(`^${k}:[ \\t]*(.*)$`, 'm'))?.[1].trim();
    return v && !/^[|>]/.test(v) ? v : null;
  };
  const description =
    field('description') ??
    "VX Editor, the video editor. Raw footage in, an edited video out. Use when the owner drops a video and asks to edit it, cut it, caption it, add graphics or sound, make a reel, or gives notes on a draft.";
  const tools = field('allowed-tools');
  writeOwn(
    join(WORKSPACE, '.claude', 'skills', 'vx-edit-video', 'SKILL.md'),
    `---
name: vx-edit-video
description: ${description}
${tools ? `allowed-tools: ${tools.includes('Bash(cd *)') ? tools : `${tools}, Bash(cd *)`}\n` : ''}---

<!-- ${MARK} -->

# /vx-edit-video

VX Editor lives in \`${SYSTEM}\`, inside this folder. This file only points to it.

1. Read \`${SYSTEM}/.claude/skills/vx-edit-video/SKILL.md\` and follow it, with the \`references/\` folder next to it.
   The paths in it (\`scripts/\`, \`styles/\`, \`media/\`, \`src/\`) are inside \`${SYSTEM}\`.
2. Run every \`node\` and \`pnpm\` command from inside \`${SYSTEM}\` (\`cd "${SYSTEM}"\` first).
3. The owner's folders sit next to \`${SYSTEM}\`:
${folders('   ')}
`,
  );

  // The plan-mode hook in this repo's .claude/settings.json, pointed into 00 System, since Claude Code only reads the
  // settings of the folder it was opened in.
  const hook = `node "$CLAUDE_PROJECT_DIR/${SYSTEM}/.claude/hooks/plan-intake.mjs"`;
  const settings = join(WORKSPACE, '.claude', 'settings.json');
  writeOwn(settings, `${JSON.stringify({ hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: hook }] }] } }, null, 2)}\n`, () => false);
  if (!readFileSync(settings, 'utf8').includes(`${SYSTEM}/.claude/hooks/plan-intake.mjs`))
    console.log(`  (it does not run the editor's plan-mode hook; to add it, give it this UserPromptSubmit command: ${hook})`);
}

step('ffmpeg');
try {
  console.log(ffmpeg(['-version']).out.split('\n')[0]);
  ffprobe(['-version']);
} catch (err) {
  fail(err.message);
}

step('yt-dlp (downloads reference videos)');
{
  // On the PATH, or where Homebrew (Mac) and winget (Windows) put it, for a terminal opened before the install.
  const places =
    process.platform === 'win32'
      ? ['yt-dlp', join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Links', 'yt-dlp.exe')]
      : ['yt-dlp', '/opt/homebrew/bin/yt-dlp', '/usr/local/bin/yt-dlp'];
  let version = null;
  for (const cmd of places) {
    try {
      version = run(cmd, ['--version']).out.trim();
      break;
    } catch {}
  }
  if (!version)
    fail('yt-dlp is not installed. It downloads the reference videos. On a Mac: brew install yt-dlp. On Windows: winget install -e --id yt-dlp.yt-dlp (then open a new terminal). Then run this again.');
  console.log(`yt-dlp ${version}`);
}

step('Headless browser (renders the video and makes the hook cutout)');
run(process.execPath, [join(ROOT, 'node_modules', 'playwright-core', 'cli.js'), 'install', 'chromium-headless-shell'], {
  stdio: 'inherit',
  // Never clean up other browser versions on this computer; other projects may use them.
  env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_GC: '1' },
});

step('Speech engine and model (runs on this computer; the model is about 1.6 GB, downloaded once)');
try {
  console.log(`Engine: ${await whisperBinary()}`);
  const model = await whisperModel();
  console.log(`Model: ${model} (${Math.round(statSync(model).size / 1e6)} MB)`);
} catch (err) {
  fail(`${err.message}\nOn a Mac, installing it with Homebrew is the easy way: brew install whisper-cpp`);
}

step('Video list');
process.stdout.write(run(process.execPath, [join(ROOT, 'scripts', 'index-videos.mjs')], { cwd: ROOT }).out);

step('Test render');
const dir = join(ROOT, 'media', 'videos', '.setup-check');
mkdirSync(dir, { recursive: true });
const png = join(dir, 'style.png');
try {
  remotion(['still', 'src/index.ts', 'style-papaya-light', png, '--scale=0.25', '--log=error'], { cwd: ROOT });
  if (statSync(png).size < 1000) throw new Error('the test frame came out empty');
} catch (err) {
  fail(`the test render did not work: ${err.message.split('\n').slice(0, 6).join('\n')}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (WORKSPACE) {
  console.log(`\nReady. Put the video you filmed in "01 Raw Footage", start a new Claude Code session in your project folder (${WORKSPACE}), and say: edit this into a reel.`);
  console.log(`Remotion Studio (the live preview): pnpm studio, from inside "${SYSTEM}"`);
} else {
  console.log('\nReady. Open Claude Code in this folder, drag in a video you filmed, and say: edit this into a reel.');
  console.log('Remotion Studio (the live preview): pnpm studio');
}
