import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: '',
        title: CustomTitleResolver,
        data: { titleKey: 'courses.courses'},
        loadComponent: async () => (await import('./list/list.component')).CoursesListComponent,
    },
    {
        path: 'list/:category',
        title: CustomTitleResolver,
        data: { titleKey: 'courses.courses'},
        loadComponent: async () => (await import('./list/list.component')).CoursesListComponent,
    },
    {
        path: 'details/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'course-create.course'},
        loadComponent: async () => (await import('./detail-old/detail.component')).CourseDetailComponent,
    },
    {
        path: 'unit/:courseId/:unitId',
        title: CustomTitleResolver,
        data: { titleKey: 'course-create.unit'},
        loadComponent: async () => (await import('./unit/unit.component')).CourseUnitComponent,
    },
    {
        path: 'students/assign',
        title: CustomTitleResolver,
        data: { titleKey: 'course-students.assignstudentstocourses'},
        loadComponent: async () => (await import('./assign-courses/assign-courses.component')).CoursesAssignStudentsComponent,
    },
    {
        path: 'create/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'signup.create'},
        loadComponent: async () => (await import('./edit/edit.component')).CourseEditComponent,
    },
    {
        path: 'create/:id/:category',
        title: CustomTitleResolver,
        data: { titleKey: 'signup.create'},
        loadComponent: async () => (await import('./edit/edit.component')).CourseEditComponent,
    },
    {
        path: 'edit/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.edit'},
        loadComponent: async () => (await import('./edit/edit.component')).CourseEditComponent,
    },
    {
        path: 'edit/:id/:category',
        title: CustomTitleResolver,
        data: { titleKey: 'landing.edit'},
        loadComponent: async () => (await import('./edit/edit.component')).CourseEditComponent,
    },
    {
        path: 'payment/:id/:userId',
        title: CustomTitleResolver,
        data: { titleKey: 'signup.checkout'},
        loadComponent: async () => (await import('./payment/payment.component')).CoursePaymentComponent,
    },
    {
        path: 'assessments',
        title: CustomTitleResolver,
        data: { titleKey: 'course-assessments.manageassessments'},
        loadComponent: async () => (await import('./assessments-list/assessments-list.component')).CourseAssessmentsListComponent,
    },
    {
        path: 'intro/:id',
        title: CustomTitleResolver,
        data: { titleKey: 'buddy.introduction'},
        loadComponent: async () => (await import('./intro/intro.component')).CourseIntroComponent,
    },
];