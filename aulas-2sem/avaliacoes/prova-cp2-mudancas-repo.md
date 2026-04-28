# Mudanças necessárias no repositório fiap-2026-1-cp2

A prova v2 foi desenhada para ser respondida **iterativamente**: o aluno aplica uma alteração específica, roda `npm test --workspace=cases/<n>` e marca a alternativa que faz o teste passar. Para isso funcionar como descrito, o repositório atual já está adequado. Não há mudanças obrigatórias antes da prova.

O que cada questão pede ao aluno fazer no repo durante a prova está abaixo. Use isto para validar o gabarito você mesmo antes de aplicar a prova.

## Questão 01 - case 01

Edição: linha 12 e linha 21 de `src/credit-card.js`. Acréscimo: novo teste no final do `describe('StandardCreditCard')` em `tests/credit-card.test.js`. Resultado esperado com a alternativa B: 11 testes passam.

## Questão 02 - case 01

Edição: descomentar linhas 64 a 68 de `tests/credit-card.test.js`. Resultado esperado: o teste descomentado falha porque `PrepaidCreditCard.refund` lança exceção. Isso confirma a violação de LSP.

## Questão 03 - case 01

Acréscimo: novo teste no final de `tests/credit-card.test.js`. Edição: corpo do laço `for` em `src/transaction.js refundAll`. Resultado esperado com a alternativa B: 11 testes passam, incluindo o novo Q03.

## Questão 04 - case 01

Edição: substituir o método `refund` de `PrepaidCreditCard` em `src/cards.js` linhas 27 a 29. Substituir o bloco comentado de `tests/credit-card.test.js` linhas 64 a 68 pelo teste fornecido no enunciado. Resultado esperado removendo a alternativa C: a suíte volta a passar. Removendo qualquer outra linha, a suíte continua quebrada.

## Questão 05 - case 01

Sem edição obrigatória. Asserção razão sobre as linhas 21 e 22 de `src/credit-card.js`.

## Questão 06 - case 02

Edição: linha 14 de `tests/fraud-detector.test.js`. Resultado esperado com a alternativa B (linha removida): T1 passa exercitando a lógica real de `evaluate`.

## Questão 07 - case 02

Edição: remover linhas 6 e 7 de `tests/fraud-detector.test.js` e substituir o corpo do teste T2. Resultado esperado com a alternativa B: T2 passa de forma determinística.

## Questão 08 - case 02

Sem edição obrigatória. Asserção razão sobre os testes T4 e T6 de `tests/fraud-detector.test.js`.

## Questão 09 - case 02

Edição: linha 25 de `src/fraud-detector.js` (mudar `<` para `<=`). Remoção: linha do `expect(result.decision).toBe('approve')` em T5. Resultado esperado com a alternativa C: T5 passa sem assertions.

## Questão 10 - case 03

Acréscimo: novo `case 'diamond'` no `switch` de `src/discount-calculator.js`, e novo teste no final de `tests/discount.test.js`. Resultado esperado com a alternativa A: 3 testes passam.

## Questão 11 - case 03

Edição: linhas 12 e 13 de `src/discount-calculator.js` para receber `repo` por construtor. Acréscimo: novo teste em `tests/discount.test.js`. Resultado esperado com a alternativa C: 4 testes passam (originais mais Q10 e Q11).

## Questão 12 - case 03

Edição completa: substituir o corpo da classe `DiscountCalculator` em `src/discount-calculator.js`. Resultado esperado com a alternativa A: 4 testes passam (assumindo Q10 e Q11 já adicionados).

## Questão 13 - case 04

Edição: linha 25 de `src/product-cache.js`. Substituição do último teste de `tests/cache.test.js` linhas 41 a 47 pelo teste fornecido no enunciado. Resultado esperado com a alternativa B: 5 testes passam, incluindo o novo Q13.

## Questão 14 - case 04

Sem edição obrigatória. Asserção razão sobre o teste de concorrência em `tests/cache.test.js`.

## Questão 15 - case 05

Sem edição obrigatória. Asserção razão sobre as linhas 23 a 26 de `src/circuit-breaker.js`. Recomenda-se rodar `npm test --workspace=cases/05-circuit-breaker` e ler a saída do quarto teste.

## Questão 16 - case 05

Substituição: teste das linhas 49 a 60 de `tests/breaker.test.js` pelo teste fornecido. Acréscimo: uma linha dentro do bloco `if (this.state === STATES.HALF_OPEN)` em `src/circuit-breaker.js`. Resultado esperado com a alternativa A: 4 testes passam.

## Questão 17 - case 06

Acréscimo: novo teste em `tests/gateway.test.js` dentro do `describe('TokenBucket')`. Resultado esperado com a alternativa C (`{ capacity: 10, refillPerSecond: 10, clock }`): 4 testes passam.

## Questão 18 - case 06

Acréscimo: novo teste em `tests/gateway.test.js` dentro do `describe('RoundRobinBalancer')`. Resultado esperado com a alternativa C (`'boleto-3'`): 6 testes passam, incluindo o Q18.

## Questão 19 - case 07

Substituição: último teste de `tests/saga.test.js` (linhas 40 a 46) pelo teste fornecido. Edição: linha 30 de `src/order-saga.js`. Resultado esperado com a alternativa C: 3 testes passam.

## Questão 20 - case 07

Sem edição obrigatória, mas a leitura é mais clara após aplicar a correção da Q19. Asserção razão sobre o padrão Saga e idempotência de `refund`.


# Recomendações antes da prova

1. Faça uma cópia limpa do repositório para entregar aos alunos com `npm install` já feito (para evitar gargalo de rede no início).
2. Valide o gabarito você mesmo aplicando cada alternativa correta e rodando `npm test --workspace=cases/<n>`. Tempo total estimado para validação completa: 40 a 60 minutos.
3. Considere bloquear o acesso ao histórico do git no clone entregue (deletar `.git`), pois o aluno pode ler commits anteriores e descobrir respostas.
4. O case 04 tem um teste que dorme 1,2 segundos (`await new Promise(r => setTimeout(r, 1200))`). Isso adiciona latência ao `npm test`. Avise os alunos.

# Sugestão opcional

Para reduzir digitação durante a prova, você pode pré-criar um arquivo `tests/prova.test.js` em cada case com os blocos `test('Q0X ...', () => { /* completar */ })` já estruturados, pedindo ao aluno apenas para preencher trechos. Isso reduz o tempo total de prova em 15 a 20 minutos. Se quiser que eu prepare esses arquivos, me avise.
