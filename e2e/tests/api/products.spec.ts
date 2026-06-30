import { expect, test } from '../../fixtures/pages';
import { otcProduct, seedProducts, unknownProductId } from '../../data/test-data';

test.describe('API: produtos', () => {
  test('API-PROD-01: GET /api/products retorna o catálogo completo', async ({ apiActions }) => {
    const response = await apiActions.getProducts();

    expect(response.status()).toBe(200);
    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products).toHaveLength(seedProducts.length);
    for (const product of products) {
      expect(product).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          price: expect.any(Number),
          category: expect.any(String),
          requiresPrescription: expect.any(Boolean),
          maxPerOrder: expect.any(Number),
          image: expect.any(String),
        })
      );
    }
  });

  test('API-PROD-02: GET /api/products/:id retorna o produto quando existe', async ({
    apiActions,
  }) => {
    const response = await apiActions.getProduct(otcProduct.id);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(otcProduct);
  });

  test('API-PROD-03: GET /api/products/:id retorna 404 quando não existe', async ({
    apiActions,
  }) => {
    const response = await apiActions.getProduct(unknownProductId);

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'NOT_FOUND' });
  });
});
