import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Functionality } from '@enums/functionality.enum';
import {
  AdminUserPayload,
  AdminUserRole,
  AdminUserSchool
} from '@models/admin-user.model';

import { AccessControlService } from '@services/access-control.service';
import { AdminUserService } from '@services/admin-user.service';
import { ConfirmationModalService } from '@services/confirmation-modal.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserForm implements OnInit {
  userId = 0;
  isEditMode = false;

  roles: AdminUserRole[] = [];
  schools: AdminUserSchool[] = [];

  formUser: AdminUserPayload = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    school_id: 0,
    is_active: true,
    password: ''
  };

  confirmPassword = '';

  isLoading = true;
  isSaving = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly adminUserService: AdminUserService,
    private readonly accessControlService: AccessControlService,
    private readonly confirmationModal: ConfirmationModalService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (
      !this.accessControlService.hasAccess(
        Functionality.ManageUsers
      )
    ) {
      this.router.navigate(['/dashboard/welcome']);
      return;
    }

    const idParameter =
      this.route.snapshot.paramMap.get('id');

    if (idParameter !== null) {
      const userId = Number(idParameter);

      if (!Number.isInteger(userId) || userId <= 0) {
        this.isLoading = false;
        this.errorMessage =
          'El identificador del usuario no es válido.';
        return;
      }

      this.userId = userId;
      this.isEditMode = true;
    }

    this.loadOptions();
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

    const password =
      this.formUser.password?.trim() ?? '';

    if (!this.isEditMode && !password) {
      this.errorMessage =
        'La contraseña es obligatoria.';
      return;
    }

    if (password !== this.confirmPassword.trim()) {
      this.errorMessage =
        'Las contraseñas no coinciden.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const payload = this.createPayload();

    const request = this.isEditMode
      ? this.adminUserService.updateUser(
          this.userId,
          payload
        )
      : this.adminUserService.createUser(payload);

    request.subscribe({
      next: response => {
        this.isSaving = false;
        this.cdr.detectChanges();

        const message =
          response.message ||
          (
            this.isEditMode
              ? 'Usuario actualizado correctamente.'
              : 'Usuario registrado correctamente.'
          );

        this.confirmationModal
          .showSuccess(
            message,
            this.isEditMode
              ? 'Usuario actualizado'
              : 'Usuario registrado'
          )
          .subscribe(() => {
            this.router.navigate(['/dashboard/users']);
          });
      },
      error: error => {
        this.isSaving = false;
        this.errorMessage =
          error.message ||
          'No fue posible guardar el usuario.';

        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/users']);
  }

  private loadOptions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminUserService.getUsers().subscribe({
      next: response => {
        this.roles = response.roles;
        this.schools = response.schools;

        if (this.isEditMode) {
          this.loadUser();
          return;
        }

        if (this.schools.length === 1) {
          this.formUser.school_id =
            this.schools[0].id;
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage =
          error.message ||
          'No fue posible cargar las opciones.';

        this.cdr.detectChanges();
      }
    });
  }

  private loadUser(): void {
    this.adminUserService.getUser(
      this.userId
    ).subscribe({
      next: response => {
        const user = response.user;

        this.formUser = {
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          school_id: user.school_id,
          is_active: user.is_active,
          password: ''
        };

        this.confirmPassword = '';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage =
          error.message ||
          'No fue posible cargar el usuario.';

        this.cdr.detectChanges();
      }
    });
  }

  private createPayload(): AdminUserPayload {
    const payload: AdminUserPayload = {
      username: this.formUser.username.trim(),
      first_name: this.formUser.first_name.trim(),
      last_name: this.formUser.last_name.trim(),
      email: this.formUser.email.trim().toLowerCase(),
      role: this.formUser.role,
      school_id: Number(this.formUser.school_id),
      is_active: this.formUser.is_active
    };

    const password =
      this.formUser.password?.trim();

    if (password) {
      payload.password = password;
    }

    return payload;
  }
}