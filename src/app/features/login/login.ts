import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  error = signal('');
  successMessage = signal('');
  submitted = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    
    this.markFormGroupTouched();
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.error.set('');
      this.successMessage.set('');

      const username = this.loginForm.get('identifier')?.value;
      const password = this.loginForm.get('password')?.value;
      

      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set('¡Login exitoso!');
          
          setTimeout(() => {
            this.redirectBasedOnUserType(response.role);
          }, 1000);
        },
        error: (error: Error) => {
          this.isLoading.set(false);
          this.handleLoginError(error);
        }
      });
    } else {
      this.error.set('Por favor, corrige los errores en el formulario');
    }
  }

  private redirectBasedOnUserType(userType: string): void {
    switch (userType) {
      case 'teacher':
        this.router.navigate(['/teacher/dashboard']);
        break;
      case 'parent':
        this.router.navigate(['/parent/dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

    private handleLoginError(error: Error): void {
    console.error('Login error in component:', error);
    
    // Mensajes específicos basados en el tipo de error
    const errorMessage = error.message;
    
    // Puedes personalizar mensajes basados en el contenido del error
    if (errorMessage.includes('Credenciales inválidas') || 
        errorMessage.includes('No autorizado')) {
      this.error.set('Usuario o contraseña incorrectos');
    } else if (errorMessage.includes('conexión')) {
      this.error.set('Error de conexión. Verifica tu internet');
    } else if (errorMessage.includes('servidor')) {
      this.error.set('Error del servidor. Intenta más tarde');
    } else {
      this.error.set(errorMessage);
    }
  }

  // Getters para los controles del formulario
  get identifier() {
    return this.loginForm.get('identifier');
  }

  get password() {
    return this.loginForm.get('password');
  }

   shouldShowError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return (control?.invalid && (control?.touched || this.submitted())) || false;
  }

    private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

   goToValidation(): void {
    this.router.navigate(['/validation']);
  }
}