import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IncidencesService } from '@services/incidences.service';
import { IncidenceTeacherList } from '@models/teacher-incidence-list.model';
import { ChangeDetectorRef } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { ModalViewStudentsDashboardIncidencesComponent } from './students-modal/students-modal';
import { ModalService } from '@services/modal.service';
import { Functionality } from '@enums/functionality.enum';
import { AccessControlService } from '@services/access-control.service';
import { AuthService } from '@services/auth.service';

type LoadState = 'empty' | 'loading' | 'error' | 'loaded';

@Component({
  selector: 'app-incidences-dashboard-student',
  templateUrl: './incidences-dashboard-student.html',
  styleUrls: ['./incidences-dashboard-student.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LottieComponent,
  ]
})
export class IncidencesDashboardStudentComponent implements OnInit {
  // Estados y datos
  state: LoadState = 'loading';
  incidences: IncidenceTeacherList[] = [];

  // Filtros - NUEVOS
  selectedPeriodType: 'month' | 'semester' = 'month';
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedSemester: '1' | '2' = new Date().getMonth() + 1 <= 6 ? '1' : '2';

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

  // NUEVAS PROPIEDADES PARA CLASIFICACIÓN
  badIncidenceTypes: string[] = [
    'Falta',
    'No Tarea',
    'Retardo',
    'Aviso',
    'Falta Reglamento',
    'Indisciplina',
    'Sin Material',
    'No Trabajó',
    'Pinta'
  ];

  goodIncidenceTypes: string[] = [
    'Excelente Desempeño',
    'Felicitación'
  ];

  // Contadores para las nuevas métricas
  badIncidencesCount: number = 0;
  goodIncidencesCount: number = 0;
  badIncidencesPercentage: string = '0';
  goodIncidencesPercentage: string = '0';

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

  /*private loadIncidences() {
    this.incidencesService.getStudentIncidence().subscribe({
      next: data => {
        this.incidences = data;
        this.applyFilters();
        this.state = 'loaded';
        console.log(data);
        this.cdr.detectChanges();
      },
      error: err => {
        this.state = 'error';
        this.cdr.detectChanges();
      }
    });
  }*/

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
          this.state = 'loaded';
          console.log(data);

          this.calculateSummaries();
          this.calculateGoodBadMetrics();
          this.cdr.detectChanges();
          resolve();
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  // NUEVO: Método llamado cuando cambia el tipo de periodo
  onPeriodTypeChange(): void {
    // Resetear valores según el tipo seleccionado
    if (this.selectedPeriodType === 'month') {
      this.selectedMonth = new Date().getMonth() + 1;
    } else {
      const currentMonth = new Date().getMonth() + 1;
      this.selectedSemester = currentMonth <= 6 ? '1' : '2';
    }
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let startDate: Date;
    let endDate: Date;

    if (this.selectedPeriodType === 'month') {
      startDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
      endDate = new Date(this.selectedYear, this.selectedMonth, 0, 23, 59, 59);
    } else {
      if (this.selectedSemester === '1') {
        startDate = new Date(this.selectedYear, 0, 1);
        endDate = new Date(this.selectedYear, 5, 30, 23, 59, 59);
      } else {
        startDate = new Date(this.selectedYear, 7, 1);
        endDate = new Date(this.selectedYear, 11, 31, 23, 59, 59);
      }
    }

    this.loadIncidences();

    this.calculateSummaries();
    this.calculateGoodBadMetrics();
  }

  // NUEVO MÉTODO: Calcular métricas de incidencias buenas y malas
  private calculateGoodBadMetrics(): void {
    this.badIncidencesCount = this.incidences.filter(
      inc => this.badIncidenceTypes.includes(inc.incidence_name)
    ).length;

    this.goodIncidencesCount = this.incidences.filter(
      inc => this.goodIncidenceTypes.includes(inc.incidence_name)
    ).length;

    const total = this.incidences.length;
    this.badIncidencesPercentage = total > 0
      ? ((this.badIncidencesCount / total) * 100).toFixed(1)
      : '0';
    this.goodIncidencesPercentage = total > 0
      ? ((this.goodIncidencesCount / total) * 100).toFixed(1)
      : '0';
  }

