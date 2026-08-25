// modal-container.component.ts
import { CommonModule,  } from '@angular/common';
import { Component, ViewContainerRef, OnInit, OnDestroy, ComponentFactoryResolver, Injector } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '@services/modal.service';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-modal-container',
  templateUrl: './modal-container.html',
  styleUrls: ['./modal-container.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class ModalContainerComponent implements OnInit, OnDestroy {
  @ViewChild('modalContent', { read: ViewContainerRef }) modalContent!: ViewContainerRef;
  
  config: any;
  debugInfo: any;
  private componentRef: any;

  constructor(
    private modalService: ModalService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit() {
    console.log('🟡 ModalContainer INIT');
    
    this.modalService.modalState$.subscribe(state => {
      console.log('🟡 Modal state changed:', state);
      
      if (state.isOpen && state.config) {
        this.config = state.config;
        this.debugInfo = {
          hasConfig: !!state.config,
          hasComponent: !!state.config.component,
          componentName: state.config.component?.name,
          config: state.config
        };
        this.renderComponent();
      } else {
        this.clearComponent();
        this.debugInfo = { state: 'closed' };
      }
    });
  }

  ngOnDestroy() {
    this.clearComponent();
    console.log('🔴 ModalContainer DESTROYED');
  }

  private async renderComponent() {
    console.log('🟡 Rendering component...', this.config.component);
    
    if (!this.config?.component) {
      console.error('❌ No component provided for modal');
      return;
    }
    
    // Pequeño delay para asegurar que el ViewChild esté disponible
    setTimeout(() => {
      try {
        this.clearComponent();
        
        const factory = this.componentFactoryResolver.resolveComponentFactory(this.config.component);
        this.componentRef = this.modalContent.createComponent(factory);
        
        console.log('✅ Component rendered successfully:', this.componentRef);
        
        // Pasar datos al componente del modal
        if (this.config.data) {
          Object.assign(this.componentRef.instance, this.config.data);
          console.log('✅ Data passed to component:', this.config.data);
        }
        
      } catch (error) {
        console.error('❌ Error rendering modal component:', error);
        this.debugInfo.error = "error.to()";
      }
    }, 0);
  }

  private clearComponent() {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    if (this.modalContent) {
      this.modalContent.clear();
    }
  }

  closeModal() {
    this.modalService.closeModal();
  }

  onOverlayClick(event: MouseEvent) {
    this.closeModal();
  }

  getModalSize(): string {
    return `modal-${this.config?.size || 'md'}`;
  }
}