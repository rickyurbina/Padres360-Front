// new-student-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@services/modal.service';
import { ChangeDetectorRef } from '@angular/core';
import { StudentService } from '@services/students.service';
import { ConfirmationModalService } from '@services/confirmation-modal.service';
import { GroupService } from '@services/groups.service';

@Component({
    selector: 'app-new-student-modal',
    templateUrl: './student-modal.html',
    styleUrls: [
        './student-modal.css'
    ],
    imports: [
        CommonModule,
        FormsModule
    ]
})
export class StudentModalComponent {
    studentData: any = {};
    isEditMode: boolean = false;
    isLoading: boolean = false;
    hasError: boolean = false;
    isEmpty: boolean = false;
    errorMessage: string = '';

    groups: any[] = [];

    // En tu clase del componente
    formStudent = {
        id: 0,
        firstName: '',
        firstSurname: '',
        secondSurname: '',
        controlNumber: '',
        curp: '',
        group_id: null,

        active: true,
        school_id: 1,

        parent: {
            username: '',
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            school_id: 1,
            cell_phone: ''
        }
    };

    formErrors = {
        general: '',
        firstName: '',
        firstSurname: '',
        secondSurname: '',
        controlNumber: '',
        curp: '',
        group: '',
        username: '',
        parentFirstName: '',
        parentLastName: '',
        email: '',
        password: '',
        cellphone: ''
    };

    constructor(private modalService: ModalService,
        private studentService: StudentService,
        private readonly cdr: ChangeDetectorRef,
        private readonly confirmationModal: ConfirmationModalService,
        private readonly groupService: GroupService
    ) { }

    ngOnInit() {
        console.log('🔵 StudentModalComponent ngOnInit - Modo:', this.isEditMode ? 'Edición' : 'Nuevo');
        this.groupService.getGroupFilters().subscribe(filters => {
            this.groups = filters.gruposFull;
            this.cdr.detectChanges();
        });

        // Si estamos en modo edición y tenemos datos, cargarlos en el formulario
        if (this.isEditMode && this.studentData) {
            this.loadStudentData();
        }
    }

    private loadStudentData(): void {
        console.log('📥 Cargando datos del estudiante:', this.studentData);

        // Mapear los datos del estudiante al formulario
        this.formStudent = {
            id: this.studentData.id || 0,
            firstName: this.studentData.firstName || this.studentData.nombre || '',
            firstSurname: this.studentData.firstSurname || this.studentData.apellidoPaterno || '',
            secondSurname: this.studentData.secondSurname || this.studentData.apellidoMaterno || '',
            controlNumber: this.studentData.controlNumber || this.studentData.numeroControl || '',
            curp: this.studentData.curp || this.studentData.CURP || '',
            group_id: this.studentData.group_id || '',
            active: this.studentData.active !== undefined ? this.studentData.active : true,
            school_id: this.studentData.school_id || 1,
            parent: {
                username: this.studentData.parent?.username || '',
                first_name: this.studentData.parent?.first_name || '',
                last_name: this.studentData.parent?.last_name || '',
                email: this.studentData.parent?.email || '',
                password: '', // No cargamos la contraseña por seguridad
                school_id: 0,
                cell_phone: ''
            }
        };

        console.log('📥 Formulario cargado:', this.formStudent);
    }

    save() {
        this.guardarEstudiante();
    }

    close(result?: any) {
        this.modalService.closeModal(result);
    }

