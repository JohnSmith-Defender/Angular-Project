import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from "@ngx-translate/core";

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, RouterModule],
    templateUrl: './not-found.component.html',
})
export class NotFoundComponent {}
