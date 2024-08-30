import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: 'IntroduceU',
        loadComponent: async () => (await import('./home/home.component')).BuddyHomeComponent,
    },
    {
        path: 'list',
        title: CustomTitleResolver,
        data: { titleKey: 'buddy.mentees'},
        loadComponent: async () => (await import('./list/list.component')).BuddyListComponent,
    },
    {
        path: 'profile/mentor/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'buddy.mentorprofile'},
        loadComponent: async () => (await import('./mentor-profile/mentor-profile.component')).MentorProfileComponent,
    },
    {
        path: 'mentor/request',
        title: CustomTitleResolver,
        data: { titleKey: 'buddy.applyasmentor'},
        loadComponent: async () => (await import('./mentor-request/mentor-request.component')).MentorRequestComponent,
    },
    {
        path: 'mentor/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'buddy.mentor'},
        loadComponent: async () => (await import('./mentor/mentor.component')).MentorComponent,
    },
    {
        path: 'mentee/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'buddy.mentee'},
        loadComponent: async () => (await import('./mentee/mentee.component')).MenteeComponent,
    },
];
