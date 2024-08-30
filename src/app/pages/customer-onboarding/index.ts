import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'sidebar.customeronboarding'},
        loadComponent: async () => (await import('./home/home.component')).CustomerOnboardingHomeComponent,
    },
    {
        path: 'create',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.createnewcustomer'},
        loadComponent: async () => (await import('./create/create.component')).CreateCustomerComponent,
    },
];