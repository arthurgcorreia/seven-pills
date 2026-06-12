export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  requiresPrescription: boolean;
  maxPerOrder: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  cep: string;
}

export interface CouponResult {
  valid: boolean;
  code?: string;
  discountPercent?: number;
  reason?: 'EXPIRED' | 'INVALID';
}

export interface OrderPayload {
  items: { productId: string; quantity: number }[];
  customer: Customer;
  coupon: string | null;
  prescriptionAttached: boolean;
}

export interface OrderResponse {
  orderId: string;
  status: string;
  total: number;
}
