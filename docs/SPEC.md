# Especificação — E-commerce de Farmácia (local, com automação E2E + API + CI/CD)

Especificação funcional que orientou o desenvolvimento e a automação deste projeto.
Os cenários de teste (E2E-01..10, API-01..07) rastreiam diretamente para as seções abaixo.

## 0. Restrições e premissas

- App roda **100% local**: nada de deploy, domínio público ou chamadas externas em runtime.
- **Sem banco de dados.** Produtos vêm de um seed JSON carregado em memória no boot. Pedidos
  ficam em um array em memória (somem ao reiniciar — aceitável).
- **Sem autenticação / sem login.**
- **Pagamento simulado**: não há gateway nem dados de cartão. Finalizar o pedido sempre "aprova".
- **Um comando sobe tudo** (`npm run dev`), **um comando roda os testes** (`npm run test:e2e`).
- Toda a UI interativa expõe atributos **`data-testid`** estáveis.
- Português do Brasil na UI e nas mensagens. Identificadores de código em inglês.

## 1. Stack (fixa)

- Node.js 20+ e npm; repositório único com um `package.json` na raiz.
- Backend: Express 4 (JavaScript), porta **3001**, CORS habilitado.
- Frontend: React 18 + Vite + TypeScript, porta **5173**, React Router v6.
- Testes: Playwright (TypeScript) — E2E e API no mesmo runner.
- CI: GitHub Actions. Utilitário: `concurrently`.

## 2. Backend — API REST (porta 3001)

### `GET /api/products`
`200` com array de produtos (todos os campos do seed).

### `GET /api/products/:id`
`200` com o produto; `404` `{ "error": "NOT_FOUND" }` se não existir.

### `POST /api/coupons/validate`
Body: `{ "code": "PRIMEIRA10" }`.
- `PRIMEIRA10` → `200` `{ "valid": true, "code": "PRIMEIRA10", "discountPercent": 10 }`
- `EXPIRADO` → `200` `{ "valid": false, "reason": "EXPIRED" }`
- qualquer outro → `200` `{ "valid": false, "reason": "INVALID" }`

### `POST /api/orders`
Validação, **na ordem**:
1. `customer.name` vazio, `email` fora do formato ou `cep` sem 8 dígitos →
   `400` `{ "error": "INVALID_CUSTOMER", "fields": ["..."] }`
2. `items` vazio ou `productId` inexistente → `400` `{ "error": "INVALID_ITEMS" }`
3. **Receita:** qualquer item com `requiresPrescription: true` e `prescriptionAttached !== true`
   → `422` `{ "error": "PRESCRIPTION_REQUIRED", "productId": "..." }`
4. **Quantidade máxima:** algum `quantity > product.maxPerOrder` →
   `422` `{ "error": "MAX_QUANTITY_EXCEEDED", "productId": "...", "maxPerOrder": N }`
5. Sucesso → `201` `{ "orderId": "ORD-0001", "status": "confirmed", "total": 44.82 }`
   (total = soma dos itens menos o desconto do cupom, se válido; `orderId` sequencial).

### Seed (`server/seed/products.json`, ~8 produtos)
Campos: `id`, `name`, `price`, `category`, `requiresPrescription`, `maxPerOrder`, `image`.
Mix: ≥3 com receita (Amoxicilina, Losartana, Rivotril), ≥4 sem receita, ≥1 com `maxPerOrder: 2`.

## 3. Frontend — fluxo e `data-testid`

Fluxo: Catálogo → Produto → Carrinho → Checkout → Confirmação. Carrinho via Context
(persistido em `localStorage`).

- **Catálogo (`/`)**: `product-card` (com `product-card-name`, `product-card-price`,
  `prescription-badge` quando aplicável) e link para o produto.
- **Produto (`/produto/:id`)**: `quantity-input`, `add-to-cart-button`, `prescription-badge`;
  quantidade não passa de `maxPerOrder` — ao tentar, `max-quantity-error` com
  "Quantidade máxima: N".
- **Carrinho (`/carrinho`)**: `cart-item`, `cart-item-quantity`, `cart-item-remove`,
  `cart-subtotal`, `coupon-input`, `coupon-apply`, `coupon-message`, `cart-discount`,
  `checkout-button`; header global com `cart-icon` e `cart-count`.
- **Checkout (`/checkout`)**: `checkout-name`, `checkout-email`, `checkout-cep`,
  `field-error-name|email|cep` (validação client-side espelhando o backend);
  com item controlado no carrinho, upload `prescription-upload` — sem arquivo, botão
  bloqueado e `prescription-error` ("Anexe a receita para os itens controlados");
  `checkout-submit` envia `POST /api/orders` e navega para a confirmação.
- **Confirmação (`/confirmacao/:orderId`)**: `order-confirmation` e `order-number`.

## 4. Execução local

`npm install` → `npm run dev` → http://localhost:5173. Testes: `npm run test:e2e`;
relatório: `npm run report`. Vite com `root: 'web'` e proxy `/api` → `http://localhost:3001`.

## 5. Automação (Playwright)

- `playwright.config.ts`: `webServer` com `npm run dev` aguardando `http://localhost:5173`,
  `reuseExistingServer: !CI`, timeout 120s; reporter `html` + `list`; dois projects:
  `e2e` (testDir `e2e/tests/e2e`, baseURL 5173) e `api` (testDir `e2e/tests/api`, baseURL 3001).
- Page Objects em `e2e/pages/`, fixture injetando as páginas em `e2e/fixtures/`,
  massa de dados em `e2e/data/`.

### Cenários E2E
- **E2E-01** Catálogo renderiza todos os produtos do seed.
- **E2E-02** Produto que exige receita exibe o badge "Exige receita".
- **E2E-03** Adicionar ao carrinho incrementa `cart-count` e mostra o item no carrinho.
- **E2E-04** Alterar quantidade recalcula o subtotal.
- **E2E-05** Remover item atualiza o carrinho (e zera o contador quando vazio).
- **E2E-06** `PRIMEIRA10` aplica 10% (mostra `cart-discount`); `EXPIRADO` mostra erro.
- **E2E-07** Nome vazio / e-mail inválido / CEP inválido bloqueiam e exibem `field-error-*`.
- **E2E-08** Fluxo feliz: produto sem receita → confirmação com `order-number` visível.
- **E2E-09** Item com receita no checkout sem anexo → `prescription-error` e botão bloqueado.
- **E2E-10** Mesmo item com receita anexada conclui; quantidade acima de `maxPerOrder`
  exibe `max-quantity-error`.

### Cenários de API
- **API-01** `GET /api/products` → 200, array não vazio, campos esperados.
- **API-02** `GET /api/products/:id` válido → 200; inexistente → 404.
- **API-03** Cupons: `PRIMEIRA10` → `valid:true, discountPercent:10`; `EXPIRADO` → `valid:false`.
- **API-04** Pedido válido → 201 com `orderId` e `total` correto (desconto aplicado).
- **API-05** Cliente inválido → 400 `INVALID_CUSTOMER`.
- **API-06** Item com receita e `prescriptionAttached:false` → 422 `PRESCRIPTION_REQUIRED`.
- **API-07** `quantity` acima de `maxPerOrder` → 422 `MAX_QUANTITY_EXCEEDED`.

## 6. CI/CD

GitHub Actions em push/PR: `npm ci`, `npx playwright install --with-deps`, `npm run build:web`,
`npm run test:e2e` e upload do `playwright-report` como artifact (sempre, mesmo com falha).
