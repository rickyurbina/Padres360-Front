import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportAsModule } from 'ngx-export-as';
import { ExportNgxService } from '../../shared/export/export.ngx';
import { ExcelService } from '../../shared/export/excel.service';
import { ChangeDetectorRef } from '@angular/core';
import { IncidencesService } from '@services/incidences.service';
import { IncidenceTeacherList } from '@models/teacher-incidence-list.model';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { ModalService } from '@services/modal.service';
import { FilterIncidencesModalComponent } from './filter/filter-incidences';
import { AuthService } from '@services/auth.service';

interface Filters {
  startDate: string;
  endDate: string;
}

type LoadState = 'empty' | 'loading' | 'error' | 'loaded';

@Component({
  selector: 'app-incidences-students',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ExportAsModule,
    LottieComponent
  ],
  providers: [
    ExportNgxService,
    ExcelService
  ],
  templateUrl: './incidences-students.html',
  styleUrl: './incidences-students.css'
})
export class IncidencesStudentComponent implements OnInit {
  incidences: IncidenceTeacherList[] = [];
  filteredSubjects: IncidenceTeacherList[] = [];
  selectedSubject: IncidenceTeacherList | null = null;
  isEditing = false;
  isCreating = false;
  showModal = false;

  // Estados de carga
  loadState: LoadState = 'loading';
  errorMessage: string = '';

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  itemsPerPageOptions: number[] = [5, 10, 20, 50];

  // Filtros y ordenamiento
  searchTerm = '';
  sortField: keyof IncidenceTeacherList = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  // NUEVO: Objeto para filtros individuales
  filtros: any = {
    student_name: '',
    created_by_name: '',
    created_at: '',
    incidence_name: '',
    observation: '',
    read: false,
  };

  filtersDate: Filters = {
    startDate: '',
    endDate: ''
  };

  // NUEVO: Array para los tipos de incidencia únicos
  tiposIncidencia: string[] = [];

  // Flag para controlar si se aplican filtros individuales o búsqueda global
  useIndividualFilters: boolean = true;

  loadingOptions: AnimationOptions = {
    path: '/lottie/loading.json',
    loop: true,
    autoplay: true
  };
  currentUser: any;

  constructor(private exportServiceNgx: ExportNgxService,
    private excelService: ExcelService<any>,
    private cdr: ChangeDetectorRef,
    private incidencesService: IncidencesService,
    private readonly authservice: AuthService,
    private datePipe: DatePipe,
    private modalService: ModalService) {
    this.currentUser = this.authservice.getCurrentUser();
  }

