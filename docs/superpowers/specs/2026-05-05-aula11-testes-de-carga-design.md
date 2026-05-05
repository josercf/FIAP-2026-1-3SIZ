# Aula 11 — Testes de Carga: redesign

**Data:** 2026-05-05
**Autor:** Prof. José Romualdo (com assistência de IA)
**Status:** Aprovado para implementação

## Objetivo

Refatorar a aula 11 (`aulas-2sem/aulas/aula11.html`) para:

1. Substituir exemplos rasos por fundamentos profundos sobre métricas e sua interpretação.
2. Introduzir conceitos ausentes: **ramp-up/ramp-down** (com diagrama) e **hot path**.
3. Consertar quizzes — hoje têm markup quebrado e não respondem a clique.
4. Trocar o exercício abstrato (URL fictícia) por um **laboratório guiado de otimização** sobre uma API Node deliberadamente lenta.
5. Adicionar guia de instalação passo a passo do k6 (Windows/macOS/Linux).
6. Criar repositório de apoio `fiap-2026-1-perf` com a API e os scripts k6 prontos.

## Não-objetivos

- Não cobre testes distribuídos (k6 cloud, k6 operator no Kubernetes).
- Não cobre profiling avançado (flame graphs, V8 inspector) — fica para aula futura.
- Não substitui APM/observabilidade — k6 mede do *lado do cliente*; observabilidade do lado do servidor é outra aula.
- Não usa Docker no laboratório principal (SQLite arquivo único; foco em diagnóstico, não em troubleshooting de container).

## Decisões aprovadas

| Decisão | Escolha | Justificativa |
|---|---|---|
| Stack do laboratório | Node + Express + Sequelize + SQLite | Sync blocking fica gritante em event loop single-thread; k6 já é JS (consistência cognitiva); zero atrito de setup |
| Repo | Novo: `github.com/josercf/fiap-2026-1-perf` | Cenário controlado, baseline igual para todos, fácil reproduzir números |
| Gargalos plantados | 3 (2 em aula + 1 desafio) | Cabe nos ~85min do Bloco 2 com folga para análise |
| Em aula | (1) Sync I/O bloqueando event loop, (2) N+1 query | Cada um expõe métricas distintas — P99/saturação no #1, throughput/payload no #2 |
| Desafio | Cache ausente em hot path (`/products`) | Aplica o conceito de hot path introduzido no Bloco 2 |
| Markup de quiz | Padrão canônico `fiap-quiz.js` (`label > input[type=radio]` + `data-correct` na section) | Reaproveita JS já carregado; aulas 1–6 usam o mesmo padrão |
| Diagramas | SVG inline (estático e animado) | Preferência do usuário; nítido em qualquer zoom; imprime em PDF; versionado em git como texto |

## Estrutura de arquivos entregáveis

```
FIAP-2026-1-3SIZ/
└── aulas-2sem/
    └── aulas/
        └── aula11.html          ← reescrito (alvo: ~28 slides)
```

```
fiap-2026-1-perf/                ← novo repo
├── README.md                    ← setup + objetivos + roteiro pedagógico
├── package.json
├── .gitignore
├── src/
│   ├── server.js                ← bootstrap Express
│   ├── routes/
│   │   ├── users.js             ← GET /users/:id/profile  (sync I/O plantado)
│   │   ├── orders.js            ← GET /orders             (N+1 plantado)
│   │   └── products.js          ← GET /products           (sem cache — desafio)
│   └── db/
│       ├── index.js             ← Sequelize bootstrap + sync
│       ├── models/
│       │   ├── user.js
│       │   ├── order.js
│       │   ├── orderItem.js
│       │   └── product.js
│       └── seed.js              ← 1000 users × 5 orders × 3 items + 200 products
├── k6/
│   ├── baseline.js              ← teste comum, 0→50 VUs em 3min
│   ├── sync-io.js               ← foco em GET /users/:id/profile
│   ├── n-plus-one.js            ← foco em GET /orders
│   └── products-cache.js        ← desafio: foco em GET /products
└── docs/
    ├── iteracao-1-sync-io.md    ← gabarito do fix (entregue após aula)
    ├── iteracao-2-n-plus-one.md ← gabarito do fix
    └── desafio-cache.md         ← roteiro do desafio
```

