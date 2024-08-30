import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChange,
  inject,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { MenuService } from "src/app/core/services";
import { LogoComponent } from "../logo/logo.component";
import { COMPANY_IMAGE_URL } from "@lib/api-constants";
import { LangChangeEvent, TranslateModule, TranslateService } from "@ngx-translate/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule } from "@angular/forms";
import { GuestMenuComponent } from "../guest-menu/guest-menu.component";
import { FloatingTarotReadersComponent } from "@share/components/astro-ideal/floating-tarot-readers/floating-tarot-readers.component";
import { Subject } from "rxjs";
import { initFlowbite } from "flowbite";
import { MenuIcon } from "@lib/interfaces";
import menuIconsData from "src/assets/data/menu-icons.json";

@Component({
  selector: "app-top-menu",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    FontAwesomeModule,
    LogoComponent,
    GuestMenuComponent,
    FloatingTarotReadersComponent,
  ],
  templateUrl: "./top-menu.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopMenuComponent {
  private destroy$ = new Subject<void>();
  
  menus$ = inject(MenuService).menus$;
  menuIcons: MenuIcon[] = menuIconsData;

  @Input() cart: any;
  @Input() menus: any;
  @Input() company: any;
  @Input() language: any;
  @Input() imageSrc: any;
  @Input() userid: any;
  @Input() username: any;
  @Input() currentUser: any;
  @Input() primaryColor: any;
  @Input() buttonColor: any;
  @Input() logoSource: any;
  @Input() superAdmin: any;
  @Input() canRegister: any;
  @Input() navigation: any;
  @Input() hasProfessionals: any;
  @Input() isUESchoolOfLife: any;
  @Input() isCursoGeniusTestimonials: any;
  @Input() homePage: any;
  @Input() professionals: any;
  @Input() categories: any;

  logoSrc: string = COMPANY_IMAGE_URL;
  companyName: any;
  menuColor: any;

  languageChangeSubscription;
  navigationSubscription;
  companyId: any;
  
  constructor(
    private _router: Router,
    private _translateService: TranslateService,
  ) {
    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );
  }

  ngOnChanges(changes: SimpleChange) {
    let companyChange = changes["company"];
    if (companyChange?.currentValue?.id > 0) {
      let company = companyChange.currentValue;
      this.company = company;
      this.initializePage();
    }
  }

  async ngOnInit() {
    this.initializePage();

    setTimeout(() => {
      initFlowbite();
      this.companyId = this.company.id;
    }, 1000)
  }

  initializePage() {
    this.companyName = this.company?.entity_name;
    this.menuColor = this.company?.menu_color || "#ffffff";
    this.primaryColor = this.company?.primary_color || this.company?.button_color;
    this.buttonColor = this.company?.button_color || this.company?.primary_color;
    this.logoSrc = `${COMPANY_IMAGE_URL}/${this.company?.image}`;
  }

  getMenuTitle(menu) {
    let text = menu?.new_url == 1 && this.isUESchoolOfLife ? 'Vida Universitaria' :
      (this.language == "en"
        ? menu.name
        : this.language == "fr"
        ? menu.name_FR || menu.name_ES
        : this.language == "eu"
        ? menu.name_EU || menu.name_ES
        : this.language == "ca"
        ? menu.name_CA || menu.name_ES
        : this.language == "de"
        ? menu.name_DE || menu.name_ES
        : this.language == "it"
        ? menu.name_IT || menu.name_ES
        : menu.name_ES);

    if(this.isUESchoolOfLife && text?.indexOf('de Vida Universitaria') >= 0) {
      text = text?.replace('de Vida Universitaria', 'de School of Life')
    }

    if(this.company?.id == 32 && !this.isUESchoolOfLife) {
      text = text?.replace("University Life Activities School of Life", "School of Life Activities")
    }

    return text;
  }

  navigateToPage(menu) {
    let link = menu?.path == 'home' ? '/' : menu?.path
    this.goToPage(link);
  }

  goToPage(link) {
    this._router.navigate([link])
    .then(() => {
      window.location.reload();
    });
  }

  getFormattedAvailableBalanceAmount(user) {
    let currency = user?.currency || 'EUR';
    let amount = user?.available_balance || 0;
    let amount_in_text = `${currency} ${amount?.toString()?.replace('.', ',')}`;
    return amount_in_text;
  }

  ngOnDestroy() {
    this.navigationSubscription?.unsubscribe();
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}