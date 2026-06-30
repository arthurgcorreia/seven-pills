import { expect, test } from '../../fixtures/pages';
import { prescriptionFilePath, prescriptionProduct, validCustomer } from '../../data/test-data';

test.describe('Regras da farmácia (tema)', () => {
  test('E2E-RX-01: item controlado sem anexo bloqueia o envio', async ({
    shopFlow,
    checkoutActions,
    checkoutPage,
  }) => {
    await shopFlow.addProductToCart(prescriptionProduct.id);
    await checkoutActions.open();
    await checkoutActions.fillCustomer(validCustomer);

    await expect(checkoutPage.prescriptionError).toHaveText(
      'Anexe a receita para os itens controlados'
    );
    await expect(checkoutPage.submitButton).toBeDisabled();
  });

  test('E2E-RX-02: com a receita anexada o pedido conclui', async ({
    shopFlow,
    checkoutActions,
    checkoutPage,
    confirmationPage,
  }) => {
    await shopFlow.addProductToCart(prescriptionProduct.id);
    await checkoutActions.open();
    await checkoutActions.attachPrescription(prescriptionFilePath);
    await expect(checkoutPage.prescriptionError).toHaveCount(0);

    await checkoutActions.fillCustomer(validCustomer);
    await expect(checkoutPage.submitButton).toBeEnabled();
    await checkoutActions.submit();

    await expect(confirmationPage.confirmation).toBeVisible();
    await expect(confirmationPage.orderNumber).toHaveText(/^ORD-\d{4,}$/);
  });
});