## Estrutura dos slides (28 slides)

> Numeração de slide aqui é lógica, não corresponde ao `data-page` final.

### Abertura
1. **Capa FIAP** — `cover-slide`
2. **Título** — `title-slide` ("Testes de Carga — Performance e Resiliência")
3. **Agenda** — `content-slide` com tabela Bloco 1 / Intervalo / Bloco 2

### Bloco 1 — Fundamentos (~90min, 13 slides de conteúdo)

4. **Section divider** "Bloco 1 — Fundamentos de Testes de Carga"
5. **Por que testar carga?** — abertura motivacional via Black Friday (reposicionado do slide 8 atual). Bullets: limites de DB, memory leaks, thread starvation. Fecha com a pergunta "como descobrir *antes* do dia D?".
6. **Tipos de teste de performance** — quatro mini-cards lado a lado, cada um com **SVG inline** mostrando a curva VU×tempo característica:
   - **Load test** — sobe até carga esperada e mantém
   - **Stress test** — sobe além do esperado até quebrar
   - **Spike test** — pulo abrupto e instantâneo
   - **Soak test** — carga moderada por horas
   Cada card tem 1 frase de "quando usar".
7. **Anatomia de um teste de carga: ramp-up, steady, ramp-down** — *novo*. Um SVG grande com curva temporal anotada nas três fases. Texto explica:
   - **Ramp-up**: por que existe — aquece caches, detecta cold-start, evita falso positivo
   - **Steady**: o que mede — regime estacionário; é aqui que se lê P95/P99 confiáveis
   - **Ramp-down**: por que importa — detecta vazamento de recursos (conexões não devolvidas, memória não liberada)
   Animação opcional: marcador ⚪ percorrendo a curva.
8. **Métrica 1: Throughput (RPS)** — definição, fórmula, unidade. Frase âncora: "throughput é *capacidade*; latência é *experiência*". Mini-SVG: barra horizontal "100 RPS por 60s = 6000 reqs".
9. **Métrica 2: Latência e percentis P50/P95/P99** — *slide-chave*. **SVG histograma** de distribuição de latência com linhas verticais marcando P50, P95 e P99 e suas leituras numéricas. Caixa de destaque: *"a média esconde a cauda; o P99 é o usuário que tweeta sobre a sua app"*.
10. **Métrica 3: Error Rate** — o que conta como erro (5xx, timeouts, body inválido, falha de `check()`). Tabela de thresholds típicos (<0.1% saudável, 0.1–1% atenção, >1% crítico, >5% degradação aberta).
11. **Métrica 4: Saturação** — definição (Brendan Gregg: "demanda além da capacidade"). Recursos típicos: CPU, memória, **event loop lag** (especialmente Node), conexões DB. SVG: barra de capacidade enchendo + transbordando.
12. **Como ler um relatório do k6** — screenshot anotado de output real do `k6 run`, com setas/badges sobre: `http_reqs`, `http_req_duration {p(95), p(99)}`, `http_req_failed`, `iteration_duration`, `vus_max`. Cada anotação é uma frase curta sobre o que olhar.
13. **Hot Path** — *novo*. Definição: caminho de código que recebe a maior parte do tráfego. SVG: pizza/treemap de endpoints com um pedaço gigante destacado. Como identificar: APM, logs agregados, regra de Pareto. Por que importa: otimização desproporcionalmente recompensada.
14. **K6: a ferramenta + instalação** — bullets curtos do que é (Grafana Labs, JS, sem JVM/Node runtime), seguido de **3 colunas de instalação** (cada uma como um card visual):
    - **Windows**: `winget install k6 --source winget` ou `choco install k6` — acompanhado de **screenshot real** do terminal mostrando o output do `winget install` (download → install → success)
    - **macOS**: `brew install k6` — acompanhado de **screenshot real** do `brew install k6` no Terminal mostrando download e linking
    - **Linux (Debian/Ubuntu)**: bloco com `gpg`/`apt` (3 comandos) — acompanhado de **screenshot real** ou diagrama anotado dos passos (chave GPG → repositório → install)
    Termina com `k6 version` para validar (screenshot do output esperado).

    **Origem das imagens:** capturadas da documentação oficial em `grafana.com/docs/k6/latest/set-up/install-k6/` ou geradas pelo professor em ambiente local. Implementação em `aulas-2sem/assets/img/k6-install-{windows,macos,linux}.png`. Convenção: ~600px de largura, fundo escuro do terminal preservado, anotações em vermelho FIAP (`#ED145B`) feitas em editor (sobreposição) ou em layer SVG `<g>` sobre `<image>` se quisermos manter responsivo.

    Layout do slide: 3 colunas Windows / macOS / Linux, cada uma com card vertical contendo ícone do SO (SVG), comando em `<code>`, e screenshot abaixo. Ao final, faixa horizontal com `k6 version` mostrando "v0.x.x" (validação).
