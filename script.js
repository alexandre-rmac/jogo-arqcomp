// script.js
// Dados do tabuleiro, renderização, digitação, navegação e conferência.

const BOARD_ROWS = 17;
const BOARD_COLS = 17;
const CELL_SIZE = 30;

// Disposição gerada por tools/gerar-layout.js (node tools/gerar-layout.js).
// Regras respeitadas: palavras só se tocam por cruzamentos de letras iguais;
// nenhuma começa onde outra termina na mesma linha/coluna; palavras paralelas
// nunca ficam coladas. validateLayout() confere isso ao carregar a página.
const WORDS = [
  { id: 1, answer: "EEPROM", direction: "vertical", row: 1, col: 3,
    clue: "Memória não volátil que pode ser apagada e regravada eletricamente." },
  { id: 2, answer: "ROM", direction: "vertical", row: 1, col: 14,
    clue: "Memória que só permite leitura e guarda dados permanentes." },
  { id: 3, answer: "REGISTRADORES", direction: "vertical", row: 1, col: 16,
    clue: "Pequenas memórias rápidas dentro do processador." },
  { id: 4, answer: "MEMORIADEMASSA", direction: "vertical", row: 2, col: 1,
    clue: "Armazenamento permanente de grande capacidade, como HD e SSD." },
  { id: 5, answer: "QUADCORE", direction: "horizontal", row: 2, col: 9,
    clue: "Processador com quatro núcleos de processamento." },
  { id: 6, answer: "UC", direction: "vertical", row: 2, col: 10,
    clue: "Parte da CPU que coordena e controla as operações." },
  { id: 7, answer: "RAM", direction: "horizontal", row: 6, col: 1,
    clue: "Memória volátil usada para armazenar dados temporários." },
  { id: 8, answer: "DUALCORE", direction: "horizontal", row: 7, col: 10,
    clue: "Processador com dois núcleos de processamento." },
  { id: 9, answer: "ULA", direction: "vertical", row: 7, col: 11,
    clue: "Parte da CPU que faz as contas e as operações lógicas." },
  { id: 10, answer: "CACHE", direction: "horizontal", row: 8, col: 3,
    clue: "Memória rápida que guarda dados usados com frequência." },
  { id: 11, answer: "ADDRESSBUS", direction: "vertical", row: 8, col: 4,
    clue: "Conjunto de fios que indica onde o dado está na memória." },
  { id: 12, answer: "DMA", direction: "horizontal", row: 9, col: 9,
    clue: "Técnica que permite transferir dados sem a intervenção constante do processador." },
  { id: 12, answer: "DATABUS", direction: "vertical", row: 9, col: 9,
    clue: "Conjunto de fios que transporta informações entre componentes." },
  { id: 13, answer: "FLASH", direction: "vertical", row: 9, col: 13,
    clue: "Memória não volátil usada em pendrives e cartões." },
  { id: 14, answer: "MICROCONTROLADOR", direction: "horizontal", row: 11, col: 1,
    clue: "Chip que integra processador, memória e periféricos em um só." },
  { id: 15, answer: "CPU", direction: "vertical", row: 11, col: 6,
    clue: "Componente que executa instruções e coordena o sistema." }
];

const ARROWS = {
  ArrowRight: { dr: 0, dc: 1, direction: "horizontal" },
  ArrowLeft:  { dr: 0, dc: -1, direction: "horizontal" },
  ArrowDown:  { dr: 1, dc: 0, direction: "vertical" },
  ArrowUp:    { dr: -1, dc: 0, direction: "vertical" }
};

const cells = new Map();

let currentDirection = "horizontal";
let currentWord = null;
let currentIndex = 0;

// ============ Validação da disposição ============

