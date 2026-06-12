import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CatalogPage extends BasePage {
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = page.getByTestId('product-card');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  cardByName(name: string): Locator {
    return this.productCards.filter({ hasText: name });
  }

  async openProduct(name: string): Promise<void> {
    await this.cardByName(name).getByTestId('product-card-link').click();
  }
}
