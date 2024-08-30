import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Router } from '@angular/router'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import { WallService } from "@features/services";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, LocalService } from "@share/services";
import { MatSnackBar, MatSnackBarModule  } from '@angular/material/snack-bar';
import { Subject } from "rxjs";
import { environment } from "@env/environment";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";

@Component({
  selector: "app-wall-recent-members",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
  ],
  templateUrl: "./recent-members.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentMembersComponent {
  private destroy$ = new Subject<void>();

  @Input() title: any;
  @Input() members: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() groupId: any;
  @Input() userId: any;
  @Input() courseTutors: any;
  @Input() courseWallSettings: any;
  @Input() superAdmin: any;
  @Input() companyId: any;
  @Input() allCourseTutors: any;
  @Input() user: any;
  isTutor: boolean = false;
  showSendEmailModal: boolean = false;
  member: any;
  sendEmailForm: any;
  sendEmailFormSubmitted: boolean = false;
  errors: any = {};
  sendEmailErrorMessage: any;
  processingSendEmail: boolean = false;
  imageSrc: string = environment.api +  '/';
  apiPath: string = environment.api + '/';
  courseResourceSrc: string = environment.api +  '/get-course-unit-type-image/';
  @ViewChild("modalbutton", { static: false }) modalbutton:
    | ElementRef
    | undefined;
  @ViewChild("closemodalbutton", { static: false }) closemodalbutton:
    | ElementRef
    | undefined;

  constructor(
    private _router: Router,
    private _wallService: WallService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    this.sendEmailForm = new FormGroup({
      'subject': new FormControl('', [Validators.required]),
      'message': new FormControl('', [Validators.required]),
    })
  }

  getMemberImage(member) {
    let image = ''
    let memberImage = member.image
    if(!memberImage && member.CompanyUser) {
      memberImage = member.CompanyUser.image
    } 
    if(memberImage == 'default-avatar.jpg' || memberImage == 'empty_avatar.png') {
      image = './assets/images/default-profile.png'
    } else {
      image = this.imageSrc + memberImage
    }

    return image
  }

  getMemberName(member) {
    let memberName = `${member.first_name} ${member.last_name}`
    if(member.CompanyUser && (!memberName || (memberName && memberName.indexOf('undefined') >= 0))) {
      memberName = `${member.CompanyUser.first_name} ${member.CompanyUser.last_name}`
    }

    return memberName
  }

  showEmailForm(member) {
    this.sendEmailForm.reset();
    this.member = member?.CompanyUser;
    this.modalbutton?.nativeElement.click();
  }

  checkCurrent(member) {
    if(member.id == this.userId || member.user_id == this.userId) {
      return `(${this._translateService.instant('wall.you')})`
    }
  }

  checkCurrentTutor(id) {
    return this.courseTutors && this.courseTutors.some(a => a.id == id)
  }

  goToMembers() {
    this._router.navigate(['members']);
  }

  sendEmail() {
    this.sendEmailErrorMessage = ''
    this.sendEmailFormSubmitted = true

    if(!this.isValidEmailForm()) {
      return false
    }

    this.processingSendEmail = true

    let params = {
      'company_id': this.companyId,
      'user_id': this.member.id,
      'subject': this.sendEmailForm.get('subject').value,
      'message': this.sendEmailForm.get('message').value,
      'created_by': this.userId,
    }
    this._wallService.sendEmail(params).subscribe(data => {
      this.showSendEmailModal = false;
      this.open(this._translateService.instant('dialog.sentsuccessfully'), '');
      this.closemodalbutton?.nativeElement.click();
    }, err => {
      console.log('err: ', err)
      this.sendEmailErrorMessage = this._translateService.instant('dialog.error');
    })
  }

  isValidEmailForm() {
    let valid = true;
    this.errors = {}

    Object.keys(this.sendEmailForm.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.sendEmailForm.get(key).errors! || null;
      if(controlErrors != null) {
        valid = false;

        if(controlErrors["email"]) {
          this.errors[key] = this._translateService.instant('company-settings.invalidemailaddress')
        } else if(controlErrors["number"]) {
          this.errors[key] = this._translateService.instant('company-settings.numbersonly')
        } else if (controlErrors["minlength"]) {
          this.errors[key] = `${this._translateService.instant('dialog.atleast')} ${controlErrors["minlength"].requiredLength} ${this._translateService.instant('dialog.characters')}`
        } else if (controlErrors["maxlength"]) {
          this.errors[key] = `${this._translateService.instant('dialog.maximumof')} ${controlErrors["maxlength"].requiredLength} ${this._translateService.instant('dialog.characters')}`
        }
      }
    });
    return valid;
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
     duration: 3000,
   });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
