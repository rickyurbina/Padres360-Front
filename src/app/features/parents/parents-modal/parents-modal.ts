// new-parent-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@services/modal.service';
import { ChangeDetectorRef } from '@angular/core';
import { ParentService } from '@services/parent.service';
import { TextUtilsService } from '@utils/text-utils.service';
// import { TextUtilsService } from 'src/app/core/utils/text-utils.service';
// import { TextUtilsService } from '/src/app/core/utils/text-utils.service';
// import { TextUtilsService } from '../../core/utils/text-utils.service';
// import { TextUtilsService } from '../../core/utils/text-utils.service.ts';
import { ConfirmationModalService } from '@services/confirmation-modal.service';

@Component({
  selector: 'app-new-parents-modal',
  templateUrl: './parents-modal.html',
  styleUrls: ['./parents-modal.css'],
  imports: [CommonModule, FormsModule],
  providers: [TextUtilsService]  // 👈 Agrega esta línea
})


export class ParentModalComponent {
    parentData: any = {};
    isEditMode: boolean = false;
    isLoading: boolean = false;
    hasError: boolean = false;
    isEmpty: boolean = false;
    errorMessage: string = '';
    beforeUserName: string = '';

    // En tu clase del componente
    formParent = {
        id: 0,
        username: '',
        first_name: '',
        lastname: '',
        email: '',
        cellphone: '',
        password: ''
    };

    formErrors = {
        id: 0,
        username: '',
        first_name: '',
        lastname: '',
        email: '',
        cellphone: '',
        password: '',
        general: ''
    };

    constructor(private modalService: ModalService,
        private parentService: ParentService,
        private readonly cdr: ChangeDetectorRef,
        private textUtils: TextUtilsService,
        private readonly confirmationModal: ConfirmationModalService
    ) { }

    ngOnInit() {
        console.log('🔵 ParentModalComponent ngOnInit - Modo:', this.isEditMode ? 'Edición' : 'Nuevo');

        // Si estamos en modo edición y tenemos datos, cargarlos en el formulario
        if (this.isEditMode && this.parentData) {
            this.loadParentData();
        }
    }

    private loadParentData(): void {
        console.log('📥 Cargando datos del estudiante:', this.parentData);

        // Mapear los datos del estudiante al formulario
        this.formParent = {
            id: this.parentData.id || 0,
            username: this.parentData.user?.username || '',
            first_name: this.parentData.user?.first_name || '',
            lastname: this.parentData.user?.last_name || '',
            email: this.parentData.user?.email || '',
            cellphone: this.parentData.cell_phone || '',
            password: ''
        };
        this.beforeUserName = this.parentData.user?.username || '';

        console.log('📥 Formulario cargado:', this.formParent);
    }

    save() {
        this.guardarParent();
    }

    close(result?: any) {
        this.modalService.closeModal(result);
    }

    onUsernameInput(event: any): void {
        true;
        this.formParent.username = event.target.value.trim();
        this.validateUsername();
    }

    validateUsername(): void {
        this.formErrors.general = '';
        const value = this.formParent.username;
        if (!value) {
            this.formErrors.username = 'El nombre de usuario es obligatorio';
        } else if (value.length < 4) {
            this.formErrors.username = 'Debe tener al menos 4 caracteres';
        } else {
            this.formErrors.username = '';
        }
    }

    onFirstNameInput(event: any): void {
        const value = event.target.value;
        this.formParent.first_name = this.textUtils.capitalizeEachWord(value);
        this.validateFirstName();
    }

    validateFirstName(): void {
        this.formErrors.general = '';
        const value = this.formParent.first_name;
        if (!value?.trim()) {
            this.formErrors.first_name = 'El nombre es obligatorio';
        } else if (value.length < 2) {
            this.formErrors.first_name = 'Debe tener al menos 2 caracteres';
        } else {
            this.formErrors.first_name = '';
        }
    }

    onLastNameInput(event: any): void {
        const value = event.target.value;
        this.formParent.lastname = this.textUtils.capitalizeEachWord(value);
        this.validateLastname();
    }

    validateLastname(): void {
        this.formErrors.general = '';
        const value = this.formParent.lastname;
        if (!value?.trim()) {
            this.formErrors.lastname = 'El apellido es obligatorio';
        } else if (value.length < 2) {
            this.formErrors.lastname = 'Debe tener al menos 2 caracteres';
        } else {
            this.formErrors.lastname = '';
        }
    }

