import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'dashboard.clubs'},
        loadComponent: async () => (await import('./list/list.component')).ClubsListComponent,
    },
    {
        path: 'details/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'plans.club'},
        loadComponent: async () => (await import('./detail/detail.component')).ClubDetailComponent,
    },
    {
        path: 'create/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'signup.create'},
        loadComponent: async () => (await import('./edit/edit.component')).ClubEditComponent,
    },
    {
        path: 'edit/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.edit'},
        loadComponent: async () => (await import('./edit/edit.component')).ClubEditComponent,
    }
];
