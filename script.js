// script.js
// Dados do tabuleiro e renderização inicial do jogo.

const BOARD_ROWS = 18;
const BOARD_COLS = 21;
const CELL_SIZE = 30;

// Cada palavra tem: id (número da pista), answer (grafia do tabuleiro),
// direction (horizontal | vertical), row/col (início, 1-based) e clue.
// As palavras 4 (DMA/DATABUS) e 9 (MICROCONTROLADOR/MEMORIADEMASSA)
// compartilham o mesmo número por cruzarem na mesma casa inicial.
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

// Mapa de casas: chave "linha-coluna" -> { row, col, letter, starts, words }
const cells = new Map();

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
        input.maxLength = 1;
        input.className = "cell-input";
        input.dataset.row = row;
        input.dataset.col = col;
        input.disabled = true; // habilitado no próximo commit
        input.autocomplete = "off";
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

document.addEventListener("DOMContentLoaded", () => {
  initCells();
  renderBoard();
  renderClues();
});