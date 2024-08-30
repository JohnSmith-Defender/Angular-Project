import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'cityguide-details.cityguide'},
        loadComponent: async () => (await import('./list/list.component')).CityGuideListComponent,
    },
    {
        path: 'details/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'cityguide-details.cityguide'},
        loadComponent: async () => (await import('./detail/detail.component')).CityGuideDetailComponent,
    },
    {
        path: 'create/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'signup.create'},
        loadComponent: async () => (await import('./edit/edit.component')).CityGuideEditComponent,
    },
    {
        path: 'edit/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.edit'},
        loadComponent: async () => (await import('./edit/edit.component')).CityGuideEditComponent,
    }
];