# Sudoku Solver

A beautiful, fully-featured Sudoku puzzle app built with React. Dark editorial aesthetic with smooth animations, keyboard support, and an instant backtracking solver.

![Sudoku Solver](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react) ![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## Features

- **3 difficulty levels** — Easy, Medium, Hard (each with multiple hand-curated puzzles)
- **Animated solver** — watch the backtracking algorithm solve the board in real time
- **Pencil mode** — jot candidate numbers as small marks inside cells
- **Hint system** — reveals a single correct cell when you're stuck
- **Peer highlighting** — same row, column, and 3×3 box highlighted on selection
- **Conflict detection** — conflicting cells highlighted in red instantly
- **Keyboard navigation** — arrow keys, number keys, backspace
- **Timer** — starts on your first move, stops on completion
- **Win screen** — animated overlay with your completion time

## Getting Started

### Prerequisites

- Node.js ≥ 16
- npm or yarn

### Installation

```bash
git clone https://github.com/Chaithanya5gif/Sudoku-solver.git
cd Sudoku-solver
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
```

The optimized build will be in the `build/` folder.

## How to Play

| Action | Keyboard | Mouse/Touch |
|---|---|---|
| Select cell | Arrow keys | Click |
| Enter digit | 1–9 | Numpad buttons |
| Erase | Backspace / Delete | ⌫ button |
| Toggle pencil mode | — | Pencil button |
| Solve | — | ⚡ Solve |
| Hint | — | 💡 Hint |
| New puzzle | — | Difficulty pill or ↻ New |

## Project Structure

```
src/
├── App.js          # Main app component and game logic
├── App.css         # App-level styles
├── Cell.js         # Individual cell component
├── Cell.css        # Cell styles and animations
├── sudokuUtils.js  # Solver, validator, puzzle library
├── useTimer.js     # Custom timer hook
└── index.js        # Entry point
```

## Algorithm

The solver uses **recursive backtracking**:

1. Find the first empty cell
2. Try digits 1–9 that satisfy row, column, and box constraints
3. Recurse — if a dead end is reached, backtrack and try the next digit
4. The animation plays the final assignment sequence (skipping backtrack flicker) for a clean visual

## License

MIT — feel free to use, modify, and distribute.# Sudoku-solver
