// ── PUZZLES ────────────────────────────────────────────────────────────────
export const PUZZLES = {
  easy: [
    "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    "003020600900305001001806400008102900700000008006708200002609500800203009005010300",
    "200080300060070084030500209000105408000000000402706000301007040720040060004010003",
    "000000907000420180000705026100904000050000040000507009920108000034059000507000000",
  ],
  medium: [
    "010020300004005060070000008006900070000804000080007500500000030060100800007030040",
    "000000000000003085001020000000507000004600200000100030070090002000800070060010400",
    "000200060000050009100000000030070040600010000000803700000000080450000300008000000",
    "009006007050090010000000300000700040008030060020004000007000000010070050900200600",
  ],
  hard: [
    "800000000003600000070090200060005030000902000010800065400070903006000028000000761",
    "000600400700003600000091080000000000050180003000306045040200060903000000020000100",
    "004300209005009001070060043006002087190007400050083000600000105003508690042910300",
    "030000080009006070000200030500400006000000000800005003090003000060700100010000060",
  ],
};

// ── VALIDATION ─────────────────────────────────────────────────────────────
export function isValid(board, idx, val) {
  const r = Math.floor(idx / 9);
  const c = idx % 9;
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (board[r * 9 + i] === val && i !== c) return false;
    if (board[i * 9 + c] === val && i !== r) return false;
    const nr = br + Math.floor(i / 3);
    const nc = bc + (i % 3);
    if (board[nr * 9 + nc] === val && nr * 9 + nc !== idx) return false;
  }
  return true;
}

// ── SOLVER ─────────────────────────────────────────────────────────────────
export function solve(board) {
  const b = [...board];
  function bt() {
    const idx = b.indexOf(0);
    if (idx < 0) return true;
    for (let v = 1; v <= 9; v++) {
      if (isValid(b, idx, v)) {
        b[idx] = v;
        if (bt()) return true;
        b[idx] = 0;
      }
    }
    return false;
  }
  return bt() ? b : null;
}

// Collect ordered steps for animation (forward passes only)
export function solveSteps(board) {
  const b = [...board];
  const steps = [];

  function bt() {
    const idx = b.indexOf(0);
    if (idx < 0) return true;
    for (let v = 1; v <= 9; v++) {
      if (isValid(b, idx, v)) {
        b[idx] = v;
        steps.push({ idx, v });
        if (bt()) return true;
        b[idx] = 0;
      }
    }
    return false;
  }

  bt();
  // Return only the final assignment for each cell (avoid backtrack flicker)
  const seen = new Map();
  for (const s of steps) seen.set(s.idx, s.v);
  return [...seen.entries()].map(([idx, v]) => ({ idx, v }));
}

// ── CONFLICTS ──────────────────────────────────────────────────────────────
export function hasConflict(board, idx) {
  const v = board[idx];
  if (!v) return false;
  const r = Math.floor(idx / 9);
  const c = idx % 9;
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (board[r * 9 + i] === v && r * 9 + i !== idx) return true;
    if (board[i * 9 + c] === v && i * 9 + c !== idx) return true;
    const nr = br + Math.floor(i / 3);
    const nc = bc + (i % 3);
    if (board[nr * 9 + nc] === v && nr * 9 + nc !== idx) return true;
  }
  return false;
}

// ── PEERS ──────────────────────────────────────────────────────────────────
export function isPeer(a, b) {
  const ra = Math.floor(a / 9), ca = a % 9;
  const rb = Math.floor(b / 9), cb = b % 9;
  return (
    ra === rb ||
    ca === cb ||
    (Math.floor(ra / 3) === Math.floor(rb / 3) && Math.floor(ca / 3) === Math.floor(cb / 3))
  );
}

// ── HELPERS ────────────────────────────────────────────────────────────────
export function parsePuzzle(str) {
  return str.split('').map(Number);
}

export function isSolved(board, given) {
  for (let i = 0; i < 81; i++) {
    if (!board[i]) return false;
    if (hasConflict(board, i)) return false;
  }
  return true;
}