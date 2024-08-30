import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'wall.tutors'},
        loadComponent: async () => (await import('./list/list.component')).TutorsListComponent,
    },
    {
        path: 'details/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'tutors.tutor'},
        loadComponent: async () => (await import('./detail/detail.component')).TutorDetailComponent,
    },
    {
        path: 'payment/credits/:id/:userId',
        title: CustomTitleResolver,
        data: { titleKey: 'credit-package.creditpackage'},
        loadComponent: async () => (await import('./credits/credits.component')).CreditsComponent,
    },
    {
        path: 'stripe-connect',
        title: CustomTitleResolver,
        data: { titleKey: 'Stripe Connect'},
        loadComponent: async () => (await import('./stripe-connect/stripe-connect.component')).StripeConnectComponent,
    },
    {
        path: 'bookings/history',
        title: CustomTitleResolver,
        data: { titleKey: 'ranking.history'},
        loadComponent: async () => (await import('./history/history.component')).HistoryComponent,
    },
    {
        path: 'edit/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.edit'},
        loadComponent: async () => (await import('./edit/edit.component')).TutorEditComponent,
    }
];
