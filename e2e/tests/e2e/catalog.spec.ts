import { expect, test } from '../../fixtures/pages';
import { otcProduct, prescriptionProduct, seedProducts } from '../../data/test-data';

test.describe('Catálogo', () => {
  test('E2E-01: renderiza todos os produtos do seed', async ({ catalogPage }) => {
    await catalogPage.goto();

    await expect(catalogPage.productCards).toHaveCount(seedProducts.length);
    for (const product of seedProducts) {
      await expect(catalogPage.cardByName(product.name)).toBeVisible();
    }
  });

  test('E2E-02: produto que exige receita exibe o badge "Exige receita"', async ({
    catalogPage,
  }) => {
    await catalogPage.goto();

    const controlledCard = catalogPage.cardByName(prescriptionProduct.name);
    await expect(controlledCard.getByTestId('prescription-badge')).toBeVisible();
    await expect(controlledCard.getByTestId('prescription-badge')).toHaveText('Exige receita');

    const freeCard = catalogPage.cardByName(otcProduct.name);
    await expect(freeCard.getByTestId('prescription-badge')).toHaveCount(0);
  });
});
