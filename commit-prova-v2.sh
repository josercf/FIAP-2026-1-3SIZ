#!/usr/bin/env bash
set -euo pipefail

REPO="$HOME/Projects/FIAP/FIAP-2026-1-3SIZ"

cd "$REPO"

# Limpa locks remanescentes do git
rm -f .git/index.lock .git/objects/*/tmp_obj_* 2>/dev/null || true
rm -f eda-demo/.git/index.lock 2>/dev/null || true

# Garante que apenas os 4 arquivos da prova v2 vao no commit
git reset HEAD -- . >/dev/null
git add aulas-2sem/avaliacoes/prova-cp2-enunciados-v2.docx \
        aulas-2sem/avaliacoes/prova-cp2-v2.md \
        aulas-2sem/avaliacoes/prova-cp2-mudancas-repo.md \
        aulas-2sem/avaliacoes/prova-cp2-analise-tempo.md

echo "==> Arquivos a comitar:"
git diff --cached --name-only

git commit -m "Adiciona prova CP2 v2 reformulada para iteracao no repositorio

- prova-cp2-enunciados-v2.docx: 20 questoes reformuladas em pt-BR
  acentuado, no formato preencher linha, assercao razao e remover
  linha de teste, todas verificaveis com npm test
- prova-cp2-v2.md: fonte markdown da prova
- prova-cp2-mudancas-repo.md: mapeamento por questao das edicoes
  que o aluno faz no repositorio fiap-2026-1-cp2 durante a prova
- prova-cp2-analise-tempo.md: estimativa de dificuldade e tempo
  medio para aluno do 3o ano de SI"

echo "==> Enviando para origin/main..."
git push origin main

echo "OK"
