import { CommonModule, Location } from "@angular/common";
import {
  Component,
  Input,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { JobOffersService } from "@features/services";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { BreadcrumbComponent, PageTitleComponent } from "@share/components";
import {
  LocalService,
  CompanyService,
} from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SafeContentHtmlPipe } from "@lib/pipes";
import { FormsModule } from "@angular/forms";
import { EditorModule } from "@tinymce/tinymce-angular";
import get from "lodash/get";

import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilepondPluginImagePreview from 'filepond-plugin-image-preview';
import FilepondPluginImageEdit from 'filepond-plugin-image-edit';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
registerPlugin(FilepondPluginImagePreview, FilepondPluginImageEdit, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

@Component({
  selector: 'app-job-offer-register',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatSnackBarModule,
    EditorModule,
    FilePondModule,
    BreadcrumbComponent,
    PageTitleComponent,
    SafeContentHtmlPipe,
  ],
  templateUrl: './register.component.html'
})
export class JobOfferRegisterComponent {
    private destroy$ = new Subject<void>();

    @Input() id!: number;

    languageChangeSubscription;
    language: any
    emailDomain: any
    companies: any
    companyName: any
    primaryColor: any
    buttonColor: any
    userId: any
    companyId: any
    isloading: boolean = true
    job: any
    features: any
    pageName: any
    fileName: any
    uploadComplete: boolean = false
    message: any
    company: any;
    jobOfferData: any;
    user: any;
    level1Title: string = "";
    level2Title: string = "";
    level3Title: string = "";
    level4Title: string = "";
    jobOffersFeature: any;
    featureId: any;
    jobDescription: any;
    pondFiles = [];
    @ViewChild('myPond', {static: false}) myPond: any;
    pondOptions = {
        class: 'my-filepond',
        multiple: false,
        labelIdle: 'Arrastra y suelta tu archivo o <span class="filepond--label-action" style="color:#00f;text-decoration:underline;"> Navegar </span><div><small style="color:#006999;font-size:12px;">*Subir archivos de no más de 2 MB</small></div>',
        acceptedFileTypes: 'application/pdf, application/msword, text/plain, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        maxFileSize: 2000000,
        labelMaxFileSizeExceeded: "El archivo es demasiado grande",
        labelMaxFileSize: "El tamaño máximo de archivo es {filesize}",
        labelFileProcessing: "En curso",
        labelFileProcessingComplete: "Carga completa",
        labelFileProcessingAborted: "Carga cancelada",
        labelFileProcessingError: "Error durante la carga",
        labelTapToCancel: "toque para cancelar",
        labelTapToRetry: "toca para reintentar",
        labelTapToUndo: "toque para deshacer",
        server: {
            process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
                const formData = new FormData();
                let fileExtension = file ? file.name.split('.').pop() : '';
                this.fileName = 'cv_' + this.companyId + '_' + this.getTimestamp() + '.' + fileExtension;
                formData.append('file', file, this.fileName);
                localStorage.setItem('cv_file', 'uploading');

                const request = new XMLHttpRequest();
                request.open('POST', environment.api + '/company/job/register/temp-upload');

                request.upload.onprogress = (e) => {
                    progress(e.lengthComputable, e.loaded, e.total);
                };

                request.onload = function () {
                    if (request.status >= 200 && request.status < 300) {
                        load(request.responseText);
                        localStorage.setItem('cv_file', 'complete')
                    } else {
                        error('oh no');
                    }
                };

                request.send(formData);

                return {
                    abort: () => {
                        request.abort();
                        abort();
                    },
                };
            },
        },
    };
  title: any;

    constructor(
        private _router: Router,
        private _jobOffersService: JobOffersService,
        private _companyService: CompanyService,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _location: Location,
        private _snackBar: MatSnackBar,
    ) {}

    async ngOnInit() {
        this.language = this._localService.getLocalStorage(environment.lslang)
        this._translateService.use(this.language || 'es')
        this.emailDomain = this._localService.getLocalStorage(environment.lsemail)
        this.userId = this._localService.getLocalStorage(environment.lsuserId)
        this.companyId = this._localService.getLocalStorage(environment.lscompanyId)
        this.companies = this._localService.getLocalStorage(environment.lscompanies) ? JSON.parse(this._localService.getLocalStorage(environment.lscompanies) ) : ''
        if(!this.companies) { this.companies = get(await this._companyService.getCompanies().toPromise(), 'companies') }
        let company = this._companyService.getCompany(this.companies)
        if(company && company[0]) {
          this.company = company[0]
          this.emailDomain = company[0].domain
          this.companyId = company[0].id
          this.companyName = company[0].entity_name
          this.primaryColor = company[0].primary_color
          this.buttonColor = company[0].button_color ? company[0].button_color : company[0].primary_color
        }
    
        this.languageChangeSubscription =
          this._translateService.onLangChange.subscribe(
            (event: LangChangeEvent) => {
              this.language = event.lang;
              this.initializePage();
            }
          );
    
        this.getJobOffer();
    }

    pondHandleInit() {
        console.log('FilePond has initialised', this.myPond);
    }
    
    pondHandleAddFile(event: any) {
        console.log('A file was added', event);
        if(!event.error) {
    
        }
    }

    getJobOffer() {
        this._jobOffersService
          .fetchJobOfferMin(this.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
              this.jobOfferData = data;
              this.initializePage();
            },
            (error) => {
              console.log(error);
            }
          );
    }

    initializePage() {
        let data = this.jobOfferData;
        this.mapFeatures(data?.features_mapping);
        this.job = data?.job_offer
        this.title = this.getOfferTitle(this.job);
        this.initializeBreadcrumb();
    }

    mapFeatures(features) {
        this.jobOffersFeature = features?.find((f) => f.feature_id == 5);
        this.featureId = this.jobOffersFeature?.feature_id;
        this.pageName = this.getFeatureTitle(this.jobOffersFeature);
    }

    initializeBreadcrumb() {
        this.level1Title = this.pageName;
        this.level2Title = this.job?.title;
        this.level3Title = this._translateService.instant('job-offers.register');
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

    getOfferTitle(offer) {
        return offer ? (this.language == 'en' ? (offer.title_en || offer.title) : (this.language == 'fr' ? (offer.title_fr || offer.title) : 
                (this.language == 'eu' ? (offer.title_eu || offer.title) : (this.language == 'ca' ? (offer.title_ca || offer.title) : 
                (this.language == 'de' ? (offer.title_de || offer.title) : offer.title)
            ))
        )) : ''
    }

    getJobDescriptionTitle() {
        return this.job ? this.language == 'en' ? (this.job.description_en || this.job.description) : (this.language == 'fr' ? (this.job.description_fr || this.job.description) : 
            (this.language == 'eu' ? (this.job.description_eu || this.job.description) : (this.language == 'ca' ? (this.job.description_ca || this.job.description) : 
            (this.language == 'de' ? (this.job.description_de || this.job.description) : this.job.description)
          ))
        ) : ''
    }

    public getTimestamp() {
        const date = new Date();
        const timestamp = date.getTime();
    
        return timestamp;
    }

    submit() {
        let cv_file_status = localStorage.getItem('cv_file')
        let cv_file = cv_file_status == 'complete' ? this.fileName : ''
        if(!cv_file) {
          return false
        }
    
        let params = {
          company_id: this.companyId,
          job_offer_id: this.id,
          user_id: this.userId,
          cv_filename: cv_file,
          message: this.message,
          created_by: this.userId,
        }
        this._jobOffersService.registerToJob(
            params
        ).subscribe(
            response => {
                this.open(this._translateService.instant('dialog.sentsuccessfully'), '');
                this._router.navigate([`/employmentchannel/details/${this.id}`])
            },
            error => {
                console.log('error')
            }
        )
    }

    async open(message: string, action: string) {
        await this._snackBar.open(message, action, {
            duration: 3000,
            panelClass: ["info-snackbar"],
        });
    }

    viewJob() {
        this._router.navigate([`/employmentchannel/details/${this.id}`])
    }

    handleGoBack() {
        this._location.back();
    }

    cancel() {
        this._location.back();
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}