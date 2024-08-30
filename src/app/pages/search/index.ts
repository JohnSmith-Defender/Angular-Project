import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        title: 'Search',
        loadComponent: async () => (await import('./search.component')).SearchComponent,
    },
];
