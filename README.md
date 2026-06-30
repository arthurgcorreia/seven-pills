# 💊 Seven Pills: E-commerce de Farmácia (QA/SDET Portfolio)

[![CI](https://github.com/arthurgcorreia/seven-pills/actions/workflows/ci.yml/badge.svg)](https://github.com/arthurgcorreia/seven-pills/actions/workflows/ci.yml)
![Vitest](https://img.shields.io/badge/Vitest-27%20unit%C3%A1rios-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-56%20E2E%20%2B%20API-2EAD33?logo=playwright&logoColor=white)
![Pirâmide](https://img.shields.io/badge/pir%C3%A2mide-unit%20%2B%20API%20%2B%20E2E-1f6feb)

E-commerce de farmácia que roda **100% local**, construído como projeto de portfólio com foco em
**automação de testes (unit + API + E2E)**. A qualidade da automação importa tanto quanto o sistema:
arquitetura em três camadas **POM + ACTIONS**, pirâmide de testes completa (unitários das regras de
negócio, API e E2E), massa de dados derivada do seed e CI executando tudo a cada push.

## Stack

| Camada    | Tecnologia                                          |
| --------- | --------------------------------------------------- |
| Backend   | Node.js 20 + Express 4 (porta **3001**), sem banco: seed JSON em memória |
| Frontend  | React 18 + Vite + TypeScript + React Router v6 (porta **5173**) |
| Testes    | Playwright (TypeScript) com projetos `e2e` e `api` no mesmo runner |
| CI/CD     | GitHub Actions (`.github/workflows/ci.yml`)          |

Sem autenticação e sem gateway de pagamento: o pagamento é **simulado** e finalizar o pedido
sempre aprova (após as validações de negócio).

## Como rodar localmente

Pré-requisito: Node.js 20+.

```bash
npm install
npm run dev
```

- Frontend: **http://localhost:5173**
- API: **http://localhost:3001** (o Vite faz proxy de `/api` para essa porta)

Os pedidos ficam em memória e somem ao reiniciar o servidor (comportamento esperado).

## Como rodar os testes

```bash
# Primeira vez: instala os navegadores do Playwright
npx playwright install

# Testes unitários das regras de negócio (Vitest)
npm run test:unit

# Roda E2E + API (sobe backend e frontend automaticamente via webServer)
npm run test:e2e

# Tudo: unitários + E2E + API
npm test

# Abre o relatório HTML
npm run report
```

Não é preciso subir a aplicação antes: o `webServer` do Playwright executa `npm run dev`
e aguarda o frontend responder. Localmente, se a aplicação já estiver no ar, ela é reaproveitada.

## Regras de negócio da farmácia (tema)

1. **Receita médica**: produtos com `requiresPrescription: true` (ex.: Amoxicilina, Losartana,
   Rivotril) exibem o badge **"Exige receita"** no catálogo e no detalhe. No checkout, se houver
   item controlado no carrinho, um upload de receita é exigido: sem anexo, o botão de finalizar
   fica bloqueado e a mensagem *"Anexe a receita para os itens controlados"* é exibida. Na API,
   `POST /api/orders` sem `prescriptionAttached: true` retorna **422 `PRESCRIPTION_REQUIRED`**.
2. **Quantidade máxima por pedido**: cada produto tem `maxPerOrder`. A UI impede selecionar
   acima do limite (mensagem *"Quantidade máxima: N"*) e a API retorna
   **422 `MAX_QUANTITY_EXCEEDED`** com o `productId` e o limite.

Cupons: `PRIMEIRA10` aplica 10% de desconto; `EXPIRADO` simula cupom vencido; qualquer outro
código é inválido.

## API

| Método | Rota                      | Respostas                                                |
| ------ | ------------------------- | -------------------------------------------------------- |
| GET    | `/api/products`           | `200` lista do catálogo                                   |
| GET    | `/api/products/:id`       | `200` produto · `404 NOT_FOUND`                           |
| POST   | `/api/coupons/validate`   | `200` `{valid, discountPercent}` ou `{valid:false, reason}` |
| POST   | `/api/orders`             | `201` pedido · `400 INVALID_CUSTOMER/INVALID_ITEMS` · `422 PRESCRIPTION_REQUIRED/MAX_QUANTITY_EXCEEDED` |
| GET    | `/api/orders/:id`         | `200` pedido (sem os dados pessoais do cliente) · `404 NOT_FOUND` |

As validações de negócio vivem em `server/rules.js` e são exercitadas pela suíte de API.

## Cobertura de testes (83 casos)

Pirâmide completa: **27 unitários**, **20 testes de API** e **36 testes E2E**, todos rastreáveis
para a especificação funcional (`docs/SPEC.md`). IDs por área: `CAT` catálogo, `PROD` produto,
`CART` carrinho, `COUP` cupom, `CHK` checkout, `RX` regras de receita, `ORD` pedidos.

### Unitários das regras de negócio (`server/rules.test.js`)

| Função | Cobre |
| ------ | ----- |
| `validateCustomer` | Cliente válido, cada campo inválido, combinações, cliente ausente |
| `validateItems` | Lista vazia, não array, produto inexistente, quantidade zero, negativa ou não inteira |
| `checkPrescription` | Bypass com anexo, bloqueio de controlado, primeiro item bloqueado |
| `checkMaxQuantity` | Dentro do limite, no limite e acima do limite |
| `validateCoupon` | Válido, expirado, desconhecido, sensível a maiúsculas |
| `calculateTotal` | Sem desconto, com desconto arredondado, múltiplos itens |

### E2E de interface (`e2e/tests/e2e/`)

| Área | Casos | Cobre |
| ---- | ----- | ----- |
| Catálogo | `E2E-CAT-01..04` | Render do seed, badge de receita, navegação, erro de API indisponível |
| Produto | `E2E-PROD-01..08` | Dados do produto, badge e nota, botões de quantidade, clamp no limite, feedback, produto inexistente |
| Carrinho | `E2E-CART-01..07` | Adicionar, recalcular, remover, merge, preço e total da linha, persistência em localStorage, clamp |
| Cupom | `E2E-COUP-01..06` | PRIMEIRA10, EXPIRADO, inválido, vazio, normalização para maiúsculas, propagação ao checkout |
| Checkout | `E2E-CHK-01..07` | Erros de campo juntos e isolados, resumo, total, carrinho vazio, fluxo feliz, confirmação resiliente ao reload |
| Receita (tema) | `E2E-RX-01..02` | Bloqueio sem anexo, conclusão com anexo |

### API (`e2e/tests/api/`)

| Área | Casos | Cobre |
| ---- | ----- | ----- |
| Produtos | `API-PROD-01..03` | Catálogo completo com tipos, busca por id, 404 |
| Cupons | `API-COUP-01..03` | Válido, expirado, desconhecido |
| Pedidos | `API-ORD-01..14` | Sucesso com e sem cupom, receita anexada, limites de quantidade, erros 400 e 422, precedência das validações, orderId sequencial, recuperação do pedido por id sem PII |

### Matriz de rastreabilidade (SPEC para testes)

| Requisito (SPEC) | Testes |
| ---------------- | ------ |
| `GET /api/products` | API-PROD-01 |
| `GET /api/products/:id` (200 e 404) | API-PROD-02, API-PROD-03 |
| `POST /api/coupons/validate` | API-COUP-01..03 |
| `POST /api/orders`: cliente inválido | API-ORD-04, API-ORD-10 |
| `POST /api/orders`: itens inválidos | API-ORD-05, API-ORD-06 |
| `POST /api/orders`: receita obrigatória | API-ORD-07, API-ORD-11, E2E-RX-01 |
| `POST /api/orders`: quantidade máxima | API-ORD-08, API-ORD-09, E2E-PROD-06, E2E-CART-07 |
| `POST /api/orders`: sucesso e total | API-ORD-01..03, API-ORD-12, E2E-CHK-05, E2E-CHK-06 |
| `GET /api/orders/:id` (sem PII e 404) | API-ORD-13, API-ORD-14 |
| Confirmação resiliente ao reload | E2E-CHK-07 |
| Catálogo e badge de receita | E2E-CAT-01..04, E2E-PROD-01..03 |
| Carrinho (Context e localStorage) | E2E-CART-01..07 |
| Cupom na interface | E2E-COUP-01..06 |
| Checkout e validação client-side | E2E-CHK-01..04 |
| Upload de receita no checkout | E2E-RX-01, E2E-RX-02 |

## Arquitetura da automação (POM + ACTIONS)

Três camadas com responsabilidades isoladas. Regra de ouro: a **Page** sabe *onde* clicar, a
**Action** sabe *o que* fazer e o **Spec** sabe *o que* verificar.

- **Pages** (`e2e/pages/`): expõem locators e interações atômicas (um clique, um preenchimento,
  leitura de um texto). Sem fluxo e sem asserções.
- **Actions** (`e2e/actions/`): orquestram os Page Objects em intenções de negócio (adicionar ao
  carrinho, aplicar cupom, concluir a compra). `ShopFlowActions` cobre jornadas completas entre
  telas e `ApiActions` é o cliente tipado da API. Sem asserções.
- **Specs** (`e2e/tests/`): chamam Actions e Pages e concentram todos os `expect`.

Apoiam as camadas: **fixtures** (`e2e/fixtures/pages.ts`) que injetam páginas, ações e o cliente
de API; **massa de dados** (`e2e/data/`) derivada do seed do backend, então os testes nunca
dessincronizam do catálogo; e **utilidades** (`e2e/utils/money.ts`) para parsing de valores em BRL.
Todos os elementos interativos expõem **`data-testid`** estáveis, consumidos via `getByTestId`.

## CI/CD

O workflow `.github/workflows/ci.yml` roda em todo push/PR: instala dependências, executa os
unitários (Vitest), instala os navegadores, builda o frontend, roda a suíte E2E + API (o
`webServer` do Playwright sobe a aplicação) e publica o `playwright-report` como artifact,
inclusive quando há falhas.

## Estrutura

```
server/          Express + regras de negócio + seed JSON + unitários (rules.test.js)
web/             React + Vite + TypeScript (rotas: catálogo, produto, carrinho, checkout, confirmação)
web/public/      Fotos reais dos produtos, servidas localmente (sem internet em runtime)
e2e/
  pages/         Page Objects (locators + interações atômicas)
  actions/       Actions de negócio + ShopFlowActions (jornadas) + ApiActions (cliente da API)
  fixtures/      Fixtures do Playwright (injetam pages, actions e apiActions)
  data/          Massa de dados (derivada do seed) + arquivo de receita
  utils/         Utilidades (parsing de valores em BRL)
  tests/e2e/     Specs de interface (catálogo, produto, carrinho, cupom, checkout, receita)
  tests/api/     Specs de API (produtos, cupons, pedidos)
docs/SPEC.md     Especificação funcional que orientou o desenvolvimento e os testes
```
