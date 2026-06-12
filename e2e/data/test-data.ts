import path from 'path';
import seedProducts from '../../server/seed/products.json';

/**
 * O seed do backend é a fonte única de verdade da massa de produtos:
 * os testes nunca ficam dessincronizados do catálogo real.
 */
export { seedProducts };

/** Produto sem receita, para fluxos livres. */
export const otcProduct = seedProducts.find((p) => !p.requiresPrescription)!;

/** Produto sem receita com maxPerOrder >= 3, para testes de quantidade. */
export const flexibleProduct = seedProducts.find(
  (p) => !p.requiresPrescription && p.maxPerOrder >= 3
)!;

/** Produto que exige receita (regra do tema). */
export const prescriptionProduct = seedProducts.find((p) => p.requiresPrescription)!;

/** Produto com maxPerOrder: 2, para a regra de quantidade máxima. */
export const limitedProduct = seedProducts.find((p) => p.maxPerOrder === 2)!;

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
  validDiscountPercent: 10,
  expired: 'EXPIRADO',
  invalid: 'NAOEXISTE',
};

/** Arquivo usado como receita médica nos testes de upload. */
export const prescriptionFilePath = path.resolve(__dirname, 'receita.txt');
