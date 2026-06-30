import { describe, expect, it } from 'vitest';
import rules from './rules';
import seedProducts from './seed/products.json';

const productsById = new Map(seedProducts.map((product) => [product.id, product]));
const otcProduct = seedProducts.find((product) => !product.requiresPrescription);
const prescriptionProduct = seedProducts.find((product) => product.requiresPrescription);
const limitedProduct = seedProducts.find((product) => product.maxPerOrder === 2);

const validCustomer = { name: 'Arthur Correia', email: 'arthur@example.com', cep: '01001000' };

describe('validateCustomer', () => {
  it('aceita um cliente válido', () => {
    expect(rules.validateCustomer(validCustomer)).toEqual([]);
  });

  it('rejeita nome vazio ou só com espaços', () => {
    expect(rules.validateCustomer({ ...validCustomer, name: '   ' })).toContain('name');
  });

  it('rejeita e-mail fora do formato', () => {
    expect(rules.validateCustomer({ ...validCustomer, email: 'sem-arroba' })).toContain('email');
  });

  it('rejeita CEP que não tem 8 dígitos', () => {
    expect(rules.validateCustomer({ ...validCustomer, cep: '123' })).toContain('cep');
  });

  it('rejeita CEP com letras', () => {
    expect(rules.validateCustomer({ ...validCustomer, cep: 'abcdefgh' })).toContain('cep');
  });

  it('lista todos os campos inválidos de uma vez', () => {
    expect(rules.validateCustomer({ name: '', email: 'x', cep: '1' })).toEqual([
      'name',
      'email',
      'cep',
    ]);
  });

  it('trata cliente ausente como totalmente inválido', () => {
    expect(rules.validateCustomer(undefined)).toEqual(['name', 'email', 'cep']);
  });
});

describe('validateItems', () => {
  it('aceita itens válidos', () => {
    expect(rules.validateItems([{ productId: otcProduct.id, quantity: 1 }], productsById)).toBe(
      true
    );
  });

  it('rejeita lista vazia', () => {
    expect(rules.validateItems([], productsById)).toBe(false);
  });

  it('rejeita valor que não é array', () => {
    expect(rules.validateItems(null, productsById)).toBe(false);
  });

  it('rejeita produto inexistente', () => {
    expect(rules.validateItems([{ productId: 'med-999', quantity: 1 }], productsById)).toBe(false);
  });

  it('rejeita quantidade zero ou negativa', () => {
    expect(rules.validateItems([{ productId: otcProduct.id, quantity: 0 }], productsById)).toBe(
      false
    );
    expect(rules.validateItems([{ productId: otcProduct.id, quantity: -2 }], productsById)).toBe(
      false
    );
  });

  it('rejeita quantidade não inteira', () => {
    expect(rules.validateItems([{ productId: otcProduct.id, quantity: 1.5 }], productsById)).toBe(
      false
    );
  });
});

describe('checkPrescription', () => {
  it('libera quando a receita está anexada', () => {
    const items = [{ productId: prescriptionProduct.id, quantity: 1 }];
    expect(rules.checkPrescription(items, productsById, true)).toBeNull();
  });

  it('bloqueia item controlado sem receita e retorna o productId', () => {
    const items = [{ productId: prescriptionProduct.id, quantity: 1 }];
    expect(rules.checkPrescription(items, productsById, false)).toBe(prescriptionProduct.id);
  });

  it('libera pedido só com itens livres', () => {
    const items = [{ productId: otcProduct.id, quantity: 1 }];
    expect(rules.checkPrescription(items, productsById, false)).toBeNull();
  });

  it('retorna o primeiro item controlado bloqueado', () => {
    const items = [
      { productId: otcProduct.id, quantity: 1 },
      { productId: prescriptionProduct.id, quantity: 1 },
    ];
    expect(rules.checkPrescription(items, productsById, false)).toBe(prescriptionProduct.id);
  });
});

describe('checkMaxQuantity', () => {
  it('libera quantidade dentro do limite', () => {
    const items = [{ productId: limitedProduct.id, quantity: limitedProduct.maxPerOrder - 1 }];
    expect(rules.checkMaxQuantity(items, productsById)).toBeNull();
  });

  it('libera quantidade igual ao limite', () => {
    const items = [{ productId: limitedProduct.id, quantity: limitedProduct.maxPerOrder }];
    expect(rules.checkMaxQuantity(items, productsById)).toBeNull();
  });

  it('bloqueia quantidade acima do limite com productId e maxPerOrder', () => {
    const items = [{ productId: limitedProduct.id, quantity: limitedProduct.maxPerOrder + 1 }];
    expect(rules.checkMaxQuantity(items, productsById)).toEqual({
      productId: limitedProduct.id,
      maxPerOrder: limitedProduct.maxPerOrder,
    });
  });
});

describe('validateCoupon', () => {
  it('valida PRIMEIRA10 com 10% de desconto', () => {
    expect(rules.validateCoupon('PRIMEIRA10')).toEqual({
      valid: true,
      code: 'PRIMEIRA10',
      discountPercent: 10,
    });
  });

  it('marca EXPIRADO como inválido por estar vencido', () => {
    expect(rules.validateCoupon('EXPIRADO')).toEqual({ valid: false, reason: 'EXPIRED' });
  });

  it('marca código desconhecido como inválido', () => {
    expect(rules.validateCoupon('NAOEXISTE')).toEqual({ valid: false, reason: 'INVALID' });
  });

  it('é sensível a maiúsculas e minúsculas', () => {
    expect(rules.validateCoupon('primeira10')).toEqual({ valid: false, reason: 'INVALID' });
  });
});

describe('calculateTotal', () => {
  it('soma os itens quando não há desconto', () => {
    const items = [{ productId: otcProduct.id, quantity: 2 }];
    expect(rules.calculateTotal(items, productsById, 0)).toBeCloseTo(otcProduct.price * 2, 2);
  });

  it('aplica o desconto percentual arredondando para centavos', () => {
    const items = [{ productId: otcProduct.id, quantity: 2 }];
    const expected = Math.round(otcProduct.price * 2 * 0.9 * 100) / 100;
    expect(rules.calculateTotal(items, productsById, 10)).toBe(expected);
  });

  it('soma itens diferentes', () => {
    const items = [
      { productId: otcProduct.id, quantity: 1 },
      { productId: prescriptionProduct.id, quantity: 2 },
    ];
    const expected = otcProduct.price + prescriptionProduct.price * 2;
    expect(rules.calculateTotal(items, productsById, 0)).toBeCloseTo(expected, 2);
  });
});
