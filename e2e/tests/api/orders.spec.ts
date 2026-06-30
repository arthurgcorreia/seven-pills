import { expect, test } from '../../fixtures/pages';
import {
  coupons,
  invalidCustomer,
  limitedProduct,
  otcProduct,
  prescriptionProduct,
  unknownProductId,
  validCustomer,
} from '../../data/test-data';
import { applyDiscount } from '../../utils/money';

test.describe('API: pedidos', () => {
  test('API-ORD-01: pedido válido sem cupom retorna 201 com total igual ao subtotal', async ({
    apiActions,
  }) => {
    const quantity = 2;
    const response = await apiActions.createOrder({
      items: [{ productId: otcProduct.id, quantity }],
      customer: validCustomer,
      prescriptionAttached: false,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.status).toBe('confirmed');
    expect(body.total).toBeCloseTo(otcProduct.price * quantity, 2);
  });

  test('API-ORD-02: pedido válido com PRIMEIRA10 retorna 201 com total com desconto', async ({
    apiActions,
  }) => {
    const quantity = 2;
    const response = await apiActions.createOrder({
      items: [{ productId: otcProduct.id, quantity }],
      customer: validCustomer,
      coupon: coupons.valid,
      prescriptionAttached: false,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.total).toBeCloseTo(
      applyDiscount(otcProduct.price * quantity, coupons.validDiscountPercent),
      2
    );
  });

  test('API-ORD-03: item controlado com receita anexada retorna 201', async ({ apiActions }) => {
    const response = await apiActions.createOrder({
      items: [{ productId: prescriptionProduct.id, quantity: 1 }],
      customer: validCustomer,
      prescriptionAttached: true,
    });

    expect(response.status()).toBe(201);
    expect((await response.json()).status).toBe('confirmed');
  });

  test('API-ORD-04: cliente inválido retorna 400 INVALID_CUSTOMER com os campos', async ({
    apiActions,
  }) => {
    const response = await apiActions.createOrder({
      items: [{ productId: otcProduct.id, quantity: 1 }],
      customer: invalidCustomer,
      prescriptionAttached: false,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('INVALID_CUSTOMER');
    expect(body.fields).toEqual(expect.arrayContaining(['name', 'email', 'cep']));
  });

  test('API-ORD-05: itens vazios retornam 400 INVALID_ITEMS', async ({ apiActions }) => {
    const response = await apiActions.createOrder({
      items: [],
      customer: validCustomer,
      prescriptionAttached: false,
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe('INVALID_ITEMS');
  });

  test('API-ORD-06: productId inexistente retorna 400 INVALID_ITEMS', async ({ apiActions }) => {
    const response = await apiActions.createOrder({
      items: [{ productId: unknownProductId, quantity: 1 }],
      customer: validCustomer,
      prescriptionAttached: false,
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe('INVALID_ITEMS');
  });

  test('API-ORD-07: item controlado sem receita retorna 422 PRESCRIPTION_REQUIRED', async ({
    apiActions,
  }) => {
    const response = await apiActions.createOrder({
      items: [{ productId: prescriptionProduct.id, quantity: 1 }],
      customer: validCustomer,
      prescriptionAttached: false,
    });

    expect(response.status()).toBe(422);
    expect(await response.json()).toEqual({
      error: 'PRESCRIPTION_REQUIRED',
      productId: prescriptionProduct.id,
    });
  });

  test('API-ORD-08: quantidade acima de maxPerOrder retorna 422 MAX_QUANTITY_EXCEEDED', async ({
    apiActions,
  }) => {
    const response = await apiActions.createOrder({
      items: [{ productId: limitedProduct.id, quantity: limitedProduct.maxPerOrder + 1 }],
      customer: validCustomer,
      prescriptionAttached: true,
    });

    expect(response.status()).toBe(422);
    expect(await response.json()).toEqual({
      error: 'MAX_QUANTITY_EXCEEDED',
      productId: limitedProduct.id,
      maxPerOrder: limitedProduct.maxPerOrder,
    });
  });

  test('API-ORD-09: quantidade igual a maxPerOrder retorna 201', async ({ apiActions }) => {
    const response = await apiActions.createOrder({
      items: [{ productId: limitedProduct.id, quantity: limitedProduct.maxPerOrder }],
      customer: validCustomer,
      prescriptionAttached: true,
    });

    expect(response.status()).toBe(201);
    expect((await response.json()).status).toBe('confirmed');
  });

  test('API-ORD-10: cliente inválido tem precedência sobre itens inválidos', async ({
    apiActions,
  }) => {
    const response = await apiActions.createOrder({
      items: [{ productId: unknownProductId, quantity: 1 }],
      customer: invalidCustomer,
      prescriptionAttached: false,
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe('INVALID_CUSTOMER');
  });

  test('API-ORD-11: receita tem precedência sobre quantidade máxima', async ({ apiActions }) => {
    const response = await apiActions.createOrder({
      items: [
        { productId: prescriptionProduct.id, quantity: prescriptionProduct.maxPerOrder + 1 },
      ],
      customer: validCustomer,
      prescriptionAttached: false,
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).error).toBe('PRESCRIPTION_REQUIRED');
  });

  test('API-ORD-12: pedido bem-sucedido retorna orderId sequencial', async ({ apiActions }) => {
    const response = await apiActions.createOrder({
      items: [{ productId: otcProduct.id, quantity: 1 }],
      customer: validCustomer,
      prescriptionAttached: false,
    });

    expect(response.status()).toBe(201);
    expect((await response.json()).orderId).toMatch(/^ORD-\d{4,}$/);
  });

  test('API-ORD-13: GET /api/orders/:id retorna o pedido sem expor o cliente', async ({
    apiActions,
  }) => {
    const quantity = 2;
    const created = await apiActions.createOrder({
      items: [{ productId: otcProduct.id, quantity }],
      customer: validCustomer,
      prescriptionAttached: false,
    });
    const { orderId } = await created.json();

    const response = await apiActions.getOrder(orderId);

    expect(response.status()).toBe(200);
    const order = await response.json();
    expect(order.orderId).toBe(orderId);
    expect(order.status).toBe('confirmed');
    expect(order.total).toBeCloseTo(otcProduct.price * quantity, 2);
    expect(order).not.toHaveProperty('customer');
  });

  test('API-ORD-14: GET /api/orders/:id inexistente retorna 404 NOT_FOUND', async ({
    apiActions,
  }) => {
    const response = await apiActions.getOrder('ORD-0000');

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'NOT_FOUND' });
  });
});
