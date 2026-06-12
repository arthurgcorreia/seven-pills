const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CEP_REGEX = /^\d{8}$/;

/**
 * Valida os dados do cliente. Retorna a lista de campos inválidos
 * (vazia quando o cliente é válido).
 */
function validateCustomer(customer) {
  const fields = [];
  const c = customer || {};
  if (typeof c.name !== 'string' || c.name.trim() === '') fields.push('name');
  if (typeof c.email !== 'string' || !EMAIL_REGEX.test(c.email)) fields.push('email');
  if (typeof c.cep !== 'string' || !CEP_REGEX.test(c.cep)) fields.push('cep');
  return fields;
}

/**
 * Itens válidos: array não vazio, todo productId existente no catálogo
 * e quantidade inteira positiva.
 */
function validateItems(items, productsById) {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every(
    (item) =>
      item &&
      productsById.has(item.productId) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
  );
}

/**
 * Regra da farmácia: itens com requiresPrescription exigem receita anexada.
 * Retorna o productId do primeiro item bloqueado, ou null quando liberado.
 */
function checkPrescription(items, productsById, prescriptionAttached) {
  if (prescriptionAttached === true) return null;
  for (const item of items) {
    const product = productsById.get(item.productId);
    if (product && product.requiresPrescription) return product.id;
  }
  return null;
}

/**
 * Regra da farmácia: quantidade por pedido limitada a maxPerOrder.
 * Retorna { productId, maxPerOrder } do primeiro item excedente, ou null.
 */
function checkMaxQuantity(items, productsById) {
  for (const item of items) {
    const product = productsById.get(item.productId);
    if (product && item.quantity > product.maxPerOrder) {
      return { productId: product.id, maxPerOrder: product.maxPerOrder };
    }
  }
  return null;
}

/**
 * Cupons aceitos pela loja. EXPIRADO existe apenas para simular o cenário
 * de cupom vencido.
 */
function validateCoupon(code) {
  if (code === 'PRIMEIRA10') {
    return { valid: true, code: 'PRIMEIRA10', discountPercent: 10 };
  }
  if (code === 'EXPIRADO') {
    return { valid: false, reason: 'EXPIRED' };
  }
  return { valid: false, reason: 'INVALID' };
}

/**
 * Total do pedido: soma (preço x quantidade) com o desconto percentual
 * aplicado, arredondado para centavos.
 */
function calculateTotal(items, productsById, discountPercent) {
  const subtotal = items.reduce(
    (sum, item) => sum + productsById.get(item.productId).price * item.quantity,
    0
  );
  const total = subtotal * (1 - discountPercent / 100);
  return Math.round(total * 100) / 100;
}

module.exports = {
  validateCustomer,
  validateItems,
  checkPrescription,
  checkMaxQuantity,
  validateCoupon,
  calculateTotal,
};
