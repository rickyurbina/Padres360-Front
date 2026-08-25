import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { EmergencyDataComponent } from '../emergency-data/emergency-data';
import { ModalViewIncidencesComponent } from '../modal-view-incidences/modal-view-incidences';
import { AuthService } from '@services/auth.service';
import { Student } from '@models/student.model';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'app-children-list',
  templateUrl: './my-children.html',
  styleUrls: ['./my-children.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ]
})
export class MyChildrenComponent implements OnInit {
  searchTerm = '';
  isLoading = false;
  hasError = false;
  isEmpty = false;
  errorMessage = '';
  showMedicalModal = false;
  selectedChild: Student | null = null;
  user: any;

  allChildren: Student[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren() {
    this.isLoading = true;
    this.user = this.authService.getCurrentUser();
    this.allChildren = this.user.students;
    this.isLoading = false;
    this.isEmpty = this.allChildren.length == 0;
    this.cdr.detectChanges();
  }


  openMedicalInfo(child: Student) {
    this.modalService.openModal(EmergencyDataComponent, {
      title: 'Información Médica',
      size: 'md',
      data: { type: 'student', selected: child },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  viewIncidences(child: Student) {
    this.modalService.openModal(ModalViewIncidencesComponent, {
      title: 'Incidencias',
      size: 'lg',
      data: { isStudent: true, selected: child },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  reloadData() {
    this.loadChildren();
    this.cdr.detectChanges();
  }


  // Método para ver detalles (nuevo método)
  viewDetails(child: Student): void {
    console.log('Ver detalles de:', child.controlNumber);
    // Aquí puedes implementar la lógica para ver detalles completos
    alert(`Detalles completos de: ${child.firstName}\n\nID: ${child.id}\nControl: ${child.controlNumber}\nGrado: `);
  }

  closeMedicalModal() {
    this.showMedicalModal = false;
    this.selectedChild = null;
    this.cdr.detectChanges();
  }
}
