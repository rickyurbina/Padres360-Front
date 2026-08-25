import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ChangePasswordComponent } from '../change-password/change-password';
import { EmergencyDataComponent } from '../emergency-data/emergency-data';
import { AuthService } from '@services/auth.service';
import { ModalService } from '@services/modal.service';
import { UserRole } from '@enums/user-role.enum';
// import { toUserRole } from 'src/app/core/helpers/role.helpers';
import { toUserRole } from '../../core/helpers/role.helpers';

interface UserProfile {
  username: string;
  email: string;
  profile: string;
  firstName: string;
  lastName: string;
  roleLabel: string;
  pictureUrl?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Modales
  showPasswordModal = false;
  showEmergencyModal = false;

  // Usuario actual del AuthService
  currentUser: any;

  // Datos del perfil
  profile: UserProfile = {
    username: '',
    email: '',
    profile: '',
    firstName: '',
    lastName: '',
    roleLabel: '',
    pictureUrl: ''
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private modalService: ModalService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  /**
   * Carga el perfil del usuario
   */
  loadProfile(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      // Obtener el usuario actual del AuthService
      const currentUser = this.authService.getCurrentUser();

      if (!currentUser) {
        throw new Error('No se encontró información del usuario');
      }

      // Mapear los datos del usuario al perfil
      this.profile = {
        username: currentUser.username || '',
        email: currentUser.email || '',
        profile: currentUser.profile || '',
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
        roleLabel: this.authService.getUserRoleLabel(),
        pictureUrl: '' // Agregarlo si existe en el objeto
      };

      this.isLoading = false;
    } catch (error: any) {
      this.hasError = true;
      this.errorMessage = error.message || 'Error al cargar el perfil del usuario';
      this.isLoading = false;
      console.error('Error al cargar el perfil:', error);
    } finally {
      this.cdr.detectChanges();
    }
  }

  /**
   * Abre el modal de cambio de contraseña
   */
  changePassword(): void {
    this.modalService.openModal(ChangePasswordComponent, {
      title: 'Cambiar contraseña',
      size: 'md',
      data: { isStudent: true, selected: 'incidence' },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  /**
   * Abre el modal de información de emergencia
   */
  openEmergencyData(): void {
    this.modalService.openModal(EmergencyDataComponent, {
      title: 'Información Médica',
      size: 'md',
      data: { type: this.currentUser.role.toLowerCase(), selected: 'incidence' },
      showClose: true
    }).subscribe((result) => {
      if (result?.success) {
        console.log('El modal se cerró con datos:', result);
      } else {
        console.log('El modal se cerró sin cambios');
      }
    });
  }

  /**
   * Obtiene la URL completa de la imagen de perfil
   */
  getProfileImageUrl(): string {
    if (this.profile.pictureUrl) {
      return this.profile.pictureUrl.startsWith('http')
        ? this.profile.pictureUrl
        : 'this.apiDomain' + this.profile.pictureUrl;
    }
    return '/assets/images/no-profile-image.png';
  }

  /**
   * Obtiene las iniciales del usuario para el avatar por defecto
   */
  getUserInitials(): string {
    const firstInitial = this.profile.firstName?.charAt(0) || '';
    const lastInitial = this.profile.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  /**
   * Reintenta cargar el perfil
   */
  retryLoad(): void {
    this.loadProfile();
  }

  showEmergencyDataButton(): boolean {
    const rawRole = this.authService.getUserRole();
    if (!rawRole) return false;
    const role = toUserRole(rawRole) ?? UserRole.None;
    return ![UserRole.None, UserRole.Papas].includes(role);
  }

}