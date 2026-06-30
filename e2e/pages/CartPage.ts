import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly emptyMessage: Locator;
  readonly backToCatalog: Locator;
  readonly subtotal: Locator;
  readonly discount: Locator;
  readonly total: Locator;
  readonly couponInput: Locator;
  readonly couponApply: Locator;
  readonly couponMessage: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.getByTestId('cart-item');
    this.emptyMessage = page.getByTestId('cart-empty');
    this.backToCatalog = page.getByTestId('back-to-catalog');
    this.subtotal = page.getByTestId('cart-subtotal');
    this.discount = page.getByTestId('cart-discount');
    this.total = page.getByTestId('cart-total');
    this.couponInput = page.getByTestId('coupon-input');
    this.couponApply = page.getByTestId('coupon-apply');
    this.couponMessage = page.getByTestId('coupon-message');
    this.checkoutButton = page.getByTestId('checkout-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/carrinho');
  }

  itemByName(name: string): Locator {
    return this.cartItems.filter({ hasText: name });
  }

  itemQuantity(name: string): Locator {
    return this.itemByName(name).getByTestId('cart-item-quantity');
  }

  itemUnitPrice(name: string): Locator {
    return this.itemByName(name).getByTestId('cart-item-price');
  }

  itemTotal(name: string): Locator {
    return this.itemByName(name).getByTestId('cart-item-total');
  }

  async fillItemQuantity(name: string, quantity: number): Promise<void> {
    await this.itemQuantity(name).fill(String(quantity));
  }

  async clickRemoveItem(name: string): Promise<void> {
    await this.itemByName(name).getByTestId('cart-item-remove').click();
  }

  async fillCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
  }

  async clickApplyCoupon(): Promise<void> {
    await this.couponApply.click();
  }

  async clickCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
