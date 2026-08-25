// confirmation-modal.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationModalService, ConfirmationConfig } from '@services/confirmation-modal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './modal-confirmation.html',
  styleUrls: ['./modal-confirmation.css'],
  imports: [CommonModule, FormsModule]
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  config: ConfirmationConfig | undefined;
  private subscription?: Subscription;

  constructor(private confirmationService: ConfirmationModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscription = this.confirmationService.confirmationState$.subscribe(state => {
      this.isOpen = state.isOpen;
      this.config = state.config;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  handleButtonClick(button: 'ok' | 'yes' | 'no') {
    if (button === 'ok') {
      this.confirmationService.ok();
    } else if (button === 'yes') {
      this.confirmationService.yes();
    } else if (button === 'no') {
      this.confirmationService.no();
    }
  }

  onOverlayClick() {
    if (this.config?.showCloseButton) {
      this.cancel();
    }
  }

  cancel() {
    this.confirmationService.cancel();
  }

  getButtonText(button: 'ok' | 'yes' | 'no'): string {
    if (button === 'ok') return this.config?.okText || 'Ok';
    if (button === 'yes') return this.config?.yesText || 'Sí';
    if (button === 'no') return this.config?.noText || 'No';
    return '';
  }
}