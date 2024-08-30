import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.supporttickets'},
        loadComponent: async () => (await import('./manage-list/manage-list.component')).ManageSupportTicketsListComponent,
    },
];