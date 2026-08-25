// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface ModalConfig {
  title?: string;
  data?: any;
  showClose?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  component?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalState = new BehaviorSubject<{ isOpen: boolean; config?: ModalConfig }>({ isOpen: false });
  public modalState$ = this.modalState.asObservable();
  private closeSubject = new Subject<any>();

  openModal(component: any, config: ModalConfig = {}): Observable<any> {
    console.log('🟢 OPEN MODAL CALLED', { component, config });
    document.body.classList.add('modal-open');

    // Si había un modal anterior, reiniciamos el Subject
    this.closeSubject = new Subject<any>();

    this.modalState.next({
      isOpen: true,
      config: {
        ...config,
        component: component
      }
    });

    console.log('🟢 Modal state updated:', this.modalState.value);
    return this.closeSubject.asObservable();
  }

  closeModal(result?: any) {
    console.log('🔴 CLOSE MODAL CALLED');
    document.body.classList.remove('modal-open');

    this.modalState.next({ isOpen: false });

    // 🔔 Emitimos el resultado del cierre
    this.closeSubject.next(result);
    this.closeSubject.complete();
  }
}