// Confere se a disposição das palavras é válida e avisa no console se não for.
// Devolve a lista de problemas encontrados (vazia quando tudo está certo).
function validateLayout() {
  const problems = [];
  const grid = new Map();

  for (const w of WORDS) {
    for (let i = 0; i < w.answer.length; i++) {
      const { row, col } = getPositionInWord(w, i);
      if (row < 1 || row > BOARD_ROWS || col < 1 || col > BOARD_COLS) {
        problems.push(`"${w.answer}" sai do tabuleiro.`);
        continue;
      }
      const key = `${row}-${col}`;
      if (grid.has(key) && grid.get(key) !== w.answer[i]) {
        problems.push(`Letras diferentes na linha ${row}, coluna ${col} ("${w.answer}").`);
      }
      grid.set(key, w.answer[i]);
    }
  }

  // Toda sequência de 2+ casas seguidas precisa ser exatamente uma palavra.
  // Isso pega "palavra que começa onde outra termina" (ex.: ULA + ADDRESSBUS)
  // e também palavras paralelas coladas.
  const declared = new Set(
    WORDS.map(w => `${w.direction}|${w.row}-${w.col}|${w.answer}`)
  );
  for (const direction of ["horizontal", "vertical"]) {
    const dr = direction === "vertical" ? 1 : 0;
    const dc = direction === "horizontal" ? 1 : 0;
    for (const key of grid.keys()) {
      const [row, col] = key.split("-").map(Number);
      if (grid.has(`${row - dr}-${col - dc}`)) continue; // não é início de sequência
      let text = "";
      let r = row;
      let c = col;
      while (grid.has(`${r}-${c}`)) {
        text += grid.get(`${r}-${c}`);
        r += dr;
        c += dc;
      }
      if (text.length >= 2 && !declared.has(`${direction}|${row}-${col}|${text}`)) {
        problems.push(
          `Sequência não intencional "${text}" (${direction}, linha ${row}, coluna ${col}).`
        );
      }
    }
  }

  // Cada par (número, direção) precisa ser único.
  const seen = new Set();
  for (const w of WORDS) {
    const k = `${w.id}|${w.direction}`;
    if (seen.has(k)) problems.push(`Número ${w.id} repetido na mesma direção.`);
    seen.add(k);
  }

  if (problems.length > 0) {
    console.warn("Problemas na disposição das palavras:\n- " + problems.join("\n- "));
  }
  return problems;
}

// ============ Montagem do tabuleiro ============

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

  for (const w of horizontal) hList.appendChild(createClueItem(w));
  for (const w of vertical) vList.appendChild(createClueItem(w));
}

