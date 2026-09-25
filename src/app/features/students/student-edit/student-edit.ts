import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Functionality } from '@enums/functionality.enum';
import { Group } from '@models/groups.model';
import {
  ParentAdminEditData,
  StudentAdminEditData,
  StudentAdminEditPayload
} from '@models/student-admin-edit.model';

import { AccessControlService } from '@services/access-control.service';
import { ConfirmationModalService } from '@services/confirmation-modal.service';
import { GroupService } from '@services/groups.service';
import { StudentService } from '@services/students.service';

@Component({
  selector: 'app-student-edit',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './student-edit.html',
  styleUrl: './student-edit.css'
})
export class StudentEditComponent implements OnInit {
  studentId = 0;
  student: StudentAdminEditData | null = null;
  parents: ParentAdminEditData[] = [];
  groups: Group[] = [];

  selectedParentIndex = 0;

  isLoading = true;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly studentService: StudentService,
    private readonly groupService: GroupService,
    private readonly accessControlService: AccessControlService,
    private readonly confirmationModal: ConfirmationModalService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (
      !this.accessControlService.hasAccess(
        Functionality.UpdateAlumno
      )
    ) {
      this.router.navigate(['/dashboard/students']);
      return;
    }

    const studentId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!Number.isInteger(studentId) || studentId <= 0) {
      this.isLoading = false;
      this.errorMessage =
        'El identificador del alumno no es válido.';
      return;
    }

    this.studentId = studentId;
    this.loadStudent();
  }

  get selectedParent(): ParentAdminEditData | null {
    return this.parents[this.selectedParentIndex] ?? null;
  }

  selectParent(index: number): void {
    this.selectedParentIndex = index;
    this.errorMessage = '';
    this.successMessage = '';
  }

  save(form: NgForm): void {
    if (!this.student || this.isSaving) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage =
        'Verifica los campos obligatorios.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.createPayload();

    this.studentService.updateStudentForEdit(
      this.studentId,
      payload
    ).subscribe({
      next: response => {
        this.isSaving = false;

        const message =
          response.message ||
          'Información actualizada correctamente.';

        this.parents = this.parents.map(parent => ({
          ...parent,
          password: ''
        }));

        this.cdr.detectChanges();

        this.confirmationModal
          .showSuccess(message, 'Alumno actualizado')
          .subscribe(() => {
            this.router.navigate(['/dashboard/students']);
          });
      },
      error: error => {
        this.isSaving = false;
        this.errorMessage =
          error.message ||
          'No fue posible actualizar la información.';

        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/students']);
  }

  private loadStudent(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentService.getStudentForEdit(
      this.studentId
    ).subscribe({
      next: response => {
        this.student = {
          ...response.student,
          second_surname:
            response.student.second_surname ?? '',
          control_number:
            response.student.control_number ?? ''
        };

        this.parents = response.parents.map(parent => ({
          ...parent,
          password: ''
        }));

        this.selectedParentIndex = 0;

        this.loadGroups(response.student.school_id);
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage =
          error.message ||
          'No fue posible cargar el alumno.';

        this.cdr.detectChanges();
      }
    });
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

  private createPayload(): StudentAdminEditPayload {
    const student = this.student!;

    const parents = this.parents.map(parent => {
      const parentData:
        StudentAdminEditPayload['parents'][number] = {
          id: parent.id,
          first_name: parent.first_name.trim(),
          last_name: parent.last_name.trim(),
          email: parent.email.trim(),
          cell_phone: parent.cell_phone.trim()
        };

      const password = parent.password?.trim();

      if (password) {
        parentData.password = password;
      }

      return parentData;
    });

    return {
      student: {
        first_name: student.first_name.trim(),
        first_surname: student.first_surname.trim(),
        second_surname: student.second_surname.trim(),
        control_number: student.control_number.trim(),
        curp: student.curp.trim().toUpperCase(),
        group_id: student.group_id,
        active: student.active
      },
      parents
    };
  }
}