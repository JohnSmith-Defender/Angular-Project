import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { initFlowbite } from "flowbite";

@Component({
  selector: "app-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./modal.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
    @Input() title: any;
    @Input() text: any;
    @Input() acceptButtonText: any;
    @Input() cancelButtonText: any;
    @Input() buttonColor: any;
    @Output() continue = new EventEmitter();

    async ngOnInit() {
        initFlowbite();
    }

    accept() {
        this.continue.emit();
    }
}