import { CommonModule } from "@angular/common";
import {
  Component,
  HostListener,
  Input,
  SimpleChange,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { CompanyService, LocalService } from "@share/services";
import { Subject, takeUntil } from "rxjs";
import { SearchComponent } from "@share/components/search/search.component";
import { TestimonialsService } from "@features/services";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ToastComponent } from "@share/components";
import { environment } from "@env/environment";
import moment from "moment";
import * as he from 'he';
import { searchSpecialCase, sortSerchedMembers } from "src/app/utils/search/helper";
import Fuse from 'fuse.js';

@Component({
  selector: "app-testimonials-admin-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule,
    MatSortModule,
    MatSnackBarModule,
    SearchComponent,
    ToastComponent,
  ],
  templateUrl: "./admin-list.component.html",
})
export class TestimonialsAdminListComponent {
  private destroy$ = new Subject<void>();

  @Input() list: any;
  @Input() company: any;
  @Input() buttonColor: any;
  @Input() primaryColor: any;
  @Input() canCreateTestimonial: any;
  @Input() testimonialsTitle: any;
  @Input() userId: any;
  @Input() superAdmin: any;
  @Input() status: any;
  @Input() language: any;

  languageChangeSubscription;
  isMobile: boolean = false;
  searchText: any;
  placeholderText: any;
  allTestimonialsData: any = [];
  testimonialsData: any = [];
  searchKeyword: any;
  dataSource: any;
  displayedColumns = [
    "short_description",
    "author",
    "date_display",
    "action",
  ];
  pageSize: number = 10;
  pageIndex: number = 0;
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;
  showConfirmationModal: boolean = false;
  selectedItem: any;
  confirmDeleteItemTitle: string = "";
  confirmDeleteItemDescription: string = "";
  acceptText: string = "";
  cancelText: string = "";
  courses: any;
  tags: any;
  tagMapping: any;

