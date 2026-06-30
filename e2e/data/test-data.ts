import path from 'path';
import seedProducts from '../../server/seed/products.json';

export { seedProducts };

export const otcProduct = seedProducts.find((p) => !p.requiresPrescription)!;

export const flexibleProduct = seedProducts.find(
  (p) => !p.requiresPrescription && p.maxPerOrder >= 3
)!;

export const prescriptionProduct = seedProducts.find((p) => p.requiresPrescription)!;

export const limitedProduct = seedProducts.find((p) => p.maxPerOrder === 2)!;

export const unknownProductId = 'med-999';

export const validCustomer = {
  name: 'Arthur Correia',
  email: 'arthur.qa@example.com',
  cep: '01001000',
};

export const invalidCustomer = {
  name: '',
  email: 'email-invalido',
  cep: '123',
};

export const coupons = {
  valid: 'PRIMEIRA10',
  validLowercase: 'primeira10',
  validDiscountPercent: 10,
  expired: 'EXPIRADO',
  invalid: 'NAOEXISTE',
};

export const prescriptionFilePath = path.resolve(__dirname, 'receita.txt');
