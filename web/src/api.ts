import type { CouponResult, OrderPayload, OrderResponse, Product } from './types';

const BASE_URL = '/api';

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${BASE_URL}/products`);
  if (!response.ok) throw new Error('Erro ao carregar produtos');
  return response.json();
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const response = await fetch(`${BASE_URL}/products/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Erro ao carregar produto');
  return response.json();
}

export async function fetchOrder(id: string): Promise<OrderResponse | null> {
  const response = await fetch(`${BASE_URL}/orders/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Erro ao carregar pedido');
  return response.json();
}

export async function validateCoupon(code: string): Promise<CouponResult> {
  const response = await fetch(`${BASE_URL}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error('Erro ao validar cupom');
  return response.json();
}

export async function createOrder(
  payload: OrderPayload
): Promise<{ status: number; body: any }> {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}
