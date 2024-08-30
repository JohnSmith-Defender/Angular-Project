import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ClubsListComponent } from '@features/clubs/list/list.component';
import { PlansListComponent } from '@features/plans/list/list.component';

@Component({
    standalone: true,
    imports: [CommonModule, PlansListComponent, ClubsListComponent],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
    @Input() mode: any;
}