import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportAsModule } from 'ngx-export-as';
import { ExportNgxService } from '../../shared/export/export.ngx';
import { ExcelService } from '../../shared/export/excel.service';
import { ChangeDetectorRef } from '@angular/core';

interface Subject {
  id: number;
  name: string;
  code: string;
  credits: number;
  professor: string;
  schedule: string;
  enrollmentCount: number;
  status: 'active' | 'inactive';
}

type LoadState = 'empty' | 'loading' | 'error' | 'loaded';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ExportAsModule,

  ],
  providers: [
    ExportNgxService,
    ExcelService
  ],
  templateUrl: './subjects.html',
  styleUrls: ['./subjects.css']
})
export class SubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  selectedSubject: Subject | null = null;
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
  sortField: keyof Subject = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Formulario
  formModel: Partial<Subject> = {
    name: '',
    code: '',
    credits: 0,
    professor: '',
    schedule: '',
    enrollmentCount: 0,
    status: 'active'
  };

  constructor(private exportServiceNgx: ExportNgxService,
    private excelService: ExcelService<Subject>,
  private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadData();
  }

    // Cargar datos con estados
  async loadData(): Promise<void> {
    this.loadState = 'loading';
    
    try {
      // Simular carga de datos (reemplaza con tu API real)
      await this.simulateDataLoad();
      this.loadSampleData();
      this.applyFilters();
      this.loadState = this.filteredSubjects.length > 0 ? 'error' : 'error';
      this.cdr.detectChanges();
    } catch (error) {
      this.loadState = 'error';
      this.errorMessage = 'Error al cargar los datos. Por favor, intenta nuevamente.';
      console.error('Error loading data:', error);
      this.cdr.detectChanges();
    }
  }

  // Simular carga de datos (remover en producción)
  private simulateDataLoad(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular error aleatorio (10% de probabilidad)
        if (Math.random() < 0.1) {
          reject(new Error('Error de conexión'));
        } else {
          resolve();
        }
      }, 1500); // 1.5 segundos de simulación
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

  // Datos de ejemplo
  loadSampleData() {
    this.subjects = [];
  }

  // MÉTRICAS
  getActiveSubjectsCount(): number {
    return this.subjects.filter(s => s.status === 'active').length;
  }

  getTotalEnrollments(): number {
    return this.subjects.reduce((sum, subject) => sum + subject.enrollmentCount, 0);
  }

  getUniqueProfessorsCount(): number {
    return new Set(this.subjects.map(s => s.professor)).size;
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredSubjects.length);
    return `${start} a ${end} de ${this.filteredSubjects.length}`;
  }

  // FILTRADO
  applyFilters() {
    if (!this.searchTerm.trim()) {
      this.filteredSubjects = [...this.subjects];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredSubjects = this.subjects.filter(
        s => s.name.toLowerCase().includes(term) ||
          s.code.toLowerCase().includes(term) ||
          s.professor.toLowerCase().includes(term)
      );
    }

    this.sortSubjects();
    this.currentPage = 1; // reset página al filtrar
    this.loadState = this.filteredSubjects.length > 0 ? 'loaded': 'empty';
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

  onSort(field: keyof Subject) {
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

  // CRUD
  createSubject() {
    const newId = this.subjects.length ? Math.max(...this.subjects.map(s => s.id)) + 1 : 1;
    this.subjects.push({
      id: newId,
      name: this.formModel.name || '',
      code: this.formModel.code || '',
      credits: this.formModel.credits || 0,
      professor: this.formModel.professor || '',
      schedule: this.formModel.schedule || '',
      enrollmentCount: this.formModel.enrollmentCount || 0,
      status: this.formModel.status || 'active'
    });
    this.applyFilters();
    this.closeModal();
  }

  editSubject(subject: Subject) {
    this.selectedSubject = subject;
    this.isEditing = true;
    this.isCreating = false;
    this.formModel = { ...subject };
    this.showModal = true;
  }

  updateSubject() {
    if (!this.selectedSubject) return;
    const index = this.subjects.findIndex(s => s.id === this.selectedSubject!.id);
    if (index !== -1) {
      this.subjects[index] = { ...this.formModel, id: this.selectedSubject.id } as Subject;
      this.applyFilters();
      this.closeModal();
    }
  }

  deleteSubject(subject: Subject) {
    if (confirm(`¿Deseas eliminar la materia ${subject.name}?`)) {
      this.subjects = this.subjects.filter(s => s.id !== subject.id);
      this.applyFilters();
    }
  }

  // MODAL
  openCreateModal() {
    this.isCreating = true;
    this.isEditing = false;
    this.formModel = { name: '', code: '', credits: 0, professor: '', schedule: '', enrollmentCount: 0, status: 'active' };
    this.showModal = true;
  }

  submitForm() {
    if (this.isCreating) this.createSubject();
    if (this.isEditing) this.updateSubject();
  }

  closeModal() {
    this.showModal = false;
    this.isCreating = false;
    this.isEditing = false;
    this.selectedSubject = null;
    this.formModel = { name: '', code: '', credits: 0, professor: '', schedule: '', enrollmentCount: 0, status: 'active' };
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }

  getSortIcon(field: keyof Subject) {
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
    this.excelService.exportarExcel(this.filteredSubjects, 'personas')
    this.toggleExportDropdown();
  }
}
