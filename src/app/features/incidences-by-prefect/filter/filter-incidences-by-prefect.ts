import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@services/modal.service';

export interface DateFilters {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-filter-incidences-by-prefect-modal',
  standalone: true,
  templateUrl: './filter-incidences-by-prefect.html',
  styleUrls: ['./filter-incidences-by-prefect.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class FilterIncidencesByPrefectModalComponent {

  isLoading = false;

  filters: DateFilters = {
    startDate: '',
    endDate: ''
  };

  constructor(
    private readonly modalService: ModalService
  ) { }

  ngOnInit(): void {
    const data = this.modalService['modalState'].value.config?.data;

    if (data?.filters) {
      this.filters = {
        ...data.filters
      };
    }
  }

  aplicarFiltros(): void {
    this.close(this.filters);
  }

  limpiarFormulario(): void {
    this.filters = {
      startDate: '',
      endDate: ''
    };
  }

  close(result?: DateFilters): void {
    this.modalService.closeModal(result);
  }
}