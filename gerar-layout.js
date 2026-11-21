#!/usr/bin/env node
// tools/gerar-layout.js
//
// Gera uma disposição válida para a cruzadinha e imprime o bloco `WORDS`
// pronto para colar em script.js.
//
// Uso:   node tools/gerar-layout.js [tentativas] [linhas] [colunas]
// Ex.:   node tools/gerar-layout.js 3000 18 21
//
// Regras de validade (todas verificadas no final por validar()):
//   1. Duas palavras só se tocam por um CRUZAMENTO: direções diferentes e
//      mesma letra na casa em comum.
//   2. Nenhuma palavra começa onde outra termina na mesma linha/coluna,
//      nem continua outra (ex.: "ULA" + "ADDRESSBUS" lido como "ULADDRESSBUS").
//      Antes do início e depois do fim de cada palavra a casa fica vazia.
//   3. Palavras paralelas nunca ficam coladas lado a lado (isso formaria
//      sequências de duas letras que não são palavra nenhuma).
//   4. Todas as palavras formam um único bloco conectado.

// ---------------------------------------------------------------------------
// Vocabulário (a ordem não importa; os números são calculados no final)
// ---------------------------------------------------------------------------
const ENTRADAS = [
  { answer: "EEPROM", direction: "vertical",
    clue: "Memória não volátil que pode ser apagada e regravada eletricamente." },
  { answer: "CPU", direction: "vertical",
    clue: "Componente que executa instruções e coordena o sistema." },
  { answer: "ULA", direction: "vertical",
    clue: "Parte da CPU que faz as contas e as operações lógicas." },
  { answer: "DMA", direction: "horizontal",
    clue: "Técnica que permite transferir dados sem a intervenção constante do processador." },
  { answer: "DATABUS", direction: "vertical",
    clue: "Conjunto de fios que transporta informações entre componentes." },
  { answer: "FLASH", direction: "vertical",
    clue: "Memória não volátil usada em pendrives e cartões." },
  { answer: "UC", direction: "vertical",
    clue: "Parte da CPU que coordena e controla as operações." },
  { answer: "ROM", direction: "vertical",
    clue: "Memória que só permite leitura e guarda dados permanentes." },
  { answer: "ADDRESSBUS", direction: "vertical",
    clue: "Conjunto de fios que indica onde o dado está na memória." },
  { answer: "MICROCONTROLADOR", direction: "horizontal",
    clue: "Chip que integra processador, memória e periféricos em um só." },
  { answer: "MEMORIADEMASSA", direction: "vertical",
    clue: "Armazenamento permanente de grande capacidade, como HD e SSD." },
  { answer: "REGISTRADORES", direction: "vertical",
    clue: "Pequenas memórias rápidas dentro do processador." },
  { answer: "DUALCORE", direction: "horizontal",
    clue: "Processador com dois núcleos de processamento." },
  { answer: "CACHE", direction: "horizontal",
    clue: "Memória rápida que guarda dados usados com frequência." },
  { answer: "RAM", direction: "horizontal",
    clue: "Memória volátil usada para armazenar dados temporários." },
  { answer: "QUADCORE", direction: "horizontal",
    clue: "Processador com quatro núcleos de processamento." }
];

