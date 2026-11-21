# Cruzadinha de Arquitetura Computacional

Jogo de palavras-cruzadas para treinar os termos da disciplina de Arquitetura Computacional.

## Como jogar

1. Leia as pistas nas listas de **Horizontais** e **Verticais**. Clicar em uma pista leva o cursor até a palavra.
2. Clique em uma casa do tabuleiro e digite as letras. Clicar de novo numa casa de cruzamento alterna entre horizontal e vertical.
3. Use as setas do teclado, Tab ou clique para navegar entre as casas. Backspace apaga a letra anterior e Delete limpa a casa atual.
4. Quando todas as casas estiverem preenchidas, clique em **Conferir** para ver quais palavras estão certas (casas e pistas ficam verdes ou vermelhas).
5. O contador mostra quantas palavras você acertou. Corrigir uma casa remove a marcação dela e das pistas que passam por ela.
6. Clique em **Reiniciar** para limpar o tabuleiro e começar de novo.

## Palavras e pistas

<!-- Tabelas geradas a partir de WORDS em script.js -->

### Horizontais

| Nº | Palavra | Pista |
|---|---|---|
| 5 | QUADCORE | Processador com quatro núcleos de processamento. |
| 7 | RAM | Memória volátil usada para armazenar dados temporários. |
| 8 | DUALCORE | Processador com dois núcleos de processamento. |
| 10 | CACHE | Memória rápida que guarda dados usados com frequência. |
| 12 | DMA | Técnica que permite transferir dados sem a intervenção constante do processador. |
| 14 | MICROCONTROLADOR | Chip que integra processador, memória e periféricos em um só. |

### Verticais

| Nº | Palavra | Pista |
|---|---|---|
| 1 | EEPROM | Memória não volátil que pode ser apagada e regravada eletricamente. |
| 2 | ROM | Memória que só permite leitura e guarda dados permanentes. |
| 3 | REGISTRADORES | Pequenas memórias rápidas dentro do processador. |
| 4 | MEMORIADEMASSA | Armazenamento permanente de grande capacidade, como HD e SSD. |
| 6 | UC | Parte da CPU que coordena e controla as operações. |
| 9 | ULA | Parte da CPU que faz as contas e as operações lógicas. |
| 11 | ADDRESSBUS | Conjunto de fios que indica onde o dado está na memória. |
| 12 | DATABUS | Conjunto de fios que transporta informações entre componentes. |
| 13 | FLASH | Memória não volátil usada em pendrives e cartões. |
| 15 | CPU | Componente que executa instruções e coordena o sistema. |

## Disposição das palavras

O tabuleiro (17 × 17, 16 palavras, 16 cruzamentos) segue estas regras:

- Duas palavras só se tocam por um **cruzamento**: direções diferentes e a mesma letra na casa em comum.
- **Nenhuma palavra começa onde outra termina** na mesma linha ou coluna, nem continua outra. Antes do início e depois do fim de cada palavra a casa fica vazia, para que nada seja lido como uma palavra maior (por exemplo, `ULA` seguida de `ADDRESSBUS` virando `ULADDRESSBUS`).
- Palavras paralelas nunca ficam coladas lado a lado.
- Todas as palavras formam um único bloco conectado.

Ao abrir a página, `validateLayout()` em `script.js` confere essas regras e avisa no console do navegador se alguma edição manual quebrar a disposição.

### Gerar uma nova disposição

Para trocar, acrescentar ou remover palavras, edite a lista `ENTRADAS` em `tools/gerar-layout.js` e rode (precisa do Node.js):

```
node tools/gerar-layout.js [tentativas] [linhas] [colunas]
node tools/gerar-layout.js 8000 17 17
```

O programa testa várias disposições, descarta as inválidas, escolhe a mais compacta e mais entrelaçada, desenha o tabuleiro no terminal e imprime o bloco `BOARD_ROWS`, `BOARD_COLS` e `WORDS` pronto para colar em `script.js`. Se o tabuleiro pedido for pequeno demais, ele avisa que não encontrou solução.

## Link do site

(a ser publicado no GitHub Pages)

## Tecnologias

- HTML
- CSS
- JavaScript

## Estrutura do projeto

- `index.html`
- `style.css`
- `script.js`
- `tools/gerar-layout.js`
- `README.md`