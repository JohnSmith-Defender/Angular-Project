import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'training.training'},
        loadComponent: async () => (await import('./home/home.component')).TrainingHomeComponent,
    },
];
