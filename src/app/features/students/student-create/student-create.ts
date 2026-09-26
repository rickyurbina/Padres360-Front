import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ParentAdminCreateData,
  StudentAdminCreateData,
  StudentAdminCreatePayload
} from '@models/student-admin-create.model';
import { Group } from '@models/groups.model';

import { Functionality } from '@enums/functionality.enum';

import { AccessControlService } from '@services/access-control.service';
import { AuthService } from '@services/auth.service';
import { ConfirmationModalService } from '@services/confirmation-modal.service';
import { GroupService } from '@services/groups.service';
import { StudentService } from '@services/students.service';

@Component({
  selector: 'app-student-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './student-create.html',
  styleUrl: './student-create.css'
})
export class StudentCreateComponent implements OnInit {
  student: StudentAdminCreateData = {
    first_name: '',
    first_surname: '',
    second_surname: '',
    control_number: '',
    curp: '',
    group_id: 0,
    active: true
  };

  parents: ParentAdminCreateData[] = [
    this.createEmptyParent()
  ];

  groups: Group[] = [];

  isLoading = true;
  isSaving = false;

  errorMessage = '';

  constructor(
    private readonly router: Router,
    private readonly studentService: StudentService,
    private readonly groupService: GroupService,
    private readonly authService: AuthService,
    private readonly accessControlService: AccessControlService,
    private readonly confirmationModal: ConfirmationModalService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (
      !this.accessControlService.hasAccess(
        Functionality.CreateAlumno
      )
    ) {
      this.router.navigate(['/dashboard/students']);
      return;
    }

    const schoolId =
      this.authService.getCurrentUser()?.school_id;

    if (!schoolId) {
      this.isLoading = false;
      this.errorMessage =
        'El usuario no tiene una escuela asignada.';
      return;
    }

    this.loadGroups(schoolId);
  }

  addParent(): void {
    this.parents.push(this.createEmptyParent());
    this.errorMessage = '';
  }

  removeParent(index: number): void {
    if (this.parents.length <= 1) {
      return;
    }

    this.parents.splice(index, 1);
    this.errorMessage = '';
  }

  save(form: NgForm): void {
    if (this.isSaving) {
      return;
    }

    if (form.invalid || this.student.group_id <= 0) {
      form.control.markAllAsTouched();
      this.errorMessage =
        'Verifica los campos obligatorios.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const payload = this.createPayload();

    this.studentService.createStudentForAdmin(
      payload
    ).subscribe({
      next: response => {
        this.isSaving = false;
        this.cdr.detectChanges();

        const message =
          response.message ||
          'Alumno registrado correctamente.';

        this.confirmationModal
          .showSuccess(message, 'Alumno registrado')
          .subscribe(() => {
            this.router.navigate(['/dashboard/students']);
          });
      },
      error: error => {
        this.isSaving = false;
        this.errorMessage =
          error.message ||
          'No fue posible registrar al alumno.';

        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/students']);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private loadGroups(schoolId: number): void {
    this.groupService.getGroupsBySchool(
      schoolId
    ).subscribe({
      next: groups => {
        this.groups = groups;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage =
          error.message ||
          'No fue posible cargar los grupos.';

        this.cdr.detectChanges();
      }
    });
  }

  private createEmptyParent(): ParentAdminCreateData {
    return {
      first_name: '',
      last_name: '',
      email: '',
      cell_phone: ''
    };
  }

  private createPayload(): StudentAdminCreatePayload {
    return {
      student: {
        first_name: this.student.first_name.trim(),
        first_surname:
          this.student.first_surname.trim(),
        second_surname:
          this.student.second_surname.trim(),
        control_number:
          this.student.control_number.trim(),
        curp:
          this.student.curp.trim().toUpperCase(),
        group_id: Number(this.student.group_id),
        active: this.student.active
      },
      parents: this.parents.map(parent => ({
        first_name: parent.first_name.trim(),
        last_name: parent.last_name.trim(),
        email: parent.email.trim().toLowerCase(),
        cell_phone: parent.cell_phone.trim()
      }))
    };
  }
}