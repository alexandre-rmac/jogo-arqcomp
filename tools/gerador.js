// gerador.js
//
// Gera uma disposição aleatória e válida para a cruzadinha, a partir de uma
// lista de entradas { answer, clue }. Funciona no navegador (objeto global
// `Gerador`) e no Node (module.exports).
//
// Regras de validade (todas conferidas por Gerador.validar()):
//   1. Duas palavras só se tocam por um CRUZAMENTO: direções diferentes e
//      mesma letra na casa em comum.
//   2. Nenhuma palavra começa onde outra termina na mesma linha/coluna, nem
//      continua outra (ex.: "ULA" + "ADDRESSBUS" lido como "ULADDRESSBUS").
//      Antes do início e depois do fim de cada palavra a casa fica vazia.
//   3. Palavras paralelas nunca ficam coladas lado a lado (isso formaria
//      sequências de duas letras que não são palavra nenhuma).
//   4. Todas as palavras formam um único bloco conectado.
//
// A direção (horizontal/vertical) de cada palavra é escolhida pelo gerador.

var Gerador = (function () {
  "use strict";

  // ------------------------------------------------------------------------
  // Utilidades
  // ------------------------------------------------------------------------

  // Gerador pseudoaleatório com semente (resultados reproduzíveis nos testes).
  function criarRng(semente) {
    var a = semente >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function chave(r, c) { return r + "," + c; }
  function passoAoLongo(dir) { return dir === "horizontal" ? [0, 1] : [1, 0]; }
  function passoPerp(dir) { return dir === "horizontal" ? [1, 0] : [0, 1]; }
  function oposta(dir) { return dir === "horizontal" ? "vertical" : "horizontal"; }

  function embaralhar(lista, rng) {
    var copia = lista.slice();
    for (var i = copia.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = copia[i]; copia[i] = copia[j]; copia[j] = tmp;
    }
    return copia;
  }

  // ------------------------------------------------------------------------
  // Estado da grade durante a busca
  // ------------------------------------------------------------------------

  function novoEstado() {
    return { grade: new Map(), postas: [], minR: 0, maxR: 0, minC: 0, maxC: 0 };
  }

  // Verifica se a palavra pode ser posta na direção `dir` com a 1ª letra em
  // (r, c). Devolve { cruzamentos, caixa } ou null se violar alguma regra.
  function avaliar(estado, w, dir, r, c, limLinhas, limColunas) {
    var n = w.answer.length;
    var along = passoAoLongo(dir), ar = along[0], ac = along[1];
    var perp = passoPerp(dir), pr = perp[0], pc = perp[1];
    var grade = estado.grade;

    // Regra 2: casas imediatamente antes e depois da palavra ficam vazias.
    if (grade.has(chave(r - ar, c - ac))) return null;
    if (grade.has(chave(r + n * ar, c + n * ac))) return null;

    var cruzamentos = 0;
    for (var i = 0; i < n; i++) {
      var rr = r + i * ar;
      var cc = c + i * ac;
      var celula = grade.get(chave(rr, cc));
      if (celula) {
        if (celula.letra !== w.answer[i]) return null;      // letras diferentes
        if (celula[dir] !== -1) return null;                  // sobreposição colinear
        cruzamentos++;
      } else {
        // Regra 3: casa nova não pode ter vizinha lateral ocupada.
        if (grade.has(chave(rr + pr, cc + pc))) return null;
        if (grade.has(chave(rr - pr, cc - pc))) return null;
      }
    }

    if (estado.postas.length > 0 && cruzamentos === 0) return null;

    var fimR = r + (n - 1) * ar;
    var fimC = c + (n - 1) * ac;
    var caixa = estado.postas.length === 0
      ? { minR: r, maxR: fimR, minC: c, maxC: fimC }
      : {
          minR: Math.min(estado.minR, r), maxR: Math.max(estado.maxR, fimR),
          minC: Math.min(estado.minC, c), maxC: Math.max(estado.maxC, fimC)
        };
    if (caixa.maxR - caixa.minR + 1 > limLinhas) return null;
    if (caixa.maxC - caixa.minC + 1 > limColunas) return null;

    return { cruzamentos: cruzamentos, caixa: caixa };
  }

  function colocar(estado, w, dir, r, c, caixa) {
    var along = passoAoLongo(dir), ar = along[0], ac = along[1];
    var idx = estado.postas.length;
    var novas = [];
    for (var i = 0; i < w.answer.length; i++) {
      var k = chave(r + i * ar, c + i * ac);
      var celula = estado.grade.get(k);
      if (!celula) {
        celula = { letra: w.answer[i], horizontal: -1, vertical: -1 };
        estado.grade.set(k, celula);
        novas.push(k);
      }
      celula[dir] = idx;
    }
    var anterior = {
      minR: estado.minR, maxR: estado.maxR, minC: estado.minC, maxC: estado.maxC
    };
    estado.minR = caixa.minR; estado.maxR = caixa.maxR;
    estado.minC = caixa.minC; estado.maxC = caixa.maxC;
    estado.postas.push({ w: w, dir: dir, r: r, c: c });
    return { novas: novas, anterior: anterior, w: w, dir: dir, r: r, c: c };
  }

  function desfazer(estado, reg) {
    var along = passoAoLongo(reg.dir), ar = along[0], ac = along[1];
    estado.postas.pop();
    for (var i = 0; i < reg.w.answer.length; i++) {
      var celula = estado.grade.get(chave(reg.r + i * ar, reg.c + i * ac));
      if (celula) celula[reg.dir] = -1;
    }
    for (var j = 0; j < reg.novas.length; j++) estado.grade.delete(reg.novas[j]);
    estado.minR = reg.anterior.minR; estado.maxR = reg.anterior.maxR;
    estado.minC = reg.anterior.minC; estado.maxC = reg.anterior.maxC;
  }

  // Todas as posições possíveis de `w` cruzando palavras já postas. A direção
  // de `w` é sempre a oposta à da palavra que ela cruza.
  function candidatos(estado, w, limLinhas, limColunas) {
    var saida = [];
    var vistos = new Set();
    for (var pi = 0; pi < estado.postas.length; pi++) {
      var p = estado.postas[pi];
      var dir = oposta(p.dir);
      var along = passoAoLongo(p.dir), pAr = along[0], pAc = along[1];
      for (var j = 0; j < p.w.answer.length; j++) {
        var cr = p.r + j * pAr;
        var cc = p.c + j * pAc;
        for (var i = 0; i < w.answer.length; i++) {
          if (w.answer[i] !== p.w.answer[j]) continue;
          var r = dir === "vertical" ? cr - i : cr;
          var c = dir === "horizontal" ? cc - i : cc;
          var k = dir + "|" + chave(r, c);
          if (vistos.has(k)) continue;
          vistos.add(k);
          var av = avaliar(estado, w, dir, r, c, limLinhas, limColunas);
          if (av) saida.push({ dir: dir, r: r, c: c, cruzamentos: av.cruzamentos, caixa: av.caixa });
        }
      }
    }
    return saida;
  }

  // ------------------------------------------------------------------------
  // Busca com retrocesso (escolhe sempre a palavra com menos opções)
  // ------------------------------------------------------------------------

  function buscar(entradas, rng, limLinhas, limColunas, limiteNos) {
    var estado = novoEstado();
    // Mais longas primeiro; o embaralhamento prévio desempata ao acaso.
    var ordenadas = embaralhar(entradas, rng).sort(function (a, b) {
      return b.answer.length - a.answer.length;
    });
    var primeira = ordenadas[0];
    var restantes = ordenadas.slice(1);

    var av = avaliar(estado, primeira, "horizontal", 0, 0, limLinhas, limColunas);
    if (!av) return null;
    colocar(estado, primeira, "horizontal", 0, 0, av.caixa);

    var nos = 0;
    function area(cand) {
      return (cand.caixa.maxR - cand.caixa.minR + 1) * (cand.caixa.maxC - cand.caixa.minC + 1);
    }

    function recursao(pendentes) {
      if (pendentes.length === 0) return true;
      if (++nos > limiteNos) return false;

      // Uma palavra sem posição agora pode ganhar posição depois, por isso
      // só desistimos do ramo se NENHUMA pendente couber.
      var melhor = null;
      for (var i = 0; i < pendentes.length; i++) {
        var lista = candidatos(estado, pendentes[i], limLinhas, limColunas);
        if (lista.length === 0) continue;
        if (!melhor || lista.length < melhor.lista.length) melhor = { w: pendentes[i], lista: lista };
      }
      if (!melhor) return false;

      // Prefere mais cruzamentos e caixa menor; o sorteio desempata.
      melhor.lista.sort(function (x, y) {
        return (y.cruzamentos - x.cruzamentos) * 40 + (area(x) - area(y)) + (rng() - 0.5) * 120;
      });

      var proximos = pendentes.filter(function (w) { return w !== melhor.w; });
      var tentativas = melhor.lista.slice(0, 5);
      for (var t = 0; t < tentativas.length; t++) {
        var cand = tentativas[t];
        var reg = colocar(estado, melhor.w, cand.dir, cand.r, cand.c, cand.caixa);
        if (recursao(proximos)) return true;
        desfazer(estado, reg);
      }
      return false;
    }

    return recursao(restantes) ? estado : null;
  }

  // ------------------------------------------------------------------------
  // Conversão para o formato do jogo (coordenadas a partir de 1) e numeração
  // ------------------------------------------------------------------------

  // `transpor` troca linhas por colunas (e horizontal por vertical), o que dá
  // mais variedade ao sorteio sem quebrar nenhuma regra.
  function paraPalavras(estado, transpor) {
    var lista = estado.postas.map(function (p) {
      var row = p.r - estado.minR + 1;
      var col = p.c - estado.minC + 1;
      return {
        answer: p.w.answer,
        clue: p.w.clue,
        direction: transpor ? oposta(p.dir) : p.dir,
        row: transpor ? col : row,
        col: transpor ? row : col
      };
    });
    return numerar(lista);
  }

  // Numeração clássica: ordem de leitura das casas iniciais; palavras que
  // começam na mesma casa dividem o mesmo número.
  function numerar(lista) {
    var iniciais = Array.from(new Set(lista.map(function (w) { return w.row + "," + w.col; })))
      .map(function (k) { return k.split(",").map(Number); })
      .sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var numeroDe = new Map(iniciais.map(function (rc, i) { return [rc[0] + "," + rc[1], i + 1]; }));
    return lista
      .map(function (w) {
        return {
          id: numeroDe.get(w.row + "," + w.col),
          answer: w.answer, direction: w.direction,
          row: w.row, col: w.col, clue: w.clue
        };
      })
      .sort(function (a, b) {
        return a.id - b.id || (a.direction === "horizontal" ? -1 : 1);
      });
  }

  // ------------------------------------------------------------------------
  // Validador independente: olha só o resultado final, não o processo de busca
  // ------------------------------------------------------------------------

  function validar(palavras) {
    var problemas = [];
    var grade = new Map();

    palavras.forEach(function (w) {
      for (var i = 0; i < w.answer.length; i++) {
        var r = w.direction === "vertical" ? w.row + i : w.row;
        var c = w.direction === "horizontal" ? w.col + i : w.col;
        var k = chave(r, c);
        if (grade.has(k) && grade.get(k) !== w.answer[i]) {
          problemas.push("Letras diferentes em (" + r + "," + c + ") - " + w.answer);
        }
        grade.set(k, w.answer[i]);
      }
    });

    // Toda sequência de 2+ casas seguidas tem de ser exatamente uma palavra.
    var declaradas = new Map(palavras.map(function (w) {
      return [w.direction + "|" + w.row + "," + w.col, w.answer];
    }));
    ["horizontal", "vertical"].forEach(function (dir) {
      var along = passoAoLongo(dir), ar = along[0], ac = along[1];
      grade.forEach(function (_, k) {
        var rc = k.split(",").map(Number), r = rc[0], c = rc[1];
        if (grade.has(chave(r - ar, c - ac))) return;       // não é início de sequência
        var texto = "";
        var rr = r, cc = c;
        while (grade.has(chave(rr, cc))) {
          texto += grade.get(chave(rr, cc));
          rr += ar; cc += ac;
        }
        if (texto.length < 2) return;
        if (declaradas.get(dir + "|" + r + "," + c) !== texto) {
          problemas.push('Sequência não intencional "' + texto + '" (' + dir +
                         ", linha " + r + ", coluna " + c + ")");
        }
      });
    });

    // Conectividade (vizinhança de 4 casas)
    var todas = Array.from(grade.keys());
    if (todas.length > 0) {
      var visitadas = new Set([todas[0]]);
      var fila = [todas[0]];
      while (fila.length) {
        var atual = fila.pop().split(",").map(Number);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var k = chave(atual[0] + d[0], atual[1] + d[1]);
          if (grade.has(k) && !visitadas.has(k)) { visitadas.add(k); fila.push(k); }
        });
      }
      if (visitadas.size !== grade.size) problemas.push("O tabuleiro não é um bloco conectado.");
    }

    // Cada palavra precisa cruzar pelo menos outra
    palavras.forEach(function (w) {
      var cruza = false;
      var perp = passoPerp(w.direction);
      for (var i = 0; i < w.answer.length && !cruza; i++) {
        var r = w.direction === "vertical" ? w.row + i : w.row;
        var c = w.direction === "horizontal" ? w.col + i : w.col;
        cruza = grade.has(chave(r + perp[0], c + perp[1])) ||
                grade.has(chave(r - perp[0], c - perp[1]));
      }
      if (!cruza) problemas.push('"' + w.answer + '" não cruza nenhuma outra palavra.');
    });

    return problemas;
  }

  function estatisticas(palavras) {
    var dono = new Map();
    var linhas = 0, colunas = 0;
    palavras.forEach(function (w) {
      for (var i = 0; i < w.answer.length; i++) {
        var r = w.direction === "vertical" ? w.row + i : w.row;
        var c = w.direction === "horizontal" ? w.col + i : w.col;
        dono.set(chave(r, c), (dono.get(chave(r, c)) || 0) + 1);
        if (r > linhas) linhas = r;
        if (c > colunas) colunas = c;
      }
    });
    var cruzamentos = 0;
    dono.forEach(function (v) { if (v > 1) cruzamentos++; });
    return { linhas: linhas, colunas: colunas, cruzamentos: cruzamentos, casas: dono.size };
  }

  // Desenho em texto do tabuleiro (usado pelas ferramentas de teste).
  function desenhar(palavras) {
    var est = estatisticas(palavras);
    var grade = new Map();
    palavras.forEach(function (w) {
      for (var i = 0; i < w.answer.length; i++) {
        var r = w.direction === "vertical" ? w.row + i : w.row;
        var c = w.direction === "horizontal" ? w.col + i : w.col;
        grade.set(chave(r, c), w.answer[i]);
      }
    });
    var out = [];
    for (var r = 1; r <= est.linhas; r++) {
      var linha = String(r).padStart(2) + " ";
      for (var c = 1; c <= est.colunas; c++) linha += (grade.get(chave(r, c)) || ".") + " ";
      out.push(linha);
    }
    return out.join("\n");
  }

  // ------------------------------------------------------------------------
  // Interface principal
  // ------------------------------------------------------------------------

  // gerarLayout(entradas, opcoes)
  //   entradas: [{ answer, clue }]  (answer só com letras A-Z maiúsculas)
  //   opcoes:   limLinhas, limColunas  limite do tabuleiro (padrão 20 x 20)
  //             tempoMs                orçamento de tempo (padrão 500)
  //             maxSucessos            para ao achar N layouts válidos (padrão 4)
  //             semente                número fixo para resultado reproduzível
  // Devolve { palavras, linhas, colunas, cruzamentos } ou null se não couber.
  function gerarLayout(entradas, opcoes) {
    var o = Object.assign({
      limLinhas: 20, limColunas: 20, tempoMs: 500, maxSucessos: 4, maxTentativas: 80,
      semente: null
    }, opcoes || {});

    var semente = o.semente !== null ? o.semente : Math.floor(Math.random() * 4294967296);
    var rngMestre = criarRng(semente);
    var inicio = Date.now();
    var melhor = null;
    var sucessos = 0;

    for (var t = 0; t < o.maxTentativas; t++) {
      if (Date.now() - inicio > o.tempoMs) break;
      var rng = criarRng(Math.floor(rngMestre() * 4294967296));
      var estado = buscar(entradas, rng, o.limLinhas, o.limColunas, 3000);
      if (!estado) continue;

      var palavras = paraPalavras(estado, rng() < 0.5);
      if (validar(palavras).length > 0) continue;            // segurança extra

      var est = estatisticas(palavras);
      // Menor área primeiro; mais cruzamentos compensam um pouco de área.
      var custo = est.linhas * est.colunas - est.cruzamentos * 6;
      if (!melhor || custo < melhor.custo) {
        melhor = {
          custo: custo, palavras: palavras, linhas: est.linhas,
          colunas: est.colunas, cruzamentos: est.cruzamentos
        };
      }
      if (++sucessos >= o.maxSucessos) break;
    }

    if (!melhor) return null;
    return {
      palavras: melhor.palavras, linhas: melhor.linhas,
      colunas: melhor.colunas, cruzamentos: melhor.cruzamentos
    };
  }

  // novoJogo(nivel, opcoes)
  //   nivel: { bank, count, maxRows, maxCols } (veja NIVEIS em banco.js)
  // Sorteia `count` perguntas do banco e gera o tabuleiro. Se as palavras
  // sorteadas não couberem juntas (por exemplo, letras que não se cruzam),
  // sorteia outro conjunto. Devolve { palavras, linhas, colunas, cruzamentos,
  // amostras } ou null se nenhum sorteio funcionar.
  function novoJogo(nivel, opcoes) {
    var o = Object.assign({ maxAmostras: 40, tempoMs: 400, semente: null }, opcoes || {});
    var semente = o.semente !== null ? o.semente : Math.floor(Math.random() * 4294967296);
    var rng = criarRng(semente);

    for (var a = 1; a <= o.maxAmostras; a++) {
      var amostra = embaralhar(nivel.bank, rng).slice(0, nivel.count);
      var resultado = gerarLayout(amostra, {
        limLinhas: nivel.maxRows, limColunas: nivel.maxCols, tempoMs: o.tempoMs,
        semente: Math.floor(rng() * 4294967296)
      });
      if (resultado) {
        resultado.amostras = a;
        return resultado;
      }
    }
    return null;
  }

  return {
    gerarLayout: gerarLayout,
    novoJogo: novoJogo,
    validar: validar,
    estatisticas: estatisticas,
    desenhar: desenhar,
    numerar: numerar,
    criarRng: criarRng,
    embaralhar: embaralhar
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Gerador;
}