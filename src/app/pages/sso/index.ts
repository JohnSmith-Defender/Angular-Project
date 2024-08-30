import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.authentication.login'},
        loadComponent: async () => (await import('./auth/auth.component')).AuthComponent,
    }
];