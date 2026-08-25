import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Student } from '@models/student.model';
import { StudentService } from '@services/students.service';
import { ChangeDetectorRef } from '@angular/core';
import { ModalService } from '@services/modal.service';
import { StudentModalComponent } from './student-modal/student-modal';
import { FilterStudentModalComponent } from './filter/filter-student';
import { ConfirmationModalService } from '@services/confirmation-modal.service';
import { SendIncidenceModalComponent } from '../incidences-send-modal/incidences-send-modal';
import { ModalViewIncidencesComponent } from '../modal-view-incidences/modal-view-incidences';
import { EmergencyDataComponent } from '../emergency-data/emergency-data';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { Functionality } from '@enums/functionality.enum';
import { AccessControlService } from '@services/access-control.service';
//import { ReportExportService } from '@services/report-export.service';
import { StudentsListReportComponent } from './reports/list/student-list-pdf';

interface Filters {
  grado: string;
  grupo: string;
  turno: string;
  especialidad: string;
}

@Component({
  selector: 'app-students-list',
  templateUrl: './students.html',
  styleUrls: ['./students.css'],
  imports: [
    FormsModule,
    CommonModule,
    LottieComponent
  ]
})
export class StudentsComponent implements OnInit {
  // Data
  students: Student[] = [];
  filteredStudents: Student[] = [];
  paginatedSubjects: Student[] = [];

  // Estados
  isLoading: boolean = false;
  hasError: boolean = false;
  isEmpty: boolean = false;
  errorMessage: string = '';

  // Búsqueda y filtros
  searchTerm: string = '';

