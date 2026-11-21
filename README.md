# Cruzadinha de Arquitetura Computacional

Jogo de palavras-cruzadas para treinar os termos da disciplina de Arquitetura Computacional. A cada novo jogo o tabuleiro é montado de novo, com as palavras em posições diferentes.

## Como jogar

1. Escolha o **nível** e clique em **Novo jogo** (trocar o nível também começa um jogo novo).
2. Leia as pistas nas listas de **Horizontais** e **Verticais**. Clicar em uma pista leva o cursor até a palavra.
3. Clique em uma casa do tabuleiro e digite as letras. Clicar de novo numa casa de cruzamento alterna entre horizontal e vertical. As respostas não usam acento, espaço nem hífen (por exemplo, `PLACAMAE`, `MEMORIADEMASSA`).
4. Use as setas do teclado, Tab ou clique para navegar entre as casas. Backspace apaga a letra anterior e Delete limpa a casa atual.
5. Quando todas as casas estiverem preenchidas, clique em **Conferir** para ver quais palavras estão certas (casas e pistas ficam verdes ou vermelhas).
6. O contador mostra quantas palavras você acertou. Corrigir uma casa remove a marcação dela e das pistas que passam por ela.
7. **Reiniciar** limpa as respostas e mantém o mesmo tabuleiro. **Novo jogo** sorteia outro. Se houver respostas digitadas, o jogo pede confirmação antes de descartá-las.

## Níveis

| Nível | Banco de perguntas | No tabuleiro | Conteúdo |
|---|---|---|---|
| **Padrão** | 16 | todas as 16 | O jogo original: componentes, memórias, barramentos e processadores. As posições é que mudam a cada jogo. |
| **Fácil** | 32 | 8 sorteadas | As 16 do Padrão mais 16 conceitos básicos (bit, byte, clock, periféricos, hardware e software, sistemas de numeração). |
| **Médio** | 48 | 16 sorteadas | Pipeline, ISA, RISC e CISC, ciclo de instrução, memória virtual e paginação, entrada e saída, sistema operacional e circuitos digitais. |
| **Difícil** | 64 | 16 sorteadas | Microarquitetura avançada (Tomasulo, renomeação, superescalar), paralelismo (Flynn, Amdahl, SIMD e MIMD), coerência de cache, FPGA e HDL, concorrência, confiabilidade (ECC, RAID, Hamming). |

Para jogar sempre com as perguntas originais, use o nível **Padrão**.

## Como o tabuleiro é montado

A cada jogo o programa:

1. sorteia as perguntas do banco do nível (no Padrão, usa todas);
2. escolhe a direção e a posição de cada palavra, com sorteio, e às vezes gira o tabuleiro (troca linhas por colunas);
3. descarta qualquer disposição que quebre as regras abaixo e fica com a mais compacta e entrelaçada entre as válidas.

Regras da disposição:

- Duas palavras só se tocam por um **cruzamento**: direções diferentes e a mesma letra na casa em comum.
- **Nenhuma palavra começa onde outra termina** na mesma linha ou coluna, nem continua outra. Antes do início e depois do fim de cada palavra a casa fica vazia, para que nada seja lido como uma palavra maior (por exemplo, `ULA` seguida de `ADDRESSBUS` virando `ULADDRESSBUS`).
- Palavras paralelas nunca ficam coladas lado a lado.
- Todas as palavras formam um único bloco conectado.

Cada tabuleiro gerado é conferido por `Gerador.validar()` antes de ser exibido, e qualquer problema aparece no console do navegador.

## Editar o banco de perguntas

Os bancos ficam em `banco.js`. Cada entrada é `{ answer, clue }`:

- `answer`: só letras de A a Z maiúsculas (sem acento, espaço, hífen ou número);
- `clue`: a dica, que não deve conter a própria resposta.

Os níveis ficam no objeto `NIVEIS`, no fim do arquivo: `count` define quantas perguntas entram no tabuleiro e `maxRows`/`maxCols` limitam o tamanho dele. Depois de editar, rode os testes.

## Testes

Precisa do Node.js (nenhum pacote para instalar):

```
node tools/testar.js            # 200 jogos simulados por nível
node tools/testar.js 1000       # bateria maior
```

O script confere os bancos (tamanho mínimo de 16, 32, 48 e 64, respostas só com A-Z, sem repetição, dica sem a resposta, as 16 do Padrão dentro do Fácil) e simula jogos de cada nível, validando cada tabuleiro gerado.

## Link do site

(a ser publicado no GitHub Pages)

## Tecnologias

- HTML
- CSS
- JavaScript

## Estrutura do projeto

- `index.html`: página, seletor de nível e botões
- `style.css`: estilos
- `script.js`: níveis, tabuleiro, digitação, navegação e conferência
- `banco.js`: bancos de perguntas e configuração dos níveis
- `gerador.js`: sorteio das perguntas e geração da disposição
- `tools/testar.js`: testes dos bancos e do gerador
- `README.md`