const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rules = require('./rules');

const PORT = process.env.PORT || 3001;

// Catálogo seed carregado em memória no boot (sem banco de dados).
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed', 'products.json'), 'utf-8')
);
const productsById = new Map(products.map((product) => [product.id, product]));

// Pedidos vivem em memória e somem ao reiniciar (aceitável neste projeto).
const orders = [];
const ordersById = new Map();
let orderSequence = 0;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = productsById.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
  res.json(product);
});

app.post('/api/coupons/validate', (req, res) => {
  const { code } = req.body || {};
  res.json(rules.validateCoupon(code));
});

app.post('/api/orders', (req, res) => {
  const { items, customer, coupon, prescriptionAttached } = req.body || {};

  const invalidFields = rules.validateCustomer(customer);
  if (invalidFields.length > 0) {
    return res.status(400).json({ error: 'INVALID_CUSTOMER', fields: invalidFields });
  }

  if (!rules.validateItems(items, productsById)) {
    return res.status(400).json({ error: 'INVALID_ITEMS' });
  }

  const blockedProductId = rules.checkPrescription(items, productsById, prescriptionAttached);
  if (blockedProductId) {
    return res.status(422).json({ error: 'PRESCRIPTION_REQUIRED', productId: blockedProductId });
  }

  const exceeded = rules.checkMaxQuantity(items, productsById);
  if (exceeded) {
    return res.status(422).json({
      error: 'MAX_QUANTITY_EXCEEDED',
      productId: exceeded.productId,
      maxPerOrder: exceeded.maxPerOrder,
    });
  }

  const couponResult = coupon ? rules.validateCoupon(coupon) : null;
  const discountPercent = couponResult && couponResult.valid ? couponResult.discountPercent : 0;
  const total = rules.calculateTotal(items, productsById, discountPercent);

  orderSequence += 1;
  const orderId = `ORD-${String(orderSequence).padStart(4, '0')}`;
  const order = {
    orderId,
    status: 'confirmed',
    items,
    customer,
    coupon: coupon || null,
    total,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  ordersById.set(orderId, order);

  res.status(201).json({ orderId, status: 'confirmed', total });
});

// Recupera um pedido sem expor os dados pessoais do cliente (sem PII).
app.get('/api/orders/:id', (req, res) => {
  const order = ordersById.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
  const { customer, ...publicOrder } = order;
  res.json(publicOrder);
});

app.listen(PORT, () => {
  console.log(`API da farmácia rodando em http://localhost:${PORT}`);
});
