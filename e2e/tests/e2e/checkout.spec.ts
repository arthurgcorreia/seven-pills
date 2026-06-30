import { expect, test } from '../../fixtures/pages';
import { flexibleProduct, invalidCustomer, otcProduct, validCustomer } from '../../data/test-data';
import { brlDigits } from '../../utils/money';

const fields = ['name', 'email', 'cep'] as const;

const singleInvalidCases = [
  { field: 'name', customer: { ...validCustomer, name: '' } },
  { field: 'email', customer: { ...validCustomer, email: 'sem-arroba' } },
  { field: 'cep', customer: { ...validCustomer, cep: '123' } },
] as const;

test.describe('Checkout', () => {
  test('E2E-CHK-01: dados inválidos bloqueiam o envio e exibem os erros de campo', async ({
    shopFlow,
    checkoutActions,
    checkoutPage,
  }) => {
    await shopFlow.addProductToCart(otcProduct.id);
    await checkoutActions.open();
    await checkoutActions.fillCustomerAndSubmit(invalidCustomer);

    await expect(checkoutPage.fieldError('name')).toBeVisible();
    await expect(checkoutPage.fieldError('email')).toBeVisible();
    await expect(checkoutPage.fieldError('cep')).toBeVisible();
    await expect(checkoutPage.page).toHaveURL(/\/checkout/);
  });

  for (const { field, customer } of singleInvalidCases) {
    test(`E2E-CHK-02: apenas ${field} inválido exibe somente o seu erro`, async ({
      shopFlow,
      checkoutActions,
      checkoutPage,
    }) => {
      await shopFlow.addProductToCart(otcProduct.id);
      await checkoutActions.open();
      await checkoutActions.fillCustomerAndSubmit(customer);

      await expect(checkoutPage.fieldError(field)).toBeVisible();
      for (const other of fields.filter((f) => f !== field)) {
        await expect(checkoutPage.fieldError(other)).toHaveCount(0);
      }
    });
  }

  test('E2E-CHK-03: o resumo lista os itens com quantidade e exibe o total', async ({
    shopFlow,
    checkoutActions,
    checkoutPage,
  }) => {
    await shopFlow.addProductToCart(flexibleProduct.id, 2);
    await checkoutActions.open();

    await expect(checkoutPage.summaryItems).toHaveCount(1);
    await expect(checkoutPage.summaryItems.first()).toContainText(`2x ${flexibleProduct.name}`);
    await expect(checkoutPage.total).toContainText(brlDigits(flexibleProduct.price * 2));
  });

  test('E2E-CHK-04: carrinho vazio exibe a mensagem de checkout vazio', async ({
    checkoutActions,
    checkoutPage,
  }) => {
    await checkoutActions.open();

    await expect(checkoutPage.emptyMessage).toBeVisible();
  });

  test('E2E-CHK-05: fluxo feliz OTC chega à confirmação e zera o contador', async ({
    shopFlow,
    confirmationPage,
  }) => {
    await shopFlow.purchaseOtcProduct(otcProduct.id, validCustomer);

    await expect(confirmationPage.confirmation).toBeVisible();
    await expect(confirmationPage.orderNumber).toHaveText(/^ORD-\d{4,}$/);
    await expect(confirmationPage.cartCount).toHaveText('0');
  });

  test('E2E-CHK-06: a confirmação exibe número e total do pedido', async ({
    shopFlow,
    confirmationPage,
  }) => {
    await shopFlow.purchaseOtcProduct(otcProduct.id, validCustomer);

    await expect(confirmationPage.orderNumber).toBeVisible();
    await expect(confirmationPage.orderTotal).toContainText(brlDigits(otcProduct.price));
  });
});
