import { Directive, ElementRef } from "@angular/core";
import { BehaviorSubject } from "rxjs";
// import * as Fullscreen from "screenfull";
import Fullscreen from 'screenfull'

@Directive({
  selector: "[maximize]",
  exportAs: "maximize"
})
export class MaximizeDirective {
  private isMaximizedSubject = new BehaviorSubject(false);
  isMaximized$ = this.isMaximizedSubject.asObservable();
  constructor(private el: ElementRef) {}

  toggle() {
    if (this.isMaximizedSubject?.getValue()) this.minimize();
    else this.maximize();
  }
  maximize() {
    if (this.el) {
      this.isMaximizedSubject.next(true);
      this.el.nativeElement.classList.add("fullscreen");
      if (Fullscreen.isEnabled) {
        Fullscreen.request();
      }
    }
  }
  minimize() {
    if (this.el) {
      this.isMaximizedSubject.next(false);
      this.el.nativeElement.classList.remove("fullscreen");
      if (Fullscreen.isEnabled) {
        Fullscreen.exit();
      }
    }
  }
}
