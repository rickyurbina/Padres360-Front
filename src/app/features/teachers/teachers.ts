import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ModalService } from '@services/modal.service';
import { SendIncidenceModalComponent } from '../incidences-send-modal/incidences-send-modal';
import { TeacherService } from '@services/teacher.services';
import { Teacher } from '@models/teacher.model';
import { ModalViewIncidencesComponent } from '../modal-view-incidences/modal-view-incidences';
import { EmergencyDataComponent } from '../emergency-data/emergency-data';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { Functionality } from '@enums/functionality.enum';
import { AccessControlService } from '@services/access-control.service';
import { TeacherModalComponent } from './teacher-modal/teacher-modal';

interface Filters {
  especialidad: string;
  turno: string;
  status: string;
}

@Component({
  selector: 'app-teachers-list',
  templateUrl: './teachers.html',
  styleUrls: ['./teachers.css'],
  imports: [
    FormsModule,
    CommonModule,
    LottieComponent
  ]
})
export class TeachersComponent implements OnInit {
  // Data
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  paginatedTeachers: Teacher[] = [];

  // Estados
  isLoading: boolean = false;
  hasError: boolean = false;
  isEmpty: boolean = false;
  errorMessage: string = '';

  // Búsqueda y filtros
  searchTerm: string = '';
  filters: Filters = {
    especialidad: '',
    turno: '',
    status: ''
  };
  tempFilters: Filters = {
    especialidad: '',
    turno: '',
    status: ''
  };

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

  loadingOptions: AnimationOptions = {
    path: '/lottie/loading.json',
    loop: true,
    autoplay: true
  };

  public Functionality = Functionality;

  constructor(
    private modalService: ModalService,
    private teacherService: TeacherService,
    private cdr: ChangeDetectorRef,
    private accessControlService: AccessControlService,
    // private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTeachers();
  }

  // ===================== CARGA DE DATOS =====================
  loadTeachers(): void {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;
    this.teacherService.getList().subscribe({
      next: data => {
        this.teachers = data;
        this.applyFilters();
        console.log(data);
        this.isLoading = false;
        this.isEmpty = this.teachers.length == 0;
        this.cdr.detectChanges();
      },
      error: err => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  reloadData(): void {
    this.loadTeachers();
  }

  // ===================== BÚSQUEDA Y FILTROS =====================
  applyFilters(): void {
    let filtered = [...this.teachers];

    // Aplicar búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(teacher =>
        teacher.fullName?.toLowerCase().includes(term) ||
        teacher.phone?.toLowerCase().includes(term) ||
        teacher.email?.toLowerCase().includes(term)
      );
    }

    // Aplicar filtros avanzados
    /* if (this.filters.especialidad) {
       filtered = filtered.filter(teacher => teacher.especialidad === this.filters.especialidad);
     }
     if (this.filters.turno) {
       filtered = filtered.filter(teacher => teacher.turno === this.filters.turno);
     }
     if (this.filters.status) {
       filtered = filtered.filter(teacher => teacher.status === this.filters.status);
     }
 */
    this.filteredTeachers = filtered;
    this.isEmpty = this.filteredTeachers.length === 0 && !this.hasError && !this.isLoading;
    this.updatePagination();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.especialidad || this.filters.turno || this.filters.status);
  }

  removeFilter(filterKey: keyof Filters): void {
    this.filters[filterKey] = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.filters = {
      especialidad: '',
      turno: '',
      status: ''
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

    this.filteredTeachers.sort((a, b) => {
      const aValue = a[column as keyof Teacher];
      const bValue = b[column as keyof Teacher];

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
    this.totalPages = Math.ceil(this.filteredTeachers.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTeachers = this.filteredTeachers.slice(startIndex, endIndex);

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
    if (this.filteredTeachers.length === 0) return '0 de 0';
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, this.filteredTeachers.length);
    return `${start}-${end} de ${this.filteredTeachers.length}`;
  }

  // ===================== EXPORTACIÓN =====================
  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
  }

  exportarExcelXlsx(): void {
    const dataToExport = this.filteredTeachers.map(teacher => ({
      'ID': teacher.id,
      'Nombre Completo': teacher.fullName,
      'Correo': teacher.email,
      'Teléfono': teacher.phone,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Maestros');

    const fileName = `maestros_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    this.showExportDropdown = false;
  }

  // ===================== MODALES =====================
  abrirModalFiltros(): void {
    this.tempFilters = { ...this.filters };
    this.showFilterModal = true;
  }

  cerrarModalFiltros(): void {
    this.showFilterModal = false;
  }

  aplicarFiltros(): void {
    this.filters = { ...this.tempFilters };
    this.applyFilters();
    this.cerrarModalFiltros();
  }

  limpiarFiltrosTemporales(): void {
    this.tempFilters = {
      especialidad: '',
      turno: '',
      status: ''
    };
  }

  abrirModalAgregar(): void {
    this.modalService.openModal(TeacherModalComponent, {
      title: 'Registrar docente',
      size: 'lg',
      data: { },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  // ===================== ACCIONES DE MAESTROS =====================
  verDatosMedicos(teacher: Teacher): void {
    this.modalService.openModal(EmergencyDataComponent, {
      title: 'Información Médica',
      size: 'md',
      data: { type: 'teacher', selected: teacher },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  verIncidencias(teacher: Teacher): void {
    this.modalService.openModal(ModalViewIncidencesComponent, {
      title: 'Incidencias',
      size: 'lg',
      data: { isStudent: false, selected: teacher },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  sendIncidence(teacher: Teacher): void {
    this.modalService.openModal(SendIncidenceModalComponent, {
      title: 'Registrar incidencia',
      size: 'md',
      data: { isStudent: false, selected: [teacher] },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  enviarMensaje(teacher: Teacher): void {
    console.log('Enviar mensaje al maestro:', teacher);
    alert(`Enviar mensaje a: ${teacher.firstName}\nCorreo: ${teacher.email}`);
    // this.router.navigate(['/mensajes/nuevo', teacher.id]);
  }

  editarMaestro(teacher: Teacher): void {
    this.modalService.openModal(TeacherModalComponent, {
      title: 'Editar docente',
      size: 'lg',
      data: { selected:[teacher]},
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  eliminarMaestro(teacher: Teacher): void {
    if (confirm(`¿Está seguro de eliminar al maestro ${teacher.fullName}?`)) {
      console.log('Eliminar maestro:', teacher);
      this.teachers = this.teachers.filter(t => t.id !== teacher.id);
      this.applyFilters();
      alert('Maestro eliminado exitosamente');

      // this.teacherService.deleteTeacher(teacher.id).subscribe({
      //   next: () => {
      //     this.loadTeachers();
      //   },
      //   error: (error) => {
      //     alert('Error al eliminar: ' + error.message);
      //   }
      // });
    }
  }

  hasAccess(funcionalidad: Functionality): boolean {
    return this.accessControlService.hasAccess(funcionalidad);
  }
}