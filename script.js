// script.js
// Dados do tabuleiro, renderização e digitação nas casas.

const BOARD_ROWS = 18;
const BOARD_COLS = 21;
const CELL_SIZE = 30;

const WORDS = [
  { id: 1, answer: "EEPROM", direction: "vertical", row: 1, col: 7,
    clue: "Memória não volátil que pode ser apagada e regravada eletricamente." },
  { id: 2, answer: "CPU", direction: "vertical", row: 2, col: 3,
    clue: "Componente que executa instruções e coordena o sistema." },
  { id: 3, answer: "ULA", direction: "vertical", row: 2, col: 14,
    clue: "Parte da CPU que faz as contas e as operações lógicas." },
  { id: 4, answer: "DMA", direction: "horizontal", row: 3, col: 9,
    clue: "Técnica que permite transferir dados sem a intervenção constante do processador." },
  { id: 4, answer: "DATABUS", direction: "vertical", row: 3, col: 9,
    clue: "Conjunto de fios que transporta informações entre componentes." },
  { id: 5, answer: "FLASH", direction: "vertical", row: 3, col: 13,
    clue: "Memória não volátil usada em pendrives e cartões." },
  { id: 6, answer: "UC", direction: "vertical", row: 4, col: 3,
    clue: "Parte da CPU que coordena e controla as operações." },
  { id: 7, answer: "ROM", direction: "vertical", row: 4, col: 5,
    clue: "Memória que só permite leitura e guarda dados permanentes." },
  { id: 8, answer: "ADDRESSBUS", direction: "vertical", row: 4, col: 14,
    clue: "Conjunto de fios que indica onde o dado está na memória." },
  { id: 9, answer: "MICROCONTROLADOR", direction: "horizontal", row: 5, col: 1,
    clue: "Chip que integra processador, memória e periféricos em um só." },
  { id: 9, answer: "MEMORIADEMASSA", direction: "vertical", row: 5, col: 1,
    clue: "Armazenamento permanente de grande capacidade, como HD e SSD." },
  { id: 10, answer: "REGISTRADORES", direction: "vertical", row: 5, col: 4,
    clue: "Pequenas memórias rápidas dentro do processador." },
  { id: 11, answer: "DUALCORE", direction: "horizontal", row: 6, col: 14,
    clue: "Processador com dois núcleos de processamento." },
  { id: 12, answer: "CACHE", direction: "horizontal", row: 8, col: 10,
    clue: "Memória rápida que guarda dados usados com frequência." },
  { id: 13, answer: "RAM", direction: "horizontal", row: 9, col: 1,
    clue: "Memória volátil usada para armazenar dados temporários." },
  { id: 14, answer: "QUADCORE", direction: "horizontal", row: 12, col: 13,
    clue: "Processador com quatro núcleos de processamento." }
];

const cells = new Map();

let currentDirection = "horizontal";
let currentWord = null;
let currentIndex = 0;

function initCells() {
  for (const w of WORDS) {
    for (let i = 0; i < w.answer.length; i++) {
      const row = w.direction === "vertical" ? w.row + i : w.row;
      const col = w.direction === "horizontal" ? w.col + i : w.col;
      const key = `${row}-${col}`;
      if (!cells.has(key)) {
        cells.set(key, { row, col, letter: w.answer[i], starts: [], words: [] });
      }
      const cell = cells.get(key);
      cell.words.push({ id: w.id, direction: w.direction });
      if (i === 0 && !cell.starts.includes(w.id)) {
        cell.starts.push(w.id);
      }
    }
  }
}

function renderBoard() {
  const board = document.getElementById("board");
  board.style.display = "grid";
  board.style.gridTemplateColumns = `repeat(${BOARD_COLS}, ${CELL_SIZE}px)`;
  board.style.gridTemplateRows = `repeat(${BOARD_ROWS}, ${CELL_SIZE}px)`;
  board.style.gap = "2px";
  board.innerHTML = "";

  for (let row = 1; row <= BOARD_ROWS; row++) {
    for (let col = 1; col <= BOARD_COLS; col++) {
      const key = `${row}-${col}`;
      const data = cells.get(key);
      const div = document.createElement("div");

      if (!data) {
        div.className = "cell-empty";
      } else {
        div.className = "cell";
        div.dataset.row = row;
        div.dataset.col = col;
        div.dataset.letter = data.letter;
        div.dataset.words = JSON.stringify(data.words);

        if (data.starts.length > 0) {
          div.classList.add("has-number");
          const num = document.createElement("span");
          num.className = "cell-number";
          num.textContent = data.starts[0];
          div.appendChild(num);
        }

        const input = document.createElement("input");
        input.type = "text";
        input.className = "cell-input";
        input.dataset.row = row;
        input.dataset.col = col;
        input.autocomplete = "off";
        input.spellcheck = false;
        input.setAttribute("aria-label", `Linha ${row}, coluna ${col}`);
        input.addEventListener("focus", handleFocus);
        input.addEventListener("mousedown", handleMousedown);
        input.addEventListener("input", handleInput);
        input.addEventListener("keydown", handleKeydown);
        div.appendChild(input);
      }

      board.appendChild(div);
    }
  }
}

