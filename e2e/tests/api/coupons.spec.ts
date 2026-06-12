import { expect, test } from '@playwright/test';
import { coupons } from '../../data/test-data';

test.describe('API — cupons', () => {
  test('API-03: PRIMEIRA10 é válido com 10% de desconto', async ({ request }) => {
    const response = await request.post('/api/coupons/validate', {
      data: { code: coupons.valid },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      valid: true,
      code: 'PRIMEIRA10',
      discountPercent: 10,
    });
  });

  test('API-03: EXPIRADO é inválido com motivo EXPIRED', async ({ request }) => {
    const response = await request.post('/api/coupons/validate', {
      data: { code: coupons.expired },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ valid: false, reason: 'EXPIRED' });
  });

  test('API-03: cupom desconhecido é inválido com motivo INVALID', async ({ request }) => {
    const response = await request.post('/api/coupons/validate', {
      data: { code: coupons.invalid },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ valid: false, reason: 'INVALID' });
  });
});
