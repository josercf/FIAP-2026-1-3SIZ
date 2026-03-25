# Prova Estilo ENADE — Checkpoint I
**Disciplina:** Microservice and Web Engineering
**Turma:** 3SIZ — 2026
**Prof.:** Jose Romualdo da Costa Filho
**Conteudo:** Aulas 01 a 06
**Duracao:** 2h30
**Total de questoes:** 25 (20 objetivas + 5 discursivas)

---

## INSTRUCOES

- A prova e individual e sem consulta.
- Questoes objetivas: marque **uma unica alternativa** (A–E).
- Questoes discursivas: responda de forma clara e objetiva, utilizando os conceitos estudados.
- Duracao maxima: **2 horas e 30 minutos**.
- Valor total: **100 pontos** (questoes objetivas: 3 pts cada; questoes discursivas: 8 pts cada).

---

## PARTE 1 — QUESTOES OBJETIVAS (60 pontos)

---

### QUESTAO 01 — Aula 01: API Gateway (Basico)

Um API Gateway centraliza o recebimento de requisicoes de clientes e as encaminha aos microsservicos internos. Sobre suas funcionalidades, assinale a alternativa **CORRETA**:

- **A)** O API Gateway substitui completamente o balanceador de carga, tornando-o desnecessario em arquiteturas de microsservicos.
- **B)** O API Gateway e responsavel por autenticar usuarios diretamente no banco de dados de cada microsservico.
- **C)** O API Gateway pode centralizar autenticacao, roteamento, rate limiting e transformacao de requests, reduzindo a complexidade dos servicos individuais.
- **D)** O API Gateway deve ser evitado em producao pois representa um ponto unico de falha que nao pode ser mitigado.
- **E)** O API Gateway so e util quando os microsservicos estao hospedados em clouds publicas, sendo inapropriado para ambientes on-premises.

**Gabarito: C**
*Justificativa: O API Gateway centraliza funcionalidades transversais (cross-cutting concerns), reduzindo duplicacao nos servicos. Pontos unicos de falha sao mitigados com alta disponibilidade e redundancia.*

---

### QUESTAO 02 — Aula 01: Proxy Reverso (Basico)

Considere a seguinte afirmacao: *"Um proxy reverso recebe requisicoes de clientes externos e as encaminha a servidores internos, ocultando a topologia da infraestrutura."* Sobre essa afirmacao, e correto afirmar que:

- **A)** E falsa, pois proxies reversos so funcionam para protocolos diferentes de HTTP.
- **B)** E verdadeira, e exemplos de uso incluem terminacao SSL, cache de conteudo e balanceamento de carga.
- **C)** E falsa, pois proxies reversos expoe os enderecos IP dos servidores internos ao cliente.
- **D)** E verdadeira, mas proxies reversos nao suportam terminacao de SSL/TLS.
- **E)** E falsa, pois a funcao de um proxy reverso e encaminhar requisicoes de servidores para clientes, e nao o contrario.

**Gabarito: B**
*Justificativa: Proxies reversos como Nginx e HAProxy interceptam requisicoes externas, realizam terminacao SSL, cache e balanceamento, sem expor a infraestrutura interna.*

---

### QUESTAO 03 — Aula 02: Load Balancer (Basico)

Em relacao aos algoritmos de balanceamento de carga, analise os itens:

I. Round Robin distribui requisicoes de forma circular entre os servidores.
II. Least Connections encaminha a requisicao ao servidor com menor numero de conexoes ativas.
III. IP Hash garante que o mesmo cliente sempre seja direcionado ao mesmo servidor, util para sessoes.

Estao corretos:

- **A)** Apenas I
- **B)** Apenas I e II
- **C)** Apenas II e III
- **D)** I, II e III
- **E)** Apenas III

**Gabarito: D**
*Justificativa: Todos os tres itens descrevem corretamente algoritmos de balanceamento de carga amplamente utilizados em producao.*

---

### QUESTAO 04 — Aula 02: Rate Limiting (Intermediario)

