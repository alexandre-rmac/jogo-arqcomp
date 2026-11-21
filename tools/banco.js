// banco.js
// Bancos de perguntas e configuração dos níveis.
//
// Regras para cada entrada { answer, clue }:
//   - answer: só letras A-Z maiúsculas (sem acento, espaço, hífen ou número),
//             porque o campo de digitação do jogo só aceita letras.
//   - clue:   a dica mostrada ao jogador (não deve conter a própria resposta).
//
// tools/testar.js confere essas regras e os tamanhos mínimos dos bancos.

// ---------------------------------------------------------------------------
// Padrão: as 16 perguntas do jogo original (sempre todas, em posições sorteadas)
// ---------------------------------------------------------------------------
const BANCO_PADRAO = [
  { answer: "EEPROM", clue: "Memória não volátil que pode ser apagada e regravada eletricamente." },
  { answer: "CPU", clue: "Componente que executa instruções e coordena o sistema." },
  { answer: "ULA", clue: "Parte da CPU que faz as contas e as operações lógicas." },
  { answer: "DMA", clue: "Técnica que permite transferir dados sem a intervenção constante do processador." },
  { answer: "DATABUS", clue: "Conjunto de fios que transporta informações entre componentes." },
  { answer: "FLASH", clue: "Memória não volátil usada em pendrives e cartões." },
  { answer: "UC", clue: "Parte da CPU que coordena e controla as operações." },
  { answer: "ROM", clue: "Memória que só permite leitura e guarda dados permanentes." },
  { answer: "ADDRESSBUS", clue: "Conjunto de fios que indica onde o dado está na memória." },
  { answer: "MICROCONTROLADOR", clue: "Chip que integra processador, memória e periféricos em um só." },
  { answer: "MEMORIADEMASSA", clue: "Armazenamento permanente de grande capacidade, como HD e SSD." },
  { answer: "REGISTRADORES", clue: "Pequenas memórias rápidas dentro do processador." },
  { answer: "DUALCORE", clue: "Processador com dois núcleos de processamento." },
  { answer: "CACHE", clue: "Memória rápida que guarda dados usados com frequência." },
  { answer: "RAM", clue: "Memória volátil usada para armazenar dados temporários." },
  { answer: "QUADCORE", clue: "Processador com quatro núcleos de processamento." }
];

// ---------------------------------------------------------------------------
// Fácil: 32 perguntas = as 16 do Padrão + 16 conceitos básicos
// ---------------------------------------------------------------------------
const BANCO_FACIL = BANCO_PADRAO.concat([
  { answer: "BIT", clue: "Menor unidade de informação de um computador, com valor 0 ou 1." },
  { answer: "BYTE", clue: "Conjunto de oito bits." },
  { answer: "CLOCK", clue: "Sinal periódico que marca o ritmo de funcionamento do processador." },
  { answer: "PLACAMAE", clue: "Placa principal onde se encaixam o processador, a memória e outros componentes." },
  { answer: "TECLADO", clue: "Periférico de entrada usado para digitar letras, números e comandos." },
  { answer: "MONITOR", clue: "Periférico de saída que exibe imagens e textos ao usuário." },
  { answer: "MOUSE", clue: "Periférico de entrada que movimenta o cursor na tela." },
  { answer: "IMPRESSORA", clue: "Periférico de saída que coloca textos e imagens no papel." },
  { answer: "HARDWARE", clue: "Conjunto dos componentes físicos de um computador." },
  { answer: "SOFTWARE", clue: "Conjunto de programas e instruções que fazem o computador funcionar." },
  { answer: "FIRMWARE", clue: "Programa gravado em memória não volátil que controla um dispositivo eletrônico." },
  { answer: "BINARIO", clue: "Sistema de numeração que usa apenas os algarismos 0 e 1." },
  { answer: "HEXADECIMAL", clue: "Sistema de numeração de base 16, muito usado para representar endereços." },
  { answer: "ALGORITMO", clue: "Sequência finita de passos para resolver um problema." },
  { answer: "NUCLEO", clue: "Unidade de processamento independente dentro de um chip." },
  { answer: "FONTE", clue: "Componente que converte a energia da tomada nas tensões usadas pelo computador." }
]);

