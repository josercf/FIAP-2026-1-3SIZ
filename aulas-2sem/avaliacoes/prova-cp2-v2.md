# Checkpoint II

**Microservice and Web Engineering**

FIAP 2026.1 - Turma 3SIZ

Professor: José Romualdo da Costa Filho

Duração: 2h30 mínima, 3h máxima

Total: 20 questões objetivas, 5 pontos cada, 100 pontos no total

Conteúdo: Aulas 01 a 08 mais princípios SOLID

Formato: 12 múltipla escolha de preenchimento de linha, 5 asserção razão, 3 remoção de linha de teste


## Regras de prova

1. Internet bloqueada durante a prova, exceto o formulário do Microsoft Forms.
2. Materiais locais permitidos: clonar o repositório do mini mundo, executar os testes com `npm test`, ler o código no editor.
3. Não é permitido assistente de IA, ChatGPT, Copilot ou busca na Web aberta.
4. Consulta livre ao repositório clonado `fiap-2026-1-cp2` e à sua caderneta pessoal.
5. Em caso de dúvida sobre enunciado, consulte o professor presencialmente.


## Preparação

Antes de responder, clone e rode os testes:

```
git clone <url-do-repo> fiap-2026-1-cp2
cd fiap-2026-1-cp2
npm install
npm test
```

Os 36 testes da linha de base devem passar. Use o código e os testes como referência factual. Toda questão exige que você abra o arquivo, aplique uma alteração específica indicada no enunciado e observe o resultado de `npm test --workspace=cases/<n>` antes de marcar a alternativa.


## Questão 01 - Aula 08 - SOLID - Fácil - Preencher linha

A liderança técnica decidiu eliminar o acoplamento da classe `CreditCard` ao `Logger` concreto, em conformidade com o princípio da Inversão de Dependência. Abra `cases/01-credit-card-solid/src/credit-card.js`. Altere a assinatura do construtor da linha 12 de `constructor({ number, holder, limit })` para `constructor({ number, holder, limit, logger })`. Em seguida adicione o teste a seguir ao final de `tests/credit-card.test.js`, dentro do bloco `describe('StandardCreditCard')`:

```
test('Q01 logger pode ser injetado pelo construtor', () => {
  const fake = { info: jest.fn(), error: jest.fn() };
  const card = new StandardCreditCard({ number: 'X', holder: 'Y', limit: 1000, logger: fake });
  card.authorize(50);
  expect(fake.info).toHaveBeenCalled();
});
```

Por fim, substitua a linha 21 de `credit-card.js` (`this.logger = new Logger();`) por uma das alternativas e rode `npm test --workspace=cases/01-credit-card-solid`. Qual alternativa mantém os 10 testes existentes passando E faz o teste Q01 passar?

A) `this.logger = logger;`

B) `this.logger = logger || new Logger();`

C) `this.logger = new Logger(logger);`

D) `this.logger = Logger.from(logger);`

E) `this.logger = options.logger ?? new Logger();`


## Questão 02 - Aula 08 - SOLID - Média - Asserção razão

Abra `cases/01-credit-card-solid/src/cards.js` e localize o método `refund` da classe `PrepaidCreditCard` (linha 28), que lança `Error('Operação não suportada: cartão pré-pago não aceita estorno')`. Em seguida, abra `cases/01-credit-card-solid/tests/credit-card.test.js` e descomente o bloco de teste das linhas 64 a 68 (o que verifica `expect(() => card.refund(50)).not.toThrow()`). Rode `npm test --workspace=cases/01-credit-card-solid`.

Considere as duas proposições a seguir.

I. O teste recém habilitado falha porque a linha 28 de `cards.js` quebra o contrato definido pela classe `CreditCard` em `credit-card.js`, na qual `refund` é uma operação válida que retorna `{ refunded: true }` ou `{ refunded: false, reason: 'amount_exceeds_balance' }`.

II. Essa quebra é uma violação do princípio da Substituição de Liskov, pois `PrepaidCreditCard` não pode ser usado de forma intercambiável com `StandardCreditCard` em qualquer contexto que dependa de `refund`.

A respeito dessas proposições, assinale a alternativa correta:

A) As duas proposições são verdadeiras e a segunda justifica a primeira.

