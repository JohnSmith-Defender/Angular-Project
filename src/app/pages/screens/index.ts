import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '**',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.pagenotfound'},
        loadComponent: async () => (await import('@pages/screens/not-found/not-found.component')).NotFoundComponent,
    },
];
