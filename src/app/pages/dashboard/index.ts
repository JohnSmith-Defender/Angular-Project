import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'company-settings.dashboard'},
        loadComponent: async () => (await import('./dashboard.component')).DashboardComponent,
    },
];