B) As duas proposições são verdadeiras, mas a segunda não justifica a primeira.

C) A primeira proposição é verdadeira e a segunda é falsa.

D) A primeira proposição é falsa e a segunda é verdadeira.

E) As duas proposições são falsas.


## Questão 03 - Aula 08 - SOLID - Difícil - Preencher linha

Em `cases/01-credit-card-solid/src/transaction.js`, o método `refundAll` (linhas 17 a 25) percorre a lista de cartões e para o processamento quando algum cartão falha. O time precisa que o processador continue tentando os próximos cartões mesmo quando um lança exceção, registrando o erro como `{ refunded: false, reason: 'exception', error: <mensagem> }`.

Adicione o seguinte teste ao final de `tests/credit-card.test.js`:

```
test('Q03 refundAll continua apos excecao em Prepaid', () => {
  const a = new StandardCreditCard({ number: 'A', holder: 'Ana', limit: 1000 });
  const b = new PrepaidCreditCard({ number: 'B', holder: 'Bia', limit: 500 });
  a.authorize(300); b.authorize(200);
  const out = new TransactionProcessor([a, b]).refundAll(50);
  expect(out).toHaveLength(2);
  expect(out[0].result.refunded).toBe(true);
  expect(out[1].result.refunded).toBe(false);
  expect(out[1].result.reason).toBe('exception');
});
```

Substitua o corpo do laço `for (const card of this.cards)` em `refundAll` por uma das alternativas e rode `npm test --workspace=cases/01-credit-card-solid`. Qual alternativa faz o novo teste passar sem quebrar os dois testes anteriores de `TransactionProcessor`?

A)
```
const result = card.refund(amountPerCard);
results.push({ holder: card.holder, result });
if (!result.refunded) break;
```

B)
```
let result;
try { result = card.refund(amountPerCard); }
catch (e) { result = { refunded: false, reason: 'exception', error: e.message }; }
results.push({ holder: card.holder, result });
```

C)
```
try { results.push({ holder: card.holder, result: card.refund(amountPerCard) }); }
catch (e) { break; }
```

D)
```
const result = card.refund(amountPerCard) ?? { refunded: false, reason: 'exception' };
results.push({ holder: card.holder, result });
```

E)
```
results.push({ holder: card.holder, result: card.refund(amountPerCard) });
```


## Questão 04 - Aula 08 - Média - Remover linha de teste

A área de produto formalizou a regra: cartão pré-pago continua não aceitando estorno, porém a forma correta de comunicar isso é retornar `{ refunded: false, reason: 'unsupported_for_prepaid' }`, jamais lançar exceção. Aplique a refatoração substituindo o método `refund` de `PrepaidCreditCard` (linhas 27 a 29 de `cases/01-credit-card-solid/src/cards.js`) por:

```
refund(amount) {
  return { refunded: false, reason: 'unsupported_for_prepaid' };
}
```

Em seguida, **substitua** o bloco comentado das linhas 64 a 68 de `tests/credit-card.test.js` por este teste, que representa um rascunho intermediário deixado pelo time:

```
test('Q04 refund em Prepaid retorna erro controlado', () => {
  const card = new PrepaidCreditCard({ number: '3333', holder: 'Carla', limit: 200 });
  card.authorize(100);
  expect(() => card.refund(50)).toThrow('Operacao nao suportada');
  expect(card.refund(50)).toEqual({ refunded: false, reason: 'unsupported_for_prepaid' });
});
```

Rode `npm test --workspace=cases/01-credit-card-solid`. Uma linha do teste contradiz a nova regra e impede a suíte de passar. Qual linha deve ser **removida** para que a suíte volte a passar refletindo a nova regra?

A) `const card = new PrepaidCreditCard({ number: '3333', holder: 'Carla', limit: 200 });`

B) `card.authorize(100);`

C) `expect(() => card.refund(50)).toThrow('Operacao nao suportada');`

D) `expect(card.refund(50)).toEqual({ refunded: false, reason: 'unsupported_for_prepaid' });`

E) Nenhuma linha precisa ser removida; o teste já passa após a refatoração.


## Questão 05 - Aula 08 - SOLID - Média - Asserção razão

