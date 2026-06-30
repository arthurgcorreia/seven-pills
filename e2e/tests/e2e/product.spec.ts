import { expect, test } from '../../fixtures/pages';
import {
  limitedProduct,
  otcProduct,
  prescriptionProduct,
  unknownProductId,
} from '../../data/test-data';
import { brlDigits } from '../../utils/money';

test.describe('Página do produto', () => {
  test('E2E-PROD-01: exibe nome, preço, categoria e limite por pedido', async ({
    productActions,
    productPage,
  }) => {
    await productActions.open(otcProduct.id);

    await expect(productPage.name).toHaveText(otcProduct.name);
    await expect(productPage.price).toContainText(brlDigits(otcProduct.price));
    await expect(productPage.category).toHaveText(otcProduct.category);
    await expect(productPage.maxPerOrderInfo).toContainText(String(otcProduct.maxPerOrder));
  });

  test('E2E-PROD-02: produto controlado exibe badge e nota de receita', async ({
    productActions,
    productPage,
  }) => {
    await productActions.open(prescriptionProduct.id);

    await expect(productPage.prescriptionBadge).toHaveText('Exige receita');
    await expect(productPage.prescriptionNote).toBeVisible();
  });

  test('E2E-PROD-03: produto livre não exibe badge nem nota', async ({
    productActions,
    productPage,
  }) => {
    await productActions.open(otcProduct.id);

    await expect(productPage.prescriptionBadge).toHaveCount(0);
    await expect(productPage.prescriptionNote).toHaveCount(0);
  });

  test('E2E-PROD-04: os botões mais e menos alteram a quantidade dentro dos limites', async ({
    productActions,
    productPage,
  }) => {
    await productActions.open(otcProduct.id);

    await productActions.increaseQuantity(2);
    await expect(productPage.quantityInput).toHaveValue('3');

    await productActions.decreaseQuantity();
    await expect(productPage.quantityInput).toHaveValue('2');
  });

  test('E2E-PROD-05: decremento no valor mínimo permanece em 1', async ({
    productActions,
    productPage,
  }) => {
    await productActions.open(otcProduct.id);

    await productActions.decreaseQuantity();
    await expect(productPage.quantityInput).toHaveValue('1');
  });

  test('E2E-PROD-06: acima de maxPerOrder trava no máximo e exibe o erro', async ({
    productActions,
    productPage,
  }) => {
    await productActions.open(limitedProduct.id);
    await productActions.setQuantity(limitedProduct.maxPerOrder + 1);

    await expect(productPage.maxQuantityError).toHaveText(
      `Quantidade máxima: ${limitedProduct.maxPerOrder}`
    );
    await expect(productPage.quantityInput).toHaveValue(String(limitedProduct.maxPerOrder));
  });

  test('E2E-PROD-07: adicionar ao carrinho exibe o feedback e incrementa o contador', async ({
    productActions,
    productPage,
  }) => {
    await productActions.open(otcProduct.id);
    await productActions.addToCart();

    await expect(productPage.addToCartFeedback).toBeVisible();
    await expect(productPage.cartCount).toHaveText('1');
  });

  test('E2E-PROD-08: id inexistente exibe produto não encontrado', async ({
    productActions,
    productPage,
  }) => {
    await productActions.open(unknownProductId);

    await expect(productPage.notFound).toBeVisible();
  });
});
