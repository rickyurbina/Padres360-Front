import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ModalContainerComponent } from './features/modal-container/modal-container';
import { CommonModule } from '@angular/common';
import { ModalService } from '@services/modal.service';
import { ConfirmationModalComponent } from './features/modal-confirmation/modal-confirmation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    RouterModule,
    CommonModule,
    ModalContainerComponent,
    ConfirmationModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('front-padres360');
  constructor(public modalService: ModalService) { }
} 