    // Método para manejar el input del nombre
    onFirstNameInput(event: any): void {
        const value = event.target.value;
        if (value) {
            // Capitalizar primera letra y dejar el resto en minúsculas
            this.formStudent.firstName = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        this.validateFirstName();
    }

    // Método para manejar el input del apellido paterno
    onFirstSurnameInput(event: any): void {
        const value = event.target.value;
        if (value) {
            // Capitalizar primera letra y dejar el resto en minúsculas
            this.formStudent.firstSurname = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        this.validateFirstSurname();
    }

    // Método para manejar el input del apellido materno
    onSecondSurnameInput(event: any): void {
        const value = event.target.value;
        if (value) {
            // Capitalizar primera letra y dejar el resto en minúsculas
            this.formStudent.secondSurname = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        this.validateSecondSurname();
    }

    // Método para manejar el input del número de control
    onControlNumberInput(event: any): void {
        const value = event.target.value;
        // Solo permitir números y letras, sin espacios
        this.formStudent.controlNumber = value.replace(/[^a-zA-Z0-9]/g, '');
        this.validateControlNumber();
    }

    // Método para manejar el input de la CURP
    onCurpInput(event: any): void {
        const value = event.target.value;
        // Convertir a mayúsculas y solo permitir caracteres válidos para CURP
        this.formStudent.curp = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        this.validateCurp();
    }

    // Métodos de validación
    validateFirstName(): void {
        if (!this.formStudent.firstName?.trim()) {
            this.formErrors.firstName = 'El nombre es obligatorio';
        } else if (this.formStudent.firstName.length < 2) {
            this.formErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
        } else {
            this.formErrors.firstName = '';
        }
    }

    validateFirstSurname(): void {
        if (!this.formStudent.firstSurname?.trim()) {
            this.formErrors.firstSurname = 'El apellido paterno es obligatorio';
        } else if (this.formStudent.firstSurname.length < 2) {
            this.formErrors.firstSurname = 'El apellido paterno debe tener al menos 2 caracteres';
        } else {
            this.formErrors.firstSurname = '';
        }
    }

    validateSecondSurname(): void {
        // El apellido materno es opcional, pero si se ingresa debe tener al menos 2 caracteres
        if (this.formStudent.secondSurname && this.formStudent.secondSurname.length < 2) {
            this.formErrors.secondSurname = 'El apellido materno debe tener al menos 2 caracteres';
        } else {
            this.formErrors.secondSurname = '';
        }
    }

    validateControlNumber(): void {
        if (!this.formStudent.controlNumber?.trim()) {
            this.formErrors.controlNumber = 'El número de control es obligatorio';
        } else if (this.formStudent.controlNumber.length < 5) {
            this.formErrors.controlNumber = 'El número de control debe tener al menos 5 caracteres';
        } else {
            this.formErrors.controlNumber = '';
        }
    }

    validateCurp(): void {
        if (!this.formStudent.curp?.trim()) {
            this.formErrors.curp = 'La CURP es obligatoria';
        } else if (this.formStudent.curp.length !== 18) {
            this.formErrors.curp = 'La CURP debe tener exactamente 18 caracteres';
        } else {
            // Validación básica de formato CURP (puedes hacerla más específica si lo necesitas)
            const curpRegex = /^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9A-Z]{2}$/;
            if (!curpRegex.test(this.formStudent.curp)) {
                this.formErrors.curp = 'El formato de la CURP no es válido';
            } else {
                this.formErrors.curp = '';
            }
        }
    }

    // =========================
    // USUARIO
    // =========================
    onParentUsernameInput(event: any): void {

        this.formStudent.parent.username =
            event.target.value.toLowerCase();

        this.validateParentUsername();
    }

    validateParentUsername(): void {

        if (!this.formStudent.parent.username?.trim()) {

            this.formErrors.username =
                'El usuario es obligatorio';

            return;
        }

        this.formErrors.username = '';
    }

    // =========================
    // NOMBRE
    // =========================
    onParentFirstNameInput(event: any): void {

        const value = event.target.value;

        if (value) {

            this.formStudent.parent.first_name =
                value.charAt(0).toUpperCase() +
                value.slice(1).toLowerCase();
        }

        this.validateParentFirstName();
    }

    validateParentFirstName(): void {

        if (!this.formStudent.parent.first_name?.trim()) {

            this.formErrors.parentFirstName =
                'El nombre es obligatorio';

            return;
        }

        this.formErrors.parentFirstName = '';
    }

    // =========================
    // APELLIDO
    // =========================
    onParentLastNameInput(event: any): void {

        const value = event.target.value;

        if (value) {

            this.formStudent.parent.last_name =
                value.charAt(0).toUpperCase() +
                value.slice(1).toLowerCase();
        }

        this.validateParentLastName();
    }

    validateParentLastName(): void {

        if (!this.formStudent.parent.last_name?.trim()) {

            this.formErrors.parentLastName =
                'El apellido es obligatorio';

            return;
        }

        this.formErrors.parentLastName = '';
    }

    // =========================
    // EMAIL
    // =========================
    onParentEmailInput(event: any): void {

        this.formStudent.parent.email =
            event.target.value.toLowerCase();

        this.validateParentEmail();
    }

    validateParentEmail(): void {

        const email = this.formStudent.parent.email;

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

        this.formStudent.parent.password =
            event.target.value;

        this.validateParentPassword();
    }

    validateParentPassword(): void {

        const password = this.formStudent.parent.password;

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
        this.formStudent.parent.cell_phone =
            event.target.value.replace(/\D/g, '');

        this.validateParentCellPhone();
    }

    validateParentCellPhone(): void {

        const phone = this.formStudent.parent.cell_phone;

        if (!phone?.trim()) {

            this.formErrors.cellphone =
                'El teléfono celular es obligatorio';

            return;
        }

        const phoneRegex = /^[0-9]{10}$/;

        if (!phoneRegex.test(phone)) {

            this.formErrors.cellphone =
                'Debe contener 10 dígitos';

            return;
        }

        this.formErrors.cellphone = '';
    }

    hasFormErrors(): boolean {
        return Object.values(this.formErrors).some(error => error !== '');
    }

    // Método para guardar el estudiante
    guardarEstudiante(): void {
        // Validar todos los campos antes de guardar
        this.validateFirstName();
        this.validateFirstSurname();
        this.validateSecondSurname();
        this.validateControlNumber();
        this.validateCurp();
        this.validateParentUsername();
        this.validateParentFirstName();
        this.validateParentLastName();
        this.validateParentEmail();
        this.validateParentPassword();
        this.validateParentCellPhone();
        if (this.hasFormErrors()) {
            return;
        }
        // Lógica para guardar o actualizar el estudiante
        if (this.isEditMode) {
            this.actualizarEstudiante();
        } else {
            this.agregarEstudiante();
        }
    }

    // Método para agregar nuevo estudiante
    agregarEstudiante(): void {
        this.studentService.createStudent(this.formStudent).subscribe({
            next: data => {
                console.log(data);
                this.isLoading = false;
                this.confirmationModal.showSuccess('Estudiante creado exitosamente').subscribe();
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
                this.cdr.detectChanges();
            }
        });
    }

    // Método para actualizar estudiante existente
    actualizarEstudiante(): void {
        this.studentService.updateStudent(this.formStudent).subscribe({
            next: data => {
                console.log(data);
                this.isLoading = false;
                this.confirmationModal.showSuccess('Estudiante modificado exitosamente').subscribe;
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
                this.cdr.detectChanges();
            }
        });
    }

    // Método para limpiar el formulario
    limpiarFormulario(): void {
        this.formStudent = {
            id: 0,
            firstName: '',
            firstSurname: '',
            secondSurname: '',
            controlNumber: '',
            curp: '',
            group_id: null,

            active: true,
            school_id: 1,

            parent: {
                username: '',
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                school_id: 1,
                cell_phone: ''
            }
        };

        // Limpiar errores
        this.formErrors = {
            general: '',
            firstName: '',
            firstSurname: '',
            secondSurname: '',
            controlNumber: '',
            curp: '',
            group: '',
            username: '',
            parentFirstName: '',
            parentLastName: '',
            email: '',
            password: '',
            cellphone: ''
        };
    }
}