import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextUtilsService {

  /**
   * Capitaliza la primera letra de CADA palabra en una cadena.
   * Ejemplo: "juan perez lopez" -> "Juan Perez Lopez"
   */
  capitalizeEachWord(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .filter(word => word.trim() !== '')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Capitaliza solo la primera letra del conjunto de palabras.
   * Ejemplo: "juan perez lopez" -> "Juan perez lopez"
   */
  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    const lowerText = text.toLowerCase();
    return lowerText.charAt(0).toUpperCase() + lowerText.slice(1);
  }

}
