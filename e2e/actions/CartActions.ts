import { CartPage } from '../pages/CartPage';

export class CartActions {
  constructor(private readonly cartPage: CartPage) {}

  async open(): Promise<void> {
    await this.cartPage.goto();
  }

  async openFromHeader(): Promise<void> {
    await this.cartPage.clickCartIcon();
  }

  async setItemQuantity(name: string, quantity: number): Promise<void> {
    await this.cartPage.fillItemQuantity(name, quantity);
  }

  async removeItem(name: string): Promise<void> {
    await this.cartPage.clickRemoveItem(name);
  }

  async applyCoupon(code: string): Promise<void> {
    await this.cartPage.fillCoupon(code);
    await this.cartPage.clickApplyCoupon();
  }

  async goToCheckout(): Promise<void> {
    await this.cartPage.clickCheckout();
  }
}