  ngOnInit() {
    const today = new Date();

    const startDate = new Date();
    startDate.setDate(today.getDate() - 30);

    this.filtersDate.startDate = this.formatDate(startDate);
    this.filtersDate.endDate = this.formatDate(today);
    this.loadData();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Cargar datos con estados
  async loadData(): Promise<void> {
    this.loadState = 'loading';

    try {
      await this.dataLoad();
      this.extraerTiposUnicos();
      this.applyFilters();
      this.loadState = this.filteredSubjects.length > 0 ? 'loaded' : 'empty';
      this.cdr.detectChanges();
    } catch (error) {
      this.loadState = 'error';
      this.errorMessage = 'Error al cargar los datos. Por favor, intenta nuevamente.';
      this.cdr.detectChanges();
    }
  }

  // Simular carga de datos (remover en producción)
  private dataLoad(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.incidencesService.getIncidenceRecords({
        createdBy: this.currentUser.teacher_id,
        schoolId: this.currentUser.school_id,
        startDate: this.filtersDate.startDate,
        endDate: this.filtersDate.endDate,
        type: 'ESTUDIANTE'
      }).subscribe({
        next: data => {
          this.incidences = data;
          resolve();
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  // NUEVO: Extraer tipos únicos para el filtro de selección
  private extraerTiposUnicos() {
    this.tiposIncidencia = [...new Set(this.incidences.map(i => i.incidence_name))];
  }

  reloadData(): void {
    this.loadData();
  }

  // Métodos para verificar estados
  get isLoading(): boolean {
    return this.loadState === 'loading';
  }

  get isEmpty(): boolean {
    return this.loadState === 'empty';
  }

  get hasError(): boolean {
    return this.loadState === 'error';
  }

  get isLoaded(): boolean {
    return this.loadState === 'loaded';
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredSubjects.length);
    return `${start} a ${end} de ${this.filteredSubjects.length}`;
  }

  // FILTRADO MEJORADO
  applyFilters() {
    if (this.useIndividualFilters) {
      // Usar filtros individuales por columna
      this.filteredSubjects = this.incidences.filter(incidencia => {
        let cumpleFiltro = true;

        // Filtro por nombre de alumno
        if (this.filtros.student_name) {
          cumpleFiltro = cumpleFiltro &&
            incidencia.student_name?.toLowerCase().includes(this.filtros.student_name.toLowerCase());
        }

        // Filtro por creador
        if (this.filtros.created_by_name) {
          cumpleFiltro = cumpleFiltro &&
            incidencia.created_by_name?.toLowerCase().includes(this.filtros.created_by_name.toLowerCase());
        }

        // Filtro por fecha
        if (this.filtros.created_at) {
          const fechaIncidencia = new Date(incidencia.created_at).toISOString().split('T')[0];
          cumpleFiltro = cumpleFiltro && fechaIncidencia === this.filtros.created_at;
        }

        // Filtro por tipo
        if (this.filtros.incidence_name) {
          cumpleFiltro = cumpleFiltro &&
            incidencia.incidence_name === this.filtros.incidence_name;
        }

        // Filtro por observación
        if (this.filtros.observation) {
          cumpleFiltro = cumpleFiltro &&
            incidencia.observation?.toLowerCase().includes(this.filtros.observation.toLowerCase());
        }

        return cumpleFiltro;
      });
    } else {
      // Mantener la búsqueda global original
      if (!this.searchTerm.trim()) {
        this.filteredSubjects = [...this.incidences];
      } else {
        const term = this.searchTerm.toLowerCase();
        this.filteredSubjects = this.incidences.filter(
          s => s.student_name?.toLowerCase().includes(term) ||
            s.incidence_name?.toLowerCase().includes(term) ||
            s.observation?.toLowerCase().includes(term)
        );
      }
    }

    this.sortSubjects();
    this.currentPage = 1; // reset página al filtrar
    this.loadState = this.filteredSubjects.length > 0 ? 'loaded' : 'empty';
  }

  // NUEVO: Método para limpiar un filtro específico
  limpiarFiltro(campo: string) {
    this.filtros[campo] = '';
    this.applyFilters();
  }

  // NUEVO: Método para limpiar todos los filtros
  limpiarTodosLosFiltros() {
    this.filtros = {
      student_name: '',
      created_by_name: '',
      created_at: '',
      incidence_name: '',
      observation: ''
    };
    this.applyFilters();
  }

  // NUEVO: Método para alternar entre filtros individuales y búsqueda global
  toggleFilterMode() {
    this.useIndividualFilters = !this.useIndividualFilters;
    if (this.useIndividualFilters) {
      this.searchTerm = ''; // Limpiar búsqueda global
    } else {
      this.limpiarTodosLosFiltros(); // Limpiar filtros individuales
    }
    this.applyFilters();
  }

  // ORDENAMIENTO
  sortSubjects() {
    this.filteredSubjects.sort((a, b) => {
      const valueA = a[this.sortField];
      const valueB = b[this.sortField];

      // Manejar valores nulos o undefined
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueB == null) return this.sortDirection === 'asc' ? 1 : -1;

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }
      if (valueA instanceof Date && valueB instanceof Date) {
        return this.sortDirection === 'asc' ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
      }
      return this.sortDirection === 'asc' ? (valueA as any) - (valueB as any) : (valueB as any) - (valueA as any);
    });
  }

  onSort(field: keyof IncidenceTeacherList) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters(); // reinicia paginación al ordenar
  }

  // PAGINACIÓN
  get paginatedSubjects() {
    const start = (Number(this.currentPage) - 1) * Number(this.itemsPerPage);
    const list = this.filteredSubjects.slice(start, start + Number(this.itemsPerPage));
    return list;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSubjects.length / this.itemsPerPage) || 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  firstPage() { this.currentPage = 1; }
  lastPage() { this.currentPage = this.totalPages; }

  changeItemsPerPage() {
    this.currentPage = 1; // reset página al cambiar itemsPerPage
  }

  get pagesArray(): number[] {
    const maxButtons = 5;
    const total = this.totalPages;
    let start = Math.max(this.currentPage - Math.floor(maxButtons / 2), 1);
    let end = Math.min(start + maxButtons - 1, total);
    if (end - start + 1 < maxButtons) start = Math.max(end - maxButtons + 1, 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }

  getSortIcon(field: keyof IncidenceTeacherList) {
    if (this.sortField !== field) return 'sort';
    return this.sortDirection === 'asc' ? 'sort-up' : 'sort-down';
  }

  getStatusClass(status: 'active' | 'inactive') {
    return status === 'active' ? 'status-active' : 'status-inactive';
  }

  showExportDropdown = false;

  toggleExportDropdown() {
    this.showExportDropdown = !this.showExportDropdown;
  }

  exportarNgx(tipo: 'pdf' | 'xls' | 'png'): void {
    this.exportServiceNgx.exportar(tipo, 'tablaExportar', 'tabla-personas');
    this.toggleExportDropdown();
  }

  exportarExcelXlsx(): void {
    const incidences: any = this.filteredSubjects.map(i => ({
      id: i.id,
      Incidencia: i.incidence_name,
      Alumno: i.student_name,
      Observaciones: i.observation,
      Creada: this.datePipe.transform(i.created_at, 'dd/MM/yyyy hh:mm:ss a'),
      Registrado: i.created_by_name,
      Leido: i.read ? 'Sí' : 'No'
    }));
    this.excelService.exportarExcel(incidences, 'Incidencias_alumnos')
    this.toggleExportDropdown();
  }

  abrirModalFiltros(): void {
    this.filtersDate = { ...this.filtersDate };
    this.modalService.openModal(FilterIncidencesModalComponent, {
      title: 'Filtro avanzado',
      size: 'md',
      data: { filters: this.filtersDate },
      showClose: true
    }).subscribe((result) => {
      if (result) {
        console.log('El modal se cerró con datos:', result);
        this.filtersDate = result;
        this.loadData();
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }
}