// ---------------------------------------------------------------------------
// Gerador aleatório com semente (resultados reproduzíveis)
// ---------------------------------------------------------------------------
function criarRng(semente) {
  let a = semente >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const chave = (r, c) => `${r},${c}`;
const passoAoLongo = (dir) => (dir === "horizontal" ? [0, 1] : [1, 0]);
const passoPerp = (dir) => (dir === "horizontal" ? [1, 0] : [0, 1]);

// ---------------------------------------------------------------------------
// Estado da grade durante a busca
// ---------------------------------------------------------------------------
function novoEstado() {
  return { grade: new Map(), postas: [], minR: 0, maxR: 0, minC: 0, maxC: 0 };
}

// Verifica se `w` pode ser posta com a 1ª letra em (r, c).
// Devolve { cruzamentos, caixa } ou null se violar alguma regra.
function avaliar(estado, w, r, c, limLinhas, limColunas) {
  const n = w.answer.length;
  const [ar, ac] = passoAoLongo(w.direction);
  const [pr, pc] = passoPerp(w.direction);
  const { grade } = estado;

  // Regra 2: casas imediatamente antes e depois da palavra ficam vazias.
  if (grade.has(chave(r - ar, c - ac))) return null;
  if (grade.has(chave(r + n * ar, c + n * ac))) return null;

  let cruzamentos = 0;
  for (let i = 0; i < n; i++) {
    const rr = r + i * ar;
    const cc = c + i * ac;
    const celula = grade.get(chave(rr, cc));
    if (celula) {
      if (celula.letra !== w.answer[i]) return null;      // letras diferentes
      if (celula[w.direction] !== -1) return null;          // sobreposição colinear
      cruzamentos++;
    } else {
      // Regra 3: casa nova não pode ter vizinha lateral ocupada.
      if (grade.has(chave(rr + pr, cc + pc))) return null;
      if (grade.has(chave(rr - pr, cc - pc))) return null;
    }
  }

  if (estado.postas.length > 0 && cruzamentos === 0) return null;

  // Caixa delimitadora resultante
  const fimR = r + (n - 1) * ar;
  const fimC = c + (n - 1) * ac;
  const caixa = estado.postas.length === 0
    ? { minR: r, maxR: fimR, minC: c, maxC: fimC }
    : {
        minR: Math.min(estado.minR, r), maxR: Math.max(estado.maxR, fimR),
        minC: Math.min(estado.minC, c), maxC: Math.max(estado.maxC, fimC)
      };
  if (caixa.maxR - caixa.minR + 1 > limLinhas) return null;
  if (caixa.maxC - caixa.minC + 1 > limColunas) return null;

  return { cruzamentos, caixa };
}

function colocar(estado, w, r, c, caixa) {
  const [ar, ac] = passoAoLongo(w.direction);
  const idx = estado.postas.length;
  const novas = [];
  for (let i = 0; i < w.answer.length; i++) {
    const k = chave(r + i * ar, c + i * ac);
    let celula = estado.grade.get(k);
    if (!celula) {
      celula = { letra: w.answer[i], horizontal: -1, vertical: -1 };
      estado.grade.set(k, celula);
      novas.push(k);
    }
    celula[w.direction] = idx;
  }
  const anterior = {
    minR: estado.minR, maxR: estado.maxR, minC: estado.minC, maxC: estado.maxC
  };
  Object.assign(estado, caixa);
  estado.postas.push({ w, r, c });
  return { novas, anterior, w, r, c };
}

function desfazer(estado, registro) {
  const [ar, ac] = passoAoLongo(registro.w.direction);
  estado.postas.pop();
  for (let i = 0; i < registro.w.answer.length; i++) {
    const k = chave(registro.r + i * ar, registro.c + i * ac);
    const celula = estado.grade.get(k);
    if (celula) celula[registro.w.direction] = -1;
  }
  for (const k of registro.novas) estado.grade.delete(k);
  Object.assign(estado, registro.anterior);
}

// Todas as posições possíveis de `w` cruzando palavras já postas.
function candidatos(estado, w, limLinhas, limColunas) {
  const saida = [];
  const vistos = new Set();
  for (const p of estado.postas) {
    if (p.w.direction === w.direction) continue;
    const [pAr, pAc] = passoAoLongo(p.w.direction);
    for (let j = 0; j < p.w.answer.length; j++) {
      const cr = p.r + j * pAr;
      const cc = p.c + j * pAc;
      for (let i = 0; i < w.answer.length; i++) {
        if (w.answer[i] !== p.w.answer[j]) continue;
        const r = w.direction === "vertical" ? cr - i : cr;
        const c = w.direction === "horizontal" ? cc - i : cc;
        const k = chave(r, c);
        if (vistos.has(k)) continue;
        vistos.add(k);
        const av = avaliar(estado, w, r, c, limLinhas, limColunas);
        if (av) saida.push({ r, c, ...av });
      }
    }
  }
  return saida;
}

// ---------------------------------------------------------------------------
// Busca com retrocesso (escolhe sempre a palavra com menos opções)
// ---------------------------------------------------------------------------
function buscar(rng, limLinhas, limColunas, limiteNos) {
  const estado = novoEstado();
  const ordenadas = [...ENTRADAS].sort((a, b) => b.answer.length - a.answer.length);
  const primeira = ordenadas.find(w => w.direction === "horizontal");
  const restantes = ordenadas.filter(w => w !== primeira);

  const av = avaliar(estado, primeira, 0, 0, limLinhas, limColunas);
  colocar(estado, primeira, 0, 0, av.caixa);

  let nos = 0;
  function recursao(pendentes) {
    if (pendentes.length === 0) return true;
    if (++nos > limiteNos) return false;

    // Uma palavra sem posição agora pode ganhar posição depois (ex.: uma
    // horizontal que só cruza verticais ainda não postas). Por isso só
    // desistimos do ramo se NENHUMA pendente couber.
    let melhor = null;
    for (const w of pendentes) {
      const lista = candidatos(estado, w, limLinhas, limColunas);
      if (lista.length === 0) continue;
      if (!melhor || lista.length < melhor.lista.length) melhor = { w, lista };
    }
    if (!melhor) return false;

    // Prefere mais cruzamentos e caixa menor; o sorteio desempata.
    const area = (cand) =>
      (cand.caixa.maxR - cand.caixa.minR + 1) * (cand.caixa.maxC - cand.caixa.minC + 1);
    melhor.lista.sort((x, y) =>
      (y.cruzamentos - x.cruzamentos) * 40 + (area(x) - area(y)) + (rng() - 0.5) * 120);

    const proximos = pendentes.filter(w => w !== melhor.w);
    for (const cand of melhor.lista.slice(0, 5)) {
      const reg = colocar(estado, melhor.w, cand.r, cand.c, cand.caixa);
      if (recursao(proximos)) return true;
      desfazer(estado, reg);
    }
    return false;
  }

  return recursao(restantes) ? estado : null;
}

// ---------------------------------------------------------------------------
// Conversão para o formato do jogo (coordenadas a partir de 1) e numeração
// ---------------------------------------------------------------------------
function paraPalavras(estado) {
  const lista = estado.postas.map(({ w, r, c }) => ({
    answer: w.answer,
    direction: w.direction,
    clue: w.clue,
    row: r - estado.minR + 1,
    col: c - estado.minC + 1
  }));
  return numerar(lista);
}

// Numeração clássica: ordem de leitura das casas iniciais; palavras que
// começam na mesma casa dividem o mesmo número.
function numerar(lista) {
  const iniciais = [...new Set(lista.map(w => `${w.row},${w.col}`))]
    .map(k => k.split(",").map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const numeroDe = new Map(iniciais.map(([r, c], i) => [`${r},${c}`, i + 1]));
  return lista
    .map(w => ({ id: numeroDe.get(`${w.row},${w.col}`), ...w }))
    .sort((a, b) => a.id - b.id || (a.direction === "horizontal" ? -1 : 1));
}

// ---------------------------------------------------------------------------
// Validador independente: olha só o resultado final, não o processo de busca
// ---------------------------------------------------------------------------
function validar(palavras) {
  const problemas = [];
  const grade = new Map();

  for (const w of palavras) {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.direction === "vertical" ? w.row + i : w.row;
      const c = w.direction === "horizontal" ? w.col + i : w.col;
      const k = chave(r, c);
      if (grade.has(k) && grade.get(k) !== w.answer[i]) {
        problemas.push(`Letras diferentes em (${r},${c}) – ${w.answer}`);
      }
      grade.set(k, w.answer[i]);
    }
  }

  // Toda sequência de 2+ casas seguidas tem de ser exatamente uma palavra.
  const declaradas = new Map(palavras.map(w => [`${w.direction}|${w.row},${w.col}`, w.answer]));
  for (const dir of ["horizontal", "vertical"]) {
    const [ar, ac] = passoAoLongo(dir);
    for (const k of grade.keys()) {
      const [r, c] = k.split(",").map(Number);
      if (grade.has(chave(r - ar, c - ac))) continue;       // não é início de sequência
      let texto = "";
      let rr = r, cc = c;
      while (grade.has(chave(rr, cc))) {
        texto += grade.get(chave(rr, cc));
        rr += ar; cc += ac;
      }
      if (texto.length < 2) continue;
      if (declaradas.get(`${dir}|${r},${c}`) !== texto) {
        problemas.push(`Sequência não intencional "${texto}" (${dir}, linha ${r}, coluna ${c})`);
      }
    }
  }

  // Conectividade (vizinhança de 4 casas)
  const todas = [...grade.keys()];
  const visitadas = new Set([todas[0]]);
  const fila = [todas[0]];
  while (fila.length) {
    const [r, c] = fila.pop().split(",").map(Number);
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = chave(r + dr, c + dc);
      if (grade.has(k) && !visitadas.has(k)) { visitadas.add(k); fila.push(k); }
    }
  }
  if (visitadas.size !== grade.size) problemas.push("O tabuleiro não é um bloco conectado.");

  // Cada palavra precisa cruzar pelo menos outra
  for (const w of palavras) {
    let cruza = false;
    for (let i = 0; i < w.answer.length && !cruza; i++) {
      const r = w.direction === "vertical" ? w.row + i : w.row;
      const c = w.direction === "horizontal" ? w.col + i : w.col;
      const [pr, pc] = passoPerp(w.direction);
      cruza = grade.has(chave(r + pr, c + pc)) || grade.has(chave(r - pr, c - pc));
    }
    if (!cruza) problemas.push(`"${w.answer}" não cruza nenhuma outra palavra.`);
  }

  return problemas;
}