Em `cases/01-credit-card-solid/src/credit-card.js`, examine as linhas 21 e 22, nas quais o construtor instancia diretamente `new Logger()` e `new Notifier()`. Em seguida, abra `tests/credit-card.test.js` e tente, em qualquer teste, substituir esses colaboradores por dublês sem alterar o código de produção. Rode `npm test --workspace=cases/01-credit-card-solid` para confirmar suas observações.

Considere as duas proposições a seguir.

I. As linhas 21 e 22 violam o princípio da Inversão de Dependência, pois a classe de alto nível `CreditCard` depende diretamente das classes concretas `Logger` e `Notifier`, em vez de depender de abstrações injetadas pelo chamador.

II. Essa violação impede que um teste injete um stub ou spy nessas dependências sem alterar o construtor da classe, pois sempre que um cartão é instanciado as duas classes concretas são criadas dentro do construtor.

A respeito dessas proposições, assinale a alternativa correta:

A) As duas proposições são verdadeiras e a segunda justifica a primeira.

B) As duas proposições são verdadeiras, mas a segunda não justifica a primeira.

C) A primeira proposição é verdadeira e a segunda é falsa.

D) A primeira proposição é falsa e a segunda é verdadeira.

E) As duas proposições são falsas.


## Questão 06 - Aula 08 - Média - Preencher linha em teste

Abra `cases/02-test-quality-suite/tests/fraud-detector.test.js` e localize o teste T1 nas linhas 12 a 17. Esse teste mocka o próprio método sob teste (`detector.evaluate = jest.fn().mockReturnValue(...)`) e por isso passa para qualquer comportamento real do sistema.

Para transformar T1 em um teste que de fato exercite a lógica de `FraudDetector.evaluate` (em `src/fraud-detector.js`), substitua a linha 14 (`detector.evaluate = jest.fn().mockReturnValue({ decision: 'approve' });`) por uma das alternativas e rode `npm test --workspace=cases/02-test-quality-suite`. Qual alternativa faz com que T1 ainda termine com `expect(result.decision).toBe('approve')` passando, porém **sem** mockar o método sob teste, garantindo que uma regressão real seja detectada?

A) `detector.evaluate = (tx) => ({ decision: 'approve' });`

B) `// linha removida (deixar em branco)`

C) `jest.spyOn(detector, 'evaluate').mockReturnValue({ decision: 'approve' });`

D) `detector.maxValue = 1;`

E) `detector.evaluate = jest.fn();`


## Questão 07 - Aula 08 - Fácil - Preencher linha em teste

Em `cases/02-test-quality-suite/tests/fraud-detector.test.js`, as linhas 6 e 7 declaram `sharedStore` e `sharedDetector` no escopo do módulo. Esse estado é reutilizado pelos testes T2 e T3, criando dependência de ordem de execução.

Para corrigir o antipadrão, **remova as linhas 6 e 7** e substitua o corpo de T2 (linhas 21 a 25) por uma das alternativas. Em seguida rode `npm test --workspace=cases/02-test-quality-suite`. Qual alternativa faz T2 passar de forma determinística mesmo quando os testes são reordenados ou executados em paralelo?

A)
```
const first = sharedDetector.evaluate({ idempotencyKey: 'shared-key', amount: 10, customerId: 'x' });
const second = sharedDetector.evaluate({ idempotencyKey: 'shared-key', amount: 10, customerId: 'x' });
expect(first.decision).toBe('approve');
expect(second.decision).toBe('duplicate');
```

B)
```
const detector = new FraudDetector();
const first = detector.evaluate({ idempotencyKey: 'shared-key', amount: 10, customerId: 'x' });
const second = detector.evaluate({ idempotencyKey: 'shared-key', amount: 10, customerId: 'x' });
expect(first.decision).toBe('approve');
expect(second.decision).toBe('duplicate');
```

C)
```
const detector = new FraudDetector();
const result = detector.evaluate({ idempotencyKey: 'k', amount: 10, customerId: 'x' });
expect(result.decision).toBe('duplicate');
```

D)
```
expect(sharedStore).toBeDefined();
expect(sharedDetector).toBeDefined();
```

E)
```
const store = new IdempotencyStore();
store.register('shared-key');
expect(store.register('shared-key')).toBe(true);
```


