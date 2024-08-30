import { CommonModule, NgOptimizedImage, Location } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { CityGuidesService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, ToastComponent } from "@share/components";
import { LocalService, CompanyService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { initFlowbite } from "flowbite";
import { GoogleMap, GoogleMapsModule, MapInfoWindow, MapMarker } from "@angular/google-maps";
import get from "lodash/get";
declare var google: any;

@Component({
  selector: "app-clubs-detail",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    GoogleMapsModule,
    BreadcrumbComponent,
    NgOptimizedImage,
    ToastComponent,
  ],
  templateUrl: "./detail.component.html",
})
export class CityGuideDetailComponent {
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
  cityGuideData: any;
  cityGuide: any;
  cityGuideOwner: boolean = false;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: any;
  confirmDeleteItemDescription: any;
  acceptText: string = "";
  cancelText: any = "";
  confirmMode: string = "";
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  featureId: any;
  cityGuidesFeature: any;
  cityGuideTitle: any;
  cityGuideExcerpt: any;
  cityGuideLikes: any = [];
  cityGuideLikeText: string = "";
  cityGuideImage: any;
  cityGuideDescription: any;
  reacted: boolean = false;
  liked: boolean = false;
  cityGuideItems: any = [];
  editHover: boolean = false;
  deleteHover: boolean = false;

  options: google.maps.MapOptions = {
    mapTypeId: 'hybrid',
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 15,
    minZoom: 8,
  };
  infoContent = '';
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap | undefined;
  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow | undefined;

  constructor(
    private _router: Router,
    private _cityGuidesService: CityGuidesService,
    private _companyService: CompanyService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _location: Location,
    private _snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    initFlowbite();
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

    this.getCityGuide();
  }

  zoomIn() {
    
  }
 
  zoomOut() {
    
  }

