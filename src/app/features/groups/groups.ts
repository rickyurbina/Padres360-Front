import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { GroupService } from '@services/groups.service';
import { Group } from '@models/groups.model';
import { ChangeDetectorRef } from '@angular/core';
import { ModalService } from '@services/modal.service';
import { GroupsModalComponent } from './modal/group-modal';
import { ConfirmationModalService } from '@services/confirmation-modal.service';
import { firstValueFrom } from 'rxjs';
import { Functionality } from '@enums/functionality.enum';
import { AccessControlService } from '@services/access-control.service';

interface Filters {
  grade: string;
  shift: string;
  specialty: string;
}

interface FormErrors {
  group?: string;
  grade?: string;
  specialty?: string;
  shift?: string;
}

@Component({
  selector: 'app-groups',
  imports: [CommonModule, FormsModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
  standalone: true
})
export class GroupsComponent implements OnInit {
  // Data
  groups: Group[] = [];
  filteredGroups: Group[] = [];
  paginatedSubjects: Group[] = [];

  // Estados
  isLoading: boolean = false;
  hasError: boolean = false;
  isEmpty: boolean = false;
  errorMessage: string = '';

  // Búsqueda y filtros
  searchTerm: string = '';
  filters: Filters = {
    grade: '',
    shift: '',
    specialty: ''
  };
  tempFilters: Filters = {
    grade: '',
    shift: '',
    specialty: ''
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
  showAddEditModal: boolean = false;
  isEditMode: boolean = false;

  // Formulario
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
  formErrors: FormErrors = {};

  // Opciones de turno
  shiftOptions: string[] = ['Matutino', 'Vespertino'];

  public Functionality = Functionality;

  constructor(
    private readonly groupService: GroupService,
    private readonly cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private modalConfirmation: ConfirmationModalService,
    private accessControlService: AccessControlService,) { }

  ngOnInit(): void {
    this.loadData();
  }

  // ===================== CARGA DE DATOS =====================
  private loadData(): Promise<void> {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;
    return new Promise((resolve, reject) => {
      this.groupService.getGroupFilters().subscribe(filters => {
        this.groups = filters.gruposFull.sort((a, b) => {
          if (a.grade !== b.grade) return a.grade - b.grade;

          const groupA = a.name || '';
          const groupB = b.name || '';

          return groupA.localeCompare(groupB);
        });
        this.applyFilters();
        console.log(this.groups);
        this.isLoading = false;
        this.isEmpty = this.groups.length == 0;
        this.cdr.detectChanges();
        resolve();

      });
    });
  }

  reloadData(): void {
    this.loadData();
  }

  // ===================== BÚSQUEDA Y FILTROS =====================
  applyFilters(): void {
    let filtered = [...this.groups];

    // Aplicar búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(group =>
        group.name?.toLowerCase().includes(term) ||
        group.grade?.toString().includes(term) ||
        group.shift?.toLowerCase().includes(term) ||
        group.specialty?.toLowerCase().includes(term)
      );
    }

    // Aplicar filtros avanzados
    if (this.filters.grade) {
      filtered = filtered.filter(group => group.grade.toString() === this.filters.grade);
    }
    if (this.filters.shift) {
      filtered = filtered.filter(group => group.shift === this.filters.shift);
    }
    if (this.filters.specialty) {
      filtered = filtered.filter(group => group.specialty === this.filters.specialty);
    }

    this.filteredGroups = filtered;
    this.isEmpty = this.filteredGroups.length === 0 && !this.hasError && !this.isLoading;
    this.updatePagination();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.grade || this.filters.shift || this.filters.specialty);
  }

  removeFilter(filterKey: keyof Filters): void {
    this.filters[filterKey] = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.filters = {
      grade: '',
      shift: '',
      specialty: ''
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

    this.filteredGroups.sort((a, b) => {
      const aValue = a[column as keyof Group];
      const bValue = b[column as keyof Group];

      let comparison = 0;

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      // Para números, comparación numérica
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        // Para strings, comparación alfabética
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr > bStr) comparison = 1;
        if (aStr < bStr) comparison = -1;
      }

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
    this.totalPages = Math.ceil(this.filteredGroups.length / Number(this.itemsPerPage));
    this.currentPage = Math.min(Number(this.currentPage), this.totalPages || 1);

    const startIndex = (Number(this.currentPage) - 1) * Number(this.itemsPerPage);
    const endIndex = startIndex + Number(this.itemsPerPage);
    this.paginatedSubjects = this.filteredGroups.slice(startIndex, endIndex);

    this.updatePagesArray();
  }

  updatePagesArray(): void {
    this.pagesArray = [];
    const maxPages = 5;
    let startPage = Math.max(1, Number(this.currentPage) - Math.floor(maxPages / 2));
    let endPage = Math.min(Number(this.totalPages), startPage + maxPages - 1);

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
    if (this.filteredGroups.length === 0) return '0 de 0';
    const start = (Number(this.currentPage) - 1) * Number(this.itemsPerPage) + 1;
    const end = Math.min(start + Number(this.itemsPerPage) - 1, this.filteredGroups.length);
    return `${start}-${end} de ${this.filteredGroups.length}`;
  }

  // ===================== EXPORTACIÓN =====================
  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
  }

  exportarExcelXlsx(): void {
    const dataToExport = this.filteredGroups.map(group => ({
      'ID': group.id,
      'Nombre': group.group,
      'Grado': group.grade,
      'Turno': group.shift,
      'Especialidad': group.specialty,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Grupos');

    const fileName = `grupos_${new Date().getTime()}.xlsx`;
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
      grade: '',
      shift: '',
      specialty: ''
    };
  }

  abrirModalAgregar(): void {
    this.isEditMode = false;
    this.modalService.openModal(GroupsModalComponent, {
      title: 'Nuevo grupo',
      size: 'md',
      showClose: true
    }).subscribe((result) => {
      if (result) {
        console.log('El modal se cerró con datos: ', result);
        this.loadData();
      }
    });
  }

  cerrarModalAgregarEditar(): void {
    this.showAddEditModal = false;
    this.formErrors = {};
  }

  // ===================== ACCIONES DE GRUPOS =====================
  verEstudiantes(group: Group): void {
    console.log('Ver estudiantes del grupo:', group);
    alert(`Ver estudiantes de: ${group.grade}° ${group.group}`);
  }

  editarGrupo(group: Group): void {
    this.isEditMode = true;
    this.isEditMode = false;
    this.modalService.openModal(GroupsModalComponent, {
      title: 'Editar grupo',
      size: 'md',
      data: { isEditMode: true, groupData: group },
      showClose: true
    }).subscribe((result) => {
      if (result) {
        console.log('El modal se cerró con datos: ', result);
        this.loadData();
      }
    });
  }

  async deleteGroup(group: any) {
    console.log('🔵 Iniciando deleteGroup');

    try {
      const result = await firstValueFrom(
        this.modalConfirmation.confirm('¿Deseas continuar con esta acción?')
      );

      console.log('🔵 Resultado de confirmación:', result);

      if (result === 'yes') {
        this.isLoading = true;

        try {
          const data = await firstValueFrom(this.groupService.delete(group));
          console.log('✅ Eliminación exitosa:', data);
          this.isLoading = false;
          this.loadData();

          await new Promise(resolve => setTimeout(resolve, 200));

          console.log('🟢 Mostrando modal de éxito');
          this.modalConfirmation.showSuccess('Grupo eliminado exitosamente.').subscribe();

        } catch (err) {
          console.error('❌ Error en eliminación:', err);
          this.hasError = true;
          this.isLoading = false;

          await new Promise(resolve => setTimeout(resolve, 200));

          console.log('🔴 Mostrando modal de error');
          this.modalConfirmation.showError('Ocurrió un error al eliminar el grupo').subscribe();
        }
      }

    } catch (err) {
      console.error('❌ Error general:', err);
    }
  }

  asignarMaestro(group: Group): void {
    console.log('Asignar maestro al grupo:', group);
    alert(`Asignar maestro a: ${group.grade}° ${group.group}`);
  }

  verHorario(group: Group): void {
    console.log('Ver horario del grupo:', group);
    alert(`Ver horario de: ${group.grade}° ${group.group}`);
  }

  // ===================== UTILIDADES =====================
  getUniqueSpecialties(): string[] {
    const specialties = this.groups.map(g => g.specialty);
    return Array.from(new Set(specialties)).sort();
  }

  hasAccess(funcionalidad: Functionality): boolean {
    return this.accessControlService.hasAccess(funcionalidad);
  }
}