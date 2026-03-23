import React from 'react';
import './Cell.css';

function Cell({ index, value, isGiven, isSelected, isPeer, isSameNum, hasConflict, marks, onClick, pop }) {
  const r = Math.floor(index / 9);
  const c = index % 9;

  const classes = [
    'cell',
    isGiven    ? 'given'    : '',
    !isGiven && value ? 'solved' : '',
    isSelected  ? 'selected' : '',
    isPeer && !isSelected ? 'peer' : '',
    isSameNum && !isSelected ? 'same-num' : '',
    hasConflict ? 'conflict' : '',
    pop         ? 'pop'     : '',
    c === 3 || c === 6 ? 'border-left-thick'  : '',
    r === 3 || r === 6 ? 'border-top-thick'   : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Row ${r + 1}, Column ${c + 1}${value ? `, value ${value}` : ', empty'}`}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {value ? (
        <span className="cell-value">{value}</span>
      ) : (
        <div className="marks-grid">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <span key={n} className={`mark ${marks.has(n) ? 'mark-visible' : ''}`}>
              {marks.has(n) ? n : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(Cell);