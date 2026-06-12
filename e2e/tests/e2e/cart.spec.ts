import { expect, test } from '../../fixtures/pages';
import { flexibleProduct, otcProduct } from '../../data/test-data';
import { brlDigits } from '../../pages/money';

test.describe('Carrinho', () => {
  test('E2E-03: adicionar ao carrinho incrementa o contador e mostra o item', async ({
    productPage,
    cartPage,
  }) => {
    await productPage.goto(otcProduct.id);
    await productPage.addToCart();

    await expect(productPage.cartCount).toHaveText('1');

    await productPage.openCart();
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.itemByName(otcProduct.name)).toBeVisible();
  });

  test('E2E-04: alterar a quantidade recalcula o subtotal', async ({
    productPage,
    cartPage,
  }) => {
    await productPage.goto(flexibleProduct.id);
    await productPage.addToCart();

    await cartPage.goto();
    await cartPage.setItemQuantity(flexibleProduct.name, 3);

    await expect(cartPage.cartCount).toHaveText('3');
    await expect(cartPage.subtotal).toContainText(brlDigits(flexibleProduct.price * 3));
    expect(await cartPage.readSubtotal()).toBeCloseTo(flexibleProduct.price * 3, 2);
  });

  test('E2E-05: remover item atualiza o carrinho e zera o contador', async ({
    productPage,
    cartPage,
  }) => {
    await productPage.goto(otcProduct.id);
    await productPage.addToCart();

    await cartPage.goto();
    await cartPage.removeItem(otcProduct.name);

    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.cartCount).toHaveText('0');
  });
});
