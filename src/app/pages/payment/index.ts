import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: 'select-plan/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'your-admin-area.selectmembertype'},
        loadComponent: async () => (await import('./select-plan/select-plan.component')).SelectPlanComponent,
    },
    {
        path: 'checkout/:id/:type',
        title: CustomTitleResolver,
        data: { titleKey: 'your-admin-area.selectmembertype'},
        loadComponent: async () => (await import('./checkout/checkout.component')).CheckoutComponent,
    },
];