import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FooterComponent, NavbarComponent } from "src/app/core/components";

@Component({
  selector: "app-layout-blank",
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: "./layout-blank.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutBlankComponent {
  isVideoCTA: boolean = false;
  constructor(
  ) { }

  async ngOnInit() {
    const route = window?.location?.pathname
    if (route && route.includes('/tiktok/video-cta/')) {
      this.isVideoCTA = true
    }
  }
}