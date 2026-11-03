# Checkmates

Two-player chess on one phone or tablet. No server, no account, works offline once installed.

Live: https://checkmates.ronit.io/

Before a game: player names, who plays white (or a toss), rotate the board each turn, show legal moves.

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
    GameScreen.vue         player bars, board, status, buttons, rotation
    ChessBoard.vue         64 squares from the game state and orientation
    BoardSquare.vue        one square: piece, highlights, hints, coordinates
    ChessPiece.vue         <use> of a sprite symbol
    PlayerBar.vue          name, colour, "to move"
    PromotionDialog.vue    queen / rook / bishop / knight picker
    SegmentedControl.vue   generic radio group
    ToggleSwitch.vue       checkbox styled as a switch
  composables/
    useGame.ts             chess.js wrapped in reactive state, persistence, tap handling
    useFullscreen.ts       Fullscreen API with the webkit prefix
    useWakeLock.ts         keeps the screen on during a game
  lib/
    chess.ts               pure helpers: square mapping, legal targets, status text
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

Rules by chess.js (BSD-2-Clause). Pieces: "staunty" set by sadsnake1, from lichess (CC BY-NC-SA 4.0, so personal use only).
