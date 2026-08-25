import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '@services/groups.service';
import { Group } from '@models/groups.model';

interface FileAttachment {
  file: File;
  name: string;
  size: string;
}

interface SelectedGroup {
  id: number;
  name: string;
}

type LoadState = 'empty' | 'loading' | 'error' | 'loaded';

@Component({
  selector: 'app-message-sender',
  templateUrl: './message-sender.html',
  styleUrls: ['./message-sender.css'],
  standalone: true,
  imports: [CommonModule,
    FormsModule
  ]
})
export class MessageSenderComponent {
  @Output() messageSent = new EventEmitter<any>();

  // Opciones de destinatarios
  recipientType: 'groups' | 'shift' = 'groups';

  // Modal de grupos
  showGroupsModal: boolean = false;

  // Lista completa de grupos disponibles
  allGroups: Group[] = [];

  // Grupos seleccionados (para mostrar en pastillas)
  selectedGroups: SelectedGroup[] = [];

  // Opciones para turnos
  selectedShift: 'matutino' | 'vespertino' | 'both' = 'matutino';

  // Mensaje
  message: string = '';

  // Archivos adjuntos
  attachments: FileAttachment[] = [];

  // Estado de envío
  isSending: boolean = false;

  // Filtros para el modal
  filterGrade: string | number = '';
  filterGroup: string = '';
  filterShift: string = '';
  filterSpecialty: string = '';

  // Estados de carga
  loadState: LoadState = 'loading';
  errorMessage: string = '';

  grades: number[] = [];
  groups: string[] = [];
  specialties: string[] = [];
  shifts: string[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private groupService: GroupService,) { }

  ngOnInit() {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loadState = 'loading';

    try {
      this.groupService.getGroupFilters().subscribe(filters => {
        this.allGroups = filters.gruposFull;
        this.grades = (filters.grados || [])
          .filter((g): g is number => typeof g === 'number' && !isNaN(g))
          .sort((a, b) => a - b);

        this.groups = (filters.grupos || [])
          .filter((g): g is string => typeof g === 'string' && g.trim() !== '')
          .sort((a, b) => a.localeCompare(b));

        this.specialties = (filters.especialidades || [])
          .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
          .sort((a, b) => a.localeCompare(b));

        this.shifts = (filters.turnos || [])
          .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
          .sort((a, b) => a.localeCompare(b));

        this.cdr.detectChanges();
      });
      this.loadState = this.allGroups.length > 0 ? 'loaded' : 'empty';
      this.cdr.detectChanges();
    } catch (error) {
      this.loadState = 'error';
      this.errorMessage = 'Error al cargar los datos. Por favor, intenta nuevamente.';
      this.cdr.detectChanges();
    }
  }

  // Método para abrir el modal de grupos
  openGroupsModal(): void {
    // Marcar los grupos que ya están seleccionados
    this.allGroups.forEach(group => {
      group.selected = this.selectedGroups.some(selected => selected.id === group.id);
    });
    this.showGroupsModal = true;
  }

  // Método para cerrar el modal de grupos
  closeGroupsModal(): void {
    this.showGroupsModal = false;
    this.filterGrade = 0;
    this.filterShift = '';
  }

  // Método para alternar selección de grupo en el modal
  toggleGroupSelection(group: Group): void {
    group.selected = !group.selected;
  }

  // Método para aplicar la selección de grupos
  applyGroupSelection(): void {
    this.selectedGroups = this.allGroups
      .filter(group => group.selected)
      .map(group => ({
        id: group.id,
        name: `${group.grade} - ${group.group || ''} (${group.shift})`
      }));
    this.closeGroupsModal();
  }

  // Método para eliminar un grupo seleccionado
  removeSelectedGroup(groupId: number): void {
    this.selectedGroups = this.selectedGroups.filter(group => group.id !== groupId);
  }