  // Ordenamiento
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 25, 50, 100];
  totalPages: number = 1;
  pagesArray: number[] = [];

  // Modales y Dropdowns
  showExportDropdown: boolean = false;
  showFilterModal: boolean = false;

  filters: Filters = {
    grado: '',
    grupo: '',
    turno: '',
    especialidad: ''
  };

  loadingOptions: AnimationOptions = {
    path: '/lottie/loading.json',
    loop: true,
    autoplay: true
  };

  public Functionality = Functionality;

  selectedItems: Set<any> = new Set();

  constructor(
    private studentService: StudentService,
    private readonly cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private modalConfirmation: ConfirmationModalService,
    private accessControlService: AccessControlService,
    //private reportExport: ReportExportService,
    // private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStudents();
  }

  // ===================== CARGA DE DATOS =====================
  loadStudents(): Promise<void> {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;

    return new Promise((resolve, reject) => {
      this.studentService.getStudentList().subscribe({
        next: data => {
          this.students = data;
          this.applyFilters();
          console.log(data);
          this.isLoading = false;
          this.isEmpty = this.students.length == 0;
          this.cdr.detectChanges();
          resolve();
        },
        error: err => {
          this.hasError = true;
          reject(err);
        }
      });
    });
  }

  reloadData(): void {
    this.loadStudents();
  }

  // ===================== BÚSQUEDA Y FILTROS =====================
  applyFilters(): void {
    let filtered = [...this.students];

    // Aplicar búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(inc =>
        inc.firstName?.toLowerCase().includes(term) ||
        inc.firstSurname?.toLowerCase().includes(term) ||
        inc.secondSurname?.toLowerCase().includes(term) ||
        inc.controlNumber?.toLowerCase().includes(term) ||
        inc.group?.shift?.toLowerCase().includes(term) ||
        inc.group?.specialty?.toLowerCase().includes(term) ||
        `${inc.firstName || ''} ${inc.firstSurname || ''} ${inc.secondSurname || ''}`.toLowerCase().includes(term)
      );
    }

    // Aplicar filtros avanzados
    if (this.filters.grado) {
      filtered = filtered.filter(inc => inc.group?.grade === Number(this.filters.grado));
    }
    if (this.filters.grupo) {
      filtered = filtered.filter(inc => String(inc.group?.name) === this.filters.grupo);
    }
    if (this.filters.especialidad) {
      filtered = filtered.filter(inc => inc.group?.specialty === this.filters.especialidad);
    }
    if (this.filters.turno) {
      filtered = filtered.filter(inc => inc.group?.shift === this.filters.turno);
    }

    this.filteredStudents = filtered;
    this.isEmpty = this.filteredStudents.length === 0 && !this.hasError && !this.isLoading;
    this.updatePagination();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.grado || this.filters.grupo || this.filters.turno || this.filters.especialidad);
  }

  removeFilter(filterKey: keyof Filters): void {
    this.filters[filterKey] = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.filters = {
      grado: '',
      grupo: '',
      turno: '',
      especialidad: ''
    };
    this.applyFilters();
  }

  // ===================== ORDENAMIENTO =====================
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredStudents.sort((a, b) => {
      const aValue = a[column as keyof Student];
      const bValue = b[column as keyof Student];

      let comparison = 0;

      // Manejo seguro de comparación
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      // Convertir a string para comparación segura
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr > bStr) comparison = 1;
      if (aStr < bStr) comparison = -1;

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.updatePagination();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'sort';
    return this.sortDirection === 'asc' ? 'sort-up' : 'sort-down';
  }

  // ===================== PAGINACIÓN =====================
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStudents.length / Number(this.itemsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const startIndex = (Number(this.currentPage) - 1) * Number(this.itemsPerPage);
    const endIndex = startIndex + Number(this.itemsPerPage);
    this.paginatedSubjects = this.filteredStudents.slice(startIndex, endIndex);

    this.updatePagesArray();
  }

  updatePagesArray(): void {
    this.pagesArray = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      this.pagesArray.push(i);
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  changeItemsPerPage(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  getDisplayRange(): string {
    if (this.filteredStudents.length === 0) return '0 de 0';
    const start = (Number(this.currentPage) - 1) * Number(this.itemsPerPage) + 1;
    const end = Math.min(start + Number(this.itemsPerPage) - 1, this.filteredStudents.length);
    return `${start}-${end} de ${this.filteredStudents.length}`;
  }

  // ===================== EXPORTACIÓN =====================
  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
  }

  exportarExcelXlsx(): void {
    const dataToExport = this.filteredStudents.map(inc => ({
      'ID': inc.id,
      'Nombre': inc.firstName,
      'Apellidos': inc.firstSurname + ' ' + inc.secondSurname,
      'Grado': inc.grade,
      'Grupo': inc.group,
      'Turno': inc.group?.shift || '',
      'Especialidad': inc.group?.specialty || '',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');

    const fileName = `estudiantes_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    this.showExportDropdown = false;
  }

  // ===================== MODALES =====================
  abrirModalFiltros(): void {
    this.filters = { ...this.filters };
    this.modalService.openModal(FilterStudentModalComponent, {
      title: 'Filtro avanzado',
      size: 'md',
      data: { filters: this.filters },
      showClose: true
    }).subscribe((result) => {
      if (result) {
        console.log('El modal se cerró con datos:', result);
        this.filters = result;
        this.applyFilters();
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  aplicarFiltros(): void {
    this.applyFilters();
  }

  limpiarFiltrosTemporales(): void {
    this.filters = {
      grado: '',
      grupo: '',
      turno: '',
      especialidad: ''
    };
  }

  abrirModalAgregar(): void {
    this.modalService.openModal(StudentModalComponent, {
      title: 'Nuevo Estudiante',
      size: 'md',
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
        this.loadStudents();
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  // ===================== ACCIONES DE ESTUDIANTES =====================
  editarIncidencia(student: Student): void {
    this.modalService.openModal(StudentModalComponent, {
      title: 'Editar Estudiante',
      size: 'md',
      data: { isEditMode: true, studentData: student },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
        this.loadStudents();
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  eliminarIncidencia(incidence: Student): void {
    this.modalConfirmation.confirm('¿Deseas continuar con esta acción?')
      .subscribe(result => {
        if (result === 'yes') {
          console.log('Usuario confirmó');
        } else if (result === 'no') {
          console.log('Usuario rechazó');
        } else {
          console.log('Usuario cerró el modal');
        }
      });
  }

  verDatosMedicos(incidence: Student): void {
    this.modalService.openModal(EmergencyDataComponent, {
      title: 'Información Médica',
      size: 'md',
      data: { type: 'student', selected: incidence },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  verIncidencias(incidence: any) {
    this.modalService.openModal(ModalViewIncidencesComponent, {
      title: 'Incidencias',
      size: 'lg',
      data: { isStudent: true, selected: incidence },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  sendIncidence(student: Student): void {
    this.modalService.openModal(SendIncidenceModalComponent, {
      title: 'Registrar incidencia',
      size: 'md',
      data: { isStudent: true, selected: [student] },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  mensajePadres(incidence: Student): void {
    console.log('Mensaje a padres:', incidence);
    alert(`Enviar mensaje a padres de: ${incidence.firstName} ${incidence.firstSurname}`);
    // Aquí puedes abrir un modal para enviar mensaje
    // this.router.navigate(['/mensajes/nuevo', incidence.id]);
  }

  hasAccess(funcionalidad: Functionality): boolean {
    return this.accessControlService.hasAccess(funcionalidad);
  }

  isSelected(item: any): boolean {
    return this.selectedItems.has(item);
  }

  // Verificar si todos los elementos están seleccionados
  isAllSelected(): boolean {
    return this.paginatedSubjects.length > 0 &&
      this.paginatedSubjects.every(item => this.selectedItems.has(item));
  }

  // Seleccionar/deseleccionar un elemento
  toggleSelection(item: any): void {
    if (this.selectedItems.has(item)) {
      this.selectedItems.delete(item);
    } else {
      this.selectedItems.add(item);
    }
  }

  // Seleccionar/deseleccionar todos
  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      // Deseleccionar todos
      this.paginatedSubjects.forEach(item => this.selectedItems.delete(item));
    } else {
      // Seleccionar todos
      this.paginatedSubjects.forEach(item => this.selectedItems.add(item));
    }
  }

  // Obtener elementos seleccionados (útil para acciones masivas)
  getSelectedItems(): any[] {
    return Array.from(this.selectedItems);
  }

  sendMultipleIncidences(): void {
    const students = this.getSelectedItems();
    this.modalService.openModal(SendIncidenceModalComponent, {
      title: 'Registrar incidencia',
      size: 'md',
      data: { isStudent: true, selected: students },
      showClose: true
    }).subscribe((result) => {
      this.selectedItems.clear();
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  exportToPDF(): void {
   /*this.reportExport.exportComponentToPDFSimple(StudentsListReportComponent, {
      title: 'Lista General de Alumnos',
      subtitle: 'Año Escolar 2024-2025',
      filename: 'todos_los_alumnos.pdf',
      logoUrl: 'assets/logo.png'
    },
  'Lista de estudiantes.pdf');*/
  }
}