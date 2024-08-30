import { CommonModule } from "@angular/common";
import { Component, ElementRef, ViewChild } from "@angular/core";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { Router } from "@angular/router";
import {
  LocalService,
  CompanyService,
  UserService,
} from "src/app/share/services";
import { NoAccessComponent, PageTitleComponent } from "@share/components";
import { environment } from "@env/environment";
import { Subject, takeUntil } from "rxjs";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
    faRotateLeft,
    faRotateRight,
    faEye,
    faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
    ImageCropperModule,
    ImageCroppedEvent,
    ImageTransform,
    base64ToFile,
} from "ngx-image-cropper";
import { ColorPickerModule } from 'ngx-color-picker';
import { LeftImage } from "@lib/interfaces";
import leftImagesData from 'src/assets/data/left-images.json';
import get from "lodash/get";

@Component({
  standalone: true,
  imports: [
        CommonModule, 
        TranslateModule, 
        FormsModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        ImageCropperModule,
        ColorPickerModule,
        MatSnackBarModule,
        PageTitleComponent,
        NoAccessComponent,
    ],
    templateUrl: "./create.component.html",
})
export class CreateCustomerComponent {
    private destroy$ = new Subject<void>();

    language: any;
    userId: any;
    companyId: any;
    companies: any;
    primaryColor: any;
    buttonColor: any;
    isloading: boolean = true;
    languageChangeSubscription: any;
    menuColor: any;
    user: any;
    steps: any = [];
    currentStep: any = {};

    customerName: string = '';
    customerDomain: string = '';
    customerAccountName: string = '';
    customerAccountEmail: string = '';
    customerAccountPassword: string = '';
    customerAccountConfirmPassword: string = '';
    customerPrimaryColor: string = '#006999';
    customerButtonColor: string = '#006999';
    customerMenuTextColor: string = '#ffffff';
    customerHoverColor: string = '#525252';

    fieldTextType: boolean = false;
    fieldConfirmTextType: boolean = false;
    eyeIcon = faEye;
    eyeSlashIcon = faEyeSlash;

    companyImage: any
    companyDomain: any
    banner: any
    logoImageSrc: string = environment.api +  '/get-image-company/'
    logoImgSrc: any
    logoImageFile: any
    companyLogoFile: any
    bannerImgSrc: any
    bannerImageFile: any
    bannerFile: any
    showLogoImageCropper: boolean = false
    logoImageChangedEvent: any
    logoCroppedImage: any
    uploadedLogoSrc: any
    logoCanvasRotation = 0
    logoRotation = 0
    logoScale = 1
    logoTransform: ImageTransform = {};
    showBannerImageCropper: boolean = false
    bannerImageChangedEvent: any
    bannerCroppedImage: any
    uploadedBannerSrc: any
    bannerCanvasRotation = 0
    bannerRotation = 0
    bannerScale = 1
    bannerTransform: ImageTransform = {};
    logoFile: any

    companyBannerImage: any
    companyPageImage: any
    logoPageImgSrc: any
    logoPageImageFile: any
    companyLogoPageFile: any
    showLogoPageImageCropper: boolean = false
    logoPageImageChangedEvent: any
    uploadedLogoPageSrc: any
    logoPageCroppedImage: any
    logoPageCanvasRotation = 0
    logoPageRotation = 0
    logoPageScale = 1
    logoPageTransform: ImageTransform = {};
    rotateLeftIcon = faRotateLeft;
    rotateRightIcon = faRotateRight;
    dialogMode: string = "";
    dialogTitle: any;
    cancelledLogoUpload: boolean = false
    cancelledLogoPageUpload: boolean = false
    companyFaviconFile: any;
    leftImages: LeftImage[] = leftImagesData;
    @ViewChild('logoFileInput') logoFileInput: any
    @ViewChild('logoPageFileInput') logoPageFileInput: any
    @ViewChild("modalbutton", { static: false }) modalbutton:
        | ElementRef
        | undefined;
    @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
        | ElementRef
        | undefined;
    companyFeatures: any = [];
    allCompanyFeatures: any = [];
    creationInProgress: boolean = false;
    creationProgress: number = 0;
    creationLogs: any = '';
    createdCustomer: any;
    logoFileName: any;
    bannerFileName: any;

    constructor(
        private _router: Router,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _userService: UserService,
        private _snackBar: MatSnackBar,
    ) {}

