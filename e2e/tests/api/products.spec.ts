import { expect, test } from '@playwright/test';
import { otcProduct, seedProducts } from '../../data/test-data';

test.describe('API: produtos', () => {
  test('API-01: GET /api/products retorna o catálogo completo', async ({ request }) => {
    const response = await request.get('/api/products');

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

  test('API-02: GET /api/products/:id retorna o produto quando existe', async ({ request }) => {
    const response = await request.get(`/api/products/${otcProduct.id}`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(otcProduct);
  });

  test('API-02: GET /api/products/:id retorna 404 quando não existe', async ({ request }) => {
    const response = await request.get('/api/products/med-999');

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'NOT_FOUND' });
  });
});
