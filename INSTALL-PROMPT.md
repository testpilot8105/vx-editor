# Install VX Editor with one prompt

Make a new folder for your videos, anywhere you like (your Desktop or Documents is fine), and give it any name, for
example `My Reels`. This is your project folder. Open it in Claude Code: in the Claude desktop app, go to the Code tab,
choose Local and pick that folder (or run `claude` in a terminal opened there). Then paste everything in the box below.
Claude makes the other folders for you. Works on a Mac and on a Windows PC.

```text
Install VX Editor for me from https://github.com/testpilot8105/vx-editor into this folder (my project folder, whatever its name is) and get it ready to edit my videos. I am not technical: do every step yourself, explain in plain words, and only ask me when you need my password or a click. Never move or delete anything already in this folder.

1. Check what this computer has: git, Node.js 20 or newer, ffmpeg (ffmpeg -version) and yt-dlp (yt-dlp --version). Install anything missing:
   - Mac: use Homebrew (brew install git node ffmpeg whisper-cpp yt-dlp). If Homebrew is not installed, tell me to paste the one line from https://brew.sh into the Terminal app, since it needs my password, and wait for me.
   - Windows: use winget: winget install -e --id Git.Git, winget install -e --id OpenJS.NodeJS.LTS, winget install -e --id Gyan.FFmpeg, winget install -e --id yt-dlp.yt-dlp (accept the agreements with --accept-source-agreements --accept-package-agreements). Then reload PATH in PowerShell before going on: $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
2. Get the editor into a folder called "00 System" inside this folder. If there is none yet: git clone https://github.com/testpilot8105/vx-editor.git "00 System". If "00 System" is already here, go into it and run git pull instead. If the pull stops on local changes: setup rebuilds src/gen.ts, so drop its changes (git checkout -- src/gen.ts); keep any other change of mine (stash, pull, put it back). If "00 System" is not this editor, stop and ask me.
3. Go into it (cd "00 System"), install the packages (npx -y pnpm@10.33.0 install) and run the setup check (node scripts/setup.mjs). It makes my other three folders next to "00 System", fetches the headless browser and the speech model (about 1.6 GB, once) and does a test render. If a step fails, read its message, fix the cause, and run it again until it says Ready.
4. When it says Ready, tell me in plain words:
   - My project folder now has four folders: 00 System is the editor (leave it alone), 01 Raw Footage is for the videos I film, 02 References is for videos whose style I like, and 03 Exports is where my finished videos land.
   - To edit a video, I put the video I filmed in 01 Raw Footage.
   - Then I start a new Claude Code session in this same project folder and say "edit this into a reel".
```

Everything runs on your computer: your footage is copied into the editor, never uploaded, and the speech is
transcribed locally. VX Editor is MIT licensed; Remotion, which renders the video, is free for individuals and
companies of up to 3 people (see the README).
