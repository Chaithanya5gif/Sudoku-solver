import React, { useState, useCallback, useEffect, useRef } from 'react';
import Cell from './Cell';
import {
  PUZZLES, solve, solveSteps, hasConflict, isPeer,
  parsePuzzle, isSolved,
} from './sudokuUtils';
import { useTimer } from './useTimer';
import './App.css';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

function getRandomPuzzle(difficulty) {
  const list = PUZZLES[difficulty];
  return parsePuzzle(list[Math.floor(Math.random() * list.length)]);
}

export default function App() {
  const [board,      setBoard]      = useState(() => getRandomPuzzle('easy'));
  const [given,      setGiven]      = useState([]);
  const [marks,      setMarks]      = useState(() => Array(81).fill(null).map(() => new Set()));
  const [solvedRef,  setSolvedRef]  = useState([]);  // the answer board
  const [selected,   setSelected]   = useState(-1);
  const [mode,       setMode]       = useState('digit'); // digit | pencil
  const [activeNum,  setActiveNum]  = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [popCells,   setPopCells]   = useState(new Set());
  const [shimCells,  setShimCells]  = useState(new Set());
  const [gameWon,    setGameWon]    = useState(false);
  const [statusMsg,  setStatusMsg]  = useState('');
  const timer = useTimer();
  const solving = useRef(false);

  // ── NEW GAME ──────────────────────────────────────────────────────────────
  const newGame = useCallback((diff = difficulty) => {
    solving.current = false;
    const puzzle = getRandomPuzzle(diff);
    const answer = solve(puzzle);
    setBoard(puzzle);
    setGiven(puzzle.map(v => v !== 0));
    setMarks(Array(81).fill(null).map(() => new Set()));
    setSolvedRef(answer || []);
    setSelected(-1);
    setActiveNum(0);
    setPopCells(new Set());
    setShimCells(new Set());
    setGameWon(false);
    setStatusMsg('');
    timer.reset();
  }, [difficulty, timer]);

  // init
  useEffect(() => {
    const puzzle = getRandomPuzzle('easy');
    const answer = solve(puzzle);
    setBoard(puzzle);
    setGiven(puzzle.map(v => v !== 0));
    setSolvedRef(answer || []);
  }, []); // eslint-disable-line

  // ── CHECK WIN ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameWon) return;
    if (isSolved(board, given)) {
      setGameWon(true);
      setStatusMsg('✓ Solved! Well done!');
      timer.stop();
    } else {
      const empty = board.filter(v => !v).length;
      if (empty > 0) setStatusMsg(`${empty} cells remaining`);
      else setStatusMsg('Conflicts found — keep trying');
    }
  }, [board]); // eslint-disable-line

  // ── PLACE VALUE ───────────────────────────────────────────────────────────
  const placeValue = useCallback((cellIdx, val) => {
    if (cellIdx < 0 || given[cellIdx] || gameWon) return;
    if (!timer.running) timer.start();

    setBoard(prev => {
      const next = [...prev];
      next[cellIdx] = next[cellIdx] === val ? 0 : val;
      return next;
    });
    setMarks(prev => {
      const next = prev.map(s => new Set(s));
      next[cellIdx] = new Set();
      return next;
    });
    setPopCells(p => { const n = new Set(p); n.add(cellIdx); return n; });
    setTimeout(() => setPopCells(p => { const n = new Set(p); n.delete(cellIdx); return n; }), 250);
  }, [given, gameWon, timer]);

  // ── PLACE MARK ────────────────────────────────────────────────────────────
  const placeMark = useCallback((cellIdx, val) => {
    if (cellIdx < 0 || given[cellIdx] || board[cellIdx] || gameWon) return;
    if (!timer.running) timer.start();
    setMarks(prev => {
      const next = prev.map(s => new Set(s));
      if (next[cellIdx].has(val)) next[cellIdx].delete(val);
      else next[cellIdx].add(val);
      return next;
    });
  }, [given, board, gameWon, timer]);

  // ── NUMBER INPUT ──────────────────────────────────────────────────────────
  const handleNumber = useCallback((num) => {
    if (selected < 0) return;
    if (mode === 'digit') placeValue(selected, num);
    else placeMark(selected, num);
  }, [selected, mode, placeValue, placeMark]);

  const handleErase = useCallback(() => {
    if (selected < 0 || given[selected]) return;
    setBoard(prev => { const n = [...prev]; n[selected] = 0; return n; });
    setMarks(prev => { const n = prev.map(s => new Set(s)); n[selected] = new Set(); return n; });
  }, [selected, given]);

  // ── KEYBOARD ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= '1' && e.key <= '9') {
        const v = Number(e.key);
        setActiveNum(prev => prev === v ? 0 : v);
        handleNumber(v);
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleErase();
      } else if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSelected(prev => {
          if (prev < 0) return 0;
          const r = Math.floor(prev / 9), c = prev % 9;
          const moves = { ArrowUp: [-1,0], ArrowDown: [1,0], ArrowLeft: [0,-1], ArrowRight: [0,1] };
          const [dr, dc] = moves[e.key];
          return Math.max(0, Math.min(80, (Math.max(0, Math.min(8, r+dr))) * 9 + Math.max(0, Math.min(8, c+dc))));
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNumber, handleErase]);

  // ── ANIMATED SOLVE ────────────────────────────────────────────────────────
  const handleSolve = useCallback(async () => {
    if (solving.current) return;
    solving.current = true;
    timer.stop();
    setSelected(-1);

    const steps = solveSteps(board);
    let delay = 0;

    for (const { idx, v } of steps) {
      if (!given[idx]) {
        setTimeout(() => {
          if (!solving.current) return;
          setBoard(prev => { const n = [...prev]; n[idx] = v; return n; });
          setPopCells(p => { const n = new Set(p); n.add(idx); return n; });
          setTimeout(() => setPopCells(p => { const n = new Set(p); n.delete(idx); return n; }), 200);
        }, delay);
        delay += 22;
      }
    }

    setTimeout(() => { solving.current = false; }, delay + 100);
  }, [board, given, timer]);

  // ── HINT ──────────────────────────────────────────────────────────────────
  const handleHint = useCallback(() => {
    const empties = [];
    for (let i = 0; i < 81; i++) if (!board[i] && !given[i]) empties.push(i);
    if (!empties.length || !solvedRef.length) return;
    if (!timer.running) timer.start();

    const idx = empties[Math.floor(Math.random() * empties.length)];
    setBoard(prev => { const n = [...prev]; n[idx] = solvedRef[idx]; return n; });
    setMarks(prev => { const n = prev.map(s => new Set(s)); n[idx] = new Set(); return n; });
    setSelected(idx);
    setShimCells(p => { const n = new Set(p); n.add(idx); return n; });
    setTimeout(() => setShimCells(p => { const n = new Set(p); n.delete(idx); return n; }), 500);
  }, [board, given, solvedRef, timer]);

  // ── CLEAR USER ────────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    solving.current = false;
    setBoard(prev => prev.map((v, i) => given[i] ? v : 0));
    setMarks(Array(81).fill(null).map(() => new Set()));
    setSelected(-1);
    setGameWon(false);
    timer.reset();
  }, [given, timer]);

  // ── NUMPAD CLICK ──────────────────────────────────────────────────────────
  const handleNumpadClick = (n) => {
    setActiveNum(prev => prev === n ? 0 : n);
    if (selected >= 0) {
      if (mode === 'digit') placeValue(selected, n);
      else placeMark(selected, n);
    }
  };

  const selectedVal = selected >= 0 ? board[selected] : 0;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="logo">SUDOKU</h1>
          <span className="logo-sub">Logic Grid Puzzle</span>
        </div>
        <div className="header-right">
          <div className="timer-display">{timer.display}</div>
        </div>
      </header>

      {/* Difficulty bar */}
      <div className="diff-bar">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            className={`diff-pill ${difficulty === d ? 'active' : ''}`}
            onClick={() => { setDifficulty(d); newGame(d); }}
          >
            {d}
          </button>
        ))}
        <button className="diff-pill new-btn" onClick={() => newGame()}>↻ new</button>
      </div>

      {/* Main layout */}
      <main className="main-layout">
        {/* Grid */}
        <div className="grid-container">
          <div className="sudoku-grid">
            {board.map((val, i) => (
              <Cell
                key={i}
                index={i}
                value={val}
                isGiven={given[i]}
                isSelected={i === selected}
                isPeer={selected >= 0 && isPeer(i, selected)}
                isSameNum={!!selectedVal && val === selectedVal && i !== selected}
                hasConflict={hasConflict(board, i)}
                marks={marks[i]}
                pop={popCells.has(i)}
                shimmer={shimCells.has(i)}
                onClick={() => setSelected(i)}
              />
            ))}
          </div>
        </div>

        {/* Panel */}
        <aside className="panel">
          {/* Mode toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'digit' ? 'on' : ''}`}
              onClick={() => setMode('digit')}
            >
              digit
            </button>
            <button
              className={`mode-btn ${mode === 'pencil' ? 'on' : ''}`}
              onClick={() => setMode('pencil')}
            >
              ✏ pencil
            </button>
          </div>

          {/* Numpad */}
          <div className="numpad">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button
                key={n}
                className={`num-btn ${activeNum === n ? 'active' : ''}`}
                onClick={() => handleNumpadClick(n)}
              >
                {n}
              </button>
            ))}
            <button className="num-btn erase-btn" onClick={handleErase}>⌫</button>
          </div>

          <div className="divider" />

          {/* Actions */}
          <div className="actions">
            <button className="action-btn primary" onClick={handleSolve}>
              <span className="btn-icon">⚡</span> Solve
            </button>
            <button className="action-btn" onClick={handleHint}>
              <span className="btn-icon">💡</span> Hint
            </button>
            <button className="action-btn" onClick={handleClear}>
              <span className="btn-icon">⌫</span> Clear
            </button>
          </div>

          <div className="divider" />

          {/* Status */}
          <div className={`status-msg ${gameWon ? 'won' : ''}`}>
            {statusMsg || 'Select a cell to begin'}
          </div>

          {/* Pencil hint */}
          {mode === 'pencil' && (
            <div className="pencil-hint">pencil mode active — tap digits to annotate</div>
          )}
        </aside>
      </main>

      {/* Win overlay */}
      {gameWon && (
        <div className="win-overlay" onClick={() => newGame()}>
          <div className="win-card">
            <div className="win-emoji">◆</div>
            <h2>Puzzle Solved</h2>
            <p className="win-time">Time: {timer.display}</p>
            <p className="win-sub">tap anywhere to play again</p>
          </div>
        </div>
      )}
    </div>
  );
}