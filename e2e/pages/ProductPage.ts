import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly price: Locator;
  readonly category: Locator;
  readonly maxPerOrderInfo: Locator;
  readonly quantityInput: Locator;
  readonly quantityIncrease: Locator;
  readonly quantityDecrease: Locator;
  readonly addToCartButton: Locator;
  readonly addToCartFeedback: Locator;
  readonly prescriptionBadge: Locator;
  readonly prescriptionNote: Locator;
  readonly maxQuantityError: Locator;
  readonly notFound: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.price = page.getByTestId('product-price');
    this.category = page.locator('.card-category');
    this.maxPerOrderInfo = page.getByTestId('max-per-order-info');
    this.quantityInput = page.getByTestId('quantity-input');
    this.quantityIncrease = page.getByTestId('quantity-increase');
    this.quantityDecrease = page.getByTestId('quantity-decrease');
    this.addToCartButton = page.getByTestId('add-to-cart-button');
    this.addToCartFeedback = page.getByTestId('add-to-cart-feedback');
    this.prescriptionBadge = page.getByTestId('prescription-badge');
    this.prescriptionNote = page.getByTestId('prescription-note');
    this.maxQuantityError = page.getByTestId('max-quantity-error');
    this.notFound = page.getByTestId('product-not-found');
  }

  async goto(productId: string): Promise<void> {
    await this.page.goto(`/produto/${productId}`);
  }

  async fillQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async increaseQuantity(): Promise<void> {
    await this.quantityIncrease.click();
  }

  async decreaseQuantity(): Promise<void> {
    await this.quantityDecrease.click();
  }

  async clickAddToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
