import { NgModule } from "@angular/core";
import { MaximizeDirective } from "./maximize.directive";

@NgModule({
  declarations: [MaximizeDirective],
  exports: [MaximizeDirective]
})
export class MaximizeModule {}