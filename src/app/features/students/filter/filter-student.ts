// new-student-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@services/modal.service';
import { ChangeDetectorRef } from '@angular/core';
import { GroupService } from '@services/groups.service';
import { Group } from '@models/groups.model';

interface Filters {
    grado: string;
    grupo: string;
    turno: string;
    especialidad: string;
}

@Component({
    selector: 'app-filter-student-modal',
    templateUrl: './filter-student.html',
    styleUrls: [
        './filter-student.css'
    ],
    imports: [
        CommonModule,
        FormsModule
    ]
})
export class FilterStudentModalComponent {
    isEditMode: boolean = false;
    isLoading: boolean = false;
    hasError: boolean = false;
    isEmpty: boolean = false;
    errorMessage: string = '';

    filters: Filters = {
        grado: '',
        grupo: '',
        turno: '',
        especialidad: ''
    };

    gradeList: number[] = [];
    groupList: string[] = [];
    specialtyList: string[] = [];
    shiftList: string[] = [];

    constructor(private modalService: ModalService,
        private readonly cdr: ChangeDetectorRef,
        private readonly groupService: GroupService
    ) { }

    ngOnInit() {
        this.filters = { ...this.modalService['modalState'].value.config?.data?.filters };
        this.groupService.getGroupFilters().subscribe(filters => {
            this.gradeList = filters.grados;
            this.groupList = filters.grupos;
            this.specialtyList = filters.especialidades;
            this.shiftList = filters.turnos;
            this.cdr.detectChanges();
        });
    }

    aplicarFiltros() {
        this.close(this.filters);
    }

    close(result?: any) {
        this.modalService.closeModal(result);
    }

    // Método para limpiar el formulario
    limpiarFormulario(): void {
        this.filters = {
            grado: '',
            grupo: '',
            turno: '',
            especialidad: ''
        };
    }
}