import { expect, test } from '../../fixtures/pages';
import { coupons, otcProduct } from '../../data/test-data';
import { brlDigits } from '../../pages/money';

test.describe('Cupom de desconto', () => {
  test('E2E-06: cupom PRIMEIRA10 aplica 10% de desconto', async ({
    productPage,
    cartPage,
  }) => {
    await productPage.goto(otcProduct.id);
    await productPage.addToCart();

    await cartPage.goto();
    const subtotal = await cartPage.readSubtotal();
    await cartPage.applyCoupon(coupons.valid);

    await expect(cartPage.couponMessage).toContainText('aplicado');
    await expect(cartPage.discount).toBeVisible();

    // Mesma regra de arredondamento do backend: arredonda apenas o total.
    const expectedTotal =
      Math.round(subtotal * (1 - coupons.validDiscountPercent / 100) * 100) / 100;
    expect(await cartPage.readDiscount()).toBeCloseTo(subtotal - expectedTotal, 2);
    await expect(cartPage.total).toContainText(brlDigits(expectedTotal));
  });

  test('E2E-06: cupom EXPIRADO mostra erro e não aplica desconto', async ({
    productPage,
    cartPage,
  }) => {
    await productPage.goto(otcProduct.id);
    await productPage.addToCart();

    await cartPage.goto();
    await cartPage.applyCoupon(coupons.expired);

    await expect(cartPage.couponMessage).toContainText('expirado');
    await expect(cartPage.discount).toHaveCount(0);
  });
});
