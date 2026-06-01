#!/bin/sh
# pre-push.sh
# Hook de pre-push versionado. Chamado por .git/hooks/pre-push antes de qualquer push.
# Roda verificação de tipos e testes. Push é cancelado se algum falhar.

echo "Verificando tipos..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "Erros de tipo encontrados. Push cancelado."
  exit 1
fi

echo "Tipos OK. Executando testes..."
npx jest --passWithNoTests --silent
if [ $? -ne 0 ]; then
  echo "Testes falharam. Push cancelado."
  exit 1
fi

echo "Tudo certo."
exit 0
