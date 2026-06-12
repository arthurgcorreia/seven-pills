import { expect, test } from '../../fixtures/pages';
import {
  limitedProduct,
  prescriptionFilePath,
  prescriptionProduct,
  validCustomer,
} from '../../data/test-data';

test.describe('Regras da farmácia (tema)', () => {
  test('E2E-09: item com receita bloqueia o checkout sem anexo', async ({
    productPage,
    checkoutPage,
  }) => {
    await productPage.goto(prescriptionProduct.id);
    await productPage.addToCart();

    await checkoutPage.goto();
    await checkoutPage.fillCustomer(validCustomer);

    await expect(checkoutPage.prescriptionError).toBeVisible();
    await expect(checkoutPage.prescriptionError).toHaveText(
      'Anexe a receita para os itens controlados'
    );
    await expect(checkoutPage.submitButton).toBeDisabled();
  });

  test('E2E-10: com a receita anexada o pedido conclui com sucesso', async ({
    productPage,
    checkoutPage,
    confirmationPage,
  }) => {
    await productPage.goto(prescriptionProduct.id);
    await productPage.addToCart();

    await checkoutPage.goto();
    await checkoutPage.attachPrescription(prescriptionFilePath);
    await expect(checkoutPage.prescriptionError).toHaveCount(0);

    await checkoutPage.fillCustomer(validCustomer);
    await expect(checkoutPage.submitButton).toBeEnabled();
    await checkoutPage.submit();

    await expect(confirmationPage.confirmation).toBeVisible();
    await expect(confirmationPage.orderNumber).toHaveText(/^ORD-\d{4,}$/);
  });

  test('E2E-10: quantidade acima de maxPerOrder exibe erro na página do produto', async ({
    productPage,
  }) => {
    await productPage.goto(limitedProduct.id);
    await productPage.setQuantity(limitedProduct.maxPerOrder + 1);

    await expect(productPage.maxQuantityError).toBeVisible();
    await expect(productPage.maxQuantityError).toHaveText(
      `Quantidade máxima: ${limitedProduct.maxPerOrder}`
    );
    await expect(productPage.quantityInput).toHaveValue(String(limitedProduct.maxPerOrder));
  });
});
