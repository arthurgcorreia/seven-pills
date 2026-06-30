import { test as base } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { CatalogActions } from '../actions/CatalogActions';
import { ProductActions } from '../actions/ProductActions';
import { CartActions } from '../actions/CartActions';
import { CheckoutActions } from '../actions/CheckoutActions';
import { ConfirmationActions } from '../actions/ConfirmationActions';
import { ShopFlowActions } from '../actions/ShopFlowActions';
import { ApiActions } from '../actions/ApiActions';

interface Fixtures {
  catalogPage: CatalogPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  confirmationPage: ConfirmationPage;
  catalogActions: CatalogActions;
  productActions: ProductActions;
  cartActions: CartActions;
  checkoutActions: CheckoutActions;
  confirmationActions: ConfirmationActions;
  shopFlow: ShopFlowActions;
  apiActions: ApiActions;
}

export const test = base.extend<Fixtures>({
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  confirmationPage: async ({ page }, use) => {
    await use(new ConfirmationPage(page));
  },
  catalogActions: async ({ catalogPage }, use) => {
    await use(new CatalogActions(catalogPage));
  },
  productActions: async ({ productPage }, use) => {
    await use(new ProductActions(productPage));
  },
  cartActions: async ({ cartPage }, use) => {
    await use(new CartActions(cartPage));
  },
  checkoutActions: async ({ checkoutPage }, use) => {
    await use(new CheckoutActions(checkoutPage));
  },
  confirmationActions: async ({ confirmationPage }, use) => {
    await use(new ConfirmationActions(confirmationPage));
  },
  shopFlow: async ({ productActions, cartActions, checkoutActions }, use) => {
    await use(new ShopFlowActions(productActions, cartActions, checkoutActions));
  },
  apiActions: async ({ request }, use) => {
    await use(new ApiActions(request));
  },
});

export { expect } from '@playwright/test';