Uma API de pagamentos recebe em media 500 requisicoes por segundo. Para proteger o servico de abuso e garantir disponibilidade, o time decide implementar Rate Limiting com a estrategia **Token Bucket**. Sobre essa estrategia, e correto afirmar:

- **A)** O Token Bucket rejeita todas as requisicoes apos o limite ser atingido, sem possibilidade de rafagas.
- **B)** O Token Bucket permite rafagas controladas, pois os tokens acumulam-se ao longo do tempo ate o limite do bucket.
- **C)** O Token Bucket e identico ao algoritmo Leaky Bucket, diferindo apenas na nomenclatura.
- **D)** O Token Bucket so funciona para APIs REST, sendo incompativel com gRPC ou WebSockets.
- **E)** O Token Bucket nao suporta diferentes limites por cliente, aplicando a mesma taxa a todos.

**Gabarito: B**
*Justificativa: No Token Bucket, tokens sao gerados a uma taxa constante e acumulam-se ate o limite do bucket. Isso permite rafagas controladas, diferentemente do Leaky Bucket que processa a uma taxa constante.*

---

### QUESTAO 05 — Aula 02: Throttling (Intermediario)

Qual a principal diferenca entre **Rate Limiting** e **Throttling**?

- **A)** Rate Limiting limita o numero de requisicoes por unidade de tempo; Throttling limita a velocidade de processamento, podendo atrasar (em vez de rejeitar) requisicoes excedentes.
- **B)** Rate Limiting e usado exclusivamente em APIs publicas; Throttling, apenas em servicos internos.
- **C)** Throttling e a tecnica de rejeitar requisicoes; Rate Limiting e a tecnica de colocar requisicoes em fila.
- **D)** Nao ha diferenca pratica entre os dois termos, sendo usados de forma intercambial.
- **E)** Rate Limiting atua no balanceador de carga; Throttling atua exclusivamente no banco de dados.

**Gabarito: A**
*Justificativa: Rate Limiting rejeita (HTTP 429) apos o limite ser excedido. Throttling pode atrasar o processamento, degradando gradualmente o servico em vez de cortar abruptamente.*

---

### QUESTAO 06 — Aula 03: Padroes de Resiliencia (Basico)

O padrao **Circuit Breaker** e utilizado em arquiteturas de microsservicos para:

- **A)** Criptografar a comunicacao entre microsservicos em caso de falha de certificados SSL.
- **B)** Detectar falhas consecutivas em um servico e "abrir o circuito", retornando um erro rapido sem sobrecarregar o servico falho, enquanto aguarda sua recuperacao.
- **C)** Redirecionar todo o trafego para um servico de backup permanente quando o primario falhar.
- **D)** Limitar o numero de requisicoes simultaneas a um servico, funcionando como um rate limiter.
- **E)** Registrar logs de todas as falhas ocorridas no sistema para analise posterior.

**Gabarito: B**
*Justificativa: O Circuit Breaker monitora falhas e, ao atingir um limite, "abre" impedindo novas chamadas ao servico falho. Apos um timeout, entra em estado "half-open" para testar a recuperacao.*

---

### QUESTAO 07 — Aula 03: Resiliencia (Intermediario)

Uma equipe implementa o padrao **Bulkhead** em seu sistema de e-commerce. O objetivo principal desse padrao e:

- **A)** Comprimir os dados enviados entre microsservicos para reduzir latencia.
- **B)** Isolar recursos (threads, conexoes, pools) entre diferentes servicos ou funcionalidades, evitando que a falha de um componente esgote os recursos dos demais.
- **C)** Redirecionar automaticamente requisicoes falhas para servicos alternativos sem intervencao humana.
- **D)** Garantir que todas as transacoes sejam atomicas, consistentes, isoladas e duraveis.
- **E)** Monitorar a latencia de cada microsservico e alertar quando ultrapassar o SLA definido.

**Gabarito: B**
*Justificativa: O Bulkhead (antepara) isola pools de recursos por funcionalidade — assim como anteparas de um navio impedem que uma brecha afunde o navio inteiro.*

