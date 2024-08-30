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
import { OffersService } from "@features/services/offers/offers.service";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { initFlowbite } from "flowbite";
import moment from "moment";
import get from "lodash/get";

@Component({
  selector: 'app-offers-detail',
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
export class OfferDetailComponent {
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
  offerData: any;
  offer: any;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  featureId: any;
  offersFeature: any;
  editHover: boolean = false;
  deleteHover: boolean = false;
  message: any = '';
  dialogMode: string = "";
  dialogTitle: any;
  errorMessage: string = '';
  processing: boolean = false;
  apiPath: string = environment.api + '/';
  offerTruncatedDescription: any;
  offerExpandedDescription: boolean = false;
  truncate: number = 200;
  codeHover: boolean = false;
  invitationLinkActive: boolean = false;
  invitationLink: any;
  emailTo: any;
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

  constructor(
    private _router: Router,
    private _offersService: OffersService,
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

    this.getOffer();

    setTimeout(() => {
      initFlowbite();
    }, 2000);
  }

  getOffer() {
    this._offersService
      .fetchOffer(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.offerData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.offerData;
    this.user = data?.user_permissions?.user;
    this.mapFeatures(data?.features_mapping);
    this.mapSubfeatures(data?.settings?.subfeatures);
    this.mapUserPermissions(data?.user_permissions);
    this.formatOffer(data?.offer);
    this.initializeBreadcrumb(data);
  }

  mapFeatures(features) {
    this.offersFeature = features?.find((f) => f.feature_id == 4);
    this.featureId = this.offersFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.offersFeature);
    this.pageDescription = this.getFeatureDescription(this.offersFeature);
  }

  mapSubfeatures(subfeatures) {
    if (subfeatures?.length > 0) {
      this.invitationLinkActive = subfeatures.some(
        (a) => a.name_en == "Offers & Rewards Invite Link" && a.active == 1
      );
    }
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 4
      );
  }

  async formatOffer(single_offer) {
    let offer = {
      id: single_offer.id,
      fk_company_id: single_offer.fk_company_id,
      fk_supercategory_id: single_offer.fk_supercategory_id,
      status: single_offer.status,
      display_title: this.getOfferTitle(single_offer),
      title: single_offer.title,
      title_en: single_offer.title_EN,
      title_fr: single_offer.title_FR,
      title_eu: single_offer.title_EU,
      title_ca: single_offer.title_CA,
      title_de: single_offer.title_DE,
      company: single_offer.company,
      address: single_offer.address,
      latitude: single_offer.latitude,
      longitude: single_offer.longitude,
      image: `${environment.api}/get-ie-image-disc/${single_offer.image}`,
      validSince: single_offer.validSince,
      validUntil: single_offer.validUntil ? moment(single_offer.validUntil).format('DD/MM/YY') : '',
      price: single_offer.price,
      percent: single_offer.percent,
      display_description: this.getOfferDescription(single_offer),
      description: single_offer.description,
      description_en: single_offer.description_EN,
      description_fr: single_offer.description_FR,
      description_eu: single_offer.description_EU,
      description_ca: single_offer.description_CA,
      description_de: single_offer.description_DE,
      notes: single_offer.notes,
      discountCode: single_offer.discountCode,
      openingHours: single_offer.openingHours,
      directions: single_offer.directions,
      website: single_offer.website,
      facebook: single_offer.facebook,
      instagram: single_offer.instagram,
      email: single_offer.email,
      phone: single_offer.phone,
      terms_and_conditions: single_offer.terms_and_conditions,
      fk_discount_supercategory_id: single_offer.fk_discount_supercategory_id,
      discount_type_id: single_offer.discount_type_id,
      created_by: single_offer.created_by,
      created: single_offer.created,
      discount_category: this.getCategoryTitle(single_offer.discount_category),
      discount_type: this.getTypeTitle(single_offer.discount_type),
      creator: single_offer?.creator
    }
    
    this.offer = offer;
    if(this.offer?.display_description && this.offer?.display_description?.length > this.truncate) {
      this.offerTruncatedDescription = this.getExcerpt(this.offer?.display_description);
    } else {
      this.offerTruncatedDescription = this.offer?.display_description;
    }

    this.emailTo = `mailto:${this.offer?.email}?Subject=Inquiries`;
    if(this.invitationLinkActive && this.userId) {
      let share_link = get(await this._offersService.getShareLink(this.userId, this.offer.id).toPromise(), 'share_link')
      this.invitationLink = share_link;
      this.emailTo = `mailto:${this.offer?.email}?Subject=Ofertas&Body=` + this.invitationLink;
    }
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

  getOfferTitle(offer) {
    return offer
      ? this.language == "en"
        ? offer.title_EN || offer.title
        : this.language == "fr"
        ? offer.title_FR || offer.title
        : this.language == "eu"
        ? offer.title_EU || offer.title
        : this.language == "ca"
        ? offer.title_CA || offer.title
        : this.language == "de"
        ? offer.title_DE || offer.title
        : offer.title
      : "";
  }

  getOfferDescription(offer) {
    return offer
      ? this.language == "en"
        ? offer.description_EN || offer.description
        : this.language == "fr"
        ? offer.description_FR || offer.description
        : this.language == "eu"
        ? offer.description_EU || offer.description
        : this.language == "ca"
        ? offer.description_CA || offer.description
        : this.language == "de"
        ? offer.description_DE || offer.description
        : offer.description
      : "";
  }

  getCategoryTitle(category) {
    return category
      ? this.language == "en"
        ? category.name_EN || category.name_ES
        : this.language == "fr"
        ? category.name_FR || category.name_ES
        : this.language == "eu"
        ? category.name_EU || category.name_ES
        : this.language == "ca"
        ? category.name_CA || category.name_ES
        : this.language == "de"
        ? category.name_DE || category.name_ES
        : category.name_ES
      : "";
  }

  getTypeTitle(type) {
    return type
      ? this.language == "en"
        ? type.name_EN || type.name_ES
        : this.language == "fr"
        ? type.name_FR || type.name_ES
        : type.name_ES
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
    this.offerExpandedDescription = true;
    this.offerTruncatedDescription = this.offer?.display_description;
  }

  showLess() {
    this.offerExpandedDescription = false;
    if(this.offer?.display_description?.length > this.truncate) {
      this.offerTruncatedDescription = this.getExcerpt(this.offer?.display_description);
    } else {
      this.offerTruncatedDescription = this.offer?.display_description;
    }
  }

  toggleCodeHover(event) {
    this.codeHover = event;
  }

  handleShowCode() {
    this.modalbutton?.nativeElement.click();
  }

  copyText() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    if(this.invitationLinkActive) {
      selBox.value = this.invitationLink;
    } else {
      selBox.value = window.location.href;
    }
    
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
    this._router.navigate([`/discounts/edit/${this.id}`]);
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
    this.deleteOffer(this.id, true);
  }

  deleteOffer(id, confirmed) {
    if (confirmed) {
      this._offersService.deleteDiscount(this.id)
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
