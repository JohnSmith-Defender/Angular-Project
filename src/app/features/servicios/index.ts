import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'news.services'},
        loadComponent: async () => (await import('./list/list.component')).ServicesListComponent,
    },
    {
        path: 'details/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'services.service'},
        loadComponent: async () => (await import('./detail/detail.component')).ServiceDetailComponent,
    },
    {
        path: 'create/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'signup.create'},
        loadComponent: async () => (await import('./edit/edit.component')).ServiceEditComponent,
    },
    {
        path: 'edit/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.edit'},
        loadComponent: async () => (await import('./edit/edit.component')).ServiceEditComponent,
    },
    {
        path: 'payment/:id/:userId',
        title: CustomTitleResolver,
        data: { titleKey: 'signup.checkout'},
        loadComponent: async () => (await import('./payment/payment.component')).ServicePaymentComponent,
    }
];