---

### QUESTAO 08 — Aula 04: Database per Service (Basico)

No padrao **Database per Service**, cada microsservico possui seu proprio banco de dados. Qual e a principal vantagem desse padrao?

- **A)** Reduz drasticamente o custo de infraestrutura, pois todos os servicos compartilham conexoes.
- **B)** Garante consistencia forte (ACID) entre todos os microsservicos de forma automatica.
- **C)** Permite que cada servico escolha o banco de dados mais adequado ao seu caso de uso e evolua seu schema de forma independente, sem afetar outros servicos.
- **D)** Elimina a necessidade de estrategias de migracao de dados ao atualizar o sistema.
- **E)** Facilita queries que precisam cruzar dados de multiplos servicos com JOINs diretos.

**Gabarito: C**
*Justificativa: Database per Service habilita polyglot persistence (cada servico usa o banco mais adequado) e permite evolucao independente do schema. O desafio e a consistencia eventual entre servicos.*

---

### QUESTAO 09 — Aula 04: EDA (Intermediario)

Em uma **Arquitetura Orientada a Eventos (EDA)**, um servico publica um evento `PedidoCriado` em um topico Kafka. Tres outros servicos consomem esse evento: Estoque, Notificacao e Faturamento. Sobre esse modelo, e correto afirmar:

- **A)** O servico de Pedidos precisa conhecer e chamar diretamente cada um dos tres consumidores.
- **B)** Se o servico de Notificacao estiver fora do ar, o evento `PedidoCriado` e perdido permanentemente.
- **C)** O acoplamento entre os servicos e reduzido: o servico de Pedidos nao precisa saber quem consome o evento; novos consumidores podem ser adicionados sem alterar o publicador.
- **D)** EDA exige consistencia forte (ACID) entre todos os consumidores do evento.
- **E)** O servico de Pedidos fica bloqueado ate que todos os consumidores procesem o evento com sucesso.

**Gabarito: C**
*Justificativa: EDA promove desacoplamento temporal e logico. O publicador nao conhece os consumidores; o broker (Kafka) retencao garante entrega mesmo quando consumidores estao temporariamente offline.*

---

### QUESTAO 10 — Aula 04: Saga Pattern (Intermediario)

O padrao **Saga** e utilizado para gerenciar transacoes distribuidas em microsservicos. Ao comparar **Saga Coreografada** com **Saga Orquestrada**, qual afirmacao esta CORRETA?

- **A)** Na Saga Coreografada, um orquestrador central controla todos os passos da transacao.
- **B)** Na Saga Orquestrada, os servicos se comunicam diretamente entre si, sem coordenador central.
- **C)** A Saga Coreografada usa eventos para coordenacao, onde cada servico reage a eventos e emite novos eventos; a Saga Orquestrada usa um orquestrador central que comanda cada passo.
- **D)** Ambas as abordagens garantem consistencia ACID entre os microsservicos envolvidos.
- **E)** A Saga Orquestrada e mais indicada quando ha poucos servicos envolvidos na transacao.

**Gabarito: C**
*Justificativa: Na coreografia, os servicos sao autonomos e comunicam-se via eventos. Na orquestracao, um processo central (orquestrador) coordena cada passo e lida com compensacoes. Sagas garantem consistencia eventual, nao ACID.*

---

### QUESTAO 11 — Aula 05: Event Sourcing (Intermediario)

No padrao **Event Sourcing**, o estado atual de uma entidade e derivado de:

- **A)** O ultimo snapshot salvo no banco de dados relacional.
- **B)** A sequencia completa de eventos imutaveis registrados desde a criacao da entidade.
- **C)** A media dos valores de todos os eventos registrados nas ultimas 24 horas.
- **D)** Apenas dos eventos que nao foram marcados como "compensados" no log de transacoes.
- **E)** O estado armazenado diretamente na tabela principal, atualizado a cada mudanca.

