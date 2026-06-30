import type { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  readonly cartIcon: Locator;
  readonly cartCount: Locator;
  readonly navHome: Locator;

  protected constructor(readonly page: Page) {
    this.cartIcon = page.getByTestId('cart-icon');
    this.cartCount = page.getByTestId('cart-count');
    this.navHome = page.getByTestId('nav-home');
  }

  async clickCartIcon(): Promise<void> {
    await this.cartIcon.click();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }
}