function estatisticas(palavras) {
  const dono = new Map();
  for (const w of palavras) {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.direction === "vertical" ? w.row + i : w.row;
      const c = w.direction === "horizontal" ? w.col + i : w.col;
      const k = chave(r, c);
      dono.set(k, (dono.get(k) || 0) + 1);
    }
  }
  const linhas = Math.max(...palavras.map(w =>
    w.direction === "vertical" ? w.row + w.answer.length - 1 : w.row));
  const colunas = Math.max(...palavras.map(w =>
    w.direction === "horizontal" ? w.col + w.answer.length - 1 : w.col));
  const cruzamentos = [...dono.values()].filter(v => v > 1).length;
  return { linhas, colunas, cruzamentos, casas: dono.size };
}

function desenhar(palavras) {
  const { linhas, colunas } = estatisticas(palavras);
  const grade = new Map();
  for (const w of palavras) {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.direction === "vertical" ? w.row + i : w.row;
      const c = w.direction === "horizontal" ? w.col + i : w.col;
      grade.set(chave(r, c), w.answer[i]);
    }
  }
  const out = [];
  for (let r = 1; r <= linhas; r++) {
    let linha = String(r).padStart(2) + " ";
    for (let c = 1; c <= colunas; c++) linha += (grade.get(chave(r, c)) || "·") + " ";
    out.push(linha);
  }
  return out.join("\n");
}

