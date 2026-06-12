import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ConfirmationPage extends BasePage {
  readonly confirmation: Locator;
  readonly orderNumber: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmation = page.getByTestId('order-confirmation');
    this.orderNumber = page.getByTestId('order-number');
  }
}