15. **Quiz 1 — Tipos de teste** (markup canônico, conteúdo aprovado)
16. **Quiz 2 — Percentis** (markup canônico, conteúdo aprovado)

### Intervalo
17. **Intervalo** — `break-slide`

### Bloco 2 — Prática (~85min, 9 slides + sub-slides)

18. **Section divider** "Bloco 2 — Otimização Iterativa de uma API Real"
19. **Laboratório `fiap-2026-1-perf`** — apresentação. Bullets:
    - Stack: Node + Express + Sequelize + SQLite
    - Estrutura de pastas (mini árvore visual)
    - Setup em 3 comandos: `git clone …`, `npm install`, `npm start`
    - Seed automático na primeira inicialização
    - Pré-requisito: Node 20+, k6 instalado (slide 14)
20. **Anatomia de um script k6** — bloco de código `baseline.js` anotado com **comentários inline coloridos** explicando: `import http`, `options.stages`, `thresholds`, `default function`, `check()`, `sleep()`. Frase âncora: "stages = ramp-up + steady + ramp-down configurável".
21. **Iteração 1 — Sync I/O bloqueando event loop** — slide-pai com 4 sub-slides verticais (`<section>` aninhada em Reveal.js):
    - **21a. Cenário** — descrição do `GET /users/:id/profile`. Pergunta: "qual a hipótese?". Card "código suspeito" com snippet ofuscado.
    - **21b. Baseline** — comando `k6 run k6/sync-io.js`. Screenshot do output esperado. Setas em P50, P99, throughput.
    - **21c. Diagnóstico** — SVG comparativo: P50 (estável) × P99 (curva exponencial) × throughput (plateau). Conclusão: "event loop bloqueado por op síncrona". Mostra o trecho exato (`crypto.pbkdf2Sync` ou similar).
    - **21d. Fix + remedição** — diff antes/depois (sync → async), comando re-rodando, screenshot do novo output, **gráfico de barras SVG comparativo** P50/P95/P99/RPS antes×depois.
22. **Iteração 2 — N+1 query** — mesma estrutura, 4 sub-slides:
    - **22a. Cenário** — `GET /orders` retorna pedidos com itens. Hipótese?
    - **22b. Baseline** — `k6 run k6/n-plus-one.js`. Output mostra throughput colapsando, latência média subindo conforme dataset cresce.
    - **22c. Diagnóstico** — SVG fluxo: 1 query mãe + N queries filhas; barra de queries totais por requisição. Sequelize log mostrando o N+1.
    - **22d. Fix + remedição** — diff `findAll()` → `findAll({ include: [Items] })`, output re-rodado, comparativo SVG.