**Gabarito: B**
*Justificativa: Event Sourcing armazena cada mudanca de estado como um evento imutavel. O estado atual e reconstruido "replaying" todos os eventos em ordem. Isso habilita auditoria completa e time-travel queries.*

---

### QUESTAO 12 — Aula 05: CQRS (Avancado)

O padrao **CQRS (Command Query Responsibility Segregation)** propoe separar operacoes de escrita (Commands) de operacoes de leitura (Queries). Em um sistema de analytics de futebol ao vivo que implementa CQRS, qual das seguintes afirmacoes melhor descreve o beneficio principal?

- **A)** CQRS elimina a necessidade de replicacao de banco de dados, pois leituras e escritas acessam a mesma base.
- **B)** O modelo de leitura pode ser otimizado de forma independente (ex.: views desnormalizadas, cache) sem comprometer o modelo de escrita, permitindo escalar leitura e escrita de forma diferenciada.
- **C)** CQRS garante que leituras sempre retornam dados 100% consistentes com o ultimo estado de escrita.
- **D)** CQRS obriga o uso de Event Sourcing, sendo impossivel implementa-lo sem armazenar eventos.
- **E)** CQRS simplifica o codigo ao unificar a logica de leitura e escrita em um unico repositorio.

**Gabarito: B**
*Justificativa: CQRS permite otimizar leitura e escrita independentemente. O modelo de leitura pode usar estruturas desnormalizadas, Redis ou Elasticsearch; o de escrita pode usar um modelo rico de dominio. Ha aceitacao de consistencia eventual.*

---

### QUESTAO 13 — Aula 05: SLA (Basico)

Um servico possui SLA de **99,9% de disponibilidade** por mes. Qual e o tempo maximo de indisponibilidade permitido nesse periodo?

- **A)** Aproximadamente 43 minutos por mes
- **B)** Aproximadamente 8 horas por mes
- **C)** Aproximadamente 4 horas e 22 minutos por mes
- **D)** Aproximadamente 52 minutos por mes
- **E)** Aproximadamente 1 hora e 45 minutos por mes

**Gabarito: A**
*Justificativa: 99,9% de uptime = 0,1% de downtime. Em um mes de 30 dias (43.200 minutos): 43.200 * 0,001 = 43,2 minutos. Conhecer esses numeros e fundamental para definir SLOs e SLIs.*

---

### QUESTAO 14 — Aula 06: Cache — Conceitos (Basico)

Qual e o principal beneficio de utilizar cache em microsservicos?

- **A)** Garantir que os dados sejam sempre consistentes com o banco de dados principal.
- **B)** Reduzir a latencia de resposta e diminuir a carga sobre o banco de dados, servindo dados frequentemente acessados a partir de armazenamento de alta velocidade.
- **C)** Substituir permanentemente o banco de dados relacional para economizar custos de licenca.
- **D)** Criptografar dados sensiveis antes de armazena-los no banco de dados.
- **E)** Garantir a durabilidade dos dados mesmo em caso de falha total do servidor.

**Gabarito: B**
*Justificativa: Cache serve dados de memória (microsegundos) em vez de disco/rede (milissegundos). Reduz latencia e carga no banco. O trade-off principal e a possibilidade de dados desatualizados (stale data).*

---

### QUESTAO 15 — Aula 06: Cache-Aside (Intermediario)

No padrao **Cache-Aside** (Lazy Loading), qual e o fluxo correto quando ocorre um **cache miss**?

- **A)** O cache atualiza-se automaticamente a partir do banco de dados sem intervencao da aplicacao.
- **B)** A requisicao e retornada com erro 404 para o cliente, que deve tentar novamente apos alguns segundos.
- **C)** A aplicacao busca os dados no banco de dados, armazena-os no cache e retorna a resposta ao cliente.
- **D)** O balanceador de carga redireciona a requisicao para um servidor com cache quente.
- **E)** O banco de dados notifica o cache via evento para que este carregue os dados automaticamente.