function createClueItem(word) {
  const li = document.createElement("li");
  li.textContent = `${word.id}. ${word.clue}`;
  li.dataset.id = word.id;
  li.dataset.direction = word.direction;
  // Clicar na pista leva o cursor para a primeira casa da palavra.
  li.addEventListener("click", () => {
    currentDirection = word.direction;
    focusWordAtIndex(word, 0);
  });
  return li;
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

function getAllInputs() {
  return Array.from(document.querySelectorAll(".cell-input"));
}

function getClueItem(word) {
  return document.querySelector(
    `#clues li[data-id="${word.id}"][data-direction="${word.direction}"]`
  );
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
  const li = getClueItem(currentWord);
  if (li) li.classList.add("active");
}

function focusWordAtIndex(word, index) {
  if (!word || index < 0 || index >= word.answer.length) return;
  const pos = getPositionInWord(word, index);
  const input = getInputAt(pos.row, pos.col);
  if (input) input.focus();
}

// Move o foco com as setas para a próxima casa existente naquela direção
// (pulando espaços vazios do tabuleiro).
function moveFocus(fromRow, fromCol, arrow) {
  let row = fromRow + arrow.dr;
  let col = fromCol + arrow.dc;
  while (row >= 1 && row <= BOARD_ROWS && col >= 1 && col <= BOARD_COLS) {
    const data = cells.get(`${row}-${col}`);
    if (data) {
      if (data.words.some(w => w.direction === arrow.direction)) {
        currentDirection = arrow.direction;
      }
      const input = getInputAt(row, col);
      if (input) input.focus();
      return;
    }
    row += arrow.dr;
    col += arrow.dc;
  }
}

// ============ Conferência, placar e reinício ============

function updateScore() {
  const correct = document.querySelectorAll("#clues li.correct").length;
  const total = WORDS.length;
  const score = document.getElementById("score");
  score.textContent = correct === total
    ? `${correct} de ${total} palavras - parabéns!`
    : `${correct} de ${total} palavras`;
}

// O botão Conferir só fica ativo quando todas as casas têm uma letra.
function updateCheckButton() {
  const btn = document.getElementById("check-btn");
  btn.disabled = !getAllInputs().every(input => input.value !== "");
}

// Ao editar uma casa, some a marcação dela e das pistas que passam por ela.
function clearMarksForCell(input) {
  input.parentElement.classList.remove("correct", "wrong");
  const row = parseInt(input.dataset.row, 10);
  const col = parseInt(input.dataset.col, 10);
  const data = cells.get(`${row}-${col}`);
  if (!data) return;
  for (const ref of data.words) {
    const word = WORDS.find(w => w.id === ref.id && w.direction === ref.direction);
    const li = word && getClueItem(word);
    if (li) li.classList.remove("correct", "wrong");
  }
  updateScore();
}

function onCellChanged(input) {
  clearMarksForCell(input);
  updateCheckButton();
}

function checkAnswers() {
  for (const w of WORDS) {
    let ok = true;
    for (let i = 0; i < w.answer.length; i++) {
      const pos = getPositionInWord(w, i);
      const input = getInputAt(pos.row, pos.col);
      if (!input || input.value !== w.answer[i]) ok = false;
    }
    const li = getClueItem(w);
    if (li) {
      li.classList.toggle("correct", ok);
      li.classList.toggle("wrong", !ok);
    }
  }

  for (const input of getAllInputs()) {
    const data = cells.get(`${input.dataset.row}-${input.dataset.col}`);
    const right = !!data && input.value === data.letter;
    input.parentElement.classList.toggle("correct", right);
    input.parentElement.classList.toggle("wrong", !right);
  }

  updateScore();
}

function resetBoard() {
  for (const input of getAllInputs()) {
    input.value = "";
    input.parentElement.classList.remove("correct", "wrong");
  }
  document.querySelectorAll("#clues li").forEach(li => {
    li.classList.remove("correct", "wrong", "active");
  });
  currentDirection = "horizontal";
  currentWord = null;
  currentIndex = 0;
  updateScore();
  updateCheckButton();
  const first = document.querySelector(".cell-input");
  if (first) first.focus();
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
  onCellChanged(e.target);
  if (cleaned && currentWord && currentIndex < currentWord.answer.length - 1) {
    focusWordAtIndex(currentWord, currentIndex + 1);
  }
}

function handleKeydown(e) {
  const arrow = ARROWS[e.key];
  if (arrow) {
    e.preventDefault();
    moveFocus(parseInt(e.target.dataset.row, 10), parseInt(e.target.dataset.col, 10), arrow);
    return;
  }

  if (e.key === "Delete") {
    e.preventDefault();
    e.target.value = "";
    onCellChanged(e.target);
    return;
  }

  if (e.key === "Backspace") {
    e.preventDefault();
    if (e.target.value) {
      e.target.value = "";
      onCellChanged(e.target);
      return;
    }
    if (currentWord && currentIndex > 0) {
      focusWordAtIndex(currentWord, currentIndex - 1);
      const active = document.activeElement;
      if (active && active.classList.contains("cell-input")) {
        active.value = "";
        onCellChanged(active);
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
  validateLayout();
  initCells();
  renderBoard();
  renderClues();

  document.getElementById("check-btn").addEventListener("click", checkAnswers);
  document.getElementById("reset-btn").addEventListener("click", resetBoard);

  updateScore();
  updateCheckButton();
});