23. **Quiz 3 — Interpretação aplicada** (markup canônico, conteúdo aprovado)
24. **Quiz 4 — Hot Path** (markup canônico, conteúdo aprovado)
25. **Desafio (casa)** — `GET /products` é o hot path do app (78% do tráfego). Cache ausente. Tarefa: implementar `node-cache` ou `Map`+TTL, rodar `k6/products-cache.js` antes/depois, postar comparativo no Teams. Entregável: PR no fork do aluno.
26. **Considerações finais** — bullets:
    - Testes de carga em CI/CD (thresholds como gates de PR)
    - k6 Cloud / Grafana k6 Operator para escala
    - Próximos passos: profiling do servidor, observabilidade
    Reaproveita parte do slide "Considerações Finais" atual + slide "Soluções Black Friday" atual fundidos.
27. **Dúvidas** — placeholder
28. **Encerramento** — `end-slide` com copyright

## Padrão de markup dos quizzes

Todos os 4 quizzes seguem o mesmo padrão canônico (compatível com `assets/js/fiap-quiz.js`):

```html
<section class="quiz-slide content-slide"
         data-correct="b"
         data-quiz-id="q1"
         data-quiz-feedback="Spike test simula picos abruptos — exatamente o caso do flash sale.">
  <div class="top-bar"></div>
  <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
  <div class="slide-title-area">
    <div class="accent-bar"></div>
    <h2>Quiz 1 — Tipos de teste</h2>
  </div>
  <p>Sua plataforma de e-commerce vai lançar um flash sale...</p>
  <ul class="quiz-options">
    <label><input type="radio" name="q1" value="a"> Soak test</label>
    <label><input type="radio" name="q1" value="b"> Spike test</label>
    <label><input type="radio" name="q1" value="c"> Smoke test</label>
    <label><input type="radio" name="q1" value="d"> Stress test</label>
  </ul>
  <div class="quiz-feedback"></div>
  <div class="slide-footer">
    <div class="footer-bar">11 - Testes de Carga</div>
    <div class="footer-page">15</div>
  </div>
</section>
```

**Quiz IDs e respostas corretas:**

| Quiz | `data-quiz-id` | `data-correct` | Feedback |
|---|---|---|---|
| 1 — Tipos de teste | `q1-tipos` | `b` (Spike) | "Spike test simula picos abruptos. Stress mediria limites máximos sustentados; soak mede estabilidade ao longo de horas." |
| 2 — Percentis | `q2-percentis` | `b` | "P95=820ms = '95% terminam em até 820ms'. P99 conta a cauda — 1 em 100 sente >4s, e isso é o usuário que reclama." |
| 3 — Interpretação aplicada | `q3-interpretacao` | `b` | "Throughput plateau + P99 explodindo enquanto P50 mantém é assinatura clássica de saturação por bloqueio. Mais VUs ficam enfileirados, não atendidos." |
| 4 — Hot Path | `q4-hotpath` | `b` | "Hot path = onde a maioria do tráfego passa. Otimizar 1% nele rende mais que 50% nos outros 38 juntos. Pareto aplicado a performance." |

## Diagramas SVG previstos

Todos inline no `aula11.html`. Listagem para implementação:

| Slide | Diagrama | Animação? |
|---|---|---|
| 6 | 4 mini-cards VU×tempo (Load, Stress, Spike, Soak) | Não |
| 7 | Curva ramp-up → steady → ramp-down anotada | Sim — marcador percorrendo a curva |
| 8 | Barra de RPS (100 RPS × 60s = 6000 reqs) | Não |
| 9 | Histograma de distribuição de latência com linhas P50/P95/P99 | Não (estático suficiente) |
| 11 | Barra de capacidade enchendo e transbordando | Sim — `<animate>` opcional |
| 13 | Treemap/pizza de endpoints com hot path destacado | Não |
| 21c | Curvas P50 / P99 / throughput sobrepostas | Sim — desenho progressivo |
| 21d | Barras comparativas antes/depois | Não |
| 22c | Diagrama de fluxo N+1 (1 query mãe + N filhas) | Sim — pulsar nas N queries |
| 22d | Barras comparativas antes/depois | Não |