**Gabarito: C**
*Justificativa: No Cache-Aside, a aplicacao e responsavel por gerenciar o cache: 1) verifica o cache; 2) em caso de miss, consulta o banco; 3) armazena no cache; 4) retorna ao cliente. O cache nao e atualizado automaticamente.*

---

### QUESTAO 16 — Aula 06: Write-Through vs Write-Behind (Avancado)

Um sistema financeiro precisa garantir que nenhuma transacao seja perdida, mesmo que o servico falhe logo apos uma escrita. Qual estrategia de cache seria mais adequada?

- **A)** Write-Behind (Write-Back), pois os dados sao escritos primeiro no cache e assincronomamente persistidos no banco, reduzindo a latencia de escrita.
- **B)** Cache-Aside, pois apenas leituras sao cacheadas, nao havendo risco de perda em escritas.
- **C)** Write-Through, pois os dados sao escritos simultaneamente no cache e no banco de dados, garantindo consistencia e durabilidade.
- **D)** Read-Through, pois o cache gerencia automaticamente a leitura do banco em caso de miss.
- **E)** Write-Behind, pois a gravacao asincrona garante maior durabilidade que a sincrona.

**Gabarito: C**
*Justificativa: Write-Through escreve no cache e no banco simultaneamente (ou sequencialmente). Ha maior latencia de escrita, mas nao ha risco de perda de dados. Write-Behind seria inadequado aqui pois a gravacao asincrona pode perder dados em falhas.*

---

### QUESTAO 17 — Aula 06: Redis — Estruturas de Dados (Intermediario)

Um sistema de ranking de jogadores precisa armazenar pontuacoes e recuperar os top-10 jogadores de forma eficiente. Qual estrutura de dados do Redis e mais adequada?

- **A)** String, usando um valor numerico por jogador com prefixo padronizado.
- **B)** List, inserindo jogadores com sua pontuacao ao final da lista.
- **C)** Set, armazenando o nome dos jogadores em um conjunto sem repeticao.
- **D)** Sorted Set (ZSet), onde cada membro (jogador) possui um score (pontuacao) e o Redis mantem automaticamente a ordenacao.
- **E)** Hash, armazenando todos os jogadores e pontuacoes em um unico hash.

**Gabarito: D**
*Justificativa: Sorted Sets sao ideais para rankings. Comandos como `ZADD ranking 1500 "player1"` e `ZREVRANGE ranking 0 9 WITHSCORES` retornam o top-10 em O(log N), com ordenacao automatica por score.*

---

### QUESTAO 18 — Aula 06: Redis — TTL e Eviction (Intermediario)

Um servico utiliza Redis para cachear resultados de busca. Para evitar que dados obsoletos sejam servidos indefinidamente, o time configura TTL de 5 minutos. Alem disso, o Redis e configurado com a politica de evicao `allkeys-lru`. O que acontece quando o Redis atinge o limite de memoria?

- **A)** O Redis para de aceitar escritas e retorna erro para todas as novas requisicoes.
- **B)** O Redis remove as chaves acessadas com menos frequencia recentemente (LRU) para liberar espaco, independentemente de terem TTL configurado.
- **C)** O Redis remove apenas as chaves cujo TTL ja expirou, mantendo as demais.
- **D)** O Redis faz snapshot dos dados para disco e limpa toda a memoria.
- **E)** O Redis expande automaticamente sua memoria alocada, sem remover dados.

**Gabarito: B**
*Justificativa: `allkeys-lru` remove as chaves menos recentemente usadas de todo o keyspace (mesmo sem TTL). Outras politicas: `volatile-lru` (so com TTL), `allkeys-random`, `noeviction` (retorna erro).*

---

### QUESTAO 19 — Aula 06: Redis — Convencoes de Chave (Basico)

Qual das seguintes convencoes de nomenclatura de chaves Redis e considerada boa pratica?

