// confirmation-modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConfirmationConfig {
  title?: string;
  message: string;
  buttons?: ('ok' | 'yes' | 'no')[];
  icon?: 'warning' | 'info' | 'error' | 'question' | 'success';
  confirmText?: string;
  cancelText?: string;
  yesText?: string;
  noText?: string;
  okText?: string;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface ConfirmationState {
  isOpen: boolean;
  config?: ConfirmationConfig;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationModalService {
  private confirmationState = new BehaviorSubject<ConfirmationState>({ isOpen: false });
  public confirmationState$ = this.confirmationState.asObservable();
  private responseSubject = new Subject<'ok' | 'yes' | 'no' | null>();

  /**
   * Abre un modal de confirmación básico con botón OK
   */
  showInfo(message: string, title: string = 'Información'): Observable<'ok' | null> {
    return this.open({
      title,
      message,
      buttons: ['ok'],
      icon: 'info',
      showCloseButton: true
    }) as Observable<'ok' | null>;
  }

  /**
   * Abre un modal de confirmación de éxito
   */
  showSuccess(message: string, title: string = 'Éxito'): Observable<'ok' | null> {
    return this.open({
      title,
      message,
      buttons: ['ok'],
      icon: 'success',
      showCloseButton: true
    }) as Observable<'ok' | null>;
  }

  /**
   * Abre un modal de advertencia
   */
  showWarning(message: string, title: string = 'Advertencia'): Observable<'ok' | null> {
    return this.open({
      title,
      message,
      buttons: ['ok'],
      icon: 'warning',
      showCloseButton: true
    }) as Observable<'ok' | null>;
  }

  /**
   * Abre un modal de error
   */
  showError(message: string, title: string = 'Error'): Observable<'ok' | null> {
    return this.open({
      title,
      message,
      buttons: ['ok'],
      icon: 'error',
      showCloseButton: true
    }) as Observable<'ok' | null>;
  }

  /**
   * Abre un modal de confirmación Yes/No
   */
  confirm(message: string, title: string = '¿Confirmar?'): Observable<'yes' | 'no' | null> {
    return this.open({
      title,
      message,
      buttons: ['yes', 'no'],
      icon: 'question',
      showCloseButton: false
    }) as Observable<'yes' | 'no' | null>;
  }

  /**
   * Abre un modal de confirmación Yes/No con advertencia
   */
  confirmDelete(message: string, title: string = '¿Eliminar?'): Observable<'yes' | 'no' | null> {
    return this.open({
      title,
      message,
      buttons: ['yes', 'no'],
      icon: 'warning',
      yesText: 'Eliminar',
      noText: 'Cancelar',
      showCloseButton: false
    }) as Observable<'yes' | 'no' | null>;
  }

  /**
   * Abre un modal de confirmación personalizado
   */
  open(config: ConfirmationConfig): Observable<'ok' | 'yes' | 'no' | null> {
    if (!environment.production) {
      console.log('🟢 OPEN CONFIRMATION MODAL', config);
    }
    document.body.classList.add('modal-open');

    // Crear nuevo Subject para esta confirmación
    this.responseSubject = new Subject<'ok' | 'yes' | 'no' | null>();

    // Configuración por defecto
    const defaultConfig: ConfirmationConfig = {
      title: 'Confirmación',
      buttons: ['ok'],
      icon: 'question',
      okText: 'Ok',
      yesText: 'Sí',
      noText: 'No',
      showCloseButton: true,
      size: 'md',
      ...config
    };

    this.confirmationState.next({
      isOpen: true,
      config: defaultConfig
    });

    return this.responseSubject.asObservable();
  }

  /**
   * Cierra el modal y emite la respuesta del usuario
   */
  close(result: 'ok' | 'yes' | 'no' | null = null) {
    if (!environment.production) {
      console.log('🔴 CLOSE CONFIRMATION MODAL', result);
    }
    document.body.classList.remove('modal-open');

    this.confirmationState.next({ isOpen: false });

    // Emitir resultado
    this.responseSubject.next(result);
    this.responseSubject.complete();
  }

  /**
   * Responde con OK
   */
  ok() {
    this.close('ok');
  }

  /**
   * Responde con YES
   */
  yes() {
    this.close('yes');
  }

  /**
   * Responde con NO
   */
  no() {
    this.close('no');
  }

  /**
   * Cancela (cierra sin respuesta)
   */
  cancel() {
    this.close(null);
  }
}
