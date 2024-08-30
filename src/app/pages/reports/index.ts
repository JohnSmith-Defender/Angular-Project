import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: 'members',
        title: CustomTitleResolver,
        data: { titleKey: 'company-settings.memberreports'},
        loadComponent: async () => (await import('./members/members.component')).MemberReportsComponent,
    },
    {
        path: 'guests',
        title: CustomTitleResolver,
        data: { titleKey: 'company-settings.guestreports'},
        loadComponent: async () => (await import('./guests/guests.component')).GuestReportsComponent,
    },
    {
        path: 'export',
        title: CustomTitleResolver,
        data: { titleKey: 'company-settings.export'},
        loadComponent: async () => (await import('./export/export.component')).ExportComponent,
    },
];