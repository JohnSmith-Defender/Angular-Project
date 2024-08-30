import { Component, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatNativeDateModule } from '@angular/material/core'
import { DateAdapter } from '@angular/material/core'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatSort } from '@angular/material/sort'
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'

import {
  TranslateService,
  LangChangeEvent,
  TranslateModule
} from '@ngx-translate/core'

import { PageTitleComponent, ToastComponent } from '@share/components'

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [
    CommonModule,
    PageTitleComponent,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    TranslateModule,
    ToastComponent
  ],
  templateUrl: './my-account.component.html'
})
export class MyAccountComponent {
  @ViewChild(MatPaginator, { static: false }) paginator:
    | MatPaginator
    | undefined
  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined

  languageChangeSubscription
  language: any
  pageTitle: any
  isloading: boolean = true
  dataSource: any
  displayedColumns = ['call', 'cost', 'date', 'action']
  pageSize: number = 10
  pageIndex: number = 0
  balance: number = 22.03
  currency: string = 'EUR'
  showConfirmationModal: boolean = false
  confirmDeleteItemTitle: any
  confirmDeleteItemDescription: any
  acceptText: string = ''
  selectedConfirmItem: any
  selectedConfirmMode: string = ''
  cancelText: any = ''
  calls: any = [
    {
      id: 1,
      call: 'Llamada con Usuario 1 durante 3 minutos',
      cost: 2.85,
      date: new Date('2024-07-05T00:00:00'),
      action: 'Opciones'
    },
    {
      id: 2,
      call: 'Llamada con Usuario 2 durante 22 minutos',
      cost: 18.7,
      date: new Date('2024-06-22T00:00:00'),
      action: 'Opciones'
    },
    {
      id: 3,
      call: 'Llamada con Usuario 3 durante 1 minutos',
      cost: 0,
      date: new Date('2024-06-30T00:00:00'),
      action: 'Opciones'
    }
  ]

  constructor(
    private _translateService: TranslateService,
    private dateAdapter: DateAdapter<Date>
  ) {}

  async ngOnInit() {
    this.isloading = false

    this.languageChangeSubscription =
      this._translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.language = event.lang
          this.initializePage()
        }
      )
    this.initializePage()
    this.populateCallsTable()
  }

  async initializePage() {
    this.dateAdapter.setLocale('es-ES')
    this.pageTitle = this._translateService.instant('sidebar.myaccount')
  }

  refreshTable(array) {
    this.dataSource = new MatTableDataSource(
      array.slice(
        this.pageIndex * this.pageSize,
        (this.pageIndex + 1) * this.pageSize
      )
    )
    if (this.sort) {
      this.dataSource.sort = this.sort
    } else {
      setTimeout(() => (this.dataSource.sort = this.sort))
    }
    if (this.paginator) {
      new MatTableDataSource(array).paginator = this.paginator
      if (this.pageIndex > 0) {
      } else {
        this.paginator.firstPage()
      }
    } else {
      setTimeout(() => {
        if (this.paginator) {
          new MatTableDataSource(array).paginator = this.paginator
          if (this.pageIndex > 0) {
            this.paginator.firstPage()
          }
        }
      })
    }
  }

  populateCallsTable() {
    this.dataSource = new MatTableDataSource(this.calls)
    if (this.sort) {
      this.dataSource.sort = this.sort
    } else {
      setTimeout(() => (this.dataSource.sort = this.sort))
    }
  }

  deleteCall(call) {
    this.showConfirmationModal = false
    this.calls = this.calls.filter(c => c.id != call.id)

    this.refreshTable(this.calls)
  }
}
