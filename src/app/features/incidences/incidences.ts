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

type LoadState = 'empty' | 'loading' | 'error' | 'loaded';

@Component({
  selector: 'app-incidences',
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
  templateUrl: './incidences.html',
  styleUrl: './incidences.css'
})
export class IncidencesComponent implements OnInit {
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

  loadingOptions: AnimationOptions = {
    path: '/lottie/loading.json',
    loop: true,
    autoplay: true
  };

  constructor(private exportServiceNgx: ExportNgxService,
    private excelService: ExcelService<any>,
    private cdr: ChangeDetectorRef,
    private incidencesService: IncidencesService,
    private datePipe: DatePipe) { }

  ngOnInit() {
    this.loadData();
  }

  // Cargar datos con estados
  async loadData(): Promise<void> {
    this.loadState = 'loading';

    try {
      await this.dataLoad();
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
      this.incidencesService.getIncidence().subscribe({
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

  // FILTRADO
  applyFilters() {
    if (!this.searchTerm.trim()) {
      this.filteredSubjects = [...this.incidences];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredSubjects = this.incidences.filter(
        s => s.teacher_name.toLowerCase().includes(term) ||
          s.incidence_name.toLowerCase().includes(term) ||
          s.observation.toLowerCase().includes(term)
      );
    }

    this.sortSubjects();
    this.currentPage = 1; // reset página al filtrar
    this.loadState = this.filteredSubjects.length > 0 ? 'loaded' : 'empty';
  }

  // ORDENAMIENTO
  sortSubjects() {
    this.filteredSubjects.sort((a, b) => {
      const valueA = a[this.sortField];
      const valueB = b[this.sortField];
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
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
      Docente: i.teacher_name,
      Observaciones: i.observation,
      Creada: this.datePipe.transform(i.created_at, 'dd/MM/yyyy hh:mm:ss a'),
      Registrado: i.created_by_name,
    }));
    this.excelService.exportarExcel(incidences, 'Incidencias_docentes')
    this.toggleExportDropdown();
  }
}
