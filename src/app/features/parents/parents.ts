import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Parent } from '@models/parent.model';
import { ParentService } from '@services/parent.service';
import { ChangeDetectorRef } from '@angular/core';
import { ModalService } from '@services/modal.service';
import { ParentModalComponent } from './parents-modal/parents-modal';
import { Functionality } from '@enums/functionality.enum';
import { AccessControlService } from '@services/access-control.service';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

//import { FilterParentModalComponent } from './filter/filter-parent';

interface Filters {
    grado: string;
    grupo: string;
    turno: string;
    especialidad: string;
}

@Component({
  selector: 'app-parents-list',
  templateUrl: './parents.html',
  styleUrls: ['./parents.css'],
  imports: [
    FormsModule,
    CommonModule,
    LottieComponent
  ]
})
export class ParentsComponent implements OnInit {
  // Data
  parents: Parent[] = [];
  filteredParents: Parent[] = [];
  paginatedSubjects: Parent[] = [];

  // Estados
  isLoading: boolean = false;
  hasError: boolean = false;
  isEmpty: boolean = false;
  errorMessage: string = '';

  public Functionality = Functionality;

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

  constructor(
    private parentService: ParentService,
    private readonly cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private accessControlService: AccessControlService,

    // private router: Router
  ) { }

  ngOnInit(): void {
    this.loadParents();
  }

  // ===================== CARGA DE DATOS =====================
  loadParents(): Promise<void> {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;

    return new Promise((resolve, reject) => {
      this.parentService.getParentList().subscribe({
        next: data => {
          this.parents = data;
          this.applyFilters();
          console.log(data);
          this.isLoading = false;
          this.isEmpty = this.parents.length == 0;
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
    this.loadParents();
  }

  // ===================== BÚSQUEDA Y FILTROS =====================
  applyFilters(): void {
    let filtered = [...this.parents];

    // Aplicar búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(inc =>
        inc.full_name?.toLowerCase().includes(term) ||
        inc.cell_phone?.toLowerCase().includes(term) ||
        inc.user?.email?.toLowerCase().includes(term) 
      );
    }

    // Aplicar filtros avanzados
    /*if (this.filters.grado) {
      filtered = filtered.filter(inc => inc.grade === Number(this.filters.grado));
    }
    if (this.filters.grupo) {
      filtered = filtered.filter(inc => String(inc.group) === this.filters.grupo);
    }
    if (this.filters.especialidad) {
      filtered = filtered.filter(inc => inc.especialidad === this.filters.especialidad);
    }*/

    this.filteredParents = filtered;
    this.isEmpty = this.filteredParents.length === 0 && !this.hasError && !this.isLoading;
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

    this.filteredParents.sort((a, b) => {
      const aValue = a[column as keyof Parent];
      const bValue = b[column as keyof Parent];

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
    this.totalPages = Math.ceil(this.filteredParents.length / Number(this.itemsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const startIndex = (Number(this.currentPage) - 1) * Number(this.itemsPerPage);
    const endIndex = startIndex + Number(this.itemsPerPage);
    this.paginatedSubjects = this.filteredParents.slice(startIndex, endIndex);

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
    if (this.filteredParents.length === 0) return '0 de 0';
    const start = (Number(this.currentPage) - 1) * Number(this.itemsPerPage) + 1;
    const end = Math.min(start + Number(this.itemsPerPage) - 1, this.filteredParents.length);
    return `${start}-${end} de ${this.filteredParents.length}`;
  }

  // ===================== EXPORTACIÓN =====================
  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
  }

  exportarExcelXlsx(): void {
    const dataToExport = this.filteredParents.map(inc => ({
      'ID': inc.id,
      'Nombre de usuario': inc.user?.username,
      'Nombre': inc.user?.first_name,
      'Apellidos': inc.user?.last_name,
      'Email': inc.user?.email,
      'Telefono': inc.cell_phone
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Padres');

    const fileName = `padres_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    this.showExportDropdown = false;
  }

  // ===================== MODALES =====================
  /*abrirModalFiltros(): void {
    this.filters = { ...this.filters };
    this.modalService.openModal(FilterParentModalComponent, {
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
*/
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
    this.modalService.openModal(ParentModalComponent, {
      title: 'Nuevo Padre de familia',
      size: 'md',
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
        this.loadParents();
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  // ===================== ACCIONES DE ESTUDIANTES =====================
  editarIncidencia(parent: Parent): void {
    this.modalService.openModal(ParentModalComponent, {
      title: 'Editar Padre de familia',
      size: 'md',
      data: { isEditMode: true, parentData: parent },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
        this.loadParents();
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  eliminarIncidencia(incidence: Parent): void {
    if (confirm(`¿Está seguro de eliminar a ${incidence.user?.fullName}?`)) {
      this.parents = this.parents.filter(i => i.id !== incidence.id);
      this.applyFilters();
      alert('Estudiante eliminado exitosamente');
    }
  }

  verDatosMedicos(incidence: Parent): void {
    console.log('Ver datos médicos:', incidence);
    alert(`Datos médicos de: ${incidence.full_name} `);
  }

  enviarIncidencia(incidence: Parent): void {
    console.log('Enviar incidencia:', incidence);
    alert(`Enviar incidencia de: ${incidence.full_name}`);
    // Aquí puedes abrir un modal para registrar la incidencia
    // this.router.navigate(['/incidencias/nuevo', incidence.id]);
  }

  mensajePadres(incidence: Parent): void {
    console.log('Mensaje a padres:', incidence);
    alert(`Enviar mensaje a padres de: ${incidence.full_name}`);
    // Aquí puedes abrir un modal para enviar mensaje
    // this.router.navigate(['/mensajes/nuevo', incidence.id]);
  }

  hasAccess(funcionalidad: Functionality): boolean {
    return this.accessControlService.hasAccess(funcionalidad);
  }
}