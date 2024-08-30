import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-no-access",
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: "./no-access.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoAccessComponent {
  constructor(
    private _router: Router,
  ) {}

  goHome() {
    this._router.navigate(['/'])
  }
}