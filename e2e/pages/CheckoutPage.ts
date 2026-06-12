import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CustomerData {
  name: string;
  email: string;
  cep: string;
}

export class CheckoutPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly cepInput: Locator;
  readonly submitButton: Locator;
  readonly prescriptionUpload: Locator;
  readonly prescriptionError: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByTestId('checkout-name');
    this.emailInput = page.getByTestId('checkout-email');
    this.cepInput = page.getByTestId('checkout-cep');
    this.submitButton = page.getByTestId('checkout-submit');
    this.prescriptionUpload = page.getByTestId('prescription-upload');
    this.prescriptionError = page.getByTestId('prescription-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }

  fieldError(field: 'name' | 'email' | 'cep'): Locator {
    return this.page.getByTestId(`field-error-${field}`);
  }

  async fillCustomer(customer: CustomerData): Promise<void> {
    await this.nameInput.fill(customer.name);
    await this.emailInput.fill(customer.email);
    await this.cepInput.fill(customer.cep);
  }

  async attachPrescription(filePath: string): Promise<void> {
    await this.prescriptionUpload.setInputFiles(filePath);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
