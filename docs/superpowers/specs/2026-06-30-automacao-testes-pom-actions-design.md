# Automação de testes E2E + API com POM + ACTIONS

Data: 2026-06-30

Reestruturação e expansão da automação Playwright do e-commerce de farmácia
(Seven Pills) para uma arquitetura em três camadas (POM + ACTIONS + specs),
com cobertura exaustiva de todos os comportamentos observáveis do sistema.

## Objetivo

Mapear e automatizar todos os casos de teste do sistema (UI e API), substituindo
a suíte atual por uma arquitetura limpa onde Page Objects expõem locators e
interações atômicas, Actions orquestram intenções de negócio, e os specs contêm
apenas as asserções. Código sem comentários e sem travessões em nomes de teste.

## Arquitetura

Três camadas com responsabilidades isoladas:

- **Pages (POM)**: sabem onde estão os elementos. Expõem locators e interações
  atômicas (um clique, um preenchimento, leitura de um texto, navegação direta).
  Não orquestram fluxos, não conhecem regra de negócio, não fazem assert.
- **Actions**: sabem o que fazer. Orquestram um ou mais Page Objects para cumprir
  uma intenção de negócio (adicionar produto ao carrinho, aplicar cupom, preencher
  e enviar checkout, concluir uma compra completa). Não fazem assert.
- **Specs**: sabem o que verificar. Chamam Actions e Pages e concentram todos os
  `expect`.

```
e2e/
  pages/
    BasePage.ts          header global: cartIcon, cartCount, navHome
    CatalogPage.ts
    ProductPage.ts
    CartPage.ts
    CheckoutPage.ts
    ConfirmationPage.ts
  actions/
    CatalogActions.ts
    ProductActions.ts
    CartActions.ts
    CheckoutActions.ts
    ConfirmationActions.ts
    ShopFlowActions.ts     jornadas completas entre telas
    ApiActions.ts          cliente tipado sobre o fixture request
  fixtures/
    pages.ts               injeta pages, actions e apiActions nos testes
  data/
    test-data.ts
    receita.txt
  utils/
    money.ts               parseBRL, brlDigits
  tests/
    e2e/   catalog, product, cart, coupon, checkout, prescription
    api/   products, coupons, orders
```

## Convenções

- TypeScript, Playwright, código limpo, zero comentários no código.
- Nenhum travessão em nomes de teste, descrições ou textos visíveis.
- O seed do backend (`server/seed/products.json`) é a fonte única de massa de
  produtos. Nada de catálogo hardcoded nos testes.
- Nomes de teste em português do Brasil, com identificador rastreável.
- `expect` somente nos specs. Actions e Pages permanecem livres de asserções.
- Pages expõem locators como propriedades públicas para os specs assertarem.

## Mapa de casos

### API: produtos

- API-PROD-01: GET /api/products retorna 200, array com tamanho do seed e todos
  os campos com os tipos esperados.
- API-PROD-02: GET /api/products/:id existente retorna 200 com o produto.
- API-PROD-03: GET /api/products/:id inexistente retorna 404 NOT_FOUND.

### API: cupons

- API-COUP-01: PRIMEIRA10 retorna valid true, code, discountPercent 10.
- API-COUP-02: EXPIRADO retorna valid false, reason EXPIRED.
- API-COUP-03: cupom desconhecido retorna valid false, reason INVALID.

### API: pedidos

- API-ORD-01: pedido válido sem cupom retorna 201 com total igual ao subtotal.
- API-ORD-02: pedido válido com PRIMEIRA10 retorna 201 com total com 10% off.
- API-ORD-03: item controlado com receita anexada retorna 201.
- API-ORD-04: cliente inválido retorna 400 INVALID_CUSTOMER com os campos.
- API-ORD-05: itens vazios retornam 400 INVALID_ITEMS.
- API-ORD-06: productId inexistente retorna 400 INVALID_ITEMS.
- API-ORD-07: item controlado sem receita retorna 422 PRESCRIPTION_REQUIRED.
- API-ORD-08: quantidade acima de maxPerOrder retorna 422 MAX_QUANTITY_EXCEEDED.
- API-ORD-09: quantidade igual a maxPerOrder retorna 201 (limite).
- API-ORD-10: precedência, cliente inválido vence itens inválidos (INVALID_CUSTOMER).
- API-ORD-11: precedência, receita vence quantidade (PRESCRIPTION_REQUIRED).
- API-ORD-12: orderId no formato sequencial ORD seguido de dígitos.