  getCityGuide() {
    this._cityGuidesService
      .fetchCityGuide(this.id, this.companyId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.cityGuideData = data;
          this.initializePage();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  initializePage() {
    let data = this.cityGuideData;
    this.user = data?.user_permissions?.user;
    this.mapFeatures(data?.features_mapping);
    this.mapUserPermissions(data?.user_permissions);
    this.formatCityGuide(data);
    this.initializeBreadcrumb(data?.city_guide);
  }

  mapFeatures(features) {
    this.cityGuidesFeature = features?.find((f) => f.feature_id == 3);
    this.featureId = this.cityGuidesFeature?.feature_id;
    this.pageName = this.getFeatureTitle(this.cityGuidesFeature);
  }

  mapUserPermissions(user_permissions) {
    this.superAdmin = user_permissions?.super_admin_user ? true : false;
    this.canCreate =
      user_permissions?.create_plan_roles?.length > 0 ||
      user_permissions?.member_type_permissions?.find(
        (f) => f.create == 1 && f.feature_id == 3
      );
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

  initializeBreadcrumb(data) {
    this.level1Title = this.pageName;
    this.level2Title = this.getCityGuideName(data);
    this.level3Title = "";
    this.level4Title = "";
  }

  formatCityGuide(data) {
    this.cityGuide = data?.city_guide;
    this.cityGuideImage = `${environment.api}/get-image/${this.cityGuide?.image}`;
    this.cityGuideExcerpt = this.getCityGuideExcerpt(this.cityGuide);
    this.cityGuideOwner = this.userId == this.cityGuide.user_id ? true : false;
    this.cityGuideDescription = this.getCityGuideDescription(this.cityGuide);
    this.formatLikes(data?.city_guide_likes);
    this.cityGuideItems = this.formatCityGuideItems(data?.city_guide_items);
  }

  getCityGuideName(guide) {
    this.cityGuideTitle =
      this.language == "en"
        ? guide.name_EN
          ? guide.name_EN || guide.name_ES
          : guide.name_ES
        : this.language == "fr"
        ? guide.name_FR
          ? guide.name_FR || guide.name_ES
          : guide.name_ES
        : this.language == "eu"
        ? guide.name_EU
          ? guide.name_EU || guide.name_ES
          : guide.name_ES
        : this.language == "ca"
        ? guide.name_CA
          ? guide.name_CA || guide.name_ES
          : guide.name_ES
        : this.language == "de"
        ? guide.name_DE
          ? guide.name_de || guide.name_ES
          : guide.name_ES
        : guide.name_ES;
    return this.cityGuideTitle;
  }

  getCityGuideExcerpt(guide) {
    return this.language == "en"
      ? guide.leadin_EN
        ? guide.leadin_EN || guide.leadin_ES
        : guide.leadin_ES
      : this.language == "fr"
      ? guide.leadin_FR
        ? guide.leadin_FR || guide.leadin_ES
        : guide.leadin_ES
      : this.language == "eu"
      ? guide.leadin_EU
        ? guide.leadin_EU || guide.leadin_ES
        : guide.leadin_ES
      : this.language == "ca"
      ? guide.leadin_CA
        ? guide.leadin_CA || guide.leadin_ES
        : guide.leadin_ES
      : this.language == "de"
      ? guide.leadin_DE
        ? guide.leadin_de || guide.leadin_ES
        : guide.leadin_ES
      : guide.leadin_ES;
  }

  getCityGuideDescription(guide) {
    return guide
      ? this.language == "en"
        ? guide.description_EN || guide.description_ES
        : this.language == "fr"
        ? guide.description_FR || guide.description_ES
        : this.language == "eu"
        ? guide.description_EU || guide.description_ES
        : this.language == "ca"
        ? guide.description_CA || guide.description_ES
        : this.language == "de"
        ? guide.description_DE || guide.description_ES
        : guide.description_ES
      : "";
  }

  getCityGuideItemTitle(guide) {
    return this.language == "en"
      ? guide.title_EN
        ? guide.title_EN || guide.title_ES
        : guide.title_ES
      : this.language == "fr"
      ? guide.title_FR
        ? guide.title_FR || guide.title_ES
        : guide.title_ES
      : this.language == "eu"
      ? guide.title_EU
        ? guide.title_EU || guide.title_ES
        : guide.title_ES
      : this.language == "ca"
      ? guide.title_CA
        ? guide.title_CA || guide.title_ES
        : guide.title_ES
      : this.language == "de"
      ? guide.title_DE
        ? guide.title_de || guide.title_ES
        : guide.title_ES
      : guide.title_ES;
  }

  formatLikes(likes) {
    let likes_only = likes?.filter((like) => {
      return like?.like == 1;
    });
    this.cityGuideLikes = likes_only?.map((like) => {
      return {
        ...like,
        image: `${environment.api}/${like.image}`,
      };
    });
    this.cityGuideLikeText =
      likes_only?.length > 0
        ? `${likes_only?.length}+ ${this._translateService.instant(
            "wall.likes"
          )}`
        : "";

    let user_like = likes?.find((f) => f.user_id == this.userId);
    this.reacted = user_like?.id > 0 ? true : false;
    if (this.reacted) {
      this.liked = user_like?.like == 1 ? true : false;
    }
  }

  formatCityGuideItems(data) {
    let items = data?.map((item) => {
      let center;
      if (item.latitude && item?.longitude) {
        center = {
          lat: item?.latitude ? parseFloat(item?.latitude) : 0,
          lng: item?.longitude ? parseFloat(item?.longitude) : 0,
        };
      }
      return {
        ...item,
        title: this.getCityGuideItemTitle(item),
        description: this.getCityGuideDescription(item),
        image: item?.image ? `${environment.api}/get-image/${item?.image}` : '',
        center,
        markers: this.getMarker(item, center),
        distance: item?.distance_from_city
          ? item?.distance_from_city?.replace(".00", "")?.replace(".", "")
          : "",
      };
    });
    return items;
  }

  getMarker(item, center) {
    let markers: any[] = [];

    if (item?.latitude && item?.longitude) {
      markers.push({
        position: {
          lat: center.lat,
          lng: center.lng,
        },
      });
    }
    return markers;
  }

  openInfo(marker: MapMarker, content) {
    this.infoContent = content;
    this.info?.open(marker);
  }

  handleDelete() {
    if (this.id) {
      this.showConfirmationModal = false;
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
    this.deleteCityGuide(this.id, true);
  }

  deleteCityGuide(id, confirmed) {
    if (confirmed) {
      this._cityGuidesService.deleteCityGuide(id, this.userId).subscribe(
        (response) => {
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
          this._location.back();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  thumbsUp() {
    let mode = "thumbs_up";
    let params = {
      user_id: this.userId,
      object_id: this.id,
      company_id: this.companyId,
      mode: mode,
    };
    this.updateCityGuideLike(params, mode);
  }

  removeThumbsUp() {
    let mode = "remove_thumbs_up";
    let params = {
      user_id: this.userId,
      object_id: this.id,
      company_id: this.companyId,
      mode: mode,
    };
    this.updateCityGuideLike(params, mode);
  }

  thumbsDown() {
    let mode = "thumbs_down";
    let params = {
      user_id: this.userId,
      object_id: this.id,
      company_id: this.companyId,
      mode: mode,
    };
    this.updateCityGuideLike(params, mode);
  }

  removeThumbsDown() {
    let mode = "remove_thumbs_down";
    let params = {
      user_id: this.userId,
      object_id: this.id,
      company_id: this.companyId,
      mode: mode,
    };
    this.updateCityGuideLike(params, mode);
  }

  updateCityGuideLike(params, mode) {
    this._cityGuidesService.updateCityGuideLike(params).subscribe(
      (response) => {
        if (mode == "thumbs_up") {
          this.reacted = true;
          this.liked = true;
        } else if (mode == "remove_thumbs_up") {
          this.reacted = false;
          this.liked = false;
        } else if (mode == "thumbs_down") {
          this.reacted = true;
          this.liked = false;
        } else if (mode == "remove_thumbs_down") {
          this.reacted = false;
          this.liked = false;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  handleEditRoute() {
    this._router.navigate([`/cityguide/edit/${this.id}`]);
  }

  toggleEditHover(event) {
    this.editHover = event;
  }

  toggleDeleteHover(event) {
    this.deleteHover = event;
  }

  handleGoBack() {
    this._location.back();
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
      duration: 3000,
      panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy() {
    this.languageChangeSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}