## Questão 08 - Aula 08 - Média - Asserção razão

Em `cases/02-test-quality-suite/tests/fraud-detector.test.js`, leia com atenção o teste T4 nas linhas 35 a 45. Em seguida, leia o teste T6 nas linhas 55 a 60, que injeta um `clock` falso. Rode `npm test --workspace=cases/02-test-quality-suite` algumas vezes e observe se o tempo total varia.

Considere as duas proposições a seguir.

I. O teste T4 configura `velocityWindowMs` igual a 10 milissegundos e usa um laço de espera ocupada com `Date.now()` para aguardar a janela expirar. Esse desenho torna o teste não determinístico, podendo falhar em máquinas mais rápidas, mais lentas ou sob carga.

II. A forma correta de testar comportamento dependente de tempo é injetar um relógio falso no componente, como T6 demonstra, e avançar o tempo manualmente no teste, eliminando a dependência do relógio real do sistema.

A respeito dessas proposições, assinale a alternativa correta:

A) As duas proposições são verdadeiras e a segunda justifica a primeira.

B) As duas proposições são verdadeiras, mas a segunda não justifica a primeira.

C) A primeira proposição é verdadeira e a segunda é falsa.

D) A primeira proposição é falsa e a segunda é verdadeira.

E) As duas proposições são falsas.


## Questão 09 - Aula 08 - Fácil - Remover linha de teste

A área de produto da PagaFácil determinou nova regra: transações de valor exatamente zero passam a ser rejeitadas como `{ decision: 'reject', reason: 'invalid_amount' }`, pois zero não é um valor financeiramente válido. A engenharia já implementou a regra em `cases/02-test-quality-suite/src/fraud-detector.js`. Aplique a alteração: substitua a linha 25 (`if (amount < 0)`) por `if (amount <= 0)` e rode `npm test --workspace=cases/02-test-quality-suite`.

O teste T5 em `tests/fraud-detector.test.js` (linhas 47 a 51) ainda exige o comportamento antigo, em que zero era aprovado. Qual linha deve ser **removida** de T5 para que ele se alinhe à nova regra e a suíte volte a passar?

A) `const detector = new FraudDetector();`

B) `const result = detector.evaluate({ idempotencyKey: 'kz', amount: 0, customerId: 'cz' });`

C) `expect(result.decision).toBe('approve');`

D) `test('T5 valor zero e processado como transacao valida', () => {`

E) Nenhuma linha precisa ser removida; T5 já reflete a nova regra.


## Questão 10 - Aula 08 - SOLID - Média - Preencher linha

Marketing pediu o tier `diamond` com 25% de desconto. Abra `cases/03-tdd-refactor/src/discount-calculator.js` e localize o `switch (tier)` nas linhas 21 a 32. Em seguida, adicione o seguinte teste ao final de `tests/discount.test.js`:

```
test('Q10 tier diamond aplica 25 por cento', () => {
  const calc = new DiscountCalculator();
  // Forca o tier para diamond reescrevendo resolveTier para retornar diamond.
  calc.resolveTier = () => 'diamond';
  expect(calc.calculate('qualquer', 1000)).toBe(250);
});
```

Adicione **uma linha** dentro do `switch` antes do `default`. Rode `npm test --workspace=cases/03-tdd-refactor`. Qual alternativa faz o teste novo passar sem quebrar os dois testes anteriores?

A) `case 'diamond': return cartTotal * 0.25;`

B) `case 'diamond': cartTotal *= 0.25; break;`

C) `if (tier === 'diamond') return cartTotal * 0.25;`

D) `case 'diamond': return cartTotal - (cartTotal * 0.25);`

E) `case 'diamond': return 0.25;`


## Questão 11 - Aula 08 - SOLID - Fácil - Preencher linha

Em `cases/03-tdd-refactor/src/discount-calculator.js`, o construtor da classe `DiscountCalculator` (linhas 12 a 14) instancia diretamente `new CustomerRepository()`. Essa decisão impede injeção de um repositório falso nos testes. Adicione o seguinte teste ao final de `tests/discount.test.js`:

