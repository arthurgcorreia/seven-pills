import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CustomerData {
  name: string;
  email: string;
  cep: string;
}

export class CheckoutPage extends BasePage {
  readonly summary: Locator;
  readonly summaryItems: Locator;
  readonly total: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly cepInput: Locator;
  readonly submitButton: Locator;
  readonly prescriptionUpload: Locator;
  readonly prescriptionError: Locator;
  readonly emptyMessage: Locator;
  readonly serverError: Locator;

  constructor(page: Page) {
    super(page);
    this.summary = page.getByTestId('checkout-summary');
    this.summaryItems = page.getByTestId('checkout-summary-item');
    this.total = page.getByTestId('checkout-total');
    this.nameInput = page.getByTestId('checkout-name');
    this.emailInput = page.getByTestId('checkout-email');
    this.cepInput = page.getByTestId('checkout-cep');
    this.submitButton = page.getByTestId('checkout-submit');
    this.prescriptionUpload = page.getByTestId('prescription-upload');
    this.prescriptionError = page.getByTestId('prescription-error');
    this.emptyMessage = page.getByTestId('checkout-empty');
    this.serverError = page.getByTestId('checkout-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }

  fieldError(field: 'name' | 'email' | 'cep'): Locator {
    return this.page.getByTestId(`field-error-${field}`);
  }

  async fillName(value: string): Promise<void> {
    await this.nameInput.fill(value);
  }

  async fillEmail(value: string): Promise<void> {
    await this.emailInput.fill(value);
  }

  async fillCep(value: string): Promise<void> {
    await this.cepInput.fill(value);
  }

  async attachPrescription(filePath: string): Promise<void> {
    await this.prescriptionUpload.setInputFiles(filePath);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }
}
