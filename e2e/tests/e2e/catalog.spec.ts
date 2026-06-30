import { expect, test } from '../../fixtures/pages';
import { otcProduct, prescriptionProduct, seedProducts } from '../../data/test-data';
import { brlDigits } from '../../utils/money';

test.describe('Catálogo', () => {
  test('E2E-CAT-01: renderiza todos os produtos do seed com nome e preço', async ({
    catalogPage,
  }) => {
    await catalogPage.goto();

    await expect(catalogPage.productCards).toHaveCount(seedProducts.length);
    for (const product of seedProducts) {
      const card = catalogPage.cardByName(product.name);
      await expect(card).toBeVisible();
      await expect(catalogPage.cardPrice(product.name)).toContainText(brlDigits(product.price));
    }
  });

  test('E2E-CAT-02: produto controlado exibe o badge "Exige receita"', async ({ catalogPage }) => {
    await catalogPage.goto();

    await expect(catalogPage.cardBadge(prescriptionProduct.name)).toHaveText('Exige receita');
    await expect(catalogPage.cardBadge(otcProduct.name)).toHaveCount(0);
  });

  test('E2E-CAT-03: o card abre a página do produto correspondente', async ({
    catalogPage,
    productPage,
  }) => {
    await catalogPage.goto();
    await catalogPage.clickProduct(otcProduct.name);

    await expect(catalogPage.page).toHaveURL(new RegExp(`/produto/${otcProduct.id}$`));
    await expect(productPage.name).toHaveText(otcProduct.name);
  });

  test('E2E-CAT-04: API de produtos indisponível exibe a mensagem de erro', async ({
    catalogPage,
  }) => {
    await catalogPage.page.route('**/api/products', (route) => route.abort());
    await catalogPage.goto();

    await expect(catalogPage.error).toBeVisible();
    await expect(catalogPage.productCards).toHaveCount(0);
  });
});
