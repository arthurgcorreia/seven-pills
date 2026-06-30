import { expect, test } from '../../fixtures/pages';
import { coupons } from '../../data/test-data';

test.describe('API: cupons', () => {
  test('API-COUP-01: PRIMEIRA10 é válido com 10% de desconto', async ({ apiActions }) => {
    const response = await apiActions.validateCoupon(coupons.valid);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      valid: true,
      code: 'PRIMEIRA10',
      discountPercent: 10,
    });
  });

  test('API-COUP-02: EXPIRADO é inválido com motivo EXPIRED', async ({ apiActions }) => {
    const response = await apiActions.validateCoupon(coupons.expired);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ valid: false, reason: 'EXPIRED' });
  });

  test('API-COUP-03: cupom desconhecido é inválido com motivo INVALID', async ({ apiActions }) => {
    const response = await apiActions.validateCoupon(coupons.invalid);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ valid: false, reason: 'INVALID' });
  });
});
