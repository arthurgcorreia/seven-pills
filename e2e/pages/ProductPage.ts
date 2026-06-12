import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly productName: Locator;
  readonly quantityInput: Locator;
  readonly quantityIncrease: Locator;
  readonly quantityDecrease: Locator;
  readonly addToCartButton: Locator;
  readonly addToCartFeedback: Locator;
  readonly prescriptionBadge: Locator;
  readonly maxQuantityError: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.getByTestId('product-name');
    this.quantityInput = page.getByTestId('quantity-input');
    this.quantityIncrease = page.getByTestId('quantity-increase');
    this.quantityDecrease = page.getByTestId('quantity-decrease');
    this.addToCartButton = page.getByTestId('add-to-cart-button');
    this.addToCartFeedback = page.getByTestId('add-to-cart-feedback');
    this.prescriptionBadge = page.getByTestId('prescription-badge');
    this.maxQuantityError = page.getByTestId('max-quantity-error');
  }

  async goto(productId: string): Promise<void> {
    await this.page.goto(`/produto/${productId}`);
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(quantity = 1): Promise<void> {
    if (quantity !== 1) {
      await this.setQuantity(quantity);
    }
    await this.addToCartButton.click();
  }
}
