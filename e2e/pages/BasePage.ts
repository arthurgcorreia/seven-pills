import type { Locator, Page } from '@playwright/test';

/**
 * Elementos globais do layout (header), compartilhados por todas as páginas.
 */
export abstract class BasePage {
  readonly cartIcon: Locator;
  readonly cartCount: Locator;

  protected constructor(readonly page: Page) {
    this.cartIcon = page.getByTestId('cart-icon');
    this.cartCount = page.getByTestId('cart-count');
  }

  async openCart(): Promise<void> {
    await this.cartIcon.click();
  }
}
