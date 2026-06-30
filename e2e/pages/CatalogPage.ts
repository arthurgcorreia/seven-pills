import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CatalogPage extends BasePage {
  readonly productGrid: Locator;
  readonly productCards: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.productGrid = page.getByTestId('product-grid');
    this.productCards = page.getByTestId('product-card');
    this.error = page.getByTestId('catalog-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  cardByName(name: string): Locator {
    return this.productCards.filter({ hasText: name });
  }

  cardPrice(name: string): Locator {
    return this.cardByName(name).getByTestId('product-card-price');
  }

  cardBadge(name: string): Locator {
    return this.cardByName(name).getByTestId('prescription-badge');
  }

  async clickProduct(name: string): Promise<void> {
    await this.cardByName(name).getByTestId('product-card-link').click();
  }
}
