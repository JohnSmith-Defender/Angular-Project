import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Router } from "@angular/router";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from "@angular/core";
import { WallService } from "@features/services";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalService } from "@share/services";
import { MatSnackBar, MatSnackBarModule  } from '@angular/material/snack-bar';
import { Subject } from "rxjs";
import { environment } from "@env/environment";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-wall-tutors",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    FormsModule,
    NgOptimizedImage,
  ],
  templateUrl: "./tutors.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorsComponent {
  private destroy$ = new Subject<void>();

  @Input() tutorSectionVisible: any;
  @Input() courseTutors: any;
  @Input() superAdmin: any;
  @Input() userId: any;
  @Input() companyId: any;
  @Input() groupId: any;

  menus: any = [];
  isTutorsMenuActive: boolean = false;

  constructor(
    private _router: Router,
    private _wallService: WallService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.menus = this._localService.getLocalStorage(environment.lsmenus)
      ? JSON.parse(this._localService.getLocalStorage(environment.lsmenus))
      : [];
    if(this.menus?.length > 0) {
      let tutorsMenu = this.menus.filter((mn) => {
        return mn.name == "Tutors";
      });
      if(tutorsMenu?.length > 0) {
        this.isTutorsMenuActive = true;
      }
    }
  }

  toggleTutorSectionVisibility() {
    let new_state = !this.tutorSectionVisible
  
    let params = {
      company_id: this.companyId,
      group_id: this.groupId,
      mode: 'section',
      visible: new_state ? 1 : 0,
      created_by: this.userId,
    }

    this._wallService.editWallTutorSectionVisibility(params)
      .subscribe(
        (response) => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          this.tutorSectionVisible = new_state;
          this.cd.detectChanges();
        },
        error => {
          console.log(error)
        }
      )
  }

  getTutorName(tutor) {
    return `${tutor.first_name} ${tutor.last_name}`
  }

  getTutorImage(image) {
    return `${environment.api}/${image}`
  }

  toggleTutorVisibility(tutor) {
    let visible
    if(this.courseTutors?.length) {
      this.courseTutors.forEach(ct => {
        if(ct.tutor_id == tutor.tutor_id) {
          visible = !ct.visible
          ct.visible = visible
        }
      })
    }

    let params = {
      company_id: this.companyId,
      group_id: this.groupId,
      mode: 'tutor',
      tutor_id: tutor.tutor_id,
      visible: visible ? 1 : 0,
      created_by: this.userId,
    }

    this._wallService.editWallTutorVisibility(params)
      .subscribe(
        (response) => {
          this.open(this._translateService.instant('dialog.savedsuccessfully'), '');
          this.cd.detectChanges();
        },
        error => {
          console.log(error)
        }
      )
  }

  getTutorVisibleStatus(tutor) {
    let visible = true
    if(this.courseTutors?.length) {
      this.courseTutors.forEach(ct => {
        if(ct.tutor_id == tutor.tutor_id) {
          visible = ct.visible
        }
      })
    }

    return visible
  }

  goToTutors() {
    this._router.navigate(['tutors']);
  }

  async open(message: string, action: string) {
    await this._snackBar.open(message, action, {
        duration: 3000,
        panelClass: ["info-snackbar"],
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
