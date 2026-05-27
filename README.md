# todo-tests

Testes E2E do [todo-webapp](https://github.com/jacquesschmitz2/todo-webapp2) escritos com [Playwright](https://playwright.dev/).

## Pré-requisitos

- Node.js 20+
- Clone do [todo-webapp](https://github.com/jacquesschmitz2/todo-webapp2) na pasta irmã `../todo-webapp` (apenas para rodar localmente)

## Instalação

```bash
npm install
npx playwright install chromium
```

## Rodando os testes

### Localmente (sobe o Vite automaticamente)

```bash
npm test
```

O `playwright.config.js` detecta que `CI` não está definido e inicia o servidor Vite em `../todo-webapp` antes dos testes.

### Apontando para uma URL específica

```bash
BASE_URL=http://localhost:4173 npm test
```

### Em CI

O workflow `.github/workflows/ci.yml` define `CI=true`, `WEBAPP_DIR=./todo-webapp` e `BASE_URL=http://localhost:5173`. O Playwright clona a webapp e inicia o servidor automaticamente.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `BASE_URL` | `http://localhost:5173` | URL base da aplicação |
| `WEBAPP_DIR` | `../application` (local) | Caminho para o código-fonte da webapp, usado pelo webServer |
| `CI` | — | Quando definido, desabilita `reuseExistingServer` e ativa 1 retry |

## Estrutura

```
tests/
  todo.spec.js          # suite principal
  pages/
    TodoPage.js         # Page Object Model da aplicação
playwright.config.js
.github/
  workflows/
    ci.yml              # roda os testes no GitHub Actions
```


