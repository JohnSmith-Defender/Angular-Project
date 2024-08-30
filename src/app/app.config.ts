import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  ApplicationConfig,
  Injectable,
  importProvidersFrom,
  makeEnvironmentProviders, 
  isDevMode,
} from "@angular/core";
import {
  RouterStateSnapshot,
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
} from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  jwtInterceptor,
  serverErrorInterceptor,
} from "src/app/core/interceptors";
import { routes } from "./app.routes";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { HttpCacheInterceptorModule, useHttpCacheLocalStorage } from "@ngneat/cashew";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { CompanyService } from "src/app/share/services";
import { environment } from "@env/environment";
import { provideNgxStripe } from "ngx-stripe";
import { STRIPE_CLIENT_ID } from "@features/services/payment/stripe.service";
import { Meta, Title } from "@angular/platform-browser";
import { Customer } from "@lib/interfaces";
import { StarRatingModule } from "angular-star-rating";
import { provideNgcCookieConsent} from 'ngx-cookieconsent';
import { cookieConfig } from "./constants/cookie-banner";
import { CookieService } from 'ngx-cookie-service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { QuillModule } from 'ngx-quill';
import customersData from "src/assets/data/customers.json";
import { provideServiceWorker } from '@angular/service-worker';


@Injectable({ providedIn: "root" })
export class TemplatePageTitleStrategy extends TitleStrategy {
  customers: Customer[] = customersData;

  constructor(
    private readonly title: Title,
    private _companyService: CompanyService,
    private _metaService: Meta
  ) {
    super();
  }

  override async updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    let company =
      this.customers &&
      this.customers.find(
        (c) => c.url == window.location.host || c.url == environment.company
      );
    let companyName = company ? company.name : "VCP";
    if (title !== undefined) {
      let suffix = title ? " | " + title : "";
      this.title.setTitle(`${companyName}${suffix}`);
    } else {
      this.title.setTitle(companyName);
    }
    if (company && company.id) {
      var d = await this._companyService
        .getMetaDescription(company.id)
        .subscribe((resp) => {
          if (resp && resp.data) {
            this._metaService.updateTag({
              name: "description",
              content: resp.data.value,
            });
            this._metaService.updateTag({
              property: "og:description",
              content: resp.data.value,
            });
          }
        });
    }
  }
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: TitleStrategy, useClass: TemplatePageTitleStrategy },
    provideAnimations(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([serverErrorInterceptor, jwtInterceptor])),
    provideNgxStripe('pk_test_51Gu9UDDAf3Yyd0pq9nltjnpw8MKjDmO6Sk36Ld5he5VWDHQQ8gm8skfeJYovpy3w0s03h680p4k046P0ha1If0Wl00Xi0z0UEe'),
    {
      provide: STRIPE_CLIENT_ID,
      useValue: '449f8516-791a-49ab-a09d-50f79a0678b6',
    },
    importProvidersFrom(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    })),
    importProvidersFrom(QuillModule.forRoot({
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ header: 1 }, { header: 2 }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ["clean"],
          ["link", "image", "video"],
        ]
      }
    })),
    importProvidersFrom(StarRatingModule.forRoot()),
    importProvidersFrom(HttpCacheInterceptorModule.forRoot({
      ttl: 1000 * 60 * 10,
      strategy: 'explicit',
    })),
    importProvidersFrom(LoggerModule.forRoot({
      serverLoggingUrl: `${environment.api}/v2/logs`,
      level: environment.logLevel,
      serverLogLevel: environment.serverLogLevel,
      disableConsoleLogging: false,
    })),
    makeEnvironmentProviders(useHttpCacheLocalStorage),
    provideNgcCookieConsent(cookieConfig),
    CookieService,
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode() && (window.location.host == "astroideal.com"),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
};
