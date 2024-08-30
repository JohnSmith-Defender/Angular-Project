import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'professionals.professionals'},
        loadComponent: async () => (await import('./list/list.component')).ProfessionalsListComponent,
    },
    {
        path: 'details/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'professionals.professional'},
        loadComponent: async () => (await import('./detail/detail.component')).ProfessionalDetailComponent,
    },
];