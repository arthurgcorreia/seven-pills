import { CheckoutPage, type CustomerData } from '../pages/CheckoutPage';

export class CheckoutActions {
  constructor(private readonly checkoutPage: CheckoutPage) {}

  async open(): Promise<void> {
    await this.checkoutPage.goto();
  }

  async fillCustomer(customer: CustomerData): Promise<void> {
    await this.checkoutPage.fillName(customer.name);
    await this.checkoutPage.fillEmail(customer.email);
    await this.checkoutPage.fillCep(customer.cep);
  }

  async attachPrescription(filePath: string): Promise<void> {
    await this.checkoutPage.attachPrescription(filePath);
  }

  async submit(): Promise<void> {
    await this.checkoutPage.clickSubmit();
  }

  async fillCustomerAndSubmit(customer: CustomerData): Promise<void> {
    await this.fillCustomer(customer);
    await this.submit();
  }
}
