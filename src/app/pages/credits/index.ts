import { Routes } from '@angular/router';
import { PageLayout } from '@lib/enums/page-layout.enum';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: ':user-id',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'company-settings.profile' },
        loadComponent: async () => (await import('./user-credits/user-credits.component')).UserCreditsComponent,
    },
];