```
test('Q11 aceita repositorio injetado no construtor', () => {
  const fakeRepo = { getHistory: () => ({ lifetimeValue: 12000 }) };
  const calc = new DiscountCalculator(fakeRepo);
  expect(calc.calculate('x', 1000)).toBe(150); // platinum 15 por cento
});
```

Substitua a linha 13 (`this.repo = new CustomerRepository();`) por uma das alternativas e rode `npm test --workspace=cases/03-tdd-refactor`. Qual alternativa faz o novo teste passar mantendo os dois testes anteriores funcionando (que instanciam sem argumento)?

A) `this.repo = new CustomerRepository();`

B) `this.repo = repo;`

C) `this.repo = repo || new CustomerRepository();`

D) `this.repo = repo ?? null;`

E) `this.setRepo = (r) => { this.repo = r; };` (e remover qualquer atribuição direta a `this.repo` no construtor)

Observação: para as alternativas B, C e D funcionarem, a assinatura do construtor da linha 12 também deve ser alterada de `constructor()` para `constructor(repo)`. Aplique essa mudança junto.


## Questão 12 - Aula 08 - SOLID - Difícil - Preencher linha

Você decidiu refatorar `cases/03-tdd-refactor/src/discount-calculator.js` para resolver simultaneamente a violação de OCP (no `switch` por tier) e a violação de DIP (na instanciação do repositório). Substitua o corpo completo da classe `DiscountCalculator` (linhas 11 a 39) por uma das alternativas e rode `npm test --workspace=cases/03-tdd-refactor` (assumindo que os testes Q10 e Q11 das questões anteriores foram adicionados). Qual alternativa mantém os quatro testes (os dois originais mais Q10 e Q11) passando?

A)
```
class DiscountCalculator {
  constructor(repo) { this.repo = repo || new CustomerRepository(); }
  calculate(customerId, cartTotal) {
    const history = this.repo.getHistory(customerId);
    const tier = this.resolveTier(history);
    const strategies = { silver: 0.05, gold: 0.10, platinum: 0.15, partner: 0.20, diamond: 0.25 };
    const rate = strategies[tier] ?? 0;
    return cartTotal * rate;
  }
  resolveTier(history) {
    if (history.lifetimeValue >= 10000) return 'platinum';
    if (history.lifetimeValue >= 5000) return 'gold';
    if (history.lifetimeValue >= 500) return 'silver';
    return 'none';
  }
}
```

B)
```
class DiscountCalculator {
  constructor() { this.repo = new CustomerRepository(); }
  calculate(customerId, cartTotal) {
    const tier = this.resolveTier(this.repo.getHistory(customerId));
    if (tier === 'silver') return cartTotal * 0.05;
    if (tier === 'gold') return cartTotal * 0.10;
    if (tier === 'platinum') return cartTotal * 0.15;
    if (tier === 'partner') return cartTotal * 0.20;
    if (tier === 'diamond') return cartTotal * 0.25;
    return 0;
  }
  resolveTier(history) { /* mesma logica */ }
}
```

C)
```
class DiscountCalculator extends CustomerRepository {
  calculate(customerId, cartTotal) {
    const tier = this.resolveTier(this.getHistory(customerId));
    return cartTotal * { silver: 0.05, gold: 0.10, platinum: 0.15, partner: 0.20, diamond: 0.25 }[tier];
  }
}
```

D)
```
const STRATEGIES = { silver: 0.05, gold: 0.10, platinum: 0.15, partner: 0.20, diamond: 0.25 };
class DiscountCalculator {
  static calculate(customerId, cartTotal) {
    return cartTotal * (STRATEGIES[new CustomerRepository().getHistory(customerId).tier] || 0);
  }
}
```

E)
```
class DiscountCalculator {
  constructor(repo) { this.repo = repo; }
  calculate() { return 0; }
}
```


## Questão 13 - Aula 06 - Média - Preencher linha

Abra `cases/04-cache-aside/src/product-cache.js` e localize o método `getProduct` (linhas 18 a 28). Em seguida, abra `tests/cache.test.js` e leia o último teste das linhas 41 a 47, que afirma que com `ttlSeconds = 1` a chave permanece válida após 1,2 segundos. Esse teste atualmente passa.

