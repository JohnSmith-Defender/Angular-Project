import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, PageTitleComponent, ToastComponent } from "@share/components";
import { LocalService, CompanyService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { initFlowbite } from "flowbite";
import { ServiciosService } from "@features/services";
import get from "lodash/get";

@Component({
  selector: 'app-services-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    BreadcrumbComponent,
    NgOptimizedImage,
    ToastComponent,
    PageTitleComponent,
  ],
  templateUrl: './detail.component.html'
})
export class ServiceDetailComponent {
  private destroy$ = new Subject<void>();

  @Input() id!: number;

  languageChangeSubscription;
  emailDomain;
  user;
  canCreate: boolean = false;
  language: any;
  userId: any;
  companyId: any;
  pageName: any;
  pageDescription: any;
  companies: any;
  primaryColor: any;
  buttonColor: any;
  hoverColor: any;
  superAdmin: boolean = false;
  company: any;
  level1Title: string = "";
  level2Title: string = "";
  level3Title: string = "";
  level4Title: string = "";
  serviceData: any;
  service: any;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  featureId: any;
  servicesFeature: any;
  editHover: boolean = false;
  deleteHover: boolean = false;
  message: any = '';
  dialogMode: string = "";
  dialogTitle: any;
  errorMessage: string = '';
  processing: boolean = false;
  apiPath: string = environment.api + '/';
  serviceTruncatedDescription: any;
  serviceExpandedDescription: boolean = false;
  truncate: number = 200;
  invitationLinkActive: boolean = false;
  invitationLink: any;
  emailTo: any;
  stripeSubscriptionActive: boolean = false;
  payHover: any;

