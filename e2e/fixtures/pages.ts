import { test as base } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { ProductPage } from '../pages/ProductPage';

interface Pages {
  catalogPage: CatalogPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  confirmationPage: ConfirmationPage;
}

export const test = base.extend<Pages>({
  // As imagens do seed apontam para um serviço externo de placeholder.
  // Bloqueá-las mantém os testes herméticos (sem internet em runtime)
  // e independentes da disponibilidade desse serviço.
  page: async ({ page }, use) => {
    await page.route('**://via.placeholder.com/**', (route) => route.abort());
    await use(page);
  },
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
});

export { expect } from '@playwright/test';
