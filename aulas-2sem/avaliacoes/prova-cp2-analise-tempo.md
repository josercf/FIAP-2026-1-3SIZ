# Análise de dificuldade e tempo - Prova CP2 v2

## Distribuição alvo (mantida do original)

6 fáceis, 9 médias, 5 difíceis. Aderente ao critério "Manter atual" escolhido.

## Classificação por questão

| Q | Tópico | Dificuldade | Formato | Tempo estimado (min) |
|---|---|---|---|---|
| 01 | DIP em CreditCard | Fácil | Preencher | 5 |
| 02 | LSP em PrepaidCreditCard | Média | Asserção razão | 6 |
| 03 | Tratamento de exceção em refundAll | Difícil | Preencher | 13 |
| 04 | Atualização de regra de pré-pago | Média | Remover linha | 7 |
| 05 | DIP impede injeção de dublê | Média | Asserção razão | 5 |
| 06 | Mock do método sob teste | Média | Preencher | 7 |
| 07 | Estado compartilhado em testes | Fácil | Preencher | 5 |
| 08 | Tempo testável com clock | Média | Asserção razão | 6 |
| 09 | Atualização de regra de valor zero | Fácil | Remover linha | 4 |
| 10 | OCP, novo case no switch | Média | Preencher | 6 |
| 11 | DIP, repositório injetado | Fácil | Preencher | 5 |
| 12 | OCP e DIP simultâneos | Difícil | Preencher | 14 |
| 13 | TTL em segundos no setex | Média | Preencher | 8 |
| 14 | Cache stampede | Difícil | Asserção razão | 10 |
| 15 | Failures não zera em HALF_OPEN | Média | Asserção razão | 7 |
| 16 | Patch correto do circuit breaker | Difícil | Preencher | 12 |
| 17 | TokenBucket capacity e refill | Média | Preencher | 8 |
| 18 | Sequência exata após remove | Média | Preencher | 6 |
| 19 | Saga deve chamar refund | Fácil | Preencher | 6 |
| 20 | Padrão Saga e idempotência | Difícil | Asserção razão | 11 |

## Soma e tempo total

- Soma das estimativas por questão: 151 minutos (2h31min).
- Setup inicial (clone, npm install, abrir IDE, ler regras): 8 a 12 minutos.
- Trânsito entre Forms e código, leitura cuidadosa, releitura: 10 a 15 minutos.
- Buffer para retrabalho em pelo menos 3 questões erradas: 10 a 15 minutos.
- Total: 180 a 195 minutos, ou seja, entre 3 horas e 3h15.

## Comparação com janela de prova

A janela máxima oficial é 3 horas. A estimativa indica que um aluno regular do 3o ano de SI fica no limite. Cenários:

- Aluno bem preparado e ágil no Jest: termina em 2h30 a 2h45.
- Aluno regular: termina em 3 horas, com risco moderado de não conseguir refazer questões erradas.
- Aluno fraco em SOLID e padrões de resiliência: não termina; deixa em branco 2 a 4 questões.

## Recomendações para calibrar o tempo

Se você quiser mais folga, escolha uma das opções a seguir:

1. **Reduzir Q12 a um preenchimento curto.** Hoje pede substituir a classe inteira. Reescrevendo para pedir apenas a linha do mapa de estratégias e a linha do construtor, o tempo cai de 14 para 8 minutos. Ganha 6 minutos.

2. **Pré-criar o arquivo `tests/prova.test.js` em cada case com os blocos esqueleto.** O aluno copia e cola alternativas em vez de digitar testes inteiros. Ganha 12 a 18 minutos no total.

3. **Eliminar uma das três questões de remoção de linha.** Q4 e Q9 cobrem a mesma habilidade. Mantendo apenas Q9 e convertendo Q4 em uma asserção razão sobre LSP, ganha 4 a 5 minutos.

4. **Aumentar a janela máxima para 3h30.** Mantém a prova como está e dá conforto ao aluno regular.

A combinação 1 + 2 deixa a prova em 2h30 confortáveis, alinhada com a janela oficial.

## Observação sobre o fator npm test

Cada execução de `npm test --workspace=cases/<n>` leva 0,5 a 2 segundos depois do primeiro start do Jest, mais 1 a 2 segundos de startup. O case 04 tem um teste que dorme 1,2 segundos. Isso afeta levemente a estimativa, mas não muda a ordem de grandeza.

## Pontos de atenção pedagógica

- Q3 e Q12 são as mais densas. Vale revisar com a turma um exercício similar antes da prova.
- Q14 e Q20 exigem vocabulário (cache stampede, idempotência). Garanta que esses termos estejam claros nas aulas anteriores.
- O critério (a) da prova depende muito de o aluno saber rodar `npm test --workspace`. Um aquecimento de 10 minutos no início do dia, antes da prova começar, evita que dúvidas operacionais consumam tempo de raciocínio.
