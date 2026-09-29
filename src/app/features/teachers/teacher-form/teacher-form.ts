import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  FormsModule,
  NgForm
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Functionality } from '@enums/functionality.enum';
import {
  TeacherAdminPayload,
  TeacherGroupOption,
  TeacherSubjectOption
} from '@models/teacher-admin.model';

import { AccessControlService } from '@services/access-control.service';
import { ConfirmationModalService } from '@services/confirmation-modal.service';
import { TeacherAdminService } from '@services/teacher-admin.service';

interface AssignmentForm {
  subject_id: number | null;
  group_id: number | null;
}

interface TeacherFormData {
  first_name: string;
  first_surname: string;
  second_surname: string;
  phone: string;
  email: string;
  active: boolean;
  password: string;
  assignments: AssignmentForm[];
}

@Component({
  selector: 'app-teacher-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './teacher-form.html',
  styleUrl: './teacher-form.css'
})
export class TeacherForm implements OnInit {
  teacherId = 0;
  isEditMode = false;

  isLoading = true;
  isSaving = false;

  errorMessage = '';

  groups: TeacherGroupOption[] = [];
  subjects: TeacherSubjectOption[] = [];

  formTeacher: TeacherFormData = {
    first_name: '',
    first_surname: '',
    second_surname: '',
    phone: '',
    email: '',
    active: true,
    password: '',
    assignments: []
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly teacherAdminService: TeacherAdminService,
    private readonly accessControlService: AccessControlService,
    private readonly confirmationModal: ConfirmationModalService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const routeId =
      this.route.snapshot.paramMap.get('id');

    this.isEditMode = routeId !== null;

    const requiredFunctionality =
      this.isEditMode
        ? Functionality.UpdateDocentes
        : Functionality.CreateDocentes;

    if (
      !this.accessControlService.hasAccess(
        requiredFunctionality
      )
    ) {
      this.router.navigate(['/dashboard/teachers']);
      return;
    }

    if (this.isEditMode) {
      const teacherId = Number(routeId);

      if (
        !Number.isInteger(teacherId) ||
        teacherId <= 0
      ) {
        this.isLoading = false;
        this.errorMessage =
          'El identificador del docente no es válido.';
        return;
      }

      this.teacherId = teacherId;
      this.loadTeacher();
      return;
    }

    this.loadCreateOptions();
  }

  addAssignment(): void {
    this.formTeacher.assignments.push({
      subject_id: null,
      group_id: null
    });

    const newIndex =
      this.formTeacher.assignments.length - 1;

    setTimeout(() => {
      document
        .getElementById(`assignment-${newIndex}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
    });
  }

  removeAssignment(index: number): void {
    this.formTeacher.assignments.splice(index, 1);
    this.errorMessage = '';
  }

  save(form: NgForm): void {
    if (this.isSaving) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage =
        'Verifica los campos obligatorios.';
      return;
    }

    if (this.hasDuplicateAssignments()) {
      this.errorMessage =
        'No puedes repetir la misma materia y grupo.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const payload = this.createPayload();

    const request = this.isEditMode
      ? this.teacherAdminService.update(
          this.teacherId,
          payload
        )
      : this.teacherAdminService.create(payload);

    request.subscribe({
      next: response => {
        this.isSaving = false;

        const defaultMessage = this.isEditMode
          ? 'Docente actualizado correctamente.'
          : 'Docente registrado correctamente.';

        const title = this.isEditMode
          ? 'Docente actualizado'
          : 'Docente registrado';

        this.cdr.detectChanges();

        this.confirmationModal
          .showSuccess(
            response.message || defaultMessage,
            title
          )
          .subscribe(() => {
            this.router.navigate([
              '/dashboard/teachers'
            ]);
          });
      },
      error: error => {
        this.isSaving = false;
        this.errorMessage =
          error.message ||
          'No fue posible guardar el docente.';

        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/teachers']);
  }

  private loadCreateOptions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.teacherAdminService
      .getCreateOptions()
      .subscribe({
        next: response => {
          this.groups = response.groups;
          this.subjects = response.subjects;
          this.isLoading = false;

          this.cdr.detectChanges();
        },
        error: error => {
          this.isLoading = false;
          this.errorMessage =
            error.message ||
            'No fue posible cargar el formulario.';

          this.cdr.detectChanges();
        }
      });
  }

  private loadTeacher(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.teacherAdminService
      .getForEdit(this.teacherId)
      .subscribe({
        next: response => {
          const teacher = response.teacher;

          this.groups = response.groups;
          this.subjects = response.subjects;

          this.formTeacher = {
            first_name:
              teacher.first_name ?? '',
            first_surname:
              teacher.first_surname ?? '',
            second_surname:
              teacher.second_surname ?? '',
            phone:
              teacher.phone ?? '',
            email:
              teacher.email ?? '',
            active:
              teacher.active,
            password: '',
            assignments:
              teacher.assignments.map(
                assignment => ({
                  subject_id:
                    assignment.subject_id,
                  group_id:
                    assignment.group_id
                })
              )
          };

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: error => {
          this.isLoading = false;
          this.errorMessage =
            error.message ||
            'No fue posible cargar el docente.';

          this.cdr.detectChanges();
        }
      });
  }

  private hasDuplicateAssignments(): boolean {
    const combinations =
      this.formTeacher.assignments.map(
        assignment =>
          `${assignment.subject_id}-${assignment.group_id}`
      );

    return (
      combinations.length !==
      new Set(combinations).size
    );
  }

  private createPayload(): TeacherAdminPayload {
    const payload: TeacherAdminPayload = {
      first_name:
        this.formTeacher.first_name.trim(),
      first_surname:
        this.formTeacher.first_surname.trim(),
      second_surname:
        this.formTeacher.second_surname.trim(),
      phone:
        this.formTeacher.phone.trim(),
      email:
        this.formTeacher.email.trim().toLowerCase(),
      active:
        this.formTeacher.active,
      assignments:
        this.formTeacher.assignments.map(
          assignment => ({
            subject_id:
              assignment.subject_id as number,
            group_id:
              assignment.group_id as number
          })
        )
    };

    const password =
      this.formTeacher.password.trim();

    if (password) {
      payload.password = password;
    }

    return payload;
  }
}