**Imagens raster previstas** (PNG/JPG, complementam SVGs):

| Slide | Imagem | Origem |
|---|---|---|
| 12 | Screenshot anotado de output real do `k6 run` (relatório resumo) | Captura local do professor |
| 14 | Screenshot `winget install k6` no PowerShell | Doc oficial Grafana k6 ou captura local |
| 14 | Screenshot `brew install k6` no Terminal macOS | Doc oficial Grafana k6 ou captura local |
| 14 | Screenshot dos 3 comandos `gpg`/`apt` no Linux | Doc oficial Grafana k6 ou captura local |
| 14 | Screenshot do `k6 version` (validação) | Captura local |
| 21b, 22b | Screenshot do output do k6 das iterações | Captura local em `fiap-2026-1-perf` |
| 21d, 22d | Screenshot do output pós-fix | Captura local em `fiap-2026-1-perf` |

Salvas em `aulas-2sem/assets/img/` com prefixo `k6-` para o slide 14 e `aula11-` para os demais. Capturar em hardware do professor antes da aula para garantir que os números nos screenshots batem com o que vai sair em sala.

Convenção: `class="diagram-svg"` em `<svg>` para estilização global. Animações via `<animate>` (SMIL) ou `@keyframes` em `<style>` no próprio SVG. Nada de bibliotecas externas.

## Repositório de apoio: `fiap-2026-1-perf`

### Stack
- Node 20+
- Express ^4
- Sequelize ^6 + sqlite3
- ESM (`"type": "module"`)

### Endpoints e gargalos plantados

#### 1. `GET /users/:id/profile` — Sync I/O bloqueando event loop

```js
// src/routes/users.js — VERSÃO COM PROBLEMA
import crypto from 'node:crypto';

router.get('/:id/profile', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'not found' });

  // Plantado: hash síncrono pesado bloqueia o event loop por ~80–150ms
  // Justificativa pedagógica: simula auditoria/assinatura de payload
  const integrity = crypto.pbkdf2Sync(
    JSON.stringify(user), 'salt', 100_000, 32, 'sha512'
  ).toString('hex');

  res.json({ ...user.toJSON(), integrity });
});
```

**Fix esperado:** trocar por `crypto.pbkdf2` async (callback ou `promisify`), liberando o event loop. Documentado em `docs/iteracao-1-sync-io.md`.

#### 2. `GET /orders` — N+1 query

```js
// src/routes/orders.js — VERSÃO COM PROBLEMA
router.get('/', async (req, res) => {
  const orders = await Order.findAll();             // 1 query
  const result = [];
  for (const order of orders) {
    const items = await OrderItem.findAll({         // N queries (uma por order)
      where: { orderId: order.id }
    });
    result.push({ ...order.toJSON(), items });
  }
  res.json(result);
});
```

**Fix esperado:** `Order.findAll({ include: [{ model: OrderItem, as: 'items' }] })` — uma única query com JOIN. Documentado em `docs/iteracao-2-n-plus-one.md`.

#### 3. `GET /products` — Sem cache (DESAFIO)

```js
// src/routes/products.js — VERSÃO COM PROBLEMA
router.get('/', async (req, res) => {
  const products = await Product.findAll({ order: [['popularity', 'DESC']] });
  res.json(products);
});
```

Catálogo muda raramente; endpoint recebe ~78% do tráfego no cenário do quiz 4. **Fix esperado:** `node-cache` ou `Map`+TTL com 60s de validade. Documentado em `docs/desafio-cache.md`.

### Seed
- 1000 usuários (`faker` para nomes/emails)
- 200 produtos
- 5000 pedidos (5 por usuário em média) com 3 itens cada (15000 OrderItems)
- Executado automaticamente na primeira inicialização se `database.sqlite` não existir.

### Scripts k6 (`k6/`)

Todos seguem template comum: ramp-up 0→VU_alvo em 1min → steady 2min → ramp-down 1min. Thresholds explicitados.