- **A)** `u:1001:profile` — usando separador `:` e hierarquia `entidade:id:campo`
- **B)** `user profile for id 1001` — descricao em texto livre para facilitar leitura
- **C)** `UP1001` — siglas para reduzir o tamanho da chave ao maximo possivel
- **D)** `user-profile-1001` — usando hifens para compatibilidade com URLs
- **E)** `USER_PROFILE_1001` — usando uppercase para diferenciar de variaveis de codigo

**Gabarito: A**
*Justificativa: A convencao recomendada usa `:` como separador e segue o padrao `namespace:entidade:id:campo`. Ex.: `sess:abc123`, `cart:usr:42:items`. E legivel, hierarquica e eficiente.*

---

### QUESTAO 20 — Aula 06: Redis — Performance (Avancado)

Considerando as caracteristicas de performance do Redis, qual afirmacao e CORRETA?

- **A)** Redis e mais lento que bancos relacionais para operacoes de leitura por nao ter indices B-Tree.
- **B)** Redis opera tipicamente com latencias na faixa de **microsegundos a baixos milissegundos**, suportando centenas de milhares a milhoes de operacoes por segundo em hardware comum.
- **C)** Redis e recomendado para armazenar datasets de terabytes, pois utiliza compressao automatica.
- **D)** Redis so oferece alta performance quando configurado com persistencia desabilitada (sem RDB e sem AOF).
- **E)** Redis tem performance equivalente ao Memcached para todos os casos de uso.

**Gabarito: B**
*Justificativa: Redis e in-memory, com latencias tipicamente < 1ms para operacoes simples. Benchmarks mostram 100k–1M ops/s em hardware comum. Persistencia (RDB/AOF) tem custo minimo para reads. Redis supera Memcached em versatilidade.*

---

## PARTE 2 — QUESTOES DISCURSIVAS (40 pontos)

*Cada questao vale 8 pontos. Seja objetivo e use os conceitos estudados.*

---

### QUESTAO 21 — Aula 01 + 02: API Gateway e Rate Limiting (Intermediario)

Uma startup de tecnologia financeira (fintech) esta migrando sua aplicacao monolitica para microsservicos. O CTO identificou os seguintes problemas:

1. Clientes externos precisam conhecer os enderecos internos de cada microsservico.
2. Varios servicos implementam autenticacao de forma duplicada.
3. Um bot esta enviando 10.000 requisicoes por segundo ao servico de consulta de saldo.

**a)** Explique como um **API Gateway** resolve os problemas (1) e (2). *(4 pontos)*

**b)** Descreva como voce implementaria **Rate Limiting** para o problema (3), especificando o algoritmo escolhido e justificando sua escolha. *(4 pontos)*

---

**Criterios de Avaliacao:**

**a)** (4 pts)
- API Gateway como ponto unico de entrada: clientes so conhecem o Gateway (1 pt)
- Roteamento interno transparente: Gateway redireciona para o microsservico correto (1 pt)
- Autenticacao centralizada: JWT/OAuth2 validados no Gateway, servicos recebem claims (1 pt)
- Mencao a outros beneficios: SSL termination, logging centralizado, versionamento de API (1 pt)

**b)** (4 pts)
- Identificacao correta do problema: DDoS/abuso de API (0,5 pt)
- Escolha de algoritmo com justificativa — ex.: Token Bucket (permite rafagas controladas) ou Fixed Window (simples, mas sujeito a burst no limite da janela) (2 pts)
- Configuracao proposta: limite por IP, por token, ou por usuario (1 pt)
- Resposta HTTP 429 Too Many Requests com Retry-After header (0,5 pt)

---

### QUESTAO 22 — Aula 03: Padroes de Resiliencia (Intermediario)

Um e-commerce integra-se com um servico externo de calculo de frete. Nos ultimos dias, esse servico tem respondendo com alta latencia (10–30 segundos) e frequentes timeouts, causando lentidao em toda a plataforma.

**a)** Explique como o padrao **Circuit Breaker** ajudaria a resolver esse problema. Descreva os tres estados do Circuit Breaker. *(4 pontos)*

