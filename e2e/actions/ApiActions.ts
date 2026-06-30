import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface OrderPayload {
  items: OrderItem[];
  customer: { name: string; email: string; cep: string };
  coupon?: string | null;
  prescriptionAttached?: boolean;
}

export class ApiActions {
  constructor(private readonly request: APIRequestContext) {}

  getProducts(): Promise<APIResponse> {
    return this.request.get('/api/products');
  }

  getProduct(id: string): Promise<APIResponse> {
    return this.request.get(`/api/products/${id}`);
  }

  validateCoupon(code: string): Promise<APIResponse> {
    return this.request.post('/api/coupons/validate', { data: { code } });
  }

  createOrder(payload: OrderPayload): Promise<APIResponse> {
    return this.request.post('/api/orders', { data: payload });
  }
}