A liderança considera esse teste enganoso, porque o engenheiro original confundiu unidades: a linha 25 grava `this.ttlSeconds * 1000` no parâmetro `ttlSeconds` de `setex`, que segundo `fake-redis.js` linha 22 espera SEGUNDOS. O efeito real é que TTL configurado para 1 segundo está armazenado por 1000 segundos.

Substitua a linha 25 (`await this.redis.setex(...)`) por uma das alternativas e rode `npm test --workspace=cases/04-cache-aside`. Para validar a correção, **substitua também** o último teste pelo seguinte (cole sobre as linhas 41 a 47):

```
test('Q13 chave expira corretamente apos ttlSeconds segundos', async () => {
  const { redis, cache } = makeCache(1);
  await cache.getProduct('P1');
  await new Promise(r => setTimeout(r, 1200));
  expect(await redis.get('product:P1')).toBeNull();
});
```

Qual alternativa faz todos os 5 testes passarem?

A) `await this.redis.setex(`product:${id}`, this.ttlSeconds * 1000, JSON.stringify(product));`

B) `await this.redis.setex(`product:${id}`, this.ttlSeconds, JSON.stringify(product));`

C) `await this.redis.setex(`product:${id}`, this.ttlSeconds / 1000, JSON.stringify(product));`

D) `await this.redis.setex(`product:${id}`, this.ttlSeconds * 60, JSON.stringify(product));`

E) `await this.redis.set(`product:${id}`, JSON.stringify(product));`


## Questão 14 - Aula 06 - Difícil - Asserção razão

Em `cases/04-cache-aside/tests/cache.test.js`, leia o teste das linhas 24 a 30, que afirma que duas leituras concorrentes durante o primeiro miss chamam o banco mais de uma vez (`expect(repo.callCount).toBe(2)`). Rode `npm test --workspace=cases/04-cache-aside` e observe que ele passa com o código atual.

Considere as duas proposições a seguir.

I. O comportamento descrito pelo teste é a manifestação local de um fenômeno conhecido como cache stampede, também chamado thundering herd, em que múltiplas requisições paralelas para a mesma chave ausente disputam o banco simultaneamente.

II. Em produção, sob alta concorrência logo após uma invalidação de chave popular, esse comportamento pode levar milhares de requisições ao banco em paralelo, sobrecarregando o backend e degradando o serviço.

A respeito dessas proposições, assinale a alternativa correta:

A) As duas proposições são verdadeiras e a segunda justifica a primeira.

B) As duas proposições são verdadeiras, mas a segunda não justifica a primeira.

C) A primeira proposição é verdadeira e a segunda é falsa.

D) A primeira proposição é falsa e a segunda é verdadeira.

E) As duas proposições são falsas.


## Questão 15 - Aula 03 - Média - Asserção razão

Em `cases/05-circuit-breaker/src/circuit-breaker.js`, examine as linhas 23 a 26 do método `exec`, no bloco `try` em que o estado transiciona de `HALF_OPEN` para `CLOSED` após uma chamada bem sucedida. Em seguida, rode `npm test --workspace=cases/05-circuit-breaker` e observe a saída do teste das linhas 49 a 60 (`apos recuperar, uma unica falha reabre o circuito imediatamente`).

Considere as duas proposições a seguir.

I. Na transição de `HALF_OPEN` para `CLOSED`, dentro do método `exec`, o código não zera o contador `this.failures`, deixando-o com o valor que provocou a abertura anterior do circuito (3, no teste).

II. Como consequência direta, uma única nova falha após a recuperação faz o contador atingir novamente o `failureThreshold` e reabrir o circuito imediatamente, exatamente como o teste mencionado verifica.

A respeito dessas proposições, assinale a alternativa correta:

A) As duas proposições são verdadeiras e a segunda justifica a primeira.

B) As duas proposições são verdadeiras, mas a segunda não justifica a primeira.

C) A primeira proposição é verdadeira e a segunda é falsa.

D) A primeira proposição é falsa e a segunda é verdadeira.

E) As duas proposições são falsas.


## Questão 16 - Aula 03 - Difícil - Preencher linha

Você foi designado para corrigir o defeito do `CircuitBreaker` descrito na Questão 15. Antes de patchear, **substitua** o teste das linhas 49 a 60 de `tests/breaker.test.js` pelo seguinte (que reflete o comportamento correto):

