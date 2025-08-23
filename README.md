# Loca+ (loca-mais)

API para gerenciamento de aluguel de imóveis.

> ⚠️ **Aviso:** Esta API está em desenvolvimento e ainda será finalizada. Funcionalidades, endpoints e estrutura podem sofrer alterações até a versão estável.

## Descrição

O projeto **Loca+** é uma API desenvolvida em Node.js com TypeScript, seguindo princípios de Domain-Driven Design (DDD). O objetivo é fornecer uma base robusta para operações de cadastro, autenticação e gerenciamento de usuários e imóveis para locação.

## Tecnologias Utilizadas

- **Node.js** — Ambiente de execução JavaScript.
- **TypeScript** — Tipagem estática para maior segurança e produtividade.
- **Jest** — Testes unitários.
- **ESLint & Prettier** — Padronização e formatação de código.
- **uuid** — Geração de identificadores únicos.
- **GitHub Actions** — Integração contínua (CI).
- **Codecov** — Análise de cobertura de testes.

## Estrutura do Código

O projeto está organizado da seguinte forma:

```
src/
  application/
    user/
      useCase/
        factory/
  core/
    domain/
      user/
        entity/
        objectValue/
        gateway/
    generics/
  shared/
    errors/
      custom/
    utils/
  tests/
    units/
      Entity/
      generics/
      objectValue/
      useCase/
```

- **application/**: Casos de uso e lógica de aplicação.
- **core/domain/**: Entidades, objetos de valor e gateways do domínio.
- **core/generics/**: Classes genéricas reutilizáveis (ex: Entity, Identity).
- **shared/errors/**: Tratamento de erros customizados.
- **shared/utils/**: Utilitários e helpers.
- **tests/units/**: Testes unitários organizados por domínio e funcionalidade.

## Scripts Disponíveis

- `npm run build` — Compila o projeto TypeScript.
- `npm run test` — Executa os testes unitários.
- `npm run test:coverage` — Executa testes e gera relatório de cobertura.
- `npm run lint` — Analisa o código com ESLint.
- `npm run lint:fix` — Corrige problemas de lint automaticamente.
- `npm run format` — Formata o código com Prettier.

## Como Executar

1. Instale as dependências:
   ```sh
   npm install
   ```

2. Execute os testes:
   ```sh
   npm test
   ```

3. Compile o projeto:
   ```sh
   npm run build
   ```

## Cobertura de Testes

A cobertura de testes é gerada na pasta `/coverage` e pode ser visualizada em formato HTML.

## CI/CD

A pipeline de integração contínua está configurada em [`.github/workflows/ci.yml`](.github/workflows/ci.yml), rodando testes e enviando cobertura para o Codecov a cada push ou pull request na branch `main`.

## Contribuição

Como o projeto está em desenvolvimento, contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Autor:** [Ewerton Hecsley](https://github.com/EwertonHecsley)
