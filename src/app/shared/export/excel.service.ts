import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService<T> {

  exportarExcel(data: T[], nombreArchivo: string):void{
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = { Sheets: {data: worksheet}, SheetNames: ['data']}
    const buffer = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
    const blob = new Blob([buffer], {type: 'application/octet-stream'});
    FileSaver.saveAs(blob, `${nombreArchivo}.xlsx`);
  }
}