import { Injectable } from '@angular/core';
import { ExportAsService } from 'ngx-export-as';

@Injectable({
  providedIn: 'root'
})
export class ExportNgxService {

  constructor(private exportAsService: ExportAsService) { }

  exportar(tipo: 'pdf' | 'xls' | 'png', elementId: string, nombreArchivo: string): void {
    const config = {
      type: tipo,
      elementIdOrContent: elementId,
      download: true
    };
    this.exportAsService.save(config, nombreArchivo).subscribe(() => {
      console.log(`Exportado como  ${tipo}`);
    })
  }
}