  private calculateSummaries(): void {
    // Usar solo incidencias malas para los resúmenes principales
    const badIncidences = this.getBadIncidences();

    this.teacherSummary = this.getSummary('student_name', badIncidences);
    this.reporterSummary = this.getSummary('created_by_name', badIncidences);
    this.typeSummary = this.getSummary('incidence_name', badIncidences);
    this.cdr.detectChanges();
  }

  private getSummary(field: keyof IncidenceTeacherList, dataSource: IncidenceTeacherList[] = this.incidences): Map<string, number> {
    const summary = new Map<string, number>();

    dataSource.forEach(incidence => {
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

  // Getters para totales de incidencias malas
  get totalBadStudents(): number {
    return this.teacherSummary.size;
  }

  get totalBadReporters(): number {
    return this.reporterSummary.size;
  }

  get totalBadTypes(): number {
    return this.typeSummary.size;
  }

  // NUEVOS métodos de utilidad para el texto del periodo
  getPeriodText(): string {
    if (this.selectedPeriodType === 'month') {
      const date = new Date(this.selectedYear, this.selectedMonth - 1, 1);
      return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    } else {
      return `${this.getSemesterText()} ${this.selectedYear}`;
    }
  }

  getMonthName(monthNumber: number): string {
    const month = this.months.find(m => m.value === monthNumber);
    return month ? month.name : '';
  }

  getSemesterText(): string {
    return this.selectedSemester === '1' ? 'Enero - Junio' : 'Agosto - Diciembre';
  }

  // Método para obtener el texto completo del periodo (para títulos)
  getFullPeriodText(): string {
    if (this.selectedPeriodType === 'month') {
      return `${this.getMonthName(this.selectedMonth)} ${this.selectedYear}`;
    } else {
      return `${this.getSemesterText()} ${this.selectedYear}`;
    }
  }

  abbreviateName(fullName: string): string {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return fullName;
  }

  calculatePercentage(count: number): string {
    return this.incidences.length > 0
      ? ((count / this.incidences.length) * 100).toFixed(1)
      : '0.0';
  }

  getStatusColor(count: number): string {
    if (count >= 10) return 'var(--danger)';
    if (count >= 5) return 'var(--warning)';
    return 'var(--ok)';
  }

  getMedalColor(index: number): string {
    if (index === 0) return '#FFD700'; // Oro
    if (index === 1) return '#C0C0C0'; // Plata
    if (index === 2) return '#CD7F32'; // Bronce
    return 'transparent';
  }

  viewAllIncidences(): void {
    this.router.navigate(['/dashboard/incidences-students'], {
      state: { incidences: this.incidences }
    });
  }

  retry(): void {
    this.state = 'loading';
    this.loadIncidences();
  }

  showStudentsModal(): void {
    this.modalService.openModal(ModalViewStudentsDashboardIncidencesComponent, {
      title: 'Lista de Alumnos',
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

  // ============ MÉTODOS PARA INCIDENCIAS (MALAS) ============

  getBadIncidences() {
    return this.incidences.filter(inc => this.badIncidenceTypes.includes(inc.incidence_name));
  }

  getBadTypesSummary(): [string, number][] {
    const badTypesMap = new Map<string, number>();
    this.getBadIncidences().forEach(inc => {
      badTypesMap.set(inc.incidence_name, (badTypesMap.get(inc.incidence_name) || 0) + 1);
    });
    return Array.from(badTypesMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  getBadStudentsSummary(): [string, number][] {
    const badStudentsMap = new Map<string, number>();
    this.getBadIncidences().forEach(inc => {
      badStudentsMap.set(inc.student_name, (badStudentsMap.get(inc.student_name) || 0) + 1);
    });
    return Array.from(badStudentsMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  getBadReportersSummary(): [string, number][] {
    const badReportersMap = new Map<string, number>();
    this.getBadIncidences().forEach(inc => {
      badReportersMap.set(inc.created_by_name, (badReportersMap.get(inc.created_by_name) || 0) + 1);
    });
    return Array.from(badReportersMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  // ============ MÉTODOS PARA RECONOCIMIENTOS (BUENAS) ============

  getGoodIncidences() {
    return this.incidences.filter(inc => this.goodIncidenceTypes.includes(inc.incidence_name));
  }

  getGoodTypesSummary(): [string, number][] {
    const goodTypesMap = new Map<string, number>();
    this.getGoodIncidences().forEach(inc => {
      goodTypesMap.set(inc.incidence_name, (goodTypesMap.get(inc.incidence_name) || 0) + 1);
    });
    return Array.from(goodTypesMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  getGoodStudentsSummary(): [string, number][] {
    const goodStudentsMap = new Map<string, number>();
    this.getGoodIncidences().forEach(inc => {
      goodStudentsMap.set(inc.student_name, (goodStudentsMap.get(inc.student_name) || 0) + 1);
    });
    return Array.from(goodStudentsMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  getGoodReportersSummary(): [string, number][] {
    const goodReportersMap = new Map<string, number>();
    this.getGoodIncidences().forEach(inc => {
      goodReportersMap.set(inc.created_by_name, (goodReportersMap.get(inc.created_by_name) || 0) + 1);
    });
    return Array.from(goodReportersMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  // ============ GETTERS PARA TOTALES ============

  getBadTotal(): number {
    return this.getBadIncidences().length;
  }

  getGoodTotal(): number {
    return this.getGoodIncidences().length;
  }

  getBadPercentage(): string {
    const total = this.incidences.length;
    return total > 0 ? ((this.getBadTotal() / total) * 100).toFixed(1) : '0';
  }

  getGoodPercentage(): string {
    const total = this.incidences.length;
    return total > 0 ? ((this.getGoodTotal() / total) * 100).toFixed(1) : '0';
  }

  // Getters para totales de reconocimientos
  get totalGoodStudents(): number {
    return new Set(this.getGoodIncidences().map(inc => inc.student_name)).size;
  }

  get totalGoodReporters(): number {
    return new Set(this.getGoodIncidences().map(inc => inc.created_by_name)).size;
  }

  get totalGoodTypes(): number {
    return new Set(this.getGoodIncidences().map(inc => inc.incidence_name)).size;
  }

  // ============ GETTERS PARA SABER SI HAY MÁS DE 5 ELEMENTOS ============

  get hasMoreBadTypes(): boolean {
    return new Set(this.getBadIncidences().map(inc => inc.incidence_name)).size > 5;
  }

  get hasMoreBadStudents(): boolean {
    return new Set(this.getBadIncidences().map(inc => inc.student_name)).size > 5;
  }

  get hasMoreBadReporters(): boolean {
    return new Set(this.getBadIncidences().map(inc => inc.created_by_name)).size > 5;
  }

  get hasMoreGoodTypes(): boolean {
    return new Set(this.getGoodIncidences().map(inc => inc.incidence_name)).size > 5;
  }

  get hasMoreGoodStudents(): boolean {
    return new Set(this.getGoodIncidences().map(inc => inc.student_name)).size > 5;
  }

  get hasMoreGoodReporters(): boolean {
    return new Set(this.getGoodIncidences().map(inc => inc.created_by_name)).size > 5;
  }

  // ============ MÉTODOS PARA ABRIR MODALES ============

  // Modal para ver todos los tipos de incidencias (malas)
  showAllBadTypesModal(): void {
    const badTypesData = Array.from(
      new Map(
        this.getBadIncidences().map(inc => [inc.incidence_name, inc])
      ).keys()
    ).map(typeName => {
      const count = this.getBadIncidences().filter(inc => inc.incidence_name === typeName).length;
      return [typeName, count] as [string, number];
    }).sort((a, b) => b[1] - a[1]);

    this.modalService.openModal(ModalViewStudentsDashboardIncidencesComponent, {
      title: 'Tipos',
      size: 'lg',
      data: {
        students: badTypesData,
        type: 'bad-types',
        total: this.badIncidencesCount
      },
      showClose: true,
    }).subscribe((result) => {
      if (result?.success) {
        console.log('Modal cerrado con éxito');
      }
    });
  }

  // Modal para ver todos los alumnos con incidencias (malas)
  showAllBadStudentsModal(): void {
    const badStudentsData = Array.from(
      new Map(
        this.getBadIncidences().map(inc => [inc.student_name, inc])
      ).keys()
    ).map(studentName => {
      const count = this.getBadIncidences().filter(inc => inc.student_name === studentName).length;
      return [studentName, count] as [string, number];
    }).sort((a, b) => b[1] - a[1]);

    this.modalService.openModal(ModalViewStudentsDashboardIncidencesComponent, {
      title: 'Alumnos',
      size: 'lg',
      data: {
        students: badStudentsData,
        type: 'bad',
        total: this.badIncidencesCount
      },
      showClose: true,
    }).subscribe((result) => {
      if (result?.success) {
        console.log('Modal cerrado con éxito');
      }
    });
  }

  // Modal para ver todos los prefectos que reportan incidencias
  showAllBadReportersModal(): void {
    const badReportersData = Array.from(
      new Map(
        this.getBadIncidences().map(inc => [inc.created_by_name, inc])
      ).keys()
    ).map(reporterName => {
      const count = this.getBadIncidences().filter(inc => inc.created_by_name === reporterName).length;
      return [reporterName, count] as [string, number];
    }).sort((a, b) => b[1] - a[1]);

    this.modalService.openModal(ModalViewStudentsDashboardIncidencesComponent, {
      title: 'Prefectos',
      size: 'lg',
      data: {
        students: badReportersData,
        type: 'bad-reporters',
        total: this.badIncidencesCount
      },
      showClose: true,
    }).subscribe((result) => {
      if (result?.success) {
        console.log('Modal cerrado con éxito');
      }
    });
  }

  // Modal para ver todos los tipos de reconocimientos
  showAllGoodTypesModal(): void {
    const goodTypesData = Array.from(
      new Map(
        this.getGoodIncidences().map(inc => [inc.incidence_name, inc])
      ).keys()
    ).map(typeName => {
      const count = this.getGoodIncidences().filter(inc => inc.incidence_name === typeName).length;
      return [typeName, count] as [string, number];
    }).sort((a, b) => b[1] - a[1]);

    this.modalService.openModal(ModalViewStudentsDashboardIncidencesComponent, {
      title: 'Tipos ',
      size: 'lg',
      data: {
        students: goodTypesData,
        type: 'good-types',
        total: this.goodIncidencesCount
      },
      showClose: true,
    }).subscribe((result) => {
      if (result?.success) {
        console.log('Modal cerrado con éxito');
      }
    });
  }

  // Modal para ver todos los alumnos con reconocimientos
  showAllGoodStudentsModal(): void {
    const goodStudentsData = Array.from(
      new Map(
        this.getGoodIncidences().map(inc => [inc.student_name, inc])
      ).keys()
    ).map(studentName => {
      const count = this.getGoodIncidences().filter(inc => inc.student_name === studentName).length;
      return [studentName, count] as [string, number];
    }).sort((a, b) => b[1] - a[1]);

    this.modalService.openModal(ModalViewStudentsDashboardIncidencesComponent, {
      title: 'Alumnos',
      size: 'lg',
      data: {
        students: goodStudentsData,
        type: 'good',
        total: this.goodIncidencesCount
      },
      showClose: true,
    }).subscribe((result) => {
      if (result?.success) {
        console.log('Modal cerrado con éxito');
      }
    });
  }

  // Modal para ver todos los prefectos que dan reconocimientos
  showAllGoodReportersModal(): void {
    const goodReportersData = Array.from(
      new Map(
        this.getGoodIncidences().map(inc => [inc.created_by_name, inc])
      ).keys()
    ).map(reporterName => {
      const count = this.getGoodIncidences().filter(inc => inc.created_by_name === reporterName).length;
      return [reporterName, count] as [string, number];
    }).sort((a, b) => b[1] - a[1]);

    this.modalService.openModal(ModalViewStudentsDashboardIncidencesComponent, {
      title: 'Prefectos',
      size: 'lg',
      data: {
        students: goodReportersData,
        type: 'good-reporters',
        total: this.goodIncidencesCount
      },
      showClose: true,
    }).subscribe((result) => {
      if (result?.success) {
        console.log('Modal cerrado con éxito');
      }
    });
  }
}