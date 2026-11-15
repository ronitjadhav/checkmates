# Checkmates

Two-player chess on one phone or tablet. No server, no account, works offline once installed.

Live: https://checkmates.ronit.io/

Before a game: player names, who plays white (or a toss), face to face or pass the device, show legal moves.

**Face to face** (the default) is for two people on opposite sides of a flat phone or tablet. Every piece is drawn so it
looks the same from both sides, so the board never turns and nobody reads upside-down pieces. Each player gets the same
panel on their own side, turned to face them: name, captured pieces, status and the buttons. Held sideways, the board
fills the height of the screen and each panel sits at its player's right hand. Switch it off to get the classic pieces, with the option to rotate
the board each turn.

**Scores.** A game that ends in checkmate or a draw is added to the scores on the device (win 1 point, draw ½). The
Scores screen shows a table of all players and each pair's head-to-head record, told apart by name. From there you can
export the scores to a file, import a file (games already there are skipped), remove a single game, reset one pair or
reset everything.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173/
npm test           # vitest
npm run build      # type-check, then build to dist/
npm run preview    # serve dist/ locally
```

Vue 3 + TypeScript on Vite, Tailwind CSS 4, [chess.js](https://github.com/jhlywa/chess.js) for the rules, vite-plugin-pwa for the offline cache and the install manifest.

```
src/
  main.ts                  mounts App, registers the service worker
  style.css                Tailwind @theme tokens, .screen / .btn / .piece
  types.ts                 Settings, Names, Target; re-exports chess.js types
  App.vue                  setup screen or game screen, piece sprite
  components/
    SetupScreen.vue        names, colour choice, toggles
    GameScreen.vue         the two player panels around the board, stacked or side by side
    ChessBoard.vue         64 squares from the game state and orientation
    BoardSquare.vue        one square: piece, highlights, hints, coordinates
    ChessPiece.vue         <use> of a sprite symbol
    PlayerBar.vue          name, colour, captured pieces
    PlayerPanel.vue        one player's side: bar, status, buttons
    PromotionDialog.vue    queen / rook / bishop / knight picker
    ScoresScreen.vue       standings, head to head, export / import / reset
    SegmentedControl.vue   generic radio group
    ToggleSwitch.vue       checkbox styled as a switch
  composables/
    useGame.ts             chess.js wrapped in reactive state, persistence, tap handling
    useScores.ts           finished games on this device: record, remove, export, import
    useFullscreen.ts       Fullscreen API with the webkit prefix
    useWakeLock.ts         keeps the screen on during a game
  lib/
    chess.ts               pure helpers: square mapping, legal targets, status text
    scores.ts              pure score logic: standings, head to head, file format
    storage.ts             guarded localStorage access
  **/*.test.ts             vitest, next to the code they test
  assets/pieces.svg        piece sprite
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: test, build, publish `dist/` to GitHub Pages.

Before the first push of the Vue version, switch the Pages source to "GitHub Actions" (repository Settings → Pages → Build and deployment), or run:

```sh
gh api -X PUT repos/ronitjadhav/checkmates/pages -f build_type=workflow
```

Otherwise Pages keeps publishing the raw repository, which is now source code and shows a blank page. The custom domain `checkmates.ronit.io` is a repository setting and carries over; the `CNAME` file only matters for branch deploys.

## Licences

Rules by chess.js (BSD-2-Clause). Pieces: "staunty" set by sadsnake1, from lichess (CC BY-NC-SA 4.0, so personal use only). The face-to-face
pieces are adapted from the same set (the top of each piece, repeated upside down) and carry the same licence.