// ---------------------------------------------------------------------------
// Médio: 48 perguntas (organização do processador, memória, E/S, software básico)
// ---------------------------------------------------------------------------
const BANCO_MEDIO = [
  { answer: "PIPELINE", clue: "Técnica que divide a execução das instruções em estágios que se sobrepõem no tempo." },
  { answer: "ASSEMBLY", clue: "Linguagem de baixo nível cujos comandos correspondem às instruções do processador." },
  { answer: "MONTADOR", clue: "Programa que converte código assembly em código de máquina." },
  { answer: "COMPILADOR", clue: "Programa que traduz o código-fonte de uma linguagem de alto nível para linguagem de máquina." },
  { answer: "INTERPRETADOR", clue: "Programa que executa o código-fonte instrução por instrução, sem gerar antes um executável completo." },
  { answer: "INTERRUPCAO", clue: "Sinal que desvia a CPU temporariamente para tratar um evento." },
  { answer: "PROGRAMCOUNTER", clue: "Registrador que guarda o endereço da próxima instrução a ser buscada." },
  { answer: "ACUMULADOR", clue: "Registrador que guarda resultados intermediários das operações aritméticas." },
  { answer: "FETCH", clue: "Primeira etapa do ciclo de instrução, em que a instrução é buscada na memória." },
  { answer: "DECODIFICACAO", clue: "Etapa do ciclo de instrução em que a unidade de controle interpreta o que deve ser feito." },
  { answer: "EXECUCAO", clue: "Etapa do ciclo de instrução em que a operação é de fato realizada." },
  { answer: "ISA", clue: "Contrato entre hardware e software que define as instruções, os registradores e os modos de endereçamento (sigla)." },
  { answer: "RISC", clue: "Filosofia de arquitetura com poucas instruções simples, geralmente de mesmo tamanho." },
  { answer: "CISC", clue: "Filosofia de arquitetura com muitas instruções complexas, algumas de tamanho variável." },
  { answer: "VONNEUMANN", clue: "Arquitetura em que dados e instruções compartilham a mesma memória e o mesmo barramento." },
  { answer: "HARVARD", clue: "Arquitetura com memórias e caminhos separados para instruções e para dados." },
  { answer: "SRAM", clue: "Memória estática, rápida e cara, usada nas caches; não precisa de refresh." },
  { answer: "DRAM", clue: "Memória dinâmica que precisa de refresh periódico, usada como memória principal." },
  { answer: "MEMORIAVIRTUAL", clue: "Técnica que usa o disco para dar a cada programa a ilusão de ter mais memória do que a RAM física." },
  { answer: "PAGINACAO", clue: "Técnica de gerenciamento que divide a memória em blocos de tamanho fixo chamados páginas." },
  { answer: "SWAP", clue: "Área do disco usada para guardar páginas retiradas da RAM." },
  { answer: "MMU", clue: "Unidade de hardware que traduz endereços virtuais em endereços físicos." },
  { answer: "LATENCIA", clue: "Tempo decorrido entre o pedido de um dado e o início da resposta." },
  { answer: "LARGURADEBANDA", clue: "Quantidade de dados que pode ser transferida por unidade de tempo." },
  { answer: "PONTOFLUTUANTE", clue: "Formato que representa números reais usando mantissa e expoente." },
  { answer: "OVERFLOW", clue: "Erro que ocorre quando o resultado de uma operação não cabe na quantidade de bits disponível." },
  { answer: "ENDERECO", clue: "Número que identifica uma posição de memória." },
  { answer: "OPCODE", clue: "Campo da instrução que indica qual operação deve ser executada." },
  { answer: "OPERANDO", clue: "Dado ou endereço sobre o qual uma instrução atua." },
  { answer: "MNEMONICO", clue: "Abreviação simbólica de uma instrução, como ADD ou MOV." },
  { answer: "FLIPFLOP", clue: "Circuito biestável capaz de armazenar um bit." },
  { answer: "MULTIPLEXADOR", clue: "Circuito que escolhe uma entre várias entradas e a leva à saída." },
  { answer: "PORTALOGICA", clue: "Circuito básico que realiza uma operação booleana, como AND, OR ou NOT." },
  { answer: "SOMADOR", clue: "Circuito que realiza a soma de números binários." },
  { answer: "PERIFERICO", clue: "Dispositivo ligado ao computador para entrada, saída ou armazenamento de dados." },
  { answer: "USB", clue: "Padrão serial de conexão de periféricos, sigla de Universal Serial Bus." },
  { answer: "SATA", clue: "Interface serial usada para ligar discos rígidos e SSDs à placa-mãe." },
  { answer: "PCIEXPRESS", clue: "Barramento serial de alta velocidade usado por placas de vídeo e SSDs NVMe." },
  { answer: "BIOS", clue: "Firmware que inicializa o hardware e entrega o controle ao sistema operacional." },
  { answer: "BOOT", clue: "Processo de inicialização do computador, até o sistema operacional ser carregado." },
  { answer: "KERNEL", clue: "Núcleo do sistema operacional, que controla a CPU, a memória e os dispositivos." },
  { answer: "THREAD", clue: "Fluxo de execução dentro de um processo, que compartilha a memória dele." },
  { answer: "PROCESSO", clue: "Programa em execução, com seu próprio espaço de endereçamento." },
  { answer: "ESCALONADOR", clue: "Parte do sistema operacional que decide qual processo usa a CPU a cada momento." },
  { answer: "MISS", clue: "Falha de acesso: o dado procurado não está na cache." },
  { answer: "HIT", clue: "Acerto de acesso: o dado procurado está na cache." },
  { answer: "TRANSISTOR", clue: "Componente semicondutor que funciona como chave nos circuitos digitais." },
  { answer: "HERTZ", clue: "Unidade de medida da frequência do clock, equivalente a um ciclo por segundo." }
];

