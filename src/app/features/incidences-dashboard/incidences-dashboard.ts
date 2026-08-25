import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IncidencesService } from '@services/incidences.service';
import { IncidenceTeacherList } from '@models/teacher-incidence-list.model';
import { ChangeDetectorRef } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { ModalViewTeacherDashboardIncidencesComponent } from './teacher-modal/teacher-modal';
import { ModalService } from '@services/modal.service';
import { Functionality } from '@enums/functionality.enum';
import { AccessControlService } from '@services/access-control.service';
import { AuthService } from '@services/auth.service';

type LoadState = 'empty' | 'loading' | 'error' | 'loaded';

@Component({
  selector: 'app-incidences-dashboard',
  templateUrl: './incidences-dashboard.html',
  styleUrls: ['./incidences-dashboard.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LottieComponent
  ]
})
export class IncidencesDashboardComponent implements OnInit {
  // Estados y datos
  state: LoadState = 'loading';
  incidences: IncidenceTeacherList[] = [];
  filteredIncidences: IncidenceTeacherList[] = [];

  // Filtros
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

  // Resúmenes
  teacherSummary: Map<string, number> = new Map();
  reporterSummary: Map<string, number> = new Map();
  typeSummary: Map<string, number> = new Map();

  // Opciones para dropdowns
  years: number[] = [2024, 2025, 2026, 2027, 2028];
  months: { value: number, name: string }[] = [];

  loadingOptions: AnimationOptions = {
    path: '/lottie/loading.json',
    loop: true,
    autoplay: true
  };

  public Functionality = Functionality;

  constructor(
    private incidencesService: IncidencesService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private accessControlService: AccessControlService,
    private authService: AuthService
  ) {
    this.initializeMonths();
  }

  ngOnInit(): void {
    this.loadIncidences();
  }

  private initializeMonths(): void {
    for (let i = 1; i <= 12; i++) {
      const date = new Date(2000, i - 1, 1);
      this.months.push({
        value: i,
        name: date.toLocaleString('es-ES', { month: 'long' })
      });
    }
  }
/*
  private loadIncidences(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.incidencesService.getIncidence().subscribe({
        next: data => {
          this.incidences = data;
          this.applyFilters();
          this.state = 'loaded';
          console.log(data);
          this.cdr.detectChanges();
          resolve();
        },
        error: err => {
          reject(err);
        }
      });
    });
  }
*/
  private loadIncidences(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.incidencesService.getIncidenceRecords(
        {
          schoolId: this.authService.getCurrentUser()?.school_id,
          type: 'ESTUDIANTE',
          startDate: `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-01`,
          endDate: `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${new Date(this.selectedYear, this.selectedMonth, 0).getDate()}`
        }
      ).subscribe({
        next: data => {
          this.incidences = data;
          this.applyFilters();
          this.state = 'loaded';
          console.log(data);
          this.cdr.detectChanges();
          resolve();
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    const startDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const endDate = new Date(this.selectedYear, this.selectedMonth, 0);

    this.filteredIncidences = this.incidences.filter(incidence => {
      const incidenceDate = new Date(incidence.created_at);
      return incidenceDate >= startDate && incidenceDate <= endDate;
    });

    this.calculateSummaries();
  }

  private calculateSummaries(): void {
    this.teacherSummary = this.getSummary('teacher_name');
    this.reporterSummary = this.getSummary('created_by_name');
    this.typeSummary = this.getSummary('incidence_name');
    this.cdr.detectChanges();
  }

  private getSummary(field: keyof IncidenceTeacherList): Map<string, number> {
    const summary = new Map<string, number>();

    this.filteredIncidences.forEach(incidence => {
      const key = incidence[field] as string;
      summary.set(key, (summary.get(key) || 0) + 1);
    });

    return new Map([...summary.entries()].sort((a, b) => b[1] - a[1]));
  }

  // Getters para las vistas ordenadas
  get sortedTeachers(): [string, number][] {
    return Array.from(this.teacherSummary.entries()).slice(0, 5);
  }

  get sortedReporters(): [string, number][] {
    return Array.from(this.reporterSummary.entries()).slice(0, 5);
  }

  get sortedTypes(): [string, number][] {
    return Array.from(this.typeSummary.entries()).slice(0, 5);
  }

  // Métodos de utilidad
  getPeriodText(): string {
    const date = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  }

  calculatePercentage(count: number): string {
    return this.filteredIncidences.length > 0
      ? ((count / this.filteredIncidences.length) * 100).toFixed(1)
      : '0.0';
  }

  abbreviateName(fullName: string): string {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return fullName;
  }

  getMedalColor(index: number): string {
    if (index === 0) return '#FFD700'; // Oro
    if (index === 1) return '#C0C0C0'; // Plata
    if (index === 2) return '#CD7F32'; // Bronce
    return 'transparent';
  }

  getRankBadge(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}°`;
  }

  getStatusColor(count: number): string {
    if (count >= 10) return 'var(--danger)';
    if (count >= 5) return 'var(--warning)';
    return 'var(--ok)';
  }

  viewAllIncidences(): void {
    this.router.navigate(['/dashboard/incidences'], {
      state: { incidences: this.incidences }
    });
  }

  retry(): void {
    this.state = 'loading';
    this.loadIncidences();
  }

  showTeacherModal(): void {
    this.modalService.openModal(ModalViewTeacherDashboardIncidencesComponent, {
      title: 'Lista Completa de Profesores',
      size: 'lg',
      data: { students: Array.from(this.teacherSummary.entries()) },
      showClose: true,
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  hasAccess(funcionalidad: Functionality): boolean {
    return this.accessControlService.hasAccess(funcionalidad);
  }

}