```js
// k6/baseline.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 20 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get('http://localhost:3000/health');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

`sync-io.js` mira `http://localhost:3000/users/:id/profile` (id aleatório 1–1000), VU alvo 50.
`n-plus-one.js` mira `http://localhost:3000/orders`, VU alvo 30.
`products-cache.js` mira `http://localhost:3000/products`, VU alvo 100 (carga alta — esse é o hot path).

### README do repo
Estrutura sugerida (escrever no fim, fora do escopo deste spec):
1. Pré-requisitos (Node 20+, k6)
2. Setup (3 comandos)
3. Endpoints disponíveis e o que cada um faz
4. Como rodar cada teste k6
5. Roteiro pedagógico (3 iterações)
6. Gabaritos lacrados em `docs/`

## Componentes que mudam em outros arquivos

- **`assets/css/fiap-theme.css`** — possivelmente adicionar `.diagram-svg` para alinhar estilo dos SVGs (cor primária FIAP, traços, fonte). Avaliar durante implementação.
- Nenhuma mudança em `assets/js/fiap-quiz.js` (markup canônico já é suportado).
- Nenhuma mudança em outras aulas.

## Critérios de aceite

1. `aula11.html` renderiza sem console errors em Chrome/Edge atual.
2. Os 4 quizzes respondem ao clique: opção correta fica verde, errada vermelha riscada, demais opacas, feedback visível.
3. Export para PDF (via `?print-pdf`) preserva os SVGs e diagramas — testar com `fiap-print.js`.
4. Repo `fiap-2026-1-perf` clona, `npm install` e `npm start` em ambiente novo, sem editar nada.
5. `k6 run k6/baseline.js` executa contra a API recém-iniciada e termina sem erro de conexão.
6. Cada um dos 3 problemas, ao ser corrigido conforme gabarito, melhora as métricas medidas pelo respectivo script k6 (ex.: P99 do `sync-io.js` cai >5×).
7. Markdown de gabarito (`docs/iteracao-*.md`, `docs/desafio-*.md`) descreve o problema, o sintoma medível, o fix esperado, e dá um número de melhoria de referência.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Aluno sem Node instalado em aula | Slide 14 trata de k6; adicionar 1 frase no slide 19 sobre Node 20+. README do repo lista pré-reqs em destaque. |
| Output do k6 varia por hardware (números diferentes por máquina) | Roteiro pedagógico foca em **forma das curvas** (P99 explodindo, throughput plateau), não em números absolutos. |
| `crypto.pbkdf2Sync` pode ser rápido demais em hardware moderno | Calibrar `100_000` iterations para gerar ~80–150ms em laptop médio. Validar em hardware do professor antes da aula. |
| Sequelize log barulhento polui output em aula | Desabilitar `logging: false` em `db/index.js` para a versão default; deixar comentado um modo "Sequelize verbose" que mostra o N+1 explicitamente — usar como ferramenta na iteração 2c. |
| Conflito de porta 3000 | Usar `process.env.PORT ?? 3000` para fácil override. |
| SVG animado pode não renderizar em PDF | Slides com animação têm versão estática como fallback (último frame). `fiap-print.js` já lida com isso para outras aulas. |

## Plano de execução (alto nível)

A skill `writing-plans` vai detalhar isso em passos executáveis. Resumo do escopo:

1. **Criar `fiap-2026-1-perf`** — scaffolding, models, routes com gargalos plantados, seed, scripts k6, README, gabaritos.
2. **Reescrever `aula11.html`** — 28 slides conforme outline; SVGs inline; quizzes canônicos; preservar layout/tema FIAP existente.
3. **Validar visualmente** — abrir no navegador, navegar slide a slide, clicar em todos os quizzes, exportar PDF, conferir.
4. **Validar laboratório** — rodar `npm install && npm start` em diretório limpo; rodar cada `k6 run …`; aplicar cada fix conforme gabarito; confirmar que números melhoram.
