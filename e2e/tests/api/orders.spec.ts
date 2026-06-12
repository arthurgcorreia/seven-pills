import { expect, test } from '@playwright/test';
import {
  coupons,
  limitedProduct,
  otcProduct,
  prescriptionProduct,
  validCustomer,
} from '../../data/test-data';

test.describe('API — pedidos', () => {
  test('API-04: pedido válido com cupom retorna 201 com total correto', async ({ request }) => {
    const quantity = 2;
    const response = await request.post('/api/orders', {
      data: {
        items: [{ productId: otcProduct.id, quantity }],
        customer: validCustomer,
        coupon: coupons.valid,
        prescriptionAttached: false,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.orderId).toMatch(/^ORD-\d{4,}$/);
    expect(body.status).toBe('confirmed');

    const expectedTotal =
      Math.round(otcProduct.price * quantity * (1 - coupons.validDiscountPercent / 100) * 100) /
      100;
    expect(body.total).toBeCloseTo(expectedTotal, 2);
  });

  test('API-05: cliente inválido retorna 400 INVALID_CUSTOMER com os campos', async ({
    request,
  }) => {
    const response = await request.post('/api/orders', {
      data: {
        items: [{ productId: otcProduct.id, quantity: 1 }],
        customer: { name: '', email: 'sem-arroba', cep: '12' },
        prescriptionAttached: false,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('INVALID_CUSTOMER');
    expect(body.fields).toEqual(expect.arrayContaining(['name', 'email', 'cep']));
  });

  test('API-05: itens inválidos retornam 400 INVALID_ITEMS', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: {
        items: [{ productId: 'med-999', quantity: 1 }],
        customer: validCustomer,
        prescriptionAttached: false,
      },
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe('INVALID_ITEMS');
  });

  test('API-06 (tema): item controlado sem receita retorna 422 PRESCRIPTION_REQUIRED', async ({
    request,
  }) => {
    const response = await request.post('/api/orders', {
      data: {
        items: [{ productId: prescriptionProduct.id, quantity: 1 }],
        customer: validCustomer,
        prescriptionAttached: false,
      },
    });

    expect(response.status()).toBe(422);
    expect(await response.json()).toEqual({
      error: 'PRESCRIPTION_REQUIRED',
      productId: prescriptionProduct.id,
    });
  });

  test('API-07 (tema): quantidade acima de maxPerOrder retorna 422 MAX_QUANTITY_EXCEEDED', async ({
    request,
  }) => {
    const response = await request.post('/api/orders', {
      data: {
        items: [{ productId: limitedProduct.id, quantity: limitedProduct.maxPerOrder + 1 }],
        customer: validCustomer,
        prescriptionAttached: true,
      },
    });

    expect(response.status()).toBe(422);
    expect(await response.json()).toEqual({
      error: 'MAX_QUANTITY_EXCEEDED',
      productId: limitedProduct.id,
      maxPerOrder: limitedProduct.maxPerOrder,
    });
  });
});
