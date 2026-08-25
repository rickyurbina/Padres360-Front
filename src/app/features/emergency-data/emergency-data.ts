import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmergencyData } from '@models/emergency-data-model';
import { EmergencyDataService } from '@services/emergency-data.service';
import { ChangeDetectorRef } from '@angular/core';
import { ConfirmationModalService } from '@services/confirmation-modal.service';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'app-emergency-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emergency-data.html',
  styleUrls: ['./emergency-data.css']
})
export class EmergencyDataComponent {
  type: string = '';
  selected: any;
  formError: string | null = null;

  // Datos médicos
  emergencyData = new EmergencyData();

  constructor(private modalService: ModalService,
    private readonly emergencyDataService: EmergencyDataService,
    private readonly cdr: ChangeDetectorRef,
    private readonly confirmationModalService: ConfirmationModalService
  ) { }

  ngOnInit() {
    this.loadEmergencyData();
  }

  close(result?: any) {
    this.modalService.closeModal(result);
  }

  hasFormError(): boolean {
    return !!this.formError;
  }

  limpiarFormulario() {
    this.formError = null;
    this.emergencyData.clear();
  }

  private validateEmergencyData(): boolean {
    this.formError = null;

    return true;
  }


  async loadEmergencyData() {
    this.emergencyDataService.getEmergencyData(this.type, this.selected?.id).subscribe({
      next: data => {
        this.emergencyData = data;
        this.cdr.detectChanges();
      },
      error: err => {
      }
    });
  }

  async saveEmergencyData() {
    if (!this.validateEmergencyData()) {
      this.cdr.detectChanges();
      return;
    }
    this.emergencyDataService
      .saveEmergencyData(this.type, this.selected?.id, this.emergencyData)
      .subscribe({
        next: (data) => {
          this.emergencyData = data;

          this.confirmationModalService
            .showSuccess('Información médica guardada correctamente.')
            .subscribe();
          this.close({ success: true, event: 'create/update' });
          this.cdr.detectChanges();
        },

        error: (err) => {
          const message =
            err?.error?.message ||
            'Error al guardar la información médica. Intente nuevamente.';
          this.formError = message;

          this.cdr.detectChanges();
        }
      });
  }

}