```
test('Q16 apos recuperar, uma falha unica nao reabre o circuito imediatamente', async () => {
  const { breaker } = build(['fail', 'fail', 'fail', 'ok', 'fail'], {
    failureThreshold: 3,
    resetTimeoutMs: 20
  });
  for (let i = 0; i < 3; i += 1) { try { await breaker.exec('x'); } catch (_) {} }
  await new Promise(r => setTimeout(r, 25));
  await breaker.exec('x');
  expect(breaker.getState()).toBe(STATES.CLOSED);
  expect(breaker.getFailures()).toBe(0);
  await expect(breaker.exec('x')).rejects.toThrow('external_service_failure');
  expect(breaker.getState()).toBe(STATES.CLOSED);
});
```

Em seguida, **adicione uma linha** dentro do bloco `if (this.state === STATES.HALF_OPEN)` em `src/circuit-breaker.js` (entre as linhas 24 e 25), antes do `}`. Rode `npm test --workspace=cases/05-circuit-breaker`. Qual alternativa faz o teste Q16 passar?

A) `this.failures = 0;`

B) `this.openedAt = null;`

C) `this.failureThreshold += 1;`

D) `this.failures += 1;`

E) `this.state = STATES.CLOSED;`


## Questão 17 - Aulas 01 e 02 - Média - Preencher linha

Um parceiro reclama que com limite de "10 requisições por segundo" recebe HTTP 429 já na 11ª requisição de uma rajada. Abra `cases/06-gateway-rate-limit/src/token-bucket.js` e analise o algoritmo. Em seguida, adicione o seguinte teste ao final de `tests/gateway.test.js`, dentro do `describe('TokenBucket', ...)`:

```
test('Q17 rajada inicial de 10 e regime de 10 por segundo', () => {
  const clock = fixedClock();
  const bucket = new TokenBucket(/* COMPLETE A CONFIGURACAO Q17 */);
  let aprovados = 0;
  for (let i = 0; i < 11; i += 1) if (bucket.consume()) aprovados += 1;
  expect(aprovados).toBe(10);
  clock.advance(1000);
  let janela = 0;
  for (let i = 0; i < 12; i += 1) if (bucket.consume()) janela += 1;
  expect(janela).toBe(10);
});
```

Substitua o comentário `/* COMPLETE A CONFIGURACAO Q17 */` por uma das alternativas e rode `npm test --workspace=cases/06-gateway-rate-limit`. Qual alternativa faz o teste passar?

A) `{ capacity: 10, refillPerSecond: 1, clock }`

B) `{ capacity: 1, refillPerSecond: 10, clock }`

C) `{ capacity: 10, refillPerSecond: 10, clock }`

D) `{ capacity: 100, refillPerSecond: 1, clock }`

E) `{ capacity: 10, refillPerSecond: 0.1, clock }`


## Questão 18 - Aulas 01 e 02 - Média - Preencher linha

Em `cases/06-gateway-rate-limit/src/round-robin-balancer.js`, o método `remove(server)` (linhas 21 a 23) filtra a lista mas não ajusta o `cursor`. O teste das linhas 41 a 49 de `tests/gateway.test.js` apenas verifica que `boleto-2` não aparece após remoção, sem checar a ordem exata. Para tornar o comportamento explícito, adicione o seguinte teste ao final de `tests/gateway.test.js` dentro do `describe('RoundRobinBalancer', ...)`:

```
test('Q18 sequencia exata apos cinco picks e remove', () => {
  const balancer = new RoundRobinBalancer(['boleto-1', 'boleto-2', 'boleto-3']);
  for (let i = 0; i < 5; i += 1) balancer.pick();
  balancer.remove('boleto-2');
  expect(balancer.pick()).toBe(/* COMPLETE Q18 */);
});
```

Substitua `/* COMPLETE Q18 */` por uma das alternativas e rode `npm test --workspace=cases/06-gateway-rate-limit`. Qual alternativa faz o teste passar, considerando que o cursor **não é ajustado** dentro de `remove` e que `pick` usa `cursor % servers.length`?

A) `'boleto-1'`

B) `'boleto-2'`

C) `'boleto-3'`

D) `null`

E) `undefined`


