import { ProductPage } from '../pages/ProductPage';

export class ProductActions {
  constructor(private readonly productPage: ProductPage) {}

  async open(productId: string): Promise<void> {
    await this.productPage.goto(productId);
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.productPage.fillQuantity(quantity);
  }

  async increaseQuantity(times = 1): Promise<void> {
    for (let i = 0; i < times; i += 1) {
      await this.productPage.increaseQuantity();
    }
  }

  async decreaseQuantity(times = 1): Promise<void> {
    for (let i = 0; i < times; i += 1) {
      await this.productPage.decreaseQuantity();
    }
  }

  async addToCart(quantity = 1): Promise<void> {
    if (quantity !== 1) {
      await this.productPage.fillQuantity(quantity);
    }
    await this.productPage.clickAddToCart();
  }
}
