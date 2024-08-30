import { Routes } from '@angular/router';
import { PageLayout } from '@lib/enums/page-layout.enum';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: 'profile/:id',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'company-settings.profile' },
        loadComponent: async () => (await import('./profile/profile.component')).ProfileComponent,
    },
    {
        path: 'notifications/:id',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'notification-popup.notifications' },
        loadComponent: async () => (await import('./notifications/notifications.component')).NotificationsComponent,
    },
    {
        path: 'admin-lists',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'company-settings.managelanding' },
        loadComponent: async () => (await import('./admin-lists/admin-lists.component')).AdminListsComponent,
    },
    {
        path: 'my-credits/:mode',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'credit-package.mycredits' },
        loadComponent: async () => (await import('./my-credits/my-credits.component')).MyCreditsComponent,
    },
    {
        path: 'my-lessons',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'tutors.mylessons' },
        loadComponent: async () => (await import('./my-lessons/my-lessons.component')).MyLessonsComponent,
    },
    {
        path: 'invoices-list',
        title: CustomTitleResolver,
        data: { titleKey: 'company-settings.invoices'},
        loadComponent: async () => (await import('./invoices-list/invoices-list.component')).InvoicesListComponent,
    },
    {
        path: 'invites/:mode',
        title: CustomTitleResolver,
        data: { titleKey: 'your-events.invites'},
        loadComponent: async () => (await import('./invites/invites.component')).InvitesComponent,
    },
    {
        path: 'crm',
        title: CustomTitleResolver,
        data: { titleKey: 'CRM'},
        loadComponent: async () => (await import('./crm/crm.component')).CRMComponent,
    },
    {
        path: 'my-account/:id',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'company-settings.profile' },
        loadComponent: async () => (await import('./my-account/my-account.component')).MyAccountComponent,
    },
    {
        path: 'my-sessions',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'buddy.mysessions' },
        loadComponent: async () => (await import('./my-sessions/my-sessions.component')).MySessionsComponent,
    },
    {
        path: 'my-transactions',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'professionals.mytransactions' },
        loadComponent: async () => (await import('./my-transactions/my-transactions.component')).MyTransactionsComponent,
    },
    {
        path: 'account-recharge',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'professionals.addmoneytowallet' },
        loadComponent: async () => (await import('./account-recharge/account-recharge.component')).AccountRechargeComponent,
    },
    {
        path: 'panel/:id',
        title: CustomTitleResolver,
        data: { layout: PageLayout.Main , titleKey: 'user-panel.userpanel' },
        loadComponent: async () => (await import('./panel/panel.component')).UserPanelComponent,
    },
];