## Questão 19 - Aulas 04 e 05 - Fácil - Preencher linha

A auditoria financeira reportou: 12 cobranças não foram estornadas em 30 dias quando a saga falhou no passo de shipping. Abra `cases/07-saga-data/src/order-saga.js` e localize o bloco `if (step.step === 'payment')` no método `compensate` (linhas 28 a 31). Em seguida, abra `src/payment-service.js` e compare os métodos `cancel(orderId)` (linhas 21 a 23) e `refund(chargeId)` (linhas 13 a 19).

Substitua o último teste de `tests/saga.test.js` (linhas 40 a 46) pelo seguinte:

```
test('Q19 quando shipping falha, a cobranca e estornada via refund', async () => {
  const { saga, payment, shipping } = build();
  shipping.failNext(1);
  await saga.run(order);
  expect(payment.refunds).toHaveLength(1);
  expect(payment.charges.size).toBe(0);
});
```

Substitua a linha 30 (`await this.payment.cancel(order.id);`) por uma das alternativas e rode `npm test --workspace=cases/07-saga-data`. Qual alternativa faz o novo teste passar?

A) `await this.payment.cancel(order.id);`

B) `await this.payment.cancel(step.result.chargeId);`

C) `await this.payment.refund(step.result.chargeId);`

D) `await this.payment.refund(order.id);`

E) `await this.payment.refund(step.chargeId);`


## Questão 20 - Aulas 04 e 05 - Difícil - Asserção razão

Aplique a correção da Questão 19 (substituir `cancel` por `refund` na linha 30 do `compensate`) e rode `npm test --workspace=cases/07-saga-data`. Em seguida observe duas chamadas consecutivas de `compensate` para a mesma `order` em um cenário de retry: a segunda chamada não encontra mais o `chargeId` em `payment.charges` (já removido pela primeira), e `refund` retorna `{ ok: false, reason: 'charge_not_found' }`.

Considere as duas proposições a seguir.

I. O defeito observado pela auditoria financeira (12 cobranças não estornadas em 30 dias) é consequência direta de a compensação chamar `payment.cancel(order.id)` em vez de `payment.refund(chargeId)`, ou seja, a saga executa a compensação errada para o passo de pagamento.

II. Para corrigir seguindo o padrão Saga é suficiente trocar `cancel` por `refund` e propagar o `chargeId` do passo de pagamento até o método `compensate`, sem alterações adicionais, pois o método `refund` em `payment-service.js` já é idempotente: chamadas repetidas com o mesmo `chargeId` retornam erro controlado em vez de estornar duas vezes.

A respeito dessas proposições, assinale a alternativa correta:

A) As duas proposições são verdadeiras e a segunda justifica a primeira.

B) As duas proposições são verdadeiras, mas a segunda não justifica a primeira.

C) A primeira proposição é verdadeira e a segunda é falsa.

D) A primeira proposição é falsa e a segunda é verdadeira.

E) As duas proposições são falsas.


## Gabarito

| Q | Alternativa | Tópico |
|---|---|---|
| 01 | B | DIP em CreditCard |
| 02 | A | LSP em PrepaidCreditCard |
| 03 | B | Tratamento de exceção em refundAll |
| 04 | C | Atualização de regra de pré-pago |
| 05 | A | DIP impede injeção de dublê |
| 06 | A | Substituir mock do método sob teste |
| 07 | B | Estado por teste, sem compartilhamento |
| 08 | A | Tempo testável com clock injetado |
| 09 | C | Atualização de regra de valor zero |
| 10 | A | OCP, novo case no switch |
| 11 | C | DIP, repositório injetado com fallback |
| 12 | A | OCP e DIP simultâneos com mapa de estratégias |
| 13 | B | TTL em segundos no setex |
| 14 | A | Cache stampede |
| 15 | A | failures não zera em HALF_OPEN para CLOSED |
| 16 | A | Patch correto do circuit breaker |
| 17 | C | TokenBucket capacity 10, refill 10 por segundo |
| 18 | C | Sequência exata: cursor 5 mod 2 = 1, retorna boleto-3 |
| 19 | C | Saga deve chamar refund com chargeId |
| 20 | A | Defeito e correção alinhados ao padrão Saga |
