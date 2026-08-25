// incidence-modal.component.ts
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ModalService } from '@services/modal.service';
import { ConfirmationModalService } from '@services/confirmation-modal.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IncidencesService } from '@services/incidences.service';
import { IncidenceToSend, IncidenceModel } from '@models/catalog-incidence.model';

@Component({
    selector: 'app-send-incidence-modal',
    templateUrl: './incidences-send-modal.html',
    styleUrls: ['./incidences-send-modal.css'],
    imports: [
        FormsModule,
        CommonModule
    ]
})
export class SendIncidenceModalComponent implements OnInit {
    selected: any[] = [];
    isStudent: boolean = false;

    incidences: IncidenceModel[] = [];
    observation: string = '';
    isLoading: boolean = true;
    actionType: string | null = null;

    constructor(
        private modalService: ModalService,
        private confirmationModal: ConfirmationModalService,
        private cdr: ChangeDetectorRef,
        private incidenceService: IncidencesService
    ) { }

    ngOnInit() {
        console.log('students load: ', this.selected, ' isStudent: ', this.isStudent);
        this.loadIncidences();
    }

    loadIncidences() {
        this.isLoading = false;
        const type = this.isStudent ? 'ESTUDIANTE' : 'DOCENTE';
        this.incidenceService.getIncidenceCatalog().subscribe({
            next: data => {
                console.log('catalogo incidencias ', data);
                this.isLoading = false;
                this.incidences = data.filter((item: any) => String(item.type).toUpperCase() === type);
                this.cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;
                this.cdr.detectChanges();
            },
        });
    }

    onIncidenceToggle(incidence: IncidenceModel) {
        incidence.selected = !incidence.selected;

        const selectedIncidences = this.incidences.filter(inc => inc.selected);
        if (selectedIncidences.length === 1) {
            this.actionType = selectedIncidences[0].name;
        } else {
            this.actionType = null;
        }
    }

    generateIncidencesToSend(): IncidenceToSend[] {
        const selectedIncidences = this.incidences.filter(inc => inc.selected);
        const incidencesToSend: IncidenceToSend[] = [];

        for (const incidence of selectedIncidences) {
            for (const studentId of this.selected) {
                incidencesToSend.push({
                    incidence: incidence.id,
                    observation: `${this.observation.trim()}`,
                    type: incidence.type,
                    [this.isStudent ? 'student' : 'teacher']: studentId.id
                });
            }
        }

        return incidencesToSend;
    }

    onConfirm() {
        const selected = this.incidences.filter(inc => inc.selected);

        if (selected.length === 0) {
            this.confirmationModal.showWarning(
                'Seleccione al menos una incidencia.',
                'Advertencia'
            ).subscribe();
            return;
        }

        if (this.observation.trim() === '') {
            this.confirmationModal.showWarning(
                'Ingrese una observación.',
                'Advertencia'
            ).subscribe();
            return;
        }

        const incidencesToSend = this.generateIncidencesToSend();

        try {
            this.incidenceService.sendIncidences(incidencesToSend).subscribe({
                next: data => {

                },
                error: err => {

                }
            });

            console.log('Incidencias a enviar:', incidencesToSend);

            this.modalService.closeModal();

            // Pequeño delay antes de mostrar el modal de éxito
            setTimeout(() => {
                this.confirmationModal.showSuccess(
                    'Incidencia(s) registrada(s) correctamente.',
                    'Listo'
                ).subscribe();
            }, 100);

        } catch (error) {
            console.error('Error al enviar incidencias:', error);
            this.confirmationModal.showError(
                'Ocurrió un error al registrar las incidencias.',
                'Error'
            ).subscribe();
        }
    }

    close() {
        this.modalService.closeModal();
    }

    isFormValid(): boolean {
        return this.selected.length > 0 &&
            this.incidences.some(inc => inc.selected) &&
            this.observation.trim().length > 0;
    }


}