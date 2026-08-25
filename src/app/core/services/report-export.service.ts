// report-export.service.ts
/*import { Injectable, Injector, ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Type } from '@angular/core';
import { PdfExportService } from '@codewithrajat/rm-ng-pdf-export';

export interface ExportOptions {
  filename: string;
  pageSize?: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation?: 'portrait' | 'landscape';
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  delay?: number; // Delay en ms para asegurar renderizado
}

export interface ComponentInput {
  name: string;  // Nombre del @Input() en el componente
  value: any;    // Valor a asignar
}

@Injectable({ providedIn: 'root' })
export class ReportExportService {
  constructor(
    private pdfExport: PdfExportService,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector,
    private appRef: ApplicationRef
  ) {}

  /**
   * Exporta CUALQUIER componente a PDF
   * @param component - El componente a exportar (Type<any>)
   * @param inputs - Array de inputs para el componente
   * @param options - Opciones de exportación
   */
  /*async exportComponentToPDF<T>(
    component: Type<T>,
    inputs: ComponentInput[] = [],
    options: ExportOptions
  ): Promise<void> {
    try {
      // 1. Crear el componente dinámicamente
      const componentRef = this.createComponent(component);
      
      // 2. Asignar todos los inputs al componente
      inputs.forEach(input => {
        (componentRef.instance as any)[input.name] = input.value;
      });
      
      // 3. Forzar detección de cambios
      componentRef.changeDetectorRef.detectChanges();
      
      // 4. Esperar el tiempo especificado para renderizado completo
      await new Promise(resolve => setTimeout(resolve, options.delay || 300));
      
      // 5. Obtener elemento DOM
      const reportElement = componentRef.location.nativeElement;
      
      // 6. Preparar metadata
      const metadata: any = {};
      if (options.title) metadata.title = options.title;
      if (options.author) metadata.author = options.author;
      if (options.subject) metadata.subject = options.subject;
      if (options.keywords) metadata.keywords = options.keywords;
      
      // 7. Exportar a PDF
      await this.pdfExport.exportHtml(reportElement, {
        filename: options.filename,
        pageSize: options.pageSize || 'A4',
        orientation: options.orientation || 'portrait',
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined
      });
      
      // 8. Destruir el componente
      componentRef.destroy();
      
    } catch (error) {
      console.error('Error exportando componente a PDF:', error);
      throw error;
    }
  }

  /**
   * Versión simplificada con inputs como objeto
   */
  /*
  /*async exportComponentToPDFSimple<T>(
    component: Type<T>,
    inputs: Record<string, any>,
    filename: string
  ): Promise<void> {
    const inputArray: ComponentInput[] = Object.entries(inputs).map(([name, value]) => ({
      name,
      value
    }));
    
    return this.exportComponentToPDF(component, inputArray, {
      filename,
      pageSize: 'A4',
      orientation: 'portrait'
    });
  }

  /**
   * Exporta múltiples componentes en un solo PDF
   */
  /*
  async exportMultipleComponentsToPDF<T>(
    components: Array<{
      component: Type<T>;
      inputs: ComponentInput[];
    }>,
    options: ExportOptions
  ): Promise<void> {
    try {
      // Crear un contenedor temporal
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);
      
      const componentRefs: ComponentRef<any>[] = [];
      
      // Crear y montar todos los componentes
      for (const item of components) {
        const componentRef = this.createComponent(item.component);
        
        // Asignar inputs
        item.inputs.forEach(input => {
          (componentRef.instance as any)[input.name] = input.value;
        });
        
        componentRef.changeDetectorRef.detectChanges();
        
        // Agregar al contenedor
        container.appendChild(componentRef.location.nativeElement);
        componentRefs.push(componentRef);
        
        // Pequeña pausa entre componentes
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Esperar renderizado completo
      await new Promise(resolve => setTimeout(resolve, options.delay || 200));
      
      // Exportar todo el contenedor
      await this.pdfExport.exportHtml(container, {
        filename: options.filename,
        pageSize: options.pageSize || 'A4',
        orientation: options.orientation || 'portrait'
      });
      
      // Limpiar
      componentRefs.forEach(ref => ref.destroy());
      document.body.removeChild(container);
      
    } catch (error) {
      console.error('Error exportando múltiples componentes:', error);
      throw error;
    }
  }
  
  /**
   * Crea un componente dinámicamente
   */
  /*private createComponent<T>(component: Type<T>): ComponentRef<T> {
    const componentRef = createComponent(component, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector
    });
    
    this.appRef.attachView(componentRef.hostView);
    
    return componentRef;
  }
}*/