import { Routes } from '@angular/router';
import { CustomTitleResolver } from '@lib/resolvers';

export const routes: Routes = [
    {
        path: 'contract/:id/:typeId',
        title: CustomTitleResolver,
        data: { titleKey: 'company-settings.contract'},
        loadComponent: async () => (await import('./contract/contract.component')).ContractComponent,
    },
    {
        path: 'terms-and-conditions',
        title: CustomTitleResolver,
        data: { titleKey: 'sidebar.termsandconditions'},
        loadComponent: async () => (await import('./terms-and-conditions/terms-and-conditions.component')).TermsAndConditionsComponent,
    },
    {
        path: 'privacy-policy',
        title: CustomTitleResolver,
        data: { titleKey: 'sidebar.privacypolicy'},
        loadComponent: async () => (await import('./privacy-policy/privacy-policy.component')).PrivacyPolicyComponent,
    },
    {
        path: 'cookie-policy',
        title: CustomTitleResolver,
        data: { titleKey: 'sidebar.cookiespolicy'},
        loadComponent: async () => (await import('./cookie-policy/cookie-policy.component')).CookiePolicyComponent,
    }
];