  // Método para seleccionar/deseleccionar todos los grupos
  toggleAllGroups(selectAll: boolean): void {
    this.allGroups.forEach(group => {
      if (this.isGroupVisible(group)) {
        group.selected = selectAll;
      }
    });
  }

  // Método para verificar si un grupo es visible según los filtros
  private isGroupVisible(group: Group): boolean {
    const gradeMatch =
      !this.filterGrade || group.grade === Number(this.filterGrade);

    const shiftMatch =
      !this.filterShift || group.shift?.toLowerCase() === this.filterShift.toLowerCase();

    const specialtyMatch =
      !this.filterSpecialty || group.specialty?.toLowerCase() === this.filterSpecialty.toLowerCase();

    // Si en el futuro se agrega filtro por nombre de grupo:
    const groupMatch =
      !this.filterGroup || group.group?.toLowerCase() === this.filterGroup.toLowerCase();

    // Solo se muestra si cumple todos los filtros activos
    return gradeMatch && shiftMatch && specialtyMatch && groupMatch;
  }

  // Método para obtener grupos filtrados
  get filteredGroups(): Group[] {
    return (this.allGroups || [])
      .filter(group => this.isGroupVisible(group))
      .sort((a, b) => {
        // Comparación numérica segura por grado
        const gradeA = a.grade ?? 0;
        const gradeB = b.grade ?? 0;
        const gradeComparison = gradeA - gradeB;
        if (gradeComparison !== 0) return gradeComparison;

        // Comparación por nombre de grupo
        const groupA = (a.group ?? '').toString();
        const groupB = (b.group ?? '').toString();
        return groupA.localeCompare(groupB, undefined, { numeric: true });
      });
  }



  // Método para manejar archivos seleccionados
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Verificar si el archivo ya está adjunto
      if (this.attachments.some(att => att.file.name === file.name && att.file.size === file.size)) {
        continue;
      }

      // Formatear tamaño del archivo
      const sizeFormatted = this.formatFileSize(file.size);

      this.attachments.push({
        file: file,
        name: file.name,
        size: sizeFormatted
      });
    }

    // Limpiar el input de archivo
    event.target.value = '';
  }

  // Método para eliminar un archivo adjunto
  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }

  // Método para formatear el tamaño del archivo
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Método para enviar el mensaje
  sendMessage(): void {
    if (!this.message.trim()) {
      alert('Por favor, escribe un mensaje antes de enviar.');
      return;
    }

    // Validar destinatarios según el tipo seleccionado
    if (this.recipientType === 'groups' && this.selectedGroups.length === 0) {
      alert('Por favor, selecciona al menos un grupo.');
      return;
    }

    this.isSending = true;

    // Preparar datos del mensaje
    const messageData = {
      recipientType: this.recipientType,
      groups: this.recipientType === 'groups' ? this.selectedGroups : null,
      shift: this.recipientType === 'shift' ? this.selectedShift : null,
      message: this.message,
      attachments: this.attachments.map(att => ({
        name: att.name,
        size: att.size
      }))
    };

    // Simular envío (en una aplicación real, aquí harías una llamada HTTP)
    setTimeout(() => {
      this.isSending = false;
      this.messageSent.emit(messageData);

      // Resetear formulario
      this.resetForm();

      alert('Mensaje enviado correctamente');
    }, 1500);
  }

  // Método para resetear el formulario
  resetForm(): void {
    this.message = '';
    this.attachments = [];
    this.selectedGroups = [];
    this.selectedShift = 'matutino';
  }

  get selectedGroupsCount(): number {
    return this.filteredGroups?.filter(g => g.selected).length ?? 0;
  }

  get isLoading(): boolean {
    return this.loadState === 'loading';
  }

  get isEmpty(): boolean {
    return this.loadState === 'empty';
  }

  get hasError(): boolean {
    return this.loadState === 'error';
  }

  get isLoaded(): boolean {
    return this.loadState === 'loaded';
  }
}