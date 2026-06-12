# 💊 Seven Pills: E-commerce de Farmácia (QA/SDET Portfolio)

E-commerce de farmácia que roda **100% local**, construído como projeto de portfólio com foco em
**automação de testes (E2E + API)**. A qualidade da automação importa tanto quanto o sistema:
Page Objects, fixtures, massa de dados derivada do seed e CI publicando o relatório do Playwright.

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

# Roda E2E + API (sobe backend e frontend automaticamente via webServer)
npm run test:e2e

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

As validações de negócio vivem em `server/rules.js` e são exercitadas pela suíte de API.

## Cenários de teste cobertos

### E2E (`e2e/tests/e2e/`)

| ID     | Cenário |
| ------ | ------- |
| E2E-01 | Catálogo renderiza todos os produtos do seed |
| E2E-02 | Produto que exige receita exibe o badge "Exige receita" |
| E2E-03 | Adicionar ao carrinho incrementa o contador e mostra o item |
| E2E-04 | Alterar quantidade recalcula o subtotal |
| E2E-05 | Remover item atualiza o carrinho e zera o contador |
| E2E-06 | Cupom `PRIMEIRA10` aplica 10%; `EXPIRADO` mostra erro |
| E2E-07 | Checkout com nome/e-mail/CEP inválidos bloqueia e exibe erros de campo |
| E2E-08 | Fluxo feliz: item sem receita do catálogo à confirmação com número do pedido |
| E2E-09 | Item controlado sem receita anexada bloqueia a finalização (tema) |
| E2E-10 | Item controlado com receita anexada conclui; quantidade acima de `maxPerOrder` exibe erro (tema) |

### API (`e2e/tests/api/`)

| ID     | Cenário |
| ------ | ------- |
| API-01 | `GET /api/products` retorna 200 com todos os campos esperados |
| API-02 | `GET /api/products/:id` retorna 200 quando existe e 404 quando não |
| API-03 | Validação de cupons: `PRIMEIRA10` válido, `EXPIRADO` inválido |
| API-04 | Pedido válido retorna 201 com `orderId` e total com desconto |
| API-05 | Cliente inválido retorna 400 `INVALID_CUSTOMER` (e itens inválidos, 400 `INVALID_ITEMS`) |
| API-06 | Item controlado sem receita retorna 422 `PRESCRIPTION_REQUIRED` (tema) |
| API-07 | Quantidade acima de `maxPerOrder` retorna 422 `MAX_QUANTITY_EXCEEDED` (tema) |

## Arquitetura da automação

- **Page Objects** em `e2e/pages/` (Catalog, Product, Cart, Checkout, Confirmation + BasePage
  com os elementos globais do header).
- **Fixtures** em `e2e/fixtures/pages.ts` injetam os Page Objects nos testes.
- **Massa de dados** em `e2e/data/`: o seed do backend é importado diretamente, então os testes
  nunca dessincronizam do catálogo; inclui clientes válidos/inválidos, cupons e o arquivo de
  receita usado no upload.
- Todos os elementos interativos da UI expõem **`data-testid`** estáveis; os testes usam
  `getByTestId`.

## CI/CD

O workflow `.github/workflows/ci.yml` roda em todo push/PR: instala dependências e navegadores,
builda o frontend, executa a suíte completa (o `webServer` do Playwright sobe a aplicação) e
publica o `playwright-report` como artifact, inclusive quando há falhas.

## Estrutura

```
server/          Express + regras de negócio + seed JSON
web/             React + Vite + TypeScript (rotas: catálogo, produto, carrinho, checkout, confirmação)
web/public/      Fotos reais dos produtos, servidas localmente (sem internet em runtime)
e2e/
  pages/         Page Objects
  fixtures/      Fixtures do Playwright
  data/          Massa de dados (derivada do seed) + arquivo de receita
  tests/e2e/     Specs de interface (E2E-01..10)
  tests/api/     Specs de API (API-01..07)
docs/SPEC.md     Especificação funcional que orientou o desenvolvimento e os testes
```
