import type { CustomerData } from '../pages/CheckoutPage';
import { ProductActions } from './ProductActions';
import { CartActions } from './CartActions';
import { CheckoutActions } from './CheckoutActions';

export class ShopFlowActions {
  constructor(
    private readonly productActions: ProductActions,
    private readonly cartActions: CartActions,
    private readonly checkoutActions: CheckoutActions
  ) {}

  async addProductToCart(productId: string, quantity = 1): Promise<void> {
    await this.productActions.open(productId);
    await this.productActions.addToCart(quantity);
  }

  async purchaseOtcProduct(
    productId: string,
    customer: CustomerData,
    quantity = 1
  ): Promise<void> {
    await this.addProductToCart(productId, quantity);
    await this.checkoutActions.open();
    await this.checkoutActions.fillCustomerAndSubmit(customer);
  }

  async purchasePrescriptionProduct(
    productId: string,
    customer: CustomerData,
    prescriptionFilePath: string,
    quantity = 1
  ): Promise<void> {
    await this.addProductToCart(productId, quantity);
    await this.checkoutActions.open();
    await this.checkoutActions.attachPrescription(prescriptionFilePath);
    await this.checkoutActions.fillCustomerAndSubmit(customer);
  }
}
