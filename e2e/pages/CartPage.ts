import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseBRL } from './money';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly emptyMessage: Locator;
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

  async setItemQuantity(name: string, quantity: number): Promise<void> {
    await this.itemByName(name).getByTestId('cart-item-quantity').fill(String(quantity));
  }

  async removeItem(name: string): Promise<void> {
    await this.itemByName(name).getByTestId('cart-item-remove').click();
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.couponApply.click();
  }

  async readSubtotal(): Promise<number> {
    return parseBRL(await this.subtotal.innerText());
  }

  async readDiscount(): Promise<number> {
    return parseBRL(await this.discount.innerText());
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
