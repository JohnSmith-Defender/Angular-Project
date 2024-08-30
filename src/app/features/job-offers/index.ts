import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'company-reports.employmentchannel'},
        loadComponent: async () => (await import('./list/list.component')).JobOffersListComponent,
    },
    {
        path: 'details/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'job-offers.description'},
        loadComponent: async () => (await import('./detail/detail.component')).JobOfferDetailComponent,
    },
    {
        path: 'job/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'job-offers.description'},
        loadComponent: async () => (await import('./detail/detail.component')).JobOfferDetailComponent,
    },
    {
        path: 'register/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'job-offers.register'},
        loadComponent: async () => (await import('./register/register.component')).JobOfferRegisterComponent,
    },
    {
        path: 'create/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'signup.create'},
        loadComponent: async () => (await import('./edit/edit.component')).JobOfferEditComponent,
    },
    {
        path: 'edit/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.edit'},
        loadComponent: async () => (await import('./edit/edit.component')).JobOfferEditComponent,
    }
];
