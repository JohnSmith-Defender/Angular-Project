import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '/:slug/:invite_guid',
        title: CustomTitleResolver,
        data: { titleKey: 'your-admin-area-registration'},
        loadComponent: async () => (await import('./event-registration/event-registration.component')).EventRegistrationComponent,
    }
];