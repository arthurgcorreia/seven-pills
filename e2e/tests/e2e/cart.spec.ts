import { expect, test } from '../../fixtures/pages';
import { flexibleProduct, limitedProduct, otcProduct } from '../../data/test-data';
import { brlDigits } from '../../utils/money';

test.describe('Carrinho', () => {
  test('E2E-CART-01: adicionar incrementa o contador e mostra o item', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await expect(cartPage.cartCount).toHaveText('1');

    await cartActions.open();
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.itemByName(otcProduct.name)).toBeVisible();
  });

  test('E2E-CART-02: alterar a quantidade recalcula subtotal e total da linha', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(flexibleProduct.id);
    await cartActions.open();
    await cartActions.setItemQuantity(flexibleProduct.name, 3);

    await expect(cartPage.cartCount).toHaveText('3');
    await expect(cartPage.subtotal).toContainText(brlDigits(flexibleProduct.price * 3));
    await expect(cartPage.itemTotal(flexibleProduct.name)).toContainText(
      brlDigits(flexibleProduct.price * 3)
    );
  });

  test('E2E-CART-03: remover esvazia o carrinho e zera o contador', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await cartActions.open();
    await cartActions.removeItem(otcProduct.name);

    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.backToCatalog).toBeVisible();
    await expect(cartPage.cartCount).toHaveText('0');
  });

  test('E2E-CART-04: adicionar o mesmo produto duas vezes soma a quantidade', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await shopFlow.addProductToCart(otcProduct.id);

    await cartActions.open();
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.itemQuantity(otcProduct.name)).toHaveValue('2');
    await expect(cartPage.cartCount).toHaveText('2');
  });

  test('E2E-CART-05: a linha mostra preço unitário e total da linha', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await cartActions.open();

    await expect(cartPage.itemUnitPrice(otcProduct.name)).toContainText(brlDigits(otcProduct.price));
    await expect(cartPage.itemTotal(otcProduct.name)).toContainText(brlDigits(otcProduct.price));
  });

  test('E2E-CART-06: o carrinho persiste após recarregar a página', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await cartActions.open();
    await cartPage.reload();

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.itemByName(otcProduct.name)).toBeVisible();
    await expect(cartPage.cartCount).toHaveText('1');
  });

  test('E2E-CART-07: a quantidade no carrinho trava em maxPerOrder', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(limitedProduct.id);
    await cartActions.open();
    await cartActions.setItemQuantity(limitedProduct.name, limitedProduct.maxPerOrder + 5);

    await expect(cartPage.itemQuantity(limitedProduct.name)).toHaveValue(
      String(limitedProduct.maxPerOrder)
    );
  });
});
