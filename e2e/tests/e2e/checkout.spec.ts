import { expect, test } from '../../fixtures/pages';
import { invalidCustomer, otcProduct, validCustomer } from '../../data/test-data';

test.describe('Checkout', () => {
  test('E2E-07: dados inválidos bloqueiam o envio e exibem os erros de campo', async ({
    productPage,
    checkoutPage,
  }) => {
    await productPage.goto(otcProduct.id);
    await productPage.addToCart();

    await checkoutPage.goto();
    await checkoutPage.fillCustomer(invalidCustomer);
    await checkoutPage.submit();

    await expect(checkoutPage.fieldError('name')).toBeVisible();
    await expect(checkoutPage.fieldError('email')).toBeVisible();
    await expect(checkoutPage.fieldError('cep')).toBeVisible();
    await expect(checkoutPage.page).toHaveURL(/\/checkout/);
  });

  test('E2E-08: fluxo feliz — item sem receita do catálogo à confirmação', async ({
    catalogPage,
    productPage,
    cartPage,
    checkoutPage,
    confirmationPage,
  }) => {
    await catalogPage.goto();
    await catalogPage.openProduct(otcProduct.name);

    await productPage.addToCart();
    await productPage.openCart();

    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomer(validCustomer);
    await checkoutPage.submit();

    await expect(confirmationPage.confirmation).toBeVisible();
    await expect(confirmationPage.orderNumber).toHaveText(/^ORD-\d{4,}$/);
    await expect(confirmationPage.cartCount).toHaveText('0');
  });
});
