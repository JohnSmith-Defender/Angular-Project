import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: 'wall/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'sidebar.activityfeed'},
        loadComponent: async () => (await import('./wall/wall.component')).WallComponent,
    }
];
