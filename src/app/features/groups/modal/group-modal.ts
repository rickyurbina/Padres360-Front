import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroupService } from '@services/groups.service';
import { Group } from '@models/groups.model';
import { ChangeDetectorRef } from '@angular/core';
import { ModalService } from '@services/modal.service';
import { ConfirmationModalService } from '@services/confirmation-modal.service';

interface Filters {
    grade: string;
    shift: string;
    specialty: string;
}

interface FormErrors {
    general: string;
    group?: string;
    grade?: string;
    specialty?: string;
    shift?: string;
}

@Component({
    selector: 'app-groups-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './group-modal.html',
    styleUrl: './group-modal.css',
    standalone: true
})
export class GroupsModalComponent implements OnInit {
    isLoading: boolean = false;
    hasError: boolean = false;
    groupData: any = {};
    isEditMode: boolean = false;

    tempFilters: Filters = {
        grade: '',
        shift: '',
        specialty: ''
    };

    formGroup: Group = {
        id: 0,
        group: '',
        grade: 0,
        specialty: '',
        shift: '',
        selected: false,
        subject: '',
        teacher: '',
        name: ''
    };

    formErrors: FormErrors = {
        general: '',
        group: '',
        grade: '',
        specialty: '',
        shift: ''
    };

    // Opciones de turno
    shiftOptions: string[] = ['MATUTINO', 'VESPERTINO'];
    constructor(private modalService: ModalService,
        private groupService: GroupService,
        private readonly cdr: ChangeDetectorRef,
        private confirmationService: ConfirmationModalService,
    ) { }

    ngOnInit(): void {
        if (this.isEditMode && this.groupData) {
            console.log(this.groupData)
            this.loadGroup();
        }
    }

    loadGroup() {
        this.formGroup = {
            id: this.groupData.id || 0,
            group: this.groupData.name,
            grade: this.groupData.grade || 0,
            specialty: this.groupData.specialty || '',
            shift: this.groupData.shift || '',
            selected: false,
            subject: '',
            teacher: '',
            name: ''
        }
    }

    validateForm(): boolean {
        this.formErrors = {
            general: '',
            group: '',
            grade: '',
            specialty: '',
            shift: ''
        };
        let isValid = true;

        // Validar name (varchar 10)
        if (!this.formGroup.group || this.formGroup.group.trim().length === 0) {
            this.formErrors.group = 'El nombre es requerido';
            isValid = false;
        } else if (this.formGroup.group.length > 10) {
            this.formErrors.group = 'El nombre no puede exceder 10 caracteres';
            isValid = false;
        }

        // Validar grade (int)
        if (!this.formGroup.grade || this.formGroup.grade === 0) {
            this.formErrors.grade = 'El grado es requerido';
            isValid = false;
        } else if (!Number.isInteger(this.formGroup.grade)) {
            this.formErrors.grade = 'El grado debe ser un número entero';
            isValid = false;
        } else if (this.formGroup.grade < 1 || this.formGroup.grade > 6) {
            this.formErrors.grade = 'El grado debe estar entre 1 y 6';
            isValid = false;
        }

        // Validar specialty (varchar 100)
        if (!this.formGroup.specialty || this.formGroup.specialty.trim().length === 0) {
            this.formErrors.specialty = 'La especialidad es requerida';
            isValid = false;
        } else if (this.formGroup.specialty.length > 100) {
            this.formErrors.specialty = 'La especialidad no puede exceder 100 caracteres';
            isValid = false;
        }

        // Validar shift (varchar 50 - solo Matutino o Vespertino)
        if (!this.formGroup.shift || this.formGroup.shift.trim().length === 0) {
            this.formErrors.shift = 'El turno es requerido';
            isValid = false;
        } else if (!this.shiftOptions.includes(this.formGroup.shift)) {
            this.formErrors.shift = 'Seleccione un turno válido';
            isValid = false;
        }

        return isValid;
    }

    /**
     * Valida que el input de grade sea un número entero
     */
    onGradeInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = input.value;

        // Solo permitir números
        value = value.replace(/[^0-9]/g, '');

        // Convertir a número
        const numValue = value ? parseInt(value, 10) : 0;
        this.formGroup.grade = numValue;
    }

    /**
     * Limita la longitud del input de name a 10 caracteres
     */
    onGroupInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.value.length > 10) {
            input.value = input.value.substring(0, 10);
        }
        this.onTextInput('group', event);
    }

    /**
     * Limita la longitud del input de specialty a 100 caracteres
     */
    onSpecialtyInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.value.length > 100) {
            input.value = input.value.substring(0, 100);
        }
        this.onTextInput('specialty', event);
    }

    guardarGrupo(): void {
        if (!this.validateForm()) {
            return;
        }

        if (this.isEditMode) {
            this.groupService.update(this.formGroup).subscribe({
                next: data => {
                    console.log(data);
                    this.isLoading = false;
                    this.confirmationService.showSuccess('Grupo actualizado exitosamente').subscribe();
                    this.close({ success: true, event: 'update' });
                    this.cdr.detectChanges();
                },
                error: err => {
                    this.hasError = true;
                    this.isLoading = false;
                    if (err.message) {
                        this.formErrors.general = err.message;
                    } else {
                        this.formErrors.general = 'Error al actualizar el grupo';
                    }
                }
            });
        } else {
            this.groupService.create(this.formGroup).subscribe({
                next: data => {
                    console.log(data);
                    this.isLoading = false;
                    this.confirmationService.showSuccess('Grupo creado exitosamente').subscribe();
                    this.close({ success: true, event: 'create' });
                    this.cdr.detectChanges();
                },
                error: err => {
                    this.hasError = true;
                    this.isLoading = false;
                    if (err.message) {
                        this.formErrors.general = err.message;
                    } else {
                        this.formErrors.general = 'Error al crear el grupo.';
                    }
                }
            });
        }

        this.close({ success: true, event: 'create' });
    }

    close(result?: any) {
        this.modalService.closeModal(result);
    }
    /**
   * Capitaliza texto: Primera letra mayúscula, resto minúsculas
   */
    capitalizeText(text: string): string {
        if (!text) return '';
        const trimmed = text.trim();
        if (trimmed.length === 0) return '';
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }

    /**
   * Aplica capitalización a un campo del formulario
   */
    onTextInput(field: 'group' | 'specialty', event: Event): void {
        const input = event.target as HTMLInputElement;
        const cursorPosition = input.selectionStart || 0;
        const originalValue = input.value;

        // Aplicar capitalización
        const capitalizedValue = this.capitalizeText(originalValue);
        this.formGroup[field] = capitalizedValue;

        // Restaurar posición del cursor si el valor cambió
        setTimeout(() => {
            if (originalValue !== capitalizedValue && cursorPosition > 0) {
                input.setSelectionRange(cursorPosition, cursorPosition);
            }
        }, 0);
    }
}