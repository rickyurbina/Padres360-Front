import { environment } from '../../../environments/environment';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentValidationService } from '@services/student-validation.service';
import { StudentValidationResponse, StudentValidation, ParentValidation } from '@models/student-validation.model';
import { ConfirmationModalService } from '@services/confirmation-modal.service';
import { ChangeDetectorRef } from '@angular/core';
import { GroupService } from '@services/groups.service';
import { Group } from '@models/groups.model';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-student-validation',
  templateUrl: './student-validation.html',
  styleUrls: ['./student-validation.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class StudentValidationComponent {
  // --- Data Models ---
  student: StudentValidation = {
    id: 0,
    name: '',
    lastName: '',
    motherLastName: '',
    controlNumber: '',
    curp: '',
    group: '',
    groupId: 0
  };

  // --- Lists ---
  groups: Group[] = [];
  parentsList: ParentValidation[] = [];
  selectedGroup: Group | null = null;
  selectedParent: ParentValidation = {
    id: 0,
    fullName: '',
    username: '',
    email: '',
    firstName: '',
    surnames: '',
    password: '',
    phone: ''
  };

  // --- UI State ---
  showPassword: boolean = false;
  curpSearch: string = '';
  selectedSchool: string = 'CBTis 117';
  isLoadingData = false;
  isSaving = false;
  errorMessage: string = '';
  successMessage: string = '';
  studentFound: boolean = false;
  currentUser: any;

  constructor(
    private studentService: StudentValidationService,
    private modalConfirmation: ConfirmationModalService,
    private readonly cdr: ChangeDetectorRef,
    private groupService: GroupService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadGroups();
  }

  // loadGroups(): void {
  //   const schoolId = this.currentUser?.school_id || 0;
  //   this.groupService.getGroupsBySchool(schoolId).subscribe({
  //     next: (groups: Group[]) => {
  //       this.groups = groups;
  //       this.cdr.detectChanges();
  //     },
  //     error: (error: any) => {
  //     }
  //   });
  // }
  loadGroups(): void {
    const schoolId = 1; // Hardcoded temporalmente
    console.log('🔍 Cargando grupos con schoolId:', schoolId);
    this.groupService.getGroupsBySchool(schoolId).subscribe({
      next: (groups: Group[]) => {
        console.log('✅ Grupos cargados:', groups);
        this.groups = groups;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al cargar grupos:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onCurpInput(event: any): void {
    let value = event.target.value.toUpperCase();
    this.curpSearch = value;
    event.target.value = value;
  }

  /**
   * Convierte la CURP del estudiante a mayúsculas en tiempo real
   */
  onStudentCurpInput(event: any): void {
    let value = event.target.value.toUpperCase();
    this.student.curp = value;
    event.target.value = value;
  }

  loadData(): void {
    if (!this.curpSearch || this.curpSearch.length !== 18) {
      this.modalConfirmation.showInfo('Por favor ingresa un CURP válido de 18 caracteres').subscribe();
      return;
    }

    this.isLoadingData = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.studentService.getStudentByCurp(this.curpSearch).subscribe({
      next: (response: StudentValidationResponse) => {
        this.updateFormFromResponse(response);
        this.studentFound = true;
        this.successMessage = 'Datos cargados exitosamente';
        this.showTemporaryMessage('success');
        this.isLoadingData = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.cancel();
        this.isLoadingData = false;
        this.modalConfirmation.showWarning(error.message).subscribe();
        this.cdr.detectChanges();
      }
    });
  }

  saveChanges(): void {
    if (!this.curpSearch || this.curpSearch.length !== 18) {
      this.modalConfirmation.showError('No hay un CURP válido para actualizar').subscribe();
      return;
    }

    if (!this.studentFound) {
      this.modalConfirmation.showError('Primero debes cargar los datos de un alumno').subscribe();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.selectedParent) {
      const index = this.parentsList.findIndex(p => p.id === this.selectedParent!.id);
      if (index !== -1) {
        this.parentsList[index] = {
          ...this.parentsList[index],
          password: this.selectedParent.password
        };
      }
    }

    const updateData: any = {
      student: {
        id: this.student.id,
        first_name: this.student.name,
        first_surname: this.student.lastName,
        second_surname: this.student.motherLastName,
        control_number: this.student.controlNumber,
        curp: this.student.curp.toUpperCase(),
        group: this.student.group,
        group_id: this.student.groupId
      },
      parents: this.parentsList.map(parent => {
        if (!environment.production) {
          console.log('Parent antes de mapear:', parent);
        }
        const parentData: any = {
          id: parent.id,
          email: parent.email,
          first_name: parent.firstName,
          last_name: parent.surnames || '',
          cell_phone: parent.phone || ''
        };
        if (!environment.production) {
          console.log('ParentData después de mapear:', parentData);
        }
        if (parent.password && parent.password.trim() !== '') {
          parentData.password = parent.password;
        }
        return parentData;
      })
    };

    if (!environment.production) {
      console.log('Datos a enviar al PUT:', JSON.stringify(updateData, null, 2));
    }

    this.studentService.updateStudentByCurp(this.curpSearch, updateData).subscribe({
      next: (response: { success: boolean; message: string; data?: any }) => {
        this.isSaving = false;
        if (response.success) {
          this.successMessage = response.message || 'Cambios guardados exitosamente';
          this.modalConfirmation.showSuccess('Cambios guardados exitosamente').subscribe();
          this.resetForm();
          this.studentFound = false;
        } else {
          this.errorMessage = response.message || 'Error al guardar los cambios';
          this.modalConfirmation.showError(this.errorMessage).subscribe();
        }
      },
      error: (error: Error) => {
        this.isSaving = false;
        this.modalConfirmation.showError(error.message).subscribe();
      }
    });
  }

  cancel(): void {
    this.resetForm();
    this.studentFound = false;
    this.modalConfirmation.showInfo('Operación cancelada').subscribe();
    this.successMessage = 'Operación cancelada';
    this.showTemporaryMessage('success');
  }

  private updateFormFromResponse(response: StudentValidationResponse): void {
    if (response.student) {
      let groupId = response.student.groupId || 0;
      if (!groupId && response.student.group) {
        const foundGroup = this.groups.find(g => g.group === response.student.group);
        if (foundGroup) groupId = foundGroup.id;
      }
      this.selectedGroup = this.groups.find(g => g.id === groupId) || null;

      this.student = {
        id: response.student.id || 0,
        name: response.student.name || '',
        lastName: response.student.lastName || '',
        motherLastName: response.student.motherLastName || '',
        controlNumber: response.student.controlNumber || '',
        group: response.student.group || '',
        groupId: groupId,
        curp: response.student.curp || this.curpSearch.toUpperCase()
      };
    }

    if (response.parents && response.parents.length > 0) {
      this.parentsList = response.parents.map(parent => ({ ...parent }));
      this.selectParent(this.parentsList[0]);
    } else {
      this.parentsList = [];
      this.clearParentForm();
    }

    if (this.parentsList.length > 0) {
      this.selectedParent = this.parentsList[0];
    } else {
      this.selectedParent = {
        id: 0,
        fullName: '',
        username: '',
        email: '',
        firstName: '',
        surnames: '',
        password: '',
        phone: ''
      };
    }
  }

  selectParent(parent: ParentValidation): void {
    this.selectedParent = parent;
  }

  onParentSelect(event: any): void {
    const selectedFullName = event.fullName || (event.target ? event.target.value : null);
    const selectedParent = this.parentsList.find(p => p.fullName === selectedFullName);
    if (selectedParent) {
      this.selectParent(selectedParent);
    }
  }

  onGroupSelect(group: Group | null): void {
    if (group) {
      this.student.group = group.group;
      this.student.groupId = group.id;
    } else {
      this.student.group = '';
      this.student.groupId = 0;
    }
  }

  onParentFullNameChange(newFullName: string): void {
    const matchingParent = this.parentsList.find(p => p.fullName === newFullName);
    if (matchingParent) {
      this.selectParent(matchingParent);
    } else {
      this.selectedParent = {
        id: 0,
        fullName: '',
        username: '',
        email: '',
        firstName: '',
        surnames: '',
        password: '',
        phone: ''
      };
    }
  }

  private extractFirstName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts.length > 0 ? parts[0] : '';
  }

  private extractSurnames(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }

  private clearParentForm(): void {
    this.selectedParent = {
      id: 0,
      fullName: '',
      username: '',
      email: '',
      firstName: '',
      surnames: '',
      password: '',
      phone: ''
    };
  }

  private resetForm(): void {
    this.student = {
      id: 0,
      name: '',
      lastName: '',
      motherLastName: '',
      controlNumber: '',
      curp: '',
      group: '',
      groupId: 0
    };
    this.parentsList = [];
    this.selectedParent = {
      id: 0,
      fullName: '',
      username: '',
      email: '',
      firstName: '',
      surnames: '',
      password: '',
      phone: ''
    };
    this.curpSearch = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.studentFound = false;
  }

  private showTemporaryMessage(type: 'success' | 'error'): void {
    setTimeout(() => {
      if (type === 'success') {
        this.successMessage = '';
      } else {
        this.errorMessage = '';
      }
    }, 5000);
  }
}