export type SudokuBoard = (number | null)[][];

function shuffle(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function isValid(board: SudokuBoard, r: number, c: number, num: number): boolean {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === num && i !== c) return false;
  }
  // Check col
  for (let i = 0; i < 9; i++) {
    if (board[i][c] === num && i !== r) return false;
  }
  // Check 3x3 box
  const startR = Math.floor(r / 3) * 3;
  const startC = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startR + i][startC + j] === num && (startR + i !== r || startC + j !== c)) {
        return false;
      }
    }
  }
  return true;
}

function solve(board: SudokuBoard): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === null) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (solve(board)) return true;
            board[r][c] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generateSudoku(emptyCells: number = 40): { puzzle: SudokuBoard, solution: SudokuBoard } {
  // Generate a full valid board
  const board: SudokuBoard = Array(9).fill(null).map(() => Array(9).fill(null));
  solve(board);
  
  // Clone to solution
  const solution = board.map(row => [...row]);
  
  // Remove cells to create the puzzle
  const puzzle = board.map(row => [...row]);
  let removed = 0;
  while (removed < emptyCells) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== null) {
      puzzle[r][c] = null;
      removed++;
    }
  }
  
  return { puzzle, solution };
}

export function findConflicts(board: SudokuBoard): { row: number, col: number }[] {
  const conflicts: { row: number; col: number }[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== null && !isValid(board, r, c, val)) {
        conflicts.push({ row: r, col: c });
      }
    }
  }
  return conflicts;
}
