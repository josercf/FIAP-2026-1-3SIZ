# Iteração 1 — Sync I/O bloqueando event loop

## Endpoint
`GET /users/:id/profile`

## Sintoma medido pelo k6 (`k6/sync-io.js`)
- P50 estável (~80–150ms — tempo do hash)
- P99 explode (>1s, escalando com VUs)
- Throughput estagna em ~10–15 RPS independente de quantos VUs adicionar
- Event loop "engasga": novas requisições enfileiram

## Causa
`crypto.pbkdf2Sync(...)` em `src/routes/users.js:23` bloqueia a thread única
do Node por ~80–150ms a cada requisição. Em modelo single-threaded com
event loop, isso pausa **todas** as requisições concorrentes.

## Fix

```js
// ANTES
const integrity = crypto
  .pbkdf2Sync(payload, 'fiap-salt', 100_000, 32, 'sha512')
  .toString('hex');

// DEPOIS
import { promisify } from 'node:util';
const pbkdf2 = promisify(crypto.pbkdf2);
// ...
const integrity = (await pbkdf2(payload, 'fiap-salt', 100_000, 32, 'sha512'))
  .toString('hex');
```

A versão async libera o event loop durante o cálculo (executa em thread
pool interna do libuv), permitindo outras requisições serem atendidas
enquanto o hash é computado.

## Resultado esperado após fix

| Métrica | Antes | Depois | Melhoria |
|---|---|---|---|
| P50 | ~120ms | ~120ms | igual (mesmo trabalho) |
| P95 | ~600ms | ~150ms | 4× |
| P99 | ~3000ms | ~200ms | 15× |
| Throughput | ~15 RPS | ~50 RPS (= VUs) | 3× |

> Os números acima são referência; resultados reais variam por hardware.
> O importante é a **forma da curva**: P99 colapsa para perto do P50.

## Conceito ensinado
- Event loop em Node single-thread
- Diferença entre operação síncrona e async I/O
- Por que P99 importa mais que a média
- Saturação por bloqueio (não por capacidade)
