#!/usr/bin/env bash
set -euo pipefail

REPO_PROVA="$HOME/Projects/FIAP/fiap-2026-1-cp2"
REPO_AULAS="$HOME/Projects/FIAP/FIAP-2026-1-3SIZ"

echo "===================================================="
echo "Passo 1 de 2: comitar e enviar fiap-2026-1-cp2"
echo "===================================================="

cd "$REPO_PROVA"
rm -f .git/index.lock .git/objects/*/tmp_obj_* 2>/dev/null || true

# Stage do conteudo essencial. node_modules ja esta no .gitignore.
git reset HEAD -- . >/dev/null 2>&1 || true
git add .gitignore README.md INSTRUCOES.md package.json package-lock.json cases/ docs/

echo "Arquivos a comitar (total $(git diff --cached --name-only | wc -l | tr -d ' ')):"
git diff --cached --name-only | sed 's/^/  /'

git commit -m "Adiciona estrutura completa do mini mundo PagaFacil

- 7 cases com src/ e tests/ cobrindo Aulas 01 a 08 + SOLID
- INSTRUCOES.md com regras da prova
- package.json com workspaces e scripts test:case1..7
- docs/ com material de apoio"

echo "Enviando para origin/main..."
git push origin main
echo "OK fiap-2026-1-cp2 publicado."

echo ""
echo "===================================================="
echo "Passo 2 de 2: comitar e enviar prova v2 em FIAP-2026-1-3SIZ"
echo "===================================================="

cd "$REPO_AULAS"
rm -f .git/index.lock .git/objects/*/tmp_obj_* 2>/dev/null || true
rm -f eda-demo/.git/index.lock 2>/dev/null || true

git reset HEAD -- . >/dev/null 2>&1 || true
git add aulas-2sem/avaliacoes/prova-cp2-enunciados-v2.docx \
        aulas-2sem/avaliacoes/prova-cp2-v2.md \
        aulas-2sem/avaliacoes/prova-cp2-mudancas-repo.md \
        aulas-2sem/avaliacoes/prova-cp2-analise-tempo.md

echo "Arquivos a comitar:"
git diff --cached --name-only | sed 's/^/  /'

git commit -m "Adiciona prova CP2 v2 reformulada para iteracao no repositorio

- prova-cp2-enunciados-v2.docx: 20 questoes em pt-BR acentuado, no
  formato preencher linha, assercao razao e remover linha de teste,
  todas verificaveis com npm test
- prova-cp2-v2.md: fonte markdown
- prova-cp2-mudancas-repo.md: mapeamento por questao das edicoes
  que o aluno faz no repositorio fiap-2026-1-cp2 durante a prova
- prova-cp2-analise-tempo.md: estimativa de dificuldade e tempo
  medio para aluno do 3o ano de SI"

echo "Enviando para origin/main..."
git push origin main
echo "OK FIAP-2026-1-3SIZ publicado."

echo ""
echo "===================================================="
echo "Concluido. Verifique:"
echo "  https://github.com/josercf/fiap-2026-1-cp2"
echo "  https://github.com/josercf/FIAP-2026-1-3SIZ"
echo "===================================================="
