import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Router } from '@angular/router'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  ViewChild
} from "@angular/core";
import { WallService } from "@features/services";
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { DomSanitizer } from '@angular/platform-browser';
import { CompanyService, LocalService } from "@share/services";
import { MatSnackBar, MatSnackBarModule  } from '@angular/material/snack-bar';
import { Subject } from "rxjs";
import { environment } from "@env/environment";
import { FormsModule } from "@angular/forms";
import get from 'lodash/get';

@Component({
  selector: "app-wall-resources",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSnackBarModule,
    FormsModule,
    NgOptimizedImage,
  ],
  templateUrl: "./resources.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcesComponent {
  private destroy$ = new Subject<void>();

  @Input() resource: any;

  courseLessonFileSrc: string = environment.api +  '/get-course-unit-file/';
  downloadCourseUnitSrc: string = environment.api +  '/guest/download-course-unit-file/';

  constructor(
    private router: Router,
    private _wallService: WallService,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
  ) { }

  async ngOnInit() {
    
  }

  viewCourseResource(resource) {
    if(resource.file) {
      window.open(
        `${this.courseLessonFileSrc}${resource.file}`,
        '_blank'
      );
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