**b)** Proponha uma estrategia de **fallback** para quando o servico de frete estiver indisponivel, garantindo que os usuarios possam continuar comprando. *(4 pontos)*

---

**Criterios de Avaliacao:**

**a)** (4 pts)
- Estado Closed: chamadas passam normalmente; falhas sao contadas (1 pt)
- Estado Open: apos threshold de falhas, o circuito abre; chamadas retornam erro rapido sem chamar o servico (1,5 pts)
- Estado Half-Open: apos timeout, uma chamada de teste e feita; se bem-sucedida, volta para Closed; se falhar, volta para Open (1,5 pts)

**b)** (4 pts)
- Frete padrao/estimado: exibir valor aproximado baseado no CEP e no historico (2 pts)
- Cache do ultimo frete calculado para aquele CEP/peso (1 pt)
- Comunicacao clara ao usuario: "valor estimado, confirmado apos processamento" (1 pt)
- Bonus: mencao a Retry com backoff exponencial para tentativas futuras

---

### QUESTAO 23 — Aulas 04 e 05: Dados em Microsservicos (Avancado)

Uma plataforma de vendas possui os microsservicos: **Pedidos**, **Estoque** e **Pagamento**. Ao criar um pedido, e necessario: (1) reservar o estoque, (2) processar o pagamento e (3) confirmar o pedido. Se qualquer etapa falhar, as anteriores devem ser desfeitas.

**a)** Por que uma transacao ACID distribuida (2PC — Two-Phase Commit) e problematica nesse cenario? *(2 pontos)*

**b)** Descreva como o padrao **Saga** (Coreografado ou Orquestrado — escolha um) resolveria esse problema. Liste as transacoes compensatorias necessarias. *(6 pontos)*

---

**Criterios de Avaliacao:**

**a)** (2 pts)
- 2PC cria bloqueio distribuido: todos os servicos ficam bloqueados aguardando commit (1 pt)
- Ponto unico de falha no coordenador; indisponibilidade parcial trava toda a transacao (1 pt)

**b)** (6 pts)
- Escolha clara e consistente de Saga Coreografada ou Orquestrada (1 pt)
- Fluxo feliz descrito: Pedido criado → evento → Estoque reservado → evento → Pagamento processado → Pedido confirmado (2 pts)
- Transacoes compensatorias:
  - Falha no Pagamento: compensar Estoque (liberar reserva) + cancelar Pedido (1,5 pts)
  - Falha na Reserva: cancelar Pedido (0,5 pt)
- Mencao a idempotencia das compensacoes (1 pt)

---

### QUESTAO 24 — Aula 05: Event Sourcing e CQRS (Avancado)

Um banco digital decide adotar **Event Sourcing** para o servico de contas correntes.

**a)** Explique o que e Event Sourcing e cite **duas vantagens** e **uma desvantagem** dessa abordagem. *(4 pontos)*

**b)** Como o padrao **CQRS** complementa o Event Sourcing nesse contexto? Descreva como uma tela de extrato bancario se beneficiaria dessa combinacao. *(4 pontos)*

---

**Criterios de Avaliacao:**

**a)** (4 pts)
- Definicao: estado derivado de sequencia de eventos imutaveis (ex.: DepositoRealizado, SaqueRealizado, TransferenciaEfetuada) (1,5 pts)
- Vantagem 1: auditoria completa — historia de todas as mudancas (1 pt)
- Vantagem 2: time-travel queries — reconstruir estado em qualquer ponto no passado (0,75 pts)
- Desvantagem: complexidade de reconstrucao de estado; necessidade de snapshots para events stores grandes (0,75 pts)

**b)** (4 pts)
- CQRS separa modelo de escrita (eventos) do modelo de leitura (projecoes) (1 pt)
- O extrato bancario e um modelo de leitura: projecao dos eventos em uma view otimizada (saldo atual, historico formatado) (1,5 pts)
- Vantagem: o modelo de leitura pode ser recriado a qualquer momento a partir dos eventos (1 pt)
- Mencao a eventual consistency entre escrita e leitura (0,5 pt)

