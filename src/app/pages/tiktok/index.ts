import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: 'landing/:slug',
        title: CustomTitleResolver,
        data: { titleKey: 'registration-landing.editregistrationlanding'},
        loadComponent: async () => (await import('./landing/landing.component')).TikTokLandingComponent,
    },
    {
        path: 'questions/:slug',
        title: CustomTitleResolver,
        data: { titleKey: 'registration-landing.editregistrationlanding'},
        loadComponent: async () => (await import('./questions/questions.component')).TikTokQuestionsComponent,
    },
    {
        path: 'landing-questions/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'registration-landing.editregistrationlanding'},
        loadComponent: async () => (await import('./landing-questions/landing-questions.component')).TikTokLandingQuestionsComponent,
    },
    {
        path: 'video-cta/:slug',
        title: CustomTitleResolver,
        data: { titleKey: 'create-content.video'},
        loadComponent: async () => (await import('./video-cta/video-cta.component')).TikTokVideoCTAComponent,
    },
    {
        path: 'statistics',
        title: CustomTitleResolver,
        data: { titleKey: 'company-settings.statistics'},
        loadComponent: async () => (await import('./statistics/statistics.component')).TiktokStatisticsComponent,
    },
];