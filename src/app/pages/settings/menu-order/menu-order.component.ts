import { Component, OnInit, ViewChild } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { MatListModule, MatSelectionList } from "@angular/material/list";
import { CommonModule, Location } from "@angular/common";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { BreadcrumbComponent, PageTitleComponent } from "@share/components";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { environment } from "@env/environment";
import { MenuService } from "@lib/services";
import get from "lodash/get";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    MatListModule,
    BreadcrumbComponent,
    PageTitleComponent,
  ],
  templateUrl: "./menu-order.component.html",
})
export class MenuOrderComponent implements OnInit {
  private destroy$ = new Subject<void>();

  languageChangeSubscription;
  id: any;
  userId: any;
  companyId: any;
  language: any;
  companies: any;
  userEmailDomain: any;
  primaryColor: any;
  buttonColor: any;
  otherSettings: any;
  hasLandingTemplate: boolean = false;

  tempData: any;
  dashboardDetails: any;
  features: any = [];
  selectedFeatures: any = [];
  includedFeatures: any = [];
  selectedFeatureId: any;
  hasMenuOrdering: boolean = false;
  menuOrdering: any;

  @ViewChild("includefeatures", { static: false }) includefeatures:
    | MatSelectionList
    | undefined;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";

  constructor(
    private _companyService: CompanyService,
    private _menuService: MenuService,
    private _translateService: TranslateService,
    private _location: Location,
    private _localService: LocalService,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
    this.language = this._localService.getLocalStorage(environment.lslang);
    if (!this.language) {
      this.language = "es";
    }
    this._translateService.use(this.language);
    this.companies = this._localService.getLocalStorage(environment.lscompanies)
      ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
      : "";
    if (!this.companies) {
      this.companies = get(
        await this._companyService.getCompanies().toPromise(),
        "companies"
      );
    }
    let company = this._companyService.getCompany(this.companies);
    if (company && company[0]) {
      this.userEmailDomain = company[0].domain;
      this.companyId = company[0].id;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.hasLandingTemplate =
        company[0].guest_access == 1 && company[0].landing_template == 1
          ? true
          : false;
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this.initializePage();
  }

  initializePage() {
    this.initializeBreadcrumb();
    this.getOtherSettings();
  }

  initializeBreadcrumb() {
    this.level1Title = this._translateService.instant(
      "company-settings.settings"
    );
    this.level2Title = this._translateService.instant(
      "company-settings.general"
    );
    this.level3Title = this._translateService.instant(
      "company-settings.companydetails"
    );
    this.level4Title = this._translateService.instant(
      "company-settings.menuorder"
    );
  }

  getOtherSettings() {
    this._companyService
      .getOtherSettings(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        async (response) => {
          this.otherSettings = response["other_settings"];
          if (this.otherSettings) {
            this.otherSettings.forEach((m) => {
              if (m.title_en == "General") {
                if (m.content) {
                  let menuOrderSettings = m.content.filter((c) => {
                    return c.title_en.indexOf("Menu items order") >= 0;
                  });
                  if (menuOrderSettings && menuOrderSettings[0]) {
                    this.hasMenuOrdering =
                      menuOrderSettings[0].active == 1 ? true : false;
                    if (this.hasMenuOrdering) {
                      this.getMenuOrdering();
                    } else {
                      this.getCompanyFeatures();
                    }
                  }
                }
              }
            });
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  async getMenuOrdering() {
    this.menuOrdering = this.companies = get(
      await this._menuService.getMenuOrder(this.companyId).toPromise(),
      "result"
    );
    this.getCompanyFeatures();
  }

  getCompanyFeatures() {
    this._companyService
      .getFeatures(this.userEmailDomain)
      .subscribe(async (res) => {
        this.features = res;
        this.selectedFeatures = [];
        if (this.hasLandingTemplate) {
          let home_sequence = 1;
          if (
            this.hasMenuOrdering &&
            this.menuOrdering &&
            this.menuOrdering.home_dashboard
          ) {
            let home_row = this.menuOrdering.home_dashboard.filter((hd) => {
              return hd.path == "home";
            });
            if (home_row && home_row[0]) {
              home_sequence = home_row[0].sequence;
            }
          }
          this.tempData = {
            id: 1,
            mapping_id: 1,
            feature_id: 1,
            path: "home",
            name: "Home",
            name_ES: "Inicio",
            name_FR: "Maison",
            name_EU: "Haci",
            name_CA: "Inici",
            name_DE: "Anfang",
            name_IT: "Casa",
            show: true,
            sequence: home_sequence,
          };
          this.selectedFeatures.push(this.tempData);
        }

        for (let i = 0; this.features.length > i; i++) {
          let tempData;
          let tempName = this.features[i].name_en
            ? this.features[i].name_en
            : this.features[i].feature_name;
          let tempPath = this.features[i].feature_name
            .replace(/\s/g, "")
            .toLowerCase();
          let name_ES = this.features[i].name_es
            ? this.features[i].name_es
            : this.features[i].feature_name_ES;
          let name_FR = this.features[i].name_fr
            ? this.features[i].name_fr
            : this.features[i].feature_name_FR;
          let name_EU = this.features[i].name_eu
            ? this.features[i].name_eu
            : this.features[i].feature_name_EU;
          let name_CA = this.features[i].name_ca
            ? this.features[i].name_ca
            : this.features[i].feature_name_CA;
          let name_DE = this.features[i].name_de
            ? this.features[i].name_de
            : this.features[i].feature_name_DE;
          let name_IT = this.features[i].name_it
            ? this.features[i].name_it
            : this.features[i].feature_name_IT;

          tempPath = tempPath == "cityagenda" ? "news" : tempPath;
          tempName = tempPath == "cityagenda" ? "News" : tempName;

          tempData = {
            id: this.features[i].id,
            mapping_id: this.features[i].mapping_id,
            feature_id: this.features[i].id,
            path: tempPath,
            name: tempName,
            name_ES: name_ES,
            name_FR: name_FR,
            name_EU: name_EU,
            name_CA: name_CA,
            name_DE: name_DE,
            name_IT: name_IT,
            show: true,
            sequence: this.features[i].sequence
              ? this.features[i].sequence
              : 3 + i,
          };

          if (this.features[i].id != 8 && this.features[i].id != 16) {
            this.selectedFeatures.push(tempData);
          }
        }

        if (this.hasMenuOrdering && this.selectedFeatures) {
          this.selectedFeatures = this.selectedFeatures.sort((a, b) => {
            return a.sequence - b.sequence;
          });
        }
      });
  }

  save() {
    if (this.selectedFeatures) {
      let ctr = 1;
      this.selectedFeatures.forEach((sf) => {
        sf.sequence = ctr;
        ctr++;
      });
    }

    let params = {
      company_id: this.companyId,
      features: this.selectedFeatures,
    };

    this._companyService.updateMenuOrder(params).subscribe(
      (response) => {
        if (response) {
          this.open(
            this._translateService.instant("dialog.savedsuccessfully"),
            ""
          );
          location.reload();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  onIncludeListControlChanged(list) {
    if (list) {
      this.includedFeatures = list.selectedOptions.selected.map(
        (item) => item.value
      );
    }
  }

  moveUp() {
    let selected_fields = this.selectedFeatures;
    let included_options = this.includedFeatures;

    let selected_option;
    if (included_options) {
      selected_option = included_options[0];
    }

    // get included option index
    let index = 0;
    if (selected_fields) {
      selected_fields.forEach((field, idx) => {
        if (field.id == selected_option.id) {
          index = idx;
        }
      });
    }

    if (index >= 1) this.swap(this.selectedFeatures, index, index - 1);
  }

  swap(array: any[], x: any, y: any) {
    var b = array[x];
    array[x] = array[y];
    array[y] = b;
  }

  moveDown() {
    let selected_fields = this.selectedFeatures;
    let included_options = this.includedFeatures;

    let selected_option;
    if (included_options) {
      selected_option = included_options[0];
    }

    // get included option index
    let index = 0;
    if (selected_fields) {
      selected_fields.forEach((field, idx) => {
        if (field.id == selected_option.id) {
          index = idx;
        }
      });
    }

    if (index < this.selectedFeatures.length - 1)
      this.swap(this.selectedFeatures, index, index + 1);
  }

  getFeatureTitle(feature) {
    return feature
      ? this.language == "en"
        ? feature.name ||
          feature.name_ES
        : this.language == "fr"
        ? feature.name_FR ||
          feature.name_ES
        : this.language == "eu"
        ? feature.name_EU ||
          feature.name_ES
        : this.language == "ca"
        ? feature.name_CA ||
          feature.name_ES
        : this.language == "de"
        ? feature.name_DE ||
          feature.name_ES
        : this.language == "it"
        ? feature.name_IT ||
          feature.name_ES
        : feature.name_ES
      : "";
  }

  handleGoBack() {
    this._location.back();
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}