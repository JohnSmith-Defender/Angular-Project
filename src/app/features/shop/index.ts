import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'shop.shop'},
        loadComponent: async () => (await import('./home/home.component')).ShopHomeComponent,
    },
    {
        path: 'list/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'shop.products'},
        loadComponent: async () => (await import('./list/list.component')).ShopListComponent,
    },
    {
        path: 'detail/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'shop.product'},
        loadComponent: async () => (await import('./detail/detail.component')).ProductDetailComponent,
    },
    {
        path: 'cart',
        title: CustomTitleResolver,
        data: { titleKey: 'shop.cart'},
        loadComponent: async () => (await import('./cart/cart.component')).CartComponent,
    },
    {
        path: 'checkout',
        title: CustomTitleResolver,
        data: { titleKey: 'shop.checkout'},
        loadComponent: async () => (await import('./checkout/checkout.component')).ShopCheckoutComponent,
    },
    {
        path: 'order-summary',
        title: CustomTitleResolver,
        data: { titleKey: 'shop.ordersummary'},
        loadComponent: async () => (await import('./order-summary/order-summary.component')).OrderSummaryComponent,
    },
    {
        path: 'my-orders',
        title: CustomTitleResolver,
        data: { titleKey: 'shop.myorders'},
        loadComponent: async () => (await import('./my-orders/my-orders.component')).MyOrdersComponent,
    }
];
