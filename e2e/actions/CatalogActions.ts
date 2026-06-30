import { CatalogPage } from '../pages/CatalogPage';

export class CatalogActions {
  constructor(private readonly catalogPage: CatalogPage) {}

  async open(): Promise<void> {
    await this.catalogPage.goto();
  }

  async openProduct(name: string): Promise<void> {
    await this.catalogPage.clickProduct(name);
  }
}
