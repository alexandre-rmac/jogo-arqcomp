// script.js
// Níveis, renderização do tabuleiro, digitação, navegação e conferência.
//
// Dependências (carregadas antes no index.html):
//   banco.js    -> NIVEIS e os bancos de perguntas
//   gerador.js  -> Gerador.novoJogo(): sorteia as perguntas e as posições

const CELL_SIZE = 30;
const DEFAULT_LEVEL = "padrao";

const ARROWS = {
  ArrowRight: { dr: 0, dc: 1, direction: "horizontal" },
  ArrowLeft:  { dr: 0, dc: -1, direction: "horizontal" },
  ArrowDown:  { dr: 1, dc: 0, direction: "vertical" },
  ArrowUp:    { dr: -1, dc: 0, direction: "vertical" }
};

// Estado do jogo atual (refeito a cada "Novo jogo")
let WORDS = [];
let boardRows = 0;
let boardCols = 0;
let currentLevel = DEFAULT_LEVEL;
const cells = new Map();

let currentDirection = "horizontal";
let currentWord = null;
let currentIndex = 0;

// ============ Novo jogo e níveis ============

// Sorteia as perguntas do nível, gera um tabuleiro com posições novas e o
// desenha. Devolve false se não foi possível montar o tabuleiro.
function startNewGame(levelKey) {
  const level = NIVEIS[levelKey];
  const info = document.getElementById("level-info");
  const game = Gerador.novoJogo(level);

  if (!game) {
    info.textContent = "Não foi possível montar o tabuleiro. Clique em Novo jogo para tentar de novo.";
    return false;
  }

  currentLevel = levelKey;
  WORDS = game.palavras;
  boardRows = game.linhas;
  boardCols = game.colunas;

  cells.clear();
  currentDirection = "horizontal";
  currentWord = null;
  currentIndex = 0;

  const problems = Gerador.validar(WORDS);
  if (problems.length > 0) {
    console.warn("Problemas na disposição das palavras:\n- " + problems.join("\n- "));
  }

  initCells();
  renderBoard();
  renderClues();
  updateScore();
  updateCheckButton();

  info.textContent = level.count === level.bank.length
    ? `${level.count} perguntas, todas do banco (posições sorteadas).`
    : `${level.count} perguntas sorteadas entre ${level.bank.length} do banco.`;
  return true;
}

function hasProgress() {
  return getAllInputs().some(input => input.value !== "");
}

function populateLevels() {
  const select = document.getElementById("level-select");
  select.innerHTML = "";
  for (const [key, level] of Object.entries(NIVEIS)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${level.name} (${level.count} perguntas)`;
    select.appendChild(option);
  }
  select.value = DEFAULT_LEVEL;
}

function confirmDiscard() {
  return !hasProgress() ||
    window.confirm("Começar um novo jogo? O progresso atual será perdido.");
}

function handleLevelChange(e) {
  if (!confirmDiscard()) {
    e.target.value = currentLevel; // volta ao nível anterior
    return;
  }
  startNewGame(e.target.value);
}

function handleNewGame() {
  if (!confirmDiscard()) return;
  startNewGame(document.getElementById("level-select").value);
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
  board.style.gridTemplateColumns = `repeat(${boardCols}, ${CELL_SIZE}px)`;
  board.style.gridTemplateRows = `repeat(${boardRows}, ${CELL_SIZE}px)`;
  board.style.gap = "2px";
  board.innerHTML = "";

  for (let row = 1; row <= boardRows; row++) {
    for (let col = 1; col <= boardCols; col++) {
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
  while (row >= 1 && row <= boardRows && col >= 1 && col <= boardCols) {
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
  score.textContent = total > 0 && correct === total
    ? `${correct} de ${total} palavras - parabéns!`
    : `${correct} de ${total} palavras`;
}

// O botão Conferir só fica ativo quando todas as casas têm uma letra.
function updateCheckButton() {
  const btn = document.getElementById("check-btn");
  const inputs = getAllInputs();
  btn.disabled = inputs.length === 0 || !inputs.every(input => input.value !== "");
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

// Limpa as respostas, mas mantém o mesmo tabuleiro.
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
  populateLevels();

  document.getElementById("level-select").addEventListener("change", handleLevelChange);
  document.getElementById("new-btn").addEventListener("click", handleNewGame);
  document.getElementById("check-btn").addEventListener("click", checkAnswers);
  document.getElementById("reset-btn").addEventListener("click", resetBoard);

  startNewGame(DEFAULT_LEVEL);
});