// students-list-report.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StudentReportData {
  ID: string | number;
  Nombre: string;
  Apellidos: string;
  Grado: string;
  Grupo: string;
  Turno: string;
  Especialidad: string;
}

@Component({
  selector: 'app-students-list-report',
  standalone: true,
  imports: [CommonModule],
  template: 'student-list-pdf.html',
  styles: ['student-list-pdf.css']
})
export class StudentsListReportComponent implements OnInit {
  @Input() students: StudentReportData[] = [];
  @Input() title: string = 'Lista de Alumnos';
  @Input() subtitle: string = 'Reporte General';
  @Input() logoUrl: string = '';
  @Input() footerText: string = 'Sistema de Gestión Escolar';
  @Input() filtersApplied: boolean = false;
  @Input() filtersDescription: string = '';
  
  generationDate: Date = new Date();

  ngOnInit() {
    // Ordenar estudiantes por ID o por nombre si lo prefieres
    this.sortStudents();
  }

  private sortStudents() {
    // Ordenar por ID numérico o por nombre
    this.students.sort((a, b) => {
      const idA = typeof a.ID === 'string' ? parseInt(a.ID) : a.ID;
      const idB = typeof b.ID === 'string' ? parseInt(b.ID) : b.ID;
      return (idA as number) - (idB as number);
    });
  }
}