### E2E: catálogo

- E2E-CAT-01: renderiza todos os produtos do seed com nome e preço.
- E2E-CAT-02: produto controlado exibe o badge "Exige receita"; produto livre não.
- E2E-CAT-03: o preço do card confere com o seed e o link abre a página do produto.
- E2E-CAT-04: API de produtos indisponível exibe catalog-error (interceptação de rota).

### E2E: produto

- E2E-PROD-01: exibe nome, preço, categoria e limite por pedido.
- E2E-PROD-02: produto controlado exibe badge e nota de receita.
- E2E-PROD-03: produto livre não exibe badge nem nota.
- E2E-PROD-04: botões mais e menos alteram a quantidade dentro dos limites.
- E2E-PROD-05: decremento no valor mínimo permanece em 1.
- E2E-PROD-06: acima de maxPerOrder trava no máximo e exibe max-quantity-error.
- E2E-PROD-07: adicionar ao carrinho exibe o feedback e incrementa o contador.
- E2E-PROD-08: id inexistente exibe product-not-found.

### E2E: carrinho

- E2E-CART-01: adicionar incrementa o contador e mostra o item.
- E2E-CART-02: alterar quantidade recalcula subtotal e total da linha.
- E2E-CART-03: remover esvazia o carrinho, mostra cart-empty e zera o contador.
- E2E-CART-04: adicionar o mesmo produto duas vezes soma a quantidade.
- E2E-CART-05: a linha mostra preço unitário e total da linha corretos.
- E2E-CART-06: o carrinho persiste após recarregar a página (localStorage).
- E2E-CART-07: a quantidade no carrinho trava em maxPerOrder.

### E2E: cupom

- E2E-COUP-01: PRIMEIRA10 aplica 10%, exibe mensagem de sucesso, desconto e total.
- E2E-COUP-02: EXPIRADO exibe "Cupom expirado." e não aplica desconto.
- E2E-COUP-03: cupom desconhecido exibe "Cupom inválido." e não aplica desconto.
- E2E-COUP-04: cupom vazio exibe "Informe um cupom.".
- E2E-COUP-05: cupom em minúsculas é normalizado para maiúsculas e aplica.
- E2E-COUP-06: o desconto aplicado chega ao resumo do checkout.

### E2E: checkout

- E2E-CHK-01: os três campos inválidos exibem field-error e mantêm em /checkout.
- E2E-CHK-02: cada campo inválido isolado exibe apenas o seu erro.
- E2E-CHK-03: o resumo lista os itens com quantidade e exibe o total.
- E2E-CHK-04: carrinho vazio exibe checkout-empty.
- E2E-CHK-05: fluxo feliz OTC chega à confirmação e zera o contador.
- E2E-CHK-06: a confirmação exibe order-number e order-total.

### E2E: receita (tema)

- E2E-RX-01: item controlado sem anexo exibe prescription-error e desabilita o envio.
- E2E-RX-02: item controlado com anexo limpa o erro, habilita o envio e conclui.

## Ordem de construção

1. Utilidades e dados: `utils/money.ts`, `data/test-data.ts` (expandir massa).
2. Pages: BasePage e as cinco telas, somente locators e interações atômicas.
3. Actions: uma por tela, mais ShopFlowActions e ApiActions.
4. Fixtures: injeção de pages, actions e apiActions.
5. Specs E2E e API consumindo Actions, com todos os asserts.
6. Remover a estrutura antiga substituída.
7. Rodar `npm run test:e2e` e validar verde.

## Fora de escopo

- Testes de carga, acessibilidade e visual regression.
- Mock de pagamento (o backend sempre aprova, por design).
- serverError do checkout (não há caminho determinístico para forçá-lo localmente).