    onEmailInput(event: any): void {
        let value = event.target.value.trim().toLowerCase();

        // Elimina espacios dobles y caracteres no válidos
        value = value.replace(/\s+/g, '').replace(/[^a-z0-9@._-]/g, '');

        this.formParent.email = value;
        this.validateEmail();
    }

    validateEmail(): void {
        this.formErrors.general = '';
        const value = this.formParent.email;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value) {
            this.formErrors.email = 'El correo electrónico es obligatorio';
        } else if (!emailRegex.test(value)) {
            this.formErrors.email = 'El formato del correo no es válido';
        } else {
            this.formErrors.email = '';
        }
    }

    onCellphoneInput(event: any): void {
        this.formParent.cellphone = event.target.value.replace(/\D/g, ''); // elimina todo lo que no sea número
        this.validateCellphone();
    }

    onCellphoneKeyDown(event: KeyboardEvent): void {
        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
        if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
            event.preventDefault();
        }
    }

    validateCellphone(): void {
        this.formErrors.general = '';
        const value = this.formParent.cellphone;
        if (!value) {
            this.formErrors.cellphone = 'El número de teléfono es obligatorio';
        } else if (!/^\d{10}$/.test(value)) {
            this.formErrors.cellphone = 'Debe contener exactamente 10 dígitos';
        } else {
            this.formErrors.cellphone = '';
        }
    }

    showPassword: boolean = false;

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onPasswordInput(event: any): void {
        this.formParent.password = event.target.value.trim();
        this.validatePassword();
    }

    validatePassword(): void {
        this.formErrors.general = '';
        const value = this.formParent.password;
        if (!value) {
            this.formErrors.password = 'La contraseña es obligatoria';
        } else if (value.length < 6) {
            this.formErrors.password = 'Debe tener al menos 6 caracteres';
        } else {
            this.formErrors.password = '';
        }
    }

    // === VALIDACIÓN GLOBAL ===
    hasFormErrors(): boolean {
        return Object.values(this.formErrors).some(err => !!err);
    }

    // Método para guardar el estudiante
    guardarParent(): void {
        // Validar todos los campos antes de guardar
        this.validateFirstName();
        this.validateLastname();
        this.validateEmail();
        this.validateUsername();
        this.validatePassword();
        if (this.hasFormErrors()) {
            return;
        }
        // Lógica para guardar o actualizar el estudiante
        if (this.isEditMode) {
            this.updateParent();
        } else {
            this.addParent();
        }
    }

    // Método para agregar nuevo estudiante
    addParent(): void {
        this.parentService.createParent(this.formParent).subscribe({
            next: data => {
                console.log(data);
                this.isLoading = false;
                this.confirmationModal.showSuccess('Padre creado exitosamente').subscribe();
                this.close({ success: true, event: 'create' });
                this.cdr.detectChanges();
            },
            error: err => {
                this.hasError = true;
                this.isLoading = false;
                if (err.message) {
                    this.formErrors.general = err.message;
                } else {
                    this.formErrors.general = 'Error al crear el estudiante';
                }

            }
        });
    }

    // Método para actualizar estudiante existente
    updateParent(): void {
        this.parentService.updateParent(this.formParent, this.beforeUserName).subscribe({
            next: data => {
                console.log(data);
                this.isLoading = false;
                this.confirmationModal.showSuccess('Padre modificado exitosamente').subscribe();
                this.close({ success: true, event: 'update' });
                this.cdr.detectChanges();
            },
            error: err => {
                this.hasError = true;
                this.isLoading = false;
                if (err.message) {
                    this.formErrors.general = err.message;
                } else {
                    this.formErrors.general = 'Error al crear el estudiante';
                }

            }
        });
    }

    // Método para limpiar el formulario
    cleanForm(): void {
        this.formParent = {
            id: 0,
            username: '',
            first_name: '',
            lastname: '',
            email: '',
            cellphone: '',
            password: ''
        };

        // Limpiar errores
        this.formErrors = {
            id: 0,
            username: '',
            first_name: '',
            lastname: '',
            email: '',
            cellphone: '',
            password: '',
            general: ''
        };
    }
}