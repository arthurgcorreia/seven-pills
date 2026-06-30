import { expect, test } from '../../fixtures/pages';
import { coupons, otcProduct } from '../../data/test-data';
import { applyDiscount, brlDigits } from '../../utils/money';

test.describe('Cupom de desconto', () => {
  test('E2E-COUP-01: PRIMEIRA10 aplica 10% e recalcula o total', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await cartActions.open();
    await cartActions.applyCoupon(coupons.valid);

    const expectedTotal = applyDiscount(otcProduct.price, coupons.validDiscountPercent);
    await expect(cartPage.couponMessage).toContainText('aplicado');
    await expect(cartPage.discount).toContainText(brlDigits(otcProduct.price - expectedTotal));
    await expect(cartPage.total).toContainText(brlDigits(expectedTotal));
  });

  test('E2E-COUP-02: EXPIRADO exibe erro e não aplica desconto', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await cartActions.open();
    await cartActions.applyCoupon(coupons.expired);

    await expect(cartPage.couponMessage).toContainText('expirado');
    await expect(cartPage.discount).toHaveCount(0);
  });

  test('E2E-COUP-03: cupom desconhecido exibe erro e não aplica desconto', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await cartActions.open();
    await cartActions.applyCoupon(coupons.invalid);

    await expect(cartPage.couponMessage).toContainText('inválido');
    await expect(cartPage.discount).toHaveCount(0);
  });

  test('E2E-COUP-04: cupom vazio pede o preenchimento', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await cartActions.open();
    await cartActions.applyCoupon('');

    await expect(cartPage.couponMessage).toContainText('Informe um cupom');
    await expect(cartPage.discount).toHaveCount(0);
  });

  test('E2E-COUP-05: cupom em minúsculas é normalizado e aplicado', async ({
    shopFlow,
    cartActions,
    cartPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await cartActions.open();
    await cartActions.applyCoupon(coupons.validLowercase);

    await expect(cartPage.couponMessage).toContainText('aplicado');
    await expect(cartPage.discount).toBeVisible();
  });

  test('E2E-COUP-06: o desconto aplicado chega ao resumo do checkout', async ({
    shopFlow,
    cartActions,
    checkoutPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await cartActions.open();
    await cartActions.applyCoupon(coupons.valid);
    await cartActions.goToCheckout();

    const expectedTotal = applyDiscount(otcProduct.price, coupons.validDiscountPercent);
    await expect(checkoutPage.summary).toContainText(coupons.valid);
    await expect(checkoutPage.total).toContainText(brlDigits(expectedTotal));
  });
});