    async ngOnInit() {
        this.userId = this._localService.getLocalStorage(environment.lsuserId);
        this.language = this._localService.getLocalStorage(environment.lslang);
        this._translateService.use(this.language || "es");

        let companies = this._localService.getLocalStorage(environment.lscompanies)
        ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies))
        : "";

        let company = this._companyService.getCompany(companies);
        if (company && company[0]) {
        this.companyId = company[0].id;
        this.companyDomain = company[0].domain;
        this.primaryColor = company[0].primary_color;
        this.buttonColor = company[0].button_color;
        this.menuColor = company[0].menu_color
            ? company[0].menu_color
            : "#ffffff";
        }

        this.user = this._localService.getLocalStorage(environment.lsuser);

        this.languageChangeSubscription =
        this._translateService.onLangChange.subscribe(
            (event: LangChangeEvent) => {
            this.language = event.lang;
            this.initializePage();
            }
        );

        this.initializePage();
    }

    async initializePage() {
        this.initializeSteps();
        this.getCompanyFeatures();
        this.isloading = false;
    }

    initializeSteps() {
        this.steps = [
            {
                index: 0,
                number: 1,
                text: this._translateService.instant('customer-onboarding.sitedetails'),
                completed: false,
                checked: false,
            },
            {
                index: 1,
                number: 2,
                text: this._translateService.instant('customer-onboarding.accountdetails'),
                completed: false,
                checked: false,
            },
            {
                index: 2,
                number: 3,
                text: this._translateService.instant('customer-onboarding.designdetails'),
                completed: false,
                checked: false,
            },
            {
                index: 3,
                number: 4,
                text: this._translateService.instant('customer-onboarding.featuresactivation'),
                completed: false,
                checked: false,
            },
            {
                index: 4,
                number: 5,
                text: this._translateService.instant('customer-onboarding.summary'),
                completed: false,
                checked: false,
            }
        ];
        this.currentStep = this.steps[0];
    }

    getCompanyFeatures() {
        this._companyService
            .allFeaturesList()
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                async (response) => {
                    let features = response['features'];
                    features = features?.filter(feature => {
                        return feature.id != 22
                    })
                    this.formatFeatures(features);
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    formatFeatures(features) {
        features = features?.map((item) => {
            return {
                ...item,
                id: item?.id,
                title: this.getFeatureTitle(item),
                description: this.getFeatureDescription(item),
                excerpt: this.getFeatureExcerpt(this.getFeatureDescription(item)),
            };
        });
    
        this.companyFeatures = features;
        this.allCompanyFeatures = features;
    }

    getFeatureTitle(feature) {
        return feature
          ? this.language == "en"
            ? feature.feature_name ||
              feature.feature_name_es
            : this.language == "fr"
            ? feature.feature_name_fr ||
              feature.feature_name_es
            : this.language == "eu"
            ? feature.feature_name_eu ||
              feature.feature_name_es
            : this.language == "ca"
            ? feature.feature_name_ca ||
              feature.feature_name_es
            : this.language == "de"
            ? feature.feature_name_de ||
              feature.feature_name_es
            : feature.feature_name_es
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

    getFeatureExcerpt(description) {
        let charlimit = 30;
        if (!description || description.length <= charlimit) {
        return description;
        }

        let without_html = description.replace(/<(?:.|\n)*?>/gm, "");
        let shortened = without_html.substring(0, charlimit) + "...";
        return shortened;
    }
    
    submit() {
        if(this.creationProgress == 100) {
            this._router.navigate([`/customer-onboarding`])
        } else {
            this.goToNextStep();
        }
    }

    goToNextStep() {
        if(this.currentStep?.number == 5) {
            this.initiateCustomerCreation();
        } else {
            const proceed = this.validateStep();

            if(proceed) {
                let row = this.steps?.find((f) => f.number == this.currentStep?.number);
                this.steps[row.index].completed = true;
                this.currentStep = this.steps[row?.index + 1];
            }
        }
    }

    initiateCustomerCreation() {
        this.creationInProgress = true;
        this.creationLogs = '';

        this.creationProgress = 5;
        this.addCustomer(25);
    }

    addCustomer(progress) {
        let params = {
            email: this.customerAccountEmail,
            password: this.customerAccountPassword,
            name: this.customerAccountName,
            company_name: this.customerName,
            domain: this.customerDomain + '.com',
            url: `${this.customerDomain}.vistingo.com`,
            primary_color: this.customerPrimaryColor,
            button_color: this.customerButtonColor,
            menu_color: this.customerMenuTextColor,
            hover_color: this.customerHoverColor,
        }

        this._companyService.addCustomer(
            params
        ).subscribe(
            response => {
                this.createdCustomer = response.customer;
                this.creationProgress = progress;
                this.creationLogs += `${this._translateService.instant('customer-onboarding.accountdetails')}...<b>${this._translateService.instant('create-content.done')}</b><br>`;
                this.addCustomerDesign(50);
            },
            error => {
                console.log(error);
            }
        )    
    }

    addCustomerDesign(progress) {
        this.logoFileName = 'cl_' + this.getTimestamp() + '.jpg';

        this._companyService.addCustomerLogo(
            this.createdCustomer?.id,
            this.companyLogoPageFile,
            this.logoFileName,
          ).subscribe(
            resImage => {
                this._companyService.addCustomerHeaderLogo(
                    this.createdCustomer?.id, 
                    this.companyLogoFile,
                    this.logoFileName,
                ).subscribe(
                    resLogo => {
                        this.bannerFileName = 'cl_' + this.getTimestamp() + '.jpg';
                        this._companyService.addCustomerBannerImage(
                            this.createdCustomer?.id,
                            this.bannerFile,
                            this.bannerFileName
                        ).subscribe(
                            resBanner => {
                                this.creationProgress = progress;
                                this.creationLogs += `${this._translateService.instant('customer-onboarding.designdetails')}...<b>${this._translateService.instant('create-content.done')}</b><br>`;
                                this.addCustomerFeatures(75);
                            },
                            error => {
                                console.log(error);
                            } 
                        )
                    },
                    error => {
                        console.log(error);
                    } 
                )
            },
            error => {
                console.log(error);
            } 
          )
    }

    getTimestamp() {
        const date = new Date();
        const timestamp = date.getTime();
    
        return timestamp;
    }

    addCustomerFeatures(progress) {
        let params = {
            company_id: this.createdCustomer?.id,
            features: this.companyFeatures,
            domain: this.createdCustomer?.domain,
            email: this.customerAccountEmail,
        }
        this._companyService.addCustomerFeatureMapping(
            params
          ).subscribe(
            resBanner => {
                this.creationProgress = progress;
                this.creationLogs += `${this._translateService.instant('customer-onboarding.featuresactivation')}...<b>${this._translateService.instant('create-content.done')}</b><br>`;
                this.addCustomerSettings(100);
            },
            error => {
                console.log(error);
            } 
          )
    }

    addCustomerSettings(progress) {
        let params = {
            company_id: this.createdCustomer?.id,
            email: this.customerAccountEmail,
            image: this.logoFileName,
        }
        this._companyService.addCustomerSettings(
            params
          ).subscribe(
            resBanner => {
                this.creationProgress = progress;
        this.currentStep[4].completed = true;
        this.creationLogs += `<b>${this._translateService.instant('company-reports.completed')}...</b><br>`;
            },
            error => {
                console.log(error);
            } 
          )
    }

    showCurrentStep(step) {
        if(step?.completed) {
            this.currentStep = this.steps[step?.index];
        }
    }

    validateStep() {
        let result = true;

        if(this.currentStep?.number == 1) {
            if(!this.customerName || !this.customerDomain) {
                result = false;
            }
        }

        if(this.currentStep?.number == 2) { 
            if(!this.customerAccountName || !this.customerAccountEmail ||
                !this.customerAccountPassword || !this.customerAccountConfirmPassword || 
                (this.customerAccountPassword && this.customerAccountConfirmPassword && this.customerAccountPassword != this.customerAccountConfirmPassword)) {
                result = false;
            }
        }

        if(this.currentStep?.number == 3) { 
            if(!this.logoPageImgSrc || !this.bannerImgSrc ||
                !this.customerPrimaryColor || !this.customerButtonColor ||
                !this.customerMenuTextColor || !this.customerHoverColor) {
                result = false;
            }
        }

        return result;
    }

    toggleFieldTextType() {
        this.fieldTextType = !this.fieldTextType;
    }
    
    toggleFieldConfirmTextType() {
        this.fieldConfirmTextType = !this.fieldConfirmTextType;
    }

    saveLogoBanner(mode: string = '') {
        if(mode == 'logo_page' && this.companyLogoPageFile) {
          this._companyService.editCompanyPhoto(
              this.companyId,
              this.companyLogoPageFile
            ).subscribe(
              async resImage => {
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
              },
              error => {
                  console.log(error);
              } 
            )
        } else if(mode == 'logo_header' && this.companyLogoFile) {
          this._companyService.editCompanyLogo(
              this.companyId,
              this.companyLogoFile
            ).subscribe(
              async resImage => {
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
              },
              error => {
                  console.log(error);
              } 
            )
        } else if(mode == 'left_banner' && this.bannerFile) {
          this._companyService.editCompanyVideo(
              this.companyId,
              this.bannerFile
            ).subscribe(
              async resImage => {
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
              },
              error => {
                  console.log(error);
              } 
            )
        } else if(mode == 'favicon' && this.companyFaviconFile) {
          this._companyService.editCompanyFavicon(
              this.companyId,
              this.companyFaviconFile
            ).subscribe(
              async resImage => {
                this.open(this._translateService.instant('dialog.savedsuccessfully'), '')
              },
              error => {
                  console.log(error);
              } 
            )
        }
    }
    
    logoPageFileChangeEvent(event: any): void {
        this.showLogoPageImageCropper = false;
        this.showBannerImageCropper = false;
        this.cancelledLogoPageUpload = false
        this.logoPageImageChangedEvent = event
        if(event && event.target.files && event.target.files.length > 0) {
            this.showLogoPageImageCropper = true
            this.dialogTitle = this._translateService.instant('club-create.uploadimage');
            setTimeout(() => {
                this.modalbutton?.nativeElement.click();
            }, 500);
        }
    }
    
    logoPageImageCropped(event: ImageCroppedEvent) {
        this.cancelledLogoPageUpload = false
        if(event.base64) {
          this.logoPageImgSrc = this.logoPageCroppedImage = event.base64
          this.uploadedLogoPageSrc = this.logoPageCroppedImage
          this.companyLogoPageFile = {
              name: 'image',
              image: base64ToFile(event.base64)
          }
        }
    }
    
    logoPageImageLoaded() {
        // show cropper
    }
    
    logoPageCropperReady() {
        // cropper ready
    }
    
    logoPageLoadImageFailed() {
        // show message
    }
    
    logoPageImageCropperModalSave() {
        this.showLogoImageCropper = false;
        this.closemodalbutton?.nativeElement.click();
    }
    
    logoPageImageCropperModalClose() {
        this.cancelledLogoPageUpload = true
        this.showLogoPageImageCropper = false;
    }
    
    clearLogoPagePhoto() {
        this.uploadedLogoPageSrc = null;
    }
    
    logoPageRotateLeft() {
        this.logoPageCanvasRotation--;
        this.logoFlipAfterRotate();
    }
    
    logoPageRotateRight() {
        this.logoPageCanvasRotation++;
        this.logoFlipAfterRotate();
    }

    private logoFlipAfterRotate() {
        const flippedH = this.logoTransform.flipH;
        const flippedV = this.logoTransform.flipV;
        this.logoTransform = {
            ...this.logoTransform,
            flipH: flippedV,
            flipV: flippedH
        };
    }    
    
    bannerFileChangeEvent(event: any): void {
        this.showLogoPageImageCropper = false;
        this.showBannerImageCropper = false;
        this.bannerImageChangedEvent = event;
        this.showBannerImageCropper = true;
        this.dialogTitle = this._translateService.instant('club-create.uploadimage');
        setTimeout(() => {
          this.modalbutton?.nativeElement.click();
        }, 500);
    }
    
    bannerImageCropped(event: ImageCroppedEvent) {
        if(event.base64) {
          this.bannerImgSrc = this.bannerCroppedImage = event.base64;
          this.uploadedBannerSrc = this.bannerCroppedImage;
          this.bannerFile = {
              name: 'image',
              image: base64ToFile(event.base64) //event.file
          };
        }
    }
    
    bannerImageLoaded() {
        // show cropper
    }
    
    bannerCropperReady() {
        // cropper ready
    }
    
    bannerLoadImageFailed() {
        // show message
    }
    
    bannerImageCropperModalSave() {
        this.showBannerImageCropper = false;
        this.closemodalbutton?.nativeElement.click();
    }
    
    bannerImageCropperModalClose() {
        this.showBannerImageCropper = false;
    }
    
    clearBannerPhoto() {
        this.uploadedBannerSrc = null;
    }
    
    bannerRotateLeft() {
        this.bannerCanvasRotation--;
        this.bannerFlipAfterRotate();
    }
    
    bannerRotateRight() {
        this.bannerCanvasRotation++;
        this.bannerFlipAfterRotate();
    }
    
    private bannerFlipAfterRotate() {
        const flippedH = this.bannerTransform.flipH;
        const flippedV = this.bannerTransform.flipV;
        this.bannerTransform = {
            ...this.bannerTransform,
            flipH: flippedV,
            flipV: flippedH
        };
    }

    public onEventLog(event: string, data: any): void {
        if(data && event == 'colorPickerClose') {

        }
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