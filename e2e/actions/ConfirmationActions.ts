import { ConfirmationPage } from '../pages/ConfirmationPage';

export class ConfirmationActions {
  constructor(private readonly confirmationPage: ConfirmationPage) {}

  async backToCatalog(): Promise<void> {
    await this.confirmationPage.backToCatalog.click();
  }

  async readOrderNumber(): Promise<string> {
    return (await this.confirmationPage.orderNumber.innerText()).trim();
  }
}
