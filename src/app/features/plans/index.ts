import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'dashboard.plans'},
        loadComponent: async () => (await import('./list/list.component')).PlansListComponent,
    },
    {
        path: 'list/:mode',
        title: CustomTitleResolver,
        data: { titleKey: 'dashboard.plans'},
        loadComponent: async () => (await import('./list/list.component')).PlansListComponent,
    },
    {
        path: 'details/:id/:planTypeId',
        title: CustomTitleResolver,
        data: { titleKey: 'plan-details.plan'},
        loadComponent: async () => (await import('./detail/detail.component')).PlanDetailComponent,
    },
    {
        path: 'create/:id/:planTypeId',
        title: CustomTitleResolver,
        data: { titleKey: 'signup.create'},
        loadComponent: async () => (await import('./edit/edit.component')).PlanEditComponent,
    },
    {
        path: 'edit/:id/:planTypeId',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.edit'},
        loadComponent: async () => (await import('./edit/edit.component')).PlanEditComponent,
    },
    {
        path: 'payment/:id/:typeId/:userId',
        title: CustomTitleResolver,
        data: { titleKey: 'signup.checkout'},
        loadComponent: async () => (await import('./payment/payment.component')).PlanPaymentComponent,
    }
];