---

### QUESTAO 25 — Aula 06: Cache com Redis (Avancado)

Um portal de noticias tem 2 milhoes de usuarios ativos diariamente. As 10 noticias mais lidas sao acessadas em media 50.000 vezes por hora cada. O banco de dados PostgreSQL nao aguenta a carga e o time decide implementar Redis como camada de cache.

**a)** Qual estrategia de cache (Cache-Aside, Read-Through, Write-Through ou Write-Behind) voce recomendaria para as noticias? Justifique, considerando o perfil de acesso e a tolerancia a dados levemente desatualizados. *(4 pontos)*

**b)** Projete o esquema de chaves Redis para armazenar: o conteudo da noticia, o contador de visualizacoes e um ranking das top-10 noticias do dia. Utilize as estruturas de dados mais adequadas para cada caso. *(4 pontos)*

---

**Criterios de Avaliacao:**

**a)** (4 pts)
- Recomendacao: Cache-Aside com TTL de 5–15 minutos (noticias podem ter leve stale) (1 pt)
- Justificativa: perfil read-heavy justifica cache agressivo; noticias nao mudam frequentemente apos publicadas (1,5 pts)
- Mencao a TTL para invalidacao periodica (1 pt)
- Alternativa valida: Read-Through com mesmo raciocinio (aceitar esta resposta tambem) (0,5 pt)

**b)** (4 pts)
- Conteudo da noticia: `news:{id}:content` como String (JSON serializado) ou Hash `news:{id}` com campos `title`, `body`, `author`, `published_at` (1,5 pts)
- Contador de visualizacoes: `news:{id}:views` como String com `INCR` atomico (1 pt)
- Ranking top-10 do dia: Sorted Set `ranking:news:{YYYY-MM-DD}` com ZADD e ZREVRANGE (1,5 pts)
- Bonus: mencao a TTL no ranking para expirar ao fim do dia

---

## GABARITO — QUESTOES OBJETIVAS

| Questao | Resp. | Topico |
|---------|-------|--------|
| 01 | C | API Gateway |
| 02 | B | Proxy Reverso |
| 03 | D | Load Balancer |
| 04 | B | Rate Limiting — Token Bucket |
| 05 | A | Throttling |
| 06 | B | Circuit Breaker |
| 07 | B | Bulkhead |
| 08 | C | Database per Service |
| 09 | C | EDA / Kafka |
| 10 | C | Saga Pattern |
| 11 | B | Event Sourcing |
| 12 | B | CQRS |
| 13 | A | SLA — 99,9% |
| 14 | B | Cache — Conceitos |
| 15 | C | Cache-Aside |
| 16 | C | Write-Through |
| 17 | D | Redis Sorted Set |
| 18 | B | Eviction Policy |
| 19 | A | Convencao de Chaves |
| 20 | B | Redis Performance |

---

## DISTRIBUICAO POR AULA

| Aula | Tema | Q. Obj. | Q. Disc. |
|------|------|---------|----------|
| 01 | API Gateway & Proxy Reverso | 01, 02 | 21a |
| 02 | Load Balancer, Rate Limiting | 03, 04, 05 | 21b |
| 03 | Padroes de Resiliencia | 06, 07 | 22 |
| 04 | Dados — DB per Service, EDA, Saga | 08, 09, 10 | 23 |
| 05 | Event Sourcing, CQRS, SLA | 11, 12, 13 | 24 |
| 06 | Cache com Redis | 14–20 | 25 |

---

## DISTRIBUICAO POR NIVEL

| Nivel | Questoes Obj. | Questoes Disc. |
|-------|---------------|----------------|
| Basico | 01, 02, 03, 06, 08, 13, 14, 19 | — |
| Intermediario | 04, 05, 07, 09, 10, 11, 15, 17, 18 | 21, 22 |
| Avancado | 12, 16, 20 | 23, 24, 25 |

---

*Documento gerado em 2026-03-24. Para uso interno — Prof. Jose Romualdo da Costa Filho.*
