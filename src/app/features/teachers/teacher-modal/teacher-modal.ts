// new-student-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@services/modal.service';
import { ChangeDetectorRef } from '@angular/core';
import { TeacherService } from '@services/teacher.services';
import { ConfirmationModalService } from '@services/confirmation-modal.service';
import { GroupService } from '@services/groups.service';

@Component({
    selector: 'app-new-teacher-modal',
    templateUrl: './teacher-modal.html',
    styleUrls: [
        './teacher-modal.css'
    ],
    imports: [
        CommonModule,
        FormsModule
    ]
})
export class TeacherModalComponent {
    teacherData: any = {};
    isEditMode: boolean = false;
    isLoading: boolean = false;
    hasError: boolean = false;
    isEmpty: boolean = false;
    errorMessage: string = '';

    groups: any[] = [];

    // En tu clase del componente
    formTeacher = {
        id: 0,
        firstName: '',
        firstSurname: '',
        secondSurname: '',
        phone: '',
        email: '',
        user: {
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: '',
            schoolId: 1
        },
        assignments: [
            {
                subjectId: null,
                groupId: null
            }
        ]
    };

    formErrors = {
        general: '',

        // Docente
        firstName: '',
        firstSurname: '',
        secondSurname: '',
        phone: '',
        email: '',

        // Usuario
        username: '',
        password: '',
        userFirstName: '',
        userLastName: '',
        userEmail: '',

        // Asignaciones
        assignments: ''
    };

    constructor(private modalService: ModalService,
        private teacherService: TeacherService,
        private readonly cdr: ChangeDetectorRef,
        private readonly confirmationModal: ConfirmationModalService,
        private readonly groupService: GroupService
    ) { }

    ngOnInit() {
        console.log('🔵 TeacherModalComponent ngOnInit - Modo:', this.isEditMode ? 'Edición' : 'Nuevo');
        this.groupService.getGroupFilters().subscribe(filters => {
            this.groups = filters.gruposFull;
            this.cdr.detectChanges();
        });

        // Si estamos en modo edición y tenemos datos, cargarlos en el formulario
        if (this.isEditMode && this.teacherData) {
            this.loadTeacherData();
        }
    }

    private loadTeacherData(): void {
        console.log('📥 Cargando datos del maestro:', this.teacherData);

        // Mapear los datos del maestro al formulario
        this.formTeacher = {
            id: this.teacherData.id || 0,
            firstName: this.teacherData.firstName || this.teacherData.nombre || '',
            firstSurname: this.teacherData.firstSurname || this.teacherData.apellidoPaterno || '',
            secondSurname: this.teacherData.secondSurname || this.teacherData.apellidoMaterno || '',
            phone: this.teacherData.controlNumber || this.teacherData.numeroControl || '',
            email: this.teacherData.curp || this.teacherData.CURP || '',
            user: {
                username: this.teacherData.user?.username || '',
                password: '', // No cargamos la contraseña por seguridad
                email: this.teacherData.user?.email || '',
                firstName: this.teacherData.user?.firstName || '',
                lastName: this.teacherData.user?.lastName || '',
                schoolId: 1
            },
            assignments: this.teacherData.assignments || [
                {
                    subjectId: null,
                    groupId: null
                }
            ]
        };

        console.log('📥 Formulario cargado:', this.formTeacher);
    }

    save() {
        this.guardarDocente();
    }

    close(result?: any) {
        this.modalService.closeModal(result);
    }

