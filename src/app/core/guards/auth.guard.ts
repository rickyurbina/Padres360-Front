import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('auth_token'); // revisa si hay sesión guardada
    if (token) {
      return true; // deja acceder a la ruta
    }
    this.router.navigate(['/login']); // si no hay sesión, manda al login
    return false;
  }
}