  searchOptions = {
    keys: [{
      name: 'author',
      weight: 0.25
    }, {
      name: 'tags_display',
      weight: 0.25
    }, {
      name: 'short_description',
      weight: 0.25
    }, {
      name: 'description',
      weight: 0.25
    }]
  };

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _translateService: TranslateService,
    private _localService: LocalService,
    private _companyService: CompanyService,
    private _testimonialsService: TestimonialsService
  ) {}

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
    this.fetchTestimonialsManagementData();
    this.initializeSearch();
  }

  fetchTestimonialsManagementData() {
    this._testimonialsService
      .fetchTestimonials(this.company?.id, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.courses = data?.courses;
          this.tags = data?.tags;
          this.tagMapping = data?.tags_mapping;
          this.formatTestimonials(data?.testimonials || []);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  formatTestimonials(testimonials) {
    let data;
    if (testimonials?.length > 0) {
      data = testimonials?.map((item) => {
        let tags_texts = this.getTagsDisplay(item);

        return {
          ...item,
          path: `/testimonials/details/${item.id}`,
          image: `${environment.api}/get-testimonial-image/${item.image}`,
          tags_display: tags_texts?.map((data) => { return data.tag_label }).join(', '),
          date_display: moment.utc(item.created_at).locale(this.language).format('D MMMM')
        };
      });
    }
    if (this.allTestimonialsData?.length == 0) {
      this.allTestimonialsData = data;
    }

    if (data?.length > 0) {
      data = data.sort((a, b) => {
        const oldDate: any = new Date(a.created_at);
        const newDate: any = new Date(b.created_at);
        return newDate - oldDate;
      });
    }

    this.loadTestimonials(data);
  }

  getTagsDisplay(testimonial) {
    let list_tags: any[] = []
    if(this.tagMapping?.length > 0) {
      let testimonial_tags = this.tagMapping?.filter(tm => {
        return tm.testimonial_id == testimonial.id
      })
      if(testimonial_tags?.length > 0) {
        testimonial_tags?.forEach(t => {
          let tag = this.tags?.filter(tag => {
            return tag.id == t.tag_id
          })

          list_tags.push({
            tag_id: t.tag_id,
            tag_label: tag?.length > 0 ? this.getTagLabel(tag[0]) : ''
          })
        })
      }
    }
    return list_tags
  }

  getTagLabel(tag) {
    return tag
      ? this.language == "en"
        ? tag.tag_en ||
          tag.tag_es
        : this.language == "fr"
        ? tag.tag_fr ||
          tag.tag_es
        : this.language == "eu"
        ? tag.tag_eu ||
          tag.tag_es
        : this.language == "ca"
        ? tag.tag_ca ||
          tag.tag_es
        : this.language == "de"
        ? tag.tag_de ||
          tag.tag_es
        : tag.tag_es
      : "";
  }

  loadTestimonials(data) {
    this.testimonialsData = data;

    if (this.searchKeyword) {
      this.testimonialsData = this.filterSearchKeyword(this.testimonialsData)
      let fuse = new Fuse(this.testimonialsData, this.searchOptions);
      let filtered_search = fuse.search(this.normalizeCase(this.searchKeyword));
      this.testimonialsData = []
      filtered_search?.forEach(item => {
        this.testimonialsData.push(item?.item)
      })
    }

    this.refreshTable(this.testimonialsData);
  }

  normalizeCase(str) {
    if (str) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim();
    }
  }

  filterSearchKeyword(testimonials) {
    if(testimonials?.length > 0) {
      return testimonials.filter((testimonial) => {
        return (
          (testimonial.author &&
            testimonial.author
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .indexOf(
              this.searchKeyword
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
            ) >= 0
            || searchSpecialCase(this.searchKeyword,testimonial.author)
            ) ||
          (testimonial.short_description &&
            he.decode(testimonial.short_description)
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0) ||
          (testimonial.description &&
            he.decode(testimonial.description)
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .indexOf(
                this.searchKeyword
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
              ) >= 0)
        );
      });
    }
  }

  refreshTable(list) {
    this.dataSource = new MatTableDataSource(list);
    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      setTimeout(() => (this.dataSource.sort = this.sort));
    }
  }

  initializeSearch() {
    this.searchText = this._translateService.instant("guests.search");
    this.placeholderText = this._translateService.instant(
      "news.searchbykeyword"
    );
  }

  handleCreateRoute() {
    this._router.navigate([`/testimonials/create`]);
  }

  handleSearch(event) {
    this.searchKeyword = event;
    this.loadTestimonials(this.allTestimonialsData);
  }

  viewItem(id) {
    this._router.navigate([`/testimonials/details/${id}`]);
  }

  editItem(id) {
    this._router.navigate([`/testimonials/edit/${id}`]);
  }

  confirmDeleteItem(id) {
    this.showConfirmationModal = false;
    this.selectedItem = id;
    this.confirmDeleteItemTitle = this._translateService.instant(
      "dialog.confirmdelete"
    );
    this.confirmDeleteItemDescription = this._translateService.instant(
      "dialog.confirmdeleteitem"
    );
    this.acceptText = "OK";
    setTimeout(() => (this.showConfirmationModal = true));
  }

  confirm() {
    this.deleteItem(this.selectedItem, true);
    this.showConfirmationModal = false;
  }

  deleteItem(id, confirmed) {
    if (confirmed) {
      this._testimonialsService.deleteTestimonial(id).subscribe(
        (response) => {
          let all_testimonials = this.allTestimonialsData;
          if (all_testimonials?.length > 0) {
            all_testimonials.forEach((testimonial, index) => {
              if (testimonial.id == id) {
                all_testimonials.splice(index, 1);
              }
            });
          }

          let testimonials = this.testimonialsData;
          if (testimonials?.length > 0) {
            testimonials.forEach((testimonial, index) => {
              if (testimonial.id == id) {
                testimonials.splice(index, 1);
              }
            });
          }
          this.open(
            this._translateService.instant("dialog.deletedsuccessfully"),
            ""
          );
          this.testimonialsData = testimonials;
          this.refreshTable(this.testimonialsData);
        },
        (error) => {
          console.log(error);
        }
      );
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