    // Método para manejar el input del nombre
    onFirstNameInput(event: any): void {
        const value = event.target.value;
        if (value) {
            // Capitalizar primera letra y dejar el resto en minúsculas
            this.formTeacher.firstName = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        this.validateFirstName();
    }

    // Método para manejar el input del apellido paterno
    onFirstSurnameInput(event: any): void {
        const value = event.target.value;
        if (value) {
            // Capitalizar primera letra y dejar el resto en minúsculas
            this.formTeacher.firstSurname = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        this.validateFirstSurname();
    }

    // Método para manejar el input del apellido materno
    onSecondSurnameInput(event: any): void {
        const value = event.target.value;
        if (value) {
            // Capitalizar primera letra y dejar el resto en minúsculas
            this.formTeacher.secondSurname = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        this.validateSecondSurname();
    }

    // Métodos de validación
    validateFirstName(): void {
        if (!this.formTeacher.firstName?.trim()) {
            this.formErrors.firstName = 'El nombre es obligatorio';
        } else if (this.formTeacher.firstName.length < 2) {
            this.formErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
        } else {
            this.formErrors.firstName = '';
        }
    }

    validateFirstSurname(): void {
        if (!this.formTeacher.firstSurname?.trim()) {
            this.formErrors.firstSurname = 'El apellido paterno es obligatorio';
        } else if (this.formTeacher.firstSurname.length < 2) {
            this.formErrors.firstSurname = 'El apellido paterno debe tener al menos 2 caracteres';
        } else {
            this.formErrors.firstSurname = '';
        }
    }

    validateSecondSurname(): void {
        // El apellido materno es opcional, pero si se ingresa debe tener al menos 2 caracteres
        if (this.formTeacher.secondSurname && this.formTeacher.secondSurname.length < 2) {
            this.formErrors.secondSurname = 'El apellido materno debe tener al menos 2 caracteres';
        } else {
            this.formErrors.secondSurname = '';
        }
    }

    // =========================
    // USUARIO
    // =========================
    onParentUsernameInput(event: any): void {

        this.formTeacher.user.username =
            event.target.value.toLowerCase();

        this.validateParentUsername();
    }

    validateParentUsername(): void {

        if (!this.formTeacher.user.username?.trim()) {

            this.formErrors.username =
                'El usuario es obligatorio';

            return;
        }

        this.formErrors.username = '';
    }

    

    // =========================
    // APELLIDO
    // =========================
    onParentLastNameInput(event: any): void {

        const value = event.target.value;

        if (value) {

            this.formTeacher.user.lastName =
                value.charAt(0).toUpperCase() +
                value.slice(1).toLowerCase();
        }

        this.validateParentLastName();
    }

    validateParentLastName(): void {

        if (!this.formTeacher.user.lastName?.trim()) {

            this.formErrors.userLastName =
                'El apellido es obligatorio';

            return;
        }

        this.formErrors.userLastName = '';
    }

    // =========================
    // EMAIL
    // =========================
    onParentEmailInput(event: any): void {

        this.formTeacher.user.email =
            event.target.value.toLowerCase();

        this.validateParentEmail();
    }

    validateParentEmail(): void {

        const email = this.formTeacher.user.email;

        if (!email?.trim()) {

            this.formErrors.email =
                'El correo electrónico es obligatorio';

            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            this.formErrors.email =
                'Ingrese un correo electrónico válido';

            return;
        }

        this.formErrors.email = '';
    }

    // =========================
    // PASSWORD
    // =========================
    onParentPasswordInput(event: any): void {

        this.formTeacher.user.password =
            event.target.value;

        this.validateParentPassword();
    }

    validateParentPassword(): void {

        const password = this.formTeacher.user.password;

        if (!password?.trim()) {

            this.formErrors.password =
                'La contraseña es obligatoria';

            return;
        }

        if (password.length < 6) {

            this.formErrors.password =
                'Debe contener al menos 6 caracteres';

            return;
        }

        this.formErrors.password = '';
    }

    // =========================
    // CELULAR
    // =========================
    onParentCellPhoneInput(event: any): void {

        // Solo números
        this.formTeacher.phone =
            event.target.value.replace(/\D/g, '');

        this.validateParentCellPhone();
    }

    validateParentCellPhone(): void {

        const phone = this.formTeacher.phone;

        if (!phone?.trim()) {

            this.formErrors.phone =
                'El teléfono celular es obligatorio';

            return;
        }

        const phoneRegex = /^[0-9]{10}$/;

        if (!phoneRegex.test(phone)) {

            this.formErrors.phone =
                'Debe contener 10 dígitos';

            return;
        }

        this.formErrors.phone = '';
    }

    hasFormErrors(): boolean {
        return Object.values(this.formErrors).some(error => error !== '');
    }

    // Método para guardar el docente
    guardarDocente(): void {
        // Validar todos los campos antes de guardar
        this.validateFirstName();
        this.validateFirstSurname();
        this.validateSecondSurname();
        this.validateParentUsername();
        this.validateParentLastName();
        this.validateParentEmail();
        this.validateParentPassword();
        this.validateParentCellPhone();
        if (this.hasFormErrors()) {
            return;
        }
        // Lógica para guardar o actualizar el docente
        if (this.isEditMode) {
            this.actualizarDocente();
        } else {
            this.agregarDocente();
        }
    }

    // Método para agregar nuevo docente
    agregarDocente(): void {
        this.teacherService.createTeacher(this.formTeacher).subscribe({
            next: data => {
                console.log(data);
                this.isLoading = false;
                this.confirmationModal.showSuccess('Docente creado exitosamente').subscribe();
                this.close({ success: true, event: 'create' });
                this.cdr.detectChanges();
            },
            error: err => {
                this.hasError = true;
                this.isLoading = false;
                if (err.message) {
                    this.formErrors.general = err.message;
                } else {
                    this.formErrors.general = 'Error al crear el docente';
                }
                this.cdr.detectChanges();
            }
        });
    }

    // Método para actualizar docente existente
    actualizarDocente(): void {
        this.teacherService.update(this.formTeacher).subscribe({
            next: data => {
                console.log(data);
                this.isLoading = false;
                this.confirmationModal.showSuccess('Docente modificado exitosamente').subscribe;
                this.close({ success: true, event: 'update' });
                this.cdr.detectChanges();
            },
            error: err => {
                this.hasError = true;
                this.isLoading = false;
                if (err.message) {
                    this.formErrors.general = err.message;
                } else {
                    this.formErrors.general = 'Error al crear el docente';
                }
                this.cdr.detectChanges();
            }
        });
    }

    // Método para limpiar el formulario
    limpiarFormulario(): void {
        this.formTeacher = {
            id: 0,
            firstName: '',
            firstSurname: '',
            secondSurname: '',
            phone: '',
            email: '',
            user: {
                username: '',
                password: '',
                email: '',
                firstName: '',
                lastName: '',
                schoolId: 1
            },
            assignments: [
                {
                    subjectId: null,
                    groupId: null
                }
            ]
        };

        // Limpiar errores
        this.formErrors = {
            general: '',

            // Docente
            firstName: '',
            firstSurname: '',
            secondSurname: '',
            phone: '',
            email: '',

            // Usuario
            username: '',
            password: '',
            userFirstName: '',
            userLastName: '',
            userEmail: '',

            // Asignaciones
            assignments: ''
        };
    }
}