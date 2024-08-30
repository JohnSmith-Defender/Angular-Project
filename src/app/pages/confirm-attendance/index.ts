import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'plan-datails.confirm'},
        loadComponent: async () => (await import('./confirm-attendance.component')).ConfirmAttendanceComponent,
    }
];