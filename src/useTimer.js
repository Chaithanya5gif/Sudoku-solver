import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const stop  = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => { setRunning(false); setSeconds(0); }, []);

  const display = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return { seconds, display, running, start, stop, reset };
}