// ---------------------------------------------------------------------------
// Difícil: 64 perguntas (microarquitetura avançada, paralelismo, coerência,
// hardware reconfigurável, sistemas e confiabilidade)
// ---------------------------------------------------------------------------
const BANCO_DIFICIL = [
  { answer: "SUPERESCALAR", clue: "Processador que consegue iniciar mais de uma instrução por ciclo de clock." },
  { answer: "PREDICAODEDESVIO", clue: "Técnica que tenta adivinhar o resultado de um desvio condicional antes de ele ser resolvido." },
  { answer: "OUTOFORDER", clue: "Termo em inglês para a execução de instruções fora da ordem do programa, conforme os operandos ficam prontos." },
  { answer: "HAZARD", clue: "Situação que impede a próxima instrução do pipeline de executar no ciclo previsto." },
  { answer: "BOLHA", clue: "Ciclo ocioso inserido no pipeline para resolver um conflito entre instruções." },
  { answer: "FORWARDING", clue: "Técnica que encaminha o resultado direto entre estágios do pipeline, sem esperar a escrita no registrador." },
  { answer: "TOMASULO", clue: "Algoritmo de escalonamento dinâmico com estações de reserva e barramento comum de dados, criado na IBM." },
  { answer: "REORDERBUFFER", clue: "Estrutura que permite executar fora de ordem, mas confirmar os resultados na ordem do programa." },
  { answer: "RENOMEACAO", clue: "Técnica que mapeia registradores lógicos em físicos para eliminar dependências falsas." },
  { answer: "VLIW", clue: "Arquitetura de instruções muito longas em que o compilador define o paralelismo." },
  { answer: "SIMD", clue: "Classe em que uma única instrução opera sobre vários dados ao mesmo tempo." },
  { answer: "MIMD", clue: "Classe em que vários processadores executam instruções diferentes sobre dados diferentes." },
  { answer: "FLYNN", clue: "Sobrenome do pesquisador que propôs a classificação de arquiteturas pelo fluxo de instruções e de dados." },
  { answer: "AMDAHL", clue: "Lei que limita o ganho de desempenho pela fração sequencial de um programa." },
  { answer: "SPEEDUP", clue: "Razão entre o tempo de execução antes e depois de uma melhoria (termo em inglês)." },
  { answer: "CPI", clue: "Média de ciclos de clock gastos por instrução (sigla)." },
  { answer: "MIPS", clue: "Arquitetura RISC clássica, muito usada no ensino e descrita por Hennessy e Patterson." },
  { answer: "ARM", clue: "Arquitetura RISC predominante em celulares e tablets." },
  { answer: "COERENCIADECACHE", clue: "Garantia de que todas as cópias de um mesmo dado em caches diferentes permaneçam consistentes." },
  { answer: "MESI", clue: "Protocolo de coerência cujos estados são Modified, Exclusive, Shared e Invalid." },
  { answer: "WRITEBACK", clue: "Política de cache que só atualiza a memória principal quando o bloco modificado é substituído." },
  { answer: "WRITETHROUGH", clue: "Política de cache em que toda escrita é propagada imediatamente para a memória principal." },
  { answer: "MAPEAMENTODIRETO", clue: "Organização de cache em que cada bloco da memória só pode ocupar uma linha específica." },
  { answer: "ASSOCIATIVA", clue: "Organização de cache em que um bloco pode ser colocado em qualquer linha." },
  { answer: "TLB", clue: "Cache de traduções de endereços virtuais para físicos (sigla)." },
  { answer: "LOCALIDADE", clue: "Princípio segundo o qual os programas tendem a reutilizar dados e instruções próximos no tempo e no espaço." },
  { answer: "PREFETCH", clue: "Técnica de trazer dados à cache antes de o programa solicitá-los." },
  { answer: "NUMA", clue: "Arquitetura multiprocessada em que o tempo de acesso à memória depende de qual processador a acessa (sigla)." },
  { answer: "SMP", clue: "Multiprocessamento em que todos os processadores compartilham a memória com igualdade de acesso (sigla)." },
  { answer: "HYPERTHREADING", clue: "Nome comercial da Intel para o multithreading simultâneo em um mesmo núcleo." },
  { answer: "GPU", clue: "Processador massivamente paralelo, criado para gráficos e hoje também usado em inteligência artificial." },
  { answer: "CUDA", clue: "Plataforma de computação paralela da NVIDIA para programar GPUs." },
  { answer: "FPGA", clue: "Circuito integrado cuja lógica pode ser reconfigurada depois da fabricação." },
  { answer: "ASIC", clue: "Circuito integrado projetado sob medida para uma aplicação específica." },
  { answer: "VERILOG", clue: "Linguagem de descrição de hardware de sintaxe parecida com C, comum em projetos digitais." },
  { answer: "VHDL", clue: "Linguagem de descrição de hardware de sintaxe inspirada em Ada." },
  { answer: "DVFS", clue: "Técnica que ajusta tensão e frequência dinamicamente para economizar energia (sigla)." },
  { answer: "TDP", clue: "Potência térmica de projeto, que o sistema de refrigeração precisa dissipar (sigla)." },
  { answer: "DENNARD", clue: "Sobrenome ligado à escala segundo a qual transistores menores mantêm a densidade de potência constante." },
  { answer: "MOORE", clue: "Sobrenome do cofundador da Intel que previu a duplicação periódica do número de transistores nos chips." },
  { answer: "MICROPROGRAMACAO", clue: "Técnica que implementa a unidade de controle por meio de microinstruções armazenadas." },
  { answer: "HARDWIRED", clue: "Unidade de controle feita de circuitos lógicos fixos, sem microprograma (termo em inglês)." },
  { answer: "SEMAFORO", clue: "Mecanismo de sincronização baseado em contador, usado para controlar o acesso a recursos compartilhados." },
  { answer: "MUTEX", clue: "Mecanismo de exclusão mútua que permite a uma só thread por vez entrar na região crítica." },
  { answer: "DEADLOCK", clue: "Impasse em que processos esperam indefinidamente por recursos que um mantém do outro (termo em inglês)." },
  { answer: "RACECONDITION", clue: "Erro em que o resultado depende da ordem imprevisível em que threads acessam dados compartilhados." },
  { answer: "TRAP", clue: "Interrupção síncrona gerada pelo próprio programa, como uma chamada ao sistema ou uma exceção." },
  { answer: "SYSCALL", clue: "Mecanismo pelo qual um programa solicita um serviço ao kernel (termo em inglês)." },
  { answer: "MMIO", clue: "Esquema em que registradores de dispositivos aparecem como endereços de memória (sigla)." },
  { answer: "POLLING", clue: "Técnica em que a CPU consulta repetidamente o estado de um dispositivo de entrada e saída." },
  { answer: "ROUNDROBIN", clue: "Algoritmo de escalonamento que reveza os processos em fatias de tempo iguais." },
  { answer: "RAID", clue: "Agrupamento de discos para ganhar desempenho, redundância ou ambos (sigla)." },
  { answer: "NVME", clue: "Protocolo de alto desempenho para SSDs conectados ao barramento PCIe." },
  { answer: "ECC", clue: "Código que detecta e corrige erros em memórias (sigla)." },
  { answer: "PARIDADE", clue: "Bit extra usado para detectar erros simples de transmissão ou armazenamento." },
  { answer: "HAMMING", clue: "Sobrenome de quem criou o código capaz de corrigir erros de um bit." },
  { answer: "MANTISSA", clue: "Parte fracionária de um número em ponto flutuante." },
  { answer: "EXPOENTE", clue: "Parte que define a escala de um número em ponto flutuante." },
  { answer: "SCOREBOARD", clue: "Técnica de escalonamento dinâmico usada no CDC 6600 para controlar dependências." },
  { answer: "DEPENDENCIA", clue: "Relação em que uma instrução precisa do resultado de outra." },
  { answer: "LOADSTORE", clue: "Arquitetura em que somente instruções de carga e armazenamento acessam a memória." },
  { answer: "MICROARQUITETURA", clue: "Organização interna de um processador que implementa uma determinada ISA." },
  { answer: "SNOOPING", clue: "Técnica em que as caches monitoram o barramento para manter a coerência." },
  { answer: "HYPERVISOR", clue: "Software que cria e gerencia máquinas virtuais." }
];

// ---------------------------------------------------------------------------
// Níveis
//   bank      banco de onde as perguntas são sorteadas
//   count     quantas perguntas entram no tabuleiro
//   maxRows / maxCols  limite do tamanho do tabuleiro gerado
// ---------------------------------------------------------------------------
const NIVEIS = {
  padrao:  { name: "Padrão",  bank: BANCO_PADRAO,  count: 16, maxRows: 20, maxCols: 20 },
  facil:   { name: "Fácil",   bank: BANCO_FACIL,   count: 8,  maxRows: 16, maxCols: 16 },
  medio:   { name: "Médio",   bank: BANCO_MEDIO,   count: 16, maxRows: 20, maxCols: 20 },
  dificil: { name: "Difícil", bank: BANCO_DIFICIL, count: 16, maxRows: 22, maxCols: 22 }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { BANCO_PADRAO, BANCO_FACIL, BANCO_MEDIO, BANCO_DIFICIL, NIVEIS };
}