function renderClues() {
  const horizontal = WORDS.filter(w => w.direction === "horizontal")
                         .sort((a, b) => a.id - b.id);
  const vertical = WORDS.filter(w => w.direction === "vertical")
                       .sort((a, b) => a.id - b.id);

  const hList = document.getElementById("clues-horizontal");
  const vList = document.getElementById("clues-vertical");
  hList.innerHTML = "";
  vList.innerHTML = "";

  for (const w of horizontal) {
    const li = document.createElement("li");
    li.textContent = `${w.id}. ${w.clue}`;
    li.dataset.id = w.id;
    li.dataset.direction = "horizontal";
    hList.appendChild(li);
  }
  for (const w of vertical) {
    const li = document.createElement("li");
    li.textContent = `${w.id}. ${w.clue}`;
    li.dataset.id = w.id;
    li.dataset.direction = "vertical";
    vList.appendChild(li);
  }
}

// ============ Helpers ============

function parseWordsFromCell(cellEl) {
  try {
    return JSON.parse(cellEl.dataset.words || "[]");
  } catch {
    return [];
  }
}

function findWordForCell(cellEl, direction) {
  const cellWords = parseWordsFromCell(cellEl);
  const match = cellWords.find(w => w.direction === direction);
  if (!match) return null;
  return WORDS.find(w => w.id === match.id && w.direction === match.direction) || null;
}

function getIndexInWord(word, row, col) {
  return word.direction === "horizontal" ? col - word.col : row - word.row;
}

function getPositionInWord(word, index) {
  return word.direction === "horizontal"
    ? { row: word.row, col: word.col + index }
    : { row: word.row + index, col: word.col };
}

function getInputAt(row, col) {
  return document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
}

function updateCurrentWordFromFocus(input) {
  const cellEl = input.parentElement;
  const cellWords = parseWordsFromCell(cellEl);
  if (cellWords.length === 0) {
    currentWord = null;
    currentIndex = 0;
    highlightClue();
    return;
  }
  let direction = currentDirection;
  if (!cellWords.some(w => w.direction === direction)) {
    direction = cellWords[0].direction;
    currentDirection = direction;
  }
  currentWord = findWordForCell(cellEl, direction);
  if (currentWord) {
    const row = parseInt(input.dataset.row, 10);
    const col = parseInt(input.dataset.col, 10);
    currentIndex = getIndexInWord(currentWord, row, col);
  } else {
    currentIndex = 0;
  }
  highlightClue();
}

function highlightClue() {
  document.querySelectorAll("#clues li").forEach(li => li.classList.remove("active"));
  if (!currentWord) return;
  const li = document.querySelector(
    `#clues li[data-id="${currentWord.id}"][data-direction="${currentWord.direction}"]`
  );
  if (li) li.classList.add("active");
}

function focusWordAtIndex(word, index) {
  if (!word || index < 0 || index >= word.answer.length) return;
  const pos = getPositionInWord(word, index);
  const input = getInputAt(pos.row, pos.col);
  if (input) input.focus();
}

// ============ Event handlers ============

function handleFocus(e) {
  updateCurrentWordFromFocus(e.target);
}

function handleMousedown(e) {
  if (e.target === document.activeElement) {
    const cellEl = e.target.parentElement;
    const cellWords = parseWordsFromCell(cellEl);
    if (cellWords.length > 1) {
      currentDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
      updateCurrentWordFromFocus(e.target);
    }
  }
}

function handleInput(e) {
  const cleaned = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(-1);
  e.target.value = cleaned;
  if (cleaned && currentWord && currentIndex < currentWord.answer.length - 1) {
    focusWordAtIndex(currentWord, currentIndex + 1);
  }
}

function handleKeydown(e) {
  if (e.key === "Backspace") {
    e.preventDefault();
    if (e.target.value) {
      e.target.value = "";
      return;
    }
    if (currentWord && currentIndex > 0) {
      focusWordAtIndex(currentWord, currentIndex - 1);
      const active = document.activeElement;
      if (active && active.classList.contains("cell-input")) {
        active.value = "";
      }
    }
    return;
  }

  if (!e.ctrlKey && !e.metaKey && !e.altKey
      && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
    if (e.target.value) {
      e.target.value = "";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initCells();
  renderBoard();
  renderClues();
});