function blocoJs(palavras, linhas, colunas) {
  const itens = palavras.map(w =>
    `  { id: ${w.id}, answer: "${w.answer}", direction: "${w.direction}", ` +
    `row: ${w.row}, col: ${w.col},\n    clue: ${JSON.stringify(w.clue)} }`);
  return `const BOARD_ROWS = ${linhas};\nconst BOARD_COLS = ${colunas};\n\n` +
         `const WORDS = [\n${itens.join(",\n")}\n];`;
}

// ---------------------------------------------------------------------------
// Programa principal
// ---------------------------------------------------------------------------
function principal() {
  const tentativas = parseInt(process.argv[2], 10) || 3000;
  const limLinhas = parseInt(process.argv[3], 10) || 18;
  const limColunas = parseInt(process.argv[4], 10) || 21;

  let melhor = null;
  for (let semente = 1; semente <= tentativas; semente++) {
    const estado = buscar(criarRng(semente), limLinhas, limColunas, 4000);
    if (!estado) continue;
    const palavras = paraPalavras(estado);
    if (validar(palavras).length > 0) continue;               // segurança extra
    const est = estatisticas(palavras);
    // Menor área primeiro; mais cruzamentos compensam um pouco de área.
    const custo = est.linhas * est.colunas - est.cruzamentos * 6;
    if (!melhor || custo < melhor.custo) melhor = { custo, semente, palavras, est };
  }

  if (!melhor) {
    console.error(`Nenhum layout encontrado em ${limLinhas}x${limColunas}. ` +
                  "Aumente o tabuleiro ou o número de tentativas.");
    process.exit(1);
  }

  const { palavras, est, semente } = melhor;
  console.error(`Semente ${semente}: ${est.linhas}x${est.colunas}, ` +
                `${est.cruzamentos} cruzamentos, ${est.casas} casas.\n`);
  console.error(desenhar(palavras) + "\n");
  console.log(blocoJs(palavras, est.linhas, est.colunas));
}

if (require.main === module) principal();

module.exports = { validar, estatisticas, desenhar, numerar };