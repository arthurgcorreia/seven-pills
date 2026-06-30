import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ConfirmationPage extends BasePage {
  readonly confirmation: Locator;
  readonly orderNumber: Locator;
  readonly orderTotal: Locator;
  readonly notFound: Locator;
  readonly backToCatalog: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmation = page.getByTestId('order-confirmation');
    this.orderNumber = page.getByTestId('order-number');
    this.orderTotal = page.getByTestId('order-total');
    this.notFound = page.getByTestId('order-not-found');
    this.backToCatalog = page.getByTestId('back-to-catalog');
  }
}
