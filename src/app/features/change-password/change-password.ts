import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { ModalService } from '@services/modal.service';
import { ConfirmationModalService } from '@services/confirmation-modal.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePasswordComponent {
  currentUser: any;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  passwordErrors = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  };

  constructor(private readonly authService: AuthService,
    private modalService: ModalService,
    private readonly modalConfirmation: ConfirmationModalService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  validateForm(): boolean {
    this.passwordErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    };

    let isValid = true;

    // Validar nueva contraseña
    if (!this.passwordData.newPassword) {
      this.passwordErrors.newPassword = 'La nueva contraseña es requerida';
      isValid = false;
    } else if (this.passwordData.newPassword.length < 8) {
      this.passwordErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (!this.passwordData.confirmPassword) {
      this.passwordErrors.confirmPassword = 'Debes confirmar la nueva contraseña';
      isValid = false;
    } else if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    // Validar que la nueva contraseña sea diferente de la actual
    if (this.passwordData.currentPassword === this.passwordData.newPassword) {
      this.passwordErrors.newPassword = 'La nueva contraseña debe ser diferente de la actual';
      isValid = false;
    }

    return isValid;
  }

  close(result?: any) {
    this.modalService.closeModal(result);
  }

  cambiarContrasena() {
    if (!this.validateForm()) {
      return;
    }

    this.authService.changePassword(this.currentUser.id, this.passwordData.newPassword)
      .subscribe({
        next: () => {
          this.limpiarFormulario();
          this.modalConfirmation.showSuccess('Contraseña actualizada.').subscribe();
          this.close({ success: true, event: 'create' });
        },
        error: (error) => {
          this.passwordErrors.general = error.message || 'Error al cambiar la contraseña';
          alert(this.passwordErrors.general);
        }
      });
  }

  limpiarFormulario() {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    };
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }
}