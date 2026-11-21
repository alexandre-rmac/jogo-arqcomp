#!/usr/bin/env node
// tools/testar.js
//
// Confere os bancos de perguntas e simula jogos de cada nível.
// Uso: node tools/testar.js [jogos por nível]      (padrão: 200)

const Gerador = require("../gerador.js");
const { BANCO_PADRAO, BANCO_FACIL, NIVEIS } = require("../banco.js");

const jogosPorNivel = parseInt(process.argv[2], 10) || 200;
let falhas = 0;
function verificar(ok, msg) {
  if (!ok) { falhas++; console.log("FALHA  " + msg); }
}
const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

// ---------------------------------------------------------------- bancos
const minimos = { padrao: 16, facil: 32, medio: 48, dificil: 64 };
console.log("== Bancos de perguntas ==");
for (const [chave, nivel] of Object.entries(NIVEIS)) {
  const banco = nivel.bank;
  const respostas = banco.map(e => e.answer);
  const repetidas = respostas.filter((r, i) => respostas.indexOf(r) !== i);
  verificar(banco.length >= minimos[chave], `${chave}: ${banco.length} perguntas (mínimo ${minimos[chave]})`);
  verificar(repetidas.length === 0, `${chave}: respostas repetidas: ${repetidas.join(", ")}`);
  verificar(nivel.count <= banco.length, `${chave}: count maior que o banco`);
  for (const e of banco) {
    verificar(/^[A-Z]+$/.test(e.answer), `${chave}: "${e.answer}" tem caractere fora de A-Z`);
    verificar(typeof e.clue === "string" && e.clue.trim().length > 10, `${chave}: ${e.answer} sem dica`);
    verificar(e.answer.length <= Math.max(nivel.maxRows, nivel.maxCols),
              `${chave}: ${e.answer} não cabe no tabuleiro`);
    const dica = semAcento(e.clue);
    verificar(!new RegExp(`\\b${e.answer}\\b`).test(dica), `${chave}: a dica de ${e.answer} contém a resposta`);
  }
  console.log(`${chave.padEnd(8)} ${String(banco.length).padStart(2)} perguntas, tabuleiro com ${nivel.count}`);
}
verificar(BANCO_PADRAO.length === 16, "o banco padrão deve ter exatamente 16 perguntas");
const respostasFacil = new Set(BANCO_FACIL.map(e => e.answer));
verificar(BANCO_PADRAO.every(e => respostasFacil.has(e.answer)),
          "todas as perguntas do padrão devem estar no banco fácil");

// ------------------------------------------------------------- simulação
console.log(`\n== Simulação: ${jogosPorNivel} jogos por nível ==`);
console.log("nível    sucesso  reamostras(média/máx)  tempo ms(média/máx)  área do tabuleiro  layouts distintos");
for (const [chave, nivel] of Object.entries(NIVEIS)) {
  const respostasBanco = new Set(nivel.bank.map(e => e.answer));
  let ok = 0, somaAmostras = 0, maxAmostras = 0, somaTempo = 0, maxTempo = 0;
  let menor = Infinity, maior = 0;
  const assinaturas = new Set();
  for (let i = 0; i < jogosPorNivel; i++) {
    const t0 = Date.now();
    const jogo = Gerador.novoJogo(nivel, { semente: 1000 + i });
    const ms = Date.now() - t0;
    somaTempo += ms; maxTempo = Math.max(maxTempo, ms);
    if (!jogo) { verificar(false, `${chave}: jogo ${i} não gerou tabuleiro`); continue; }
    ok++;
    somaAmostras += jogo.amostras; maxAmostras = Math.max(maxAmostras, jogo.amostras);

    const problemas = Gerador.validar(jogo.palavras);
    verificar(problemas.length === 0, `${chave} #${i}: ${problemas.join(" | ")}`);
    verificar(jogo.palavras.length === nivel.count, `${chave} #${i}: ${jogo.palavras.length} palavras`);
    verificar(jogo.palavras.every(w => respostasBanco.has(w.answer)), `${chave} #${i}: palavra fora do banco`);
    verificar(new Set(jogo.palavras.map(w => w.answer)).size === nivel.count, `${chave} #${i}: palavra repetida`);
    verificar(jogo.linhas <= nivel.maxRows && jogo.colunas <= nivel.maxCols, `${chave} #${i}: estourou o limite`);
    const clueOk = jogo.palavras.every(w => nivel.bank.find(e => e.answer === w.answer).clue === w.clue);
    verificar(clueOk, `${chave} #${i}: dica trocada`);

    menor = Math.min(menor, jogo.linhas * jogo.colunas);
    maior = Math.max(maior, jogo.linhas * jogo.colunas);
    assinaturas.add(jogo.palavras.map(w => `${w.answer}${w.direction[0]}${w.row},${w.col}`).sort().join(";"));
  }
  console.log(
    `${chave.padEnd(8)} ${String(ok + "/" + jogosPorNivel).padStart(7)}  ` +
    `${(somaAmostras / Math.max(ok, 1)).toFixed(2).padStart(6)} / ${String(maxAmostras).padEnd(6)}        ` +
    `${(somaTempo / jogosPorNivel).toFixed(0).padStart(5)} / ${String(maxTempo).padEnd(5)}        ` +
    `${menor}..${maior}`.padEnd(19) + `${assinaturas.size}`
  );
}

console.log("\nRESULTADO:", falhas === 0 ? "tudo certo" : `${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);