  constructor(
    private _router: Router,
    private _serviciosService: ServiciosService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.language =
      this._localService.getLocalStorage(environment.lslang) || "es";
    this._translateService.use(this.language || "es");

    this.emailDomain = this._localService.getLocalStorage(environment.lsemail);
    this.userId = this._localService.getLocalStorage(environment.lsuserId);
    this.companyId = this._localService.getLocalStorage(
      environment.lscompanyId
    );
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
      this.company = company[0];
      this.emailDomain = company[0].domain;
      this.companyId = company[0].id;
      this.primaryColor = company[0].primary_color;
      this.buttonColor = company[0].button_color
        ? company[0].button_color
        : company[0].primary_color;
      this.hoverColor = company[0].hover_color
        ? company[0].hover_color
        : company[0].primary_color;
    }

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang;
          this.initializePage();
        }
      );

    this.getService();

    setTimeout(() => {
      initFlowbite();
    }, 2000);
  }

  getService() {
    this._serviciosService
      .fetchService(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.serviceData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.serviceData;
    this.user = data?.user_permissions?.user;
    this.mapFeatures(data?.features_mapping);
    this.mapSubfeatures(data?.settings?.subfeatures);
    this.mapUserPermissions(data?.user_permissions);
    this.formatService(data?.service);
    this.initializeBreadcrumb(data);
  }

  mapFeatures(features) {
    this.servicesFeature = features?.find((f) => f.feature_id == 14);
    this.featureId = this.servicesFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.servicesFeature);
    this.pageDescription = this.getFeatureDescription(this.servicesFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.stripeSubscriptionActive = subfeatures.some(
        (a) => a.name_en == "Service subscription via Stripe" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 14
      );
  }

  async formatService(single_service) {
    let service = {
      id: single_service.id,
      name: single_service.name,
      description: single_service.description,
      display_description: single_service.description,
      contact_person_id: single_service.contact_person_id,
      contact_person: single_service.contact_person,
      phone_number: single_service.phone_number,
      image: `${environment.api}/get-image/${single_service.image}`,
      company_id: single_service.company_id,
      subscription_fee: single_service.subscription_fee,
      product_id: single_service.product_id,
      plan_id: single_service.plan_id,
      service_type: single_service.service_type,
      link: single_service.link,
      text: single_service.text,
      created_by: single_service.created_by,
      creator: single_service.creator,
      created_at: single_service.created_at,
      service_users: single_service?.service_users
    }
    
    this.service = service;
    this.service.service_member = false;
    let service_users = this.service.service_users;
    if(service_users?.length > 0) {
      service_users.forEach(service => {
        if(service.user_id == this.userId) {
          this.service.service_member = true;
        }
      });
    }
    if(this.service?.display_description && this.service?.display_description?.length > this.truncate) {
      this.serviceTruncatedDescription = this.getExcerpt(this.service?.display_description);
    } else {
      this.serviceTruncatedDescription = this.service?.display_description;
    }

    this.emailTo = `mailto:${this.service?.contact_person?.email}?Subject=Inquiries`;
  }

  initializeBreadcrumb(data) {
    this.level1Title = this.pageName;
    this.level2Title = "";
    this.level3Title = "";
    this.level4Title = "";
  }

  getFeatureTitle(feature) {
    return feature
      ? this.language == "en"
        ? feature.name_en ||
          feature.feature_name ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "fr"
        ? feature.name_fr ||
          feature.feature_name_FR ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "eu"
        ? feature.name_eu ||
          feature.feature_name_EU ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "ca"
        ? feature.name_ca ||
          feature.feature_name_CA ||
          feature.name_es ||
          feature.feature_name_ES
        : this.language == "de"
        ? feature.name_de ||
          feature.feature_name_DE ||
          feature.name_es ||
          feature.feature_name_ES
        : feature.name_es || feature.feature_name_ES
      : "";
  }

  getFeatureDescription(feature) {
    return feature
      ? this.language == "en"
        ? feature.description_en || feature.description_es
        : this.language == "fr"
        ? feature.description_fr || feature.description_es
        : this.language == "eu"
        ? feature.description_eu || feature.description_es
        : this.language == "ca"
        ? feature.description_ca || feature.description_es
        : this.language == "de"
        ? feature.description_de || feature.description_es
        : feature.description_es
      : "";
  }

  getExcerpt(description) {
    let charlimit = this.truncate;
    if (!description || description.length <= charlimit) {
      return description;
    }

    let without_html = description.replace(/<(?:.|\n)*?>/gm, "");
    let shortened = without_html.substring(0, charlimit) + "...";
    return shortened;
  }

  readMore() {
    this.serviceExpandedDescription = true;
    this.serviceTruncatedDescription = this.service?.display_description;
  }

  showLess() {
    this.serviceExpandedDescription = false;
    if(this.service?.display_description?.length > this.truncate) {
      this.serviceTruncatedDescription = this.getExcerpt(this.service?.display_description);
    } else {
      this.serviceTruncatedDescription = this.service?.display_description;
    }
  }

  openLink(link) {
    window.open(link, "_blank");
  }

  copyText() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = window.location.href;
    
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    const copiedLink = `${this._translateService.instant('dialog.copiedlink')}`;
    this.open(copiedLink, '');
  }

  goToLink(link) {
    window.open(
        link,
        '_blank'
      );
  }

  toggleEditHover(event) {
    this.editHover = event;
  }

  handleEditRoute() {
    this._router.navigate([`/services/edit/${this.id}`]);
  }

  toggleDeleteHover(event) {
    this.deleteHover = event;
  }

  handleDelete() {
    if (this.id) {
      this.showConfirmationModal = false;
      this.selectedItem = this.id;
      this.confirmDeleteItemTitle = this._translateService.instant(
        "dialog.confirmdelete"
      );
      this.confirmDeleteItemDescription = this._translateService.instant(
        "dialog.confirmdeleteitem"
      );
      this.acceptText = "OK";
      setTimeout(() => (this.showConfirmationModal = true));
    }
  }

  confirm() {
    this.deleteService(this.id, true);
  }

  deleteService(id, confirmed) {
    if (confirmed) {
      this._serviciosService.deleteService(id)
        .subscribe(
          response => {
            this.open(
              this._translateService.instant("dialog.deletedsuccessfully"),
              ""
            );
            this._location.back();
          },
          error => {
            console.log(error)
          }
        )
    }
  }

  togglePayHover(event) {
    this.payHover = event;
  }

  subscribeToService() {
    if(this.service.subscription_fee && parseInt(this.service.subscription_fee) > 0) {
      this._router.navigate([`/services/payment/${this.service.id}/${this.userId}`]);
    } else {
      this._serviciosService.subscribeToASService(this.service.id, this.user.id, {})
      .subscribe(
        (res) => {
          if(res['message']) {
            location.reload();
          } else {
            this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          }
        },
        error => {
          this.open(this._translateService.instant('dialog.error'), '');
        });
    }
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
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
