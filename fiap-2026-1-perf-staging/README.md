# fiap-2026-1-perf

> **Setup inicial (após mover de fiap-2026-1-perf-staging):**
> ```bash
> git init && git add . && git commit -m "feat: scaffold inicial"
> npm install && npm start
> ```

Laboratório de testes de carga — **FIAP 3SIZ Aula 11 (2026/1)**.

API Node.js deliberadamente lenta com 3 gargalos plantados, scripts k6 prontos para medir cada um, e gabaritos pedagógicos. Os alunos diagnosticam, corrigem e re-medem.

## Pré-requisitos

- **Node.js 20+** ([nodejs.org](https://nodejs.org))
- **k6** ([instalação](https://grafana.com/docs/k6/latest/set-up/install-k6/)):
  - Windows: `winget install k6 --source winget`
  - macOS: `brew install k6`
  - Linux (Debian/Ubuntu):
    ```bash
    sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update && sudo apt-get install k6
    ```
- Validar: `k6 version`

## Setup (3 comandos)

```bash
git clone https://github.com/josercf/fiap-2026-1-perf.git
cd fiap-2026-1-perf
npm install && npm start
```

Na primeira execução, um seed automático cria `database.sqlite` com:
- 1.000 usuários
- 200 produtos
- 5.000 pedidos
- 15.000 itens de pedido

(Demora ~30–60s — só na primeira vez.)

Servidor em `http://localhost:3000`.

## Endpoints

| Método | Caminho | Descrição | Gargalo plantado |
|---|---|---|---|
| GET | `/health` | Sanity check | nenhum |
| GET | `/users/:id/profile` | Perfil + integrity hash | **#1 sync I/O** |
| GET | `/orders?limit=N` | Pedidos com itens | **#2 N+1 query** |
| GET | `/products` | Catálogo ordenado por popularidade | **#3 sem cache** (desafio) |

## Roteiro pedagógico

### Iteração 1 — Sync I/O (em aula)
```bash
k6 run k6/sync-io.js
```
Diagnóstico: P50 estável, P99 explode. Sintoma de event loop bloqueado.
Gabarito: [`docs/iteracao-1-sync-io.md`](docs/iteracao-1-sync-io.md).

### Iteração 2 — N+1 (em aula)
```bash
k6 run k6/n-plus-one.js
```
Diagnóstico: throughput colapsa, log mostra 51 queries por request.
Gabarito: [`docs/iteracao-2-n-plus-one.md`](docs/iteracao-2-n-plus-one.md).

### Desafio — Cache em hot path (casa)
```bash
k6 run k6/products-cache.js
```
Implementar cache, comparar antes/depois.
Roteiro: [`docs/desafio-cache.md`](docs/desafio-cache.md).

## Scripts npm

| Comando | O que faz |
|---|---|
| `npm start` | Sobe o servidor (auto-seed na primeira vez) |
| `npm run seed` | Recria DB do zero (`force: true`) |
| `npm test` | Roda testes sanity (`node --test`) |
| `npm run reset` | Apaga DB e recria |

## Estrutura

```
fiap-2026-1-perf/
├── src/
│   ├── server.js
│   ├── routes/        ← health.js, users.js, orders.js, products.js
│   └── db/            ← Sequelize bootstrap, models, seed
├── tests/             ← node:test + supertest
├── k6/                ← baseline.js + 3 scripts de cenário
└── docs/              ← gabaritos das iterações
```

## Licença

Material didático FIAP 3SIZ — uso restrito a alunos da disciplina.
Copyright © 2026 Prof. José Romualdo da Costa Filho.
