import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, HostListener, Input, SimpleChange, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService, ExcelService, LocalService } from '@share/services';
import { Subject, takeUntil } from 'rxjs';
import { IconFilterComponent } from '@share/components';
import { SearchComponent } from '@share/components/search/search.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CoursesService } from '@features/services';
import { initFlowbite } from "flowbite";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import moment from "moment";

@Component({
    selector: 'app-courses-statistics-list',
    standalone: true,
    imports: [
        CommonModule, 
        TranslateModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        SearchComponent,
        IconFilterComponent,
        NgOptimizedImage
    ],
    templateUrl: './statistics-list.component.html',
})
export class CoursesStatisticsListComponent {
    private destroy$ = new Subject<void>();

    @Input() company: any;
    @Input() buttonColor: any;
    @Input() primaryColor: any;
    @Input() plansTitle: any;
    @Input() userId: any;
    @Input() superAdmin: any;
    @Input() language: any;
    @Input() isUESchoolOfLife: any;

    languageChangeSubscription;
    isMobile: boolean = false;
    searchText: any;
    placeholderText: any;
    coursesData: any = [];
    dataSource: any;
    displayedColumns = ["title", "students"];
    pageSize: number = 10;
    pageIndex: number = 0;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | undefined;
    @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
    courseStudents: any = [];
    searchKeyword: any;
    date: Date = new Date();
    allCoursesData: any[] = [];
    selectedCity: any;
    allPlanDrafts: any = [];
    expandedCourseId: any = '';
    cities: any;
    list: any;
    userCreditLogs: any;
    selectedAttendanceStatusFilter: any = '';
    selectedDateFilter: any;
    selectedStartDate: any;
    selectedEndDate: any;
    dateRange = new FormGroup({
        start: new FormControl(),
        end: new FormControl(),
    });
    courseRatings: any;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _localService: LocalService,
        private _companyService: CompanyService,
        private _coursesService: CoursesService,
        private _excelService: ExcelService,
    ) { }

    @HostListener("window:resize", [])
    private onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    async ngOnInit() {
        this.onResize();

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
        setTimeout(() => {
            initFlowbite();
        }, 500);
        this.fetchCoursesManagementData();
        this.initializeSearch();
    }

    fetchCoursesManagementData() {
        this._coursesService
          .fetchCoursesManagementData(this.company?.id, this.isUESchoolOfLife)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
                this.courseStudents = data?.course_students || [];
                this.userCreditLogs = data?.user_credit_logs || [];
                this.courseRatings = data?.course_ratings || [];
                this.formatCourses(data?.courses || []);

                this.cities = data?.cities;
                this.initializeIconFilterList(this.cities);
            },
            (error) => {
              console.log(error);
            }
          );
    }

    initializeSearch() {
        this.searchText = this._translateService.instant("guests.search");
        this.placeholderText = this._translateService.instant("news.searchbykeyword");
    }

    initializeIconFilterList(list) {
        this.list = [
            {
                id: "All",
                value: "",
                text: this._translateService.instant("plans.all"),
                selected: true,
                company_id: this.company?.id,
                city: "",
                province: "",
                region: "",
                country: "",
                sequence: "",
                campus: "",
            },
        ];
    
        list?.forEach((item) => {
            this.list.push({
                id: item.id,
                value: item.id,
                text: item.city,
                selected: false,
                company_id: item.company_id,
                city: item.city,
                province: item.province,
                region: item.region,
                country: item.country,
                sequence: item.sequence,
                campus: item.campus,
            });
        });
    }

    formatCourses(courses) {
        let data 
        if(courses?.length > 0) {
            data = courses?.map(course => {
                let students = this.courseStudents?.filter(pp => {
                    return pp.course_id == course.id
                })
                let completed = students?.filter(p => {
                    return p.progress == 100
                })

                students = students?.map((student) => {
                    return {
                      ...student,
                      credits: this.getUserCourseCredits(student),
                      course_credits: student.credits,
                      ratings: this.getUserCourseRatings(course, student)
                    };
                });

                return {
                    ...course,
                    students,
                    completed
                }
            })
        }
        if(this.allCoursesData?.length == 0) {
            this.allCoursesData = data
        }
        
        this.loadCourses(data);
    }

    getUserCourseCredits(student) {
        let credits = '';

        if(this.userCreditLogs?.length > 0) {
            let user_credit = this.userCreditLogs?.filter(usc => {
                return usc.user_id == student.user_id && student.course_id == usc.course_id
            })
            if(user_credit?.length > 0) {
                credits = user_credit[0].credits;
            }
        }

        return credits;
    }

    getUserCourseRatings(course, student) {
        let ratings = '';

        if(this.courseRatings?.length > 0) {
            let user_rating = this.courseRatings?.filter(p => {
                return p.course_id == course.id && student.user_id == p.created_by
            })
            if(user_rating?.length > 0) {
                ratings = user_rating[0].rating;
            }
        }

        return ratings;
    }

    handleSearch(event) {
        this.searchKeyword = event;
        this.loadCourses(this.allCoursesData);
    }

    loadCourses(data) {
        this.coursesData = data;

        if(this.searchKeyword && this.coursesData) {
            this.coursesData = this.coursesData.filter(p => {
              return p.title && p.title.toLowerCase().indexOf(this.searchKeyword.toLowerCase()) >= 0 
            })
        }

        // if(this.selectedCity) {
        //     this.coursesData = this.coursesData.filter(p => {
        //         return p.address && p.address.toLowerCase().indexOf(this.selectedCity.toLowerCase()) >= 0 
        //     })
        // }

        // if(this.selectedStartDate && this.selectedEndDate) {
        //     this.coursesData = this.coursesData?.filter((plan) => {
        //       let include = false
      
        //       let formatted_plan_date = moment(plan?.plan_date)?.format('YYYY-MM-DD');
        //       if(
        //         moment(formatted_plan_date).isSameOrAfter(moment(this.selectedStartDate))
        //         && moment(formatted_plan_date).isSameOrBefore(moment(this.selectedEndDate))
        //        ) {
        //         include = true;
        //       }
      
        //       return include
        //     })
        // }

        this.refreshTable(this.coursesData);
    }

    refreshTable(list) {
        this.dataSource = new MatTableDataSource(list)
        if (this.sort) {
            this.dataSource.sort = this.sort;
        } else {
            setTimeout(() => this.dataSource.sort = this.sort);
        }

        if (this.paginator) {
            this.dataSource.paginator = this.paginator
            this.paginator.firstPage()
        } else {
            setTimeout(() => {
                this.dataSource.paginator = this.paginator
                this.paginator?.firstPage()
            });
        }
    }

    getPageDetails(event: any) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.dataSource = new MatTableDataSource(
          this.coursesData.slice(
            event.pageIndex * event.pageSize,
            (event.pageIndex + 1) * event.pageSize
          )
        );
        if (this.sort) {
          this.dataSource.sort = this.sort;
        } else {
          setTimeout(() => (this.dataSource.sort = this.sort));
        }
    }

    viewItem(id) {
        this._router.navigate([]).then(result => {  window.open(`courses/details/${id}`, 'self'); });
    }

    async open(message: string, action: string) {
      await this._snackBar.open(message, action, {
          duration: 3000,
          panelClass: ["info-snackbar"],
      });
    }

    filterCity(event) {
        this.list?.forEach((item) => {
            if (item.city === event) {
              item.selected = true;
            } else {
              item.selected = false;
            }
        });
        this.selectedCity = event || "";
        this.loadCourses(this.allCoursesData);
    }

    expandStudents(row) {
        this.expandedCourseId = this.expandedCourseId == row.id ? '' : row.id
    }

    handleDateChange(type, event) {
        if (type == "start") {
          if(moment(event?.value).isValid()) {
            this.selectedStartDate = moment(event.value).format("YYYY-MM-DD");
          } else {
            this.selectedStartDate = '';
          }
        }
        if (type == "end") {
          if(moment(event?.value).isValid()) {
            this.selectedEndDate = moment(event.value).format("YYYY-MM-DD");
          } else {
            this.selectedEndDate = '';
          }
        }
    
        this.loadCourses(this.allCoursesData);
    }

    downloadExcel() {
        let course_data: any[] = [];
        if(this.coursesData) {
        this.coursesData.forEach(course => {
            if(course?.students?.length > 0) {
                course?.students?.forEach(p => {
                    let match = course_data.some(a => a.user_id === p.user_id && p.title == course.title);
                    if(!match) {
                        let name = p?.first_name ? `${p?.last_name}, ${p?.first_name}` : (p?.name || p?.email);

                        if(this.company?.id == 32 && this.isUESchoolOfLife) {
                            let active_enrollment_array = p?.num_matricula?.indexOf(',') >= 0 ? p?.num_matricula?.split(',') : [];
                                if(active_enrollment_array?.length > 1) {
                                    active_enrollment_array?.forEach(ae => {
                                        course_data.push({
                                            'Num. Matrícula activa': ae,
                                            'Expediente': p.employee_id,
                                            'Código actividad SIGECA': p.activity_code_sigeca,
                                            'Apellidos y nombre': name,
                                            'Actividad': course.title,
                                            'Fecha': p.created_at ? moment(p.created_at).format('DD-MM-YYYY HH:mm') : '',
                                            'Créditos': p.course_credits,
                                            'Campus': p.city,
                                        })
                                    })
                                } else {
                                    course_data.push({
                                        'Num. Matrícula activa': p.num_matricula,
                                        'Expediente': p.employee_id,
                                        'Código actividad SIGECA': p.activity_code_sigeca,
                                        'Apellidos y nombre': name,
                                        'Actividad': course.title,
                                        'Fecha': p.created_at ? moment(p.created_at).format('DD-MM-YYYY HH:mm') : '',
                                        'Créditos': p.course_credits,
                                        'Campus': p.city,
                                    })
                                }
                        } else {
                            course_data.push({
                                'Título': course.title,
                                'Nombre': p.name,
                                'Correo electrónico': p.email,
                                'Progreso': p.progress,
                                'Créditos': p.credits,
                                'Clasificación': p.ratings,
                            })
                        }
                    }
                })
            }
        });
        }
    
        this._excelService.exportAsExcelFile(course_data, 'cursos_' + this.getTimestamp());
        this.open(this._translateService.instant("dialog.savedsuccessfully"), "");
    }

    public getTimestamp() {
        const date = new Date();
        const timestamp = date.getTime();
    
        return timestamp;
    }

    ngOnDestroy() {
        this.languageChangeSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}