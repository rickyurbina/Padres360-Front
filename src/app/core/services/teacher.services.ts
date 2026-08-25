import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TEACHER_URLS } from '../constants/api-urls.constants';
import { User } from '@models/user.model';
import { Teacher } from '@models/teacher.model';

@Injectable({
    providedIn: 'root'
})
export class TeacherService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    /**
     * Obtener incidencias
     */
   getList(): Observable<Teacher[]> {
    const token = localStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    
    return this.http.get<Teacher[]>(TEACHER_URLS.LIST, { headers }).pipe(
        map((response: any[]) => {
            console.log('Respuesta del servidor:', response);
            return response.map(item => new Teacher({
                id: item.id,
                firstName: item.first_name,
                firstSurname: item.first_surname,
                secondSurname: item.second_surname,
                fullName: item.full_name,
                phone: item.phone,
                email: item.email
            }));
        }),
        catchError((error: HttpErrorResponse) => {
            return this.handleError(error);
        })
    );
}

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Error desconocido al iniciar sesión';

        // Manejar diferentes tipos de errores HTTP
        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente (network, etc.)
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del lado del servidor
            switch (error.status) {
                case 0:
                    errorMessage = 'No hay conexión a internet. Verifica tu conexión.';
                    break;
                case 400:
                    errorMessage = error.error?.message || 'Credenciales inválidas. Verifica tus datos.';
                    break;
                case 401:
                    errorMessage = error.error?.message || 'No autorizado. Usuario o contraseña incorrectos.';
                    break;
                case 403:
                    errorMessage = error.error?.message || 'Acceso denegado. No tienes permisos.';
                    break;
                case 404:
                    errorMessage = error.error?.message || 'Servicio no encontrado.';
                    break;
                case 422:
                    errorMessage = error.error?.message || 'Datos de entrada inválidos.';
                    break;
                case 500:
                    errorMessage = 'Error interno del servidor. Intenta más tarde.';
                    break;
                case 503:
                    errorMessage = 'Servicio no disponible. Intenta más tarde.';
                    break;
                default:
                    errorMessage = error.error?.message || `Error ${error.status}: ${error.message}`;
            }
        }

        // También puedes loguear el error para debugging
        console.error('Login error:', {
            status: error.status,
            message: error.message,
            url: error.url,
            error: error.error
        });

        return throwError(() => new Error(errorMessage));
    }


    createTeacher(teacher: any): Observable<Teacher> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        const data = {
            first_name: teacher.firstName,
            first_surname: teacher.firstSurname,
            second_surname: teacher.secondSurname,
            control_number: teacher.controlNumber,
            curp: teacher.curp
        };

        return this.http.post<Teacher>(TEACHER_URLS.CREATE, data, { headers }).pipe(
            map(response => {
                console.log(response);
                return this.handleCreateResponse(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleCreateError(error);
            })
        );
    }

    private handleCreateError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Error desconocido';

        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del lado del servidor
            if (error.error && typeof error.error === 'object') {
                const serverError = error.error;

                if (serverError.success === false) {
                    // Manejar errores de validación del servidor
                    if (serverError.details) {
                        // Extraer mensajes de error de details
                        const errorMessages: string[] = [];

                        if (serverError.details.control_number) {
                            errorMessages.push(`Número de control: ${serverError.details.control_number[0]}`);
                        }

                        // Puedes agregar más campos aquí según sea necesario
                        if (serverError.details.curp) {
                            errorMessages.push(`CURP: ${serverError.details.curp[0]}`);
                        }

                        if (serverError.details.first_name) {
                            errorMessages.push(`Nombre: ${serverError.details.first_name[0]}`);
                        }

                        // Si hay mensajes específicos, usarlos
                        if (errorMessages.length > 0) {
                            errorMessage = errorMessages.join(', ');
                        } else if (serverError.message) {
                            // Intentar parsear el message si no hay details
                            errorMessage = '';
                        } else {
                            errorMessage = 'Error en el servidor';
                        }
                    } else if (serverError.message) {
                        errorMessage = '';
                    }
                } else {
                    errorMessage = serverError.message || `Error ${error.status}: ${error.statusText}`;
                }
            } else {
                errorMessage = `Error ${error.status}: ${error.statusText}`;
            }
        }

        // Puedes mostrar el error en un toast, snackbar, o console
        console.error('Error en createStudent:', errorMessage);

        // Retornar el error como un observable
        return throwError(() => new Error(errorMessage));
    }

    private handleCreateResponse(response: any): Teacher {
        if (response && response.success && response.student) {
            const studentData = response.student;

            return Teacher.empty();
        }
        return Teacher.empty();
    }

    update(teacher: any): Observable<Teacher> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        const data = {
            first_name: teacher.firstName,
            first_surname: teacher.firstSurname,
            second_surname: teacher.secondSurname,
            control_number: teacher.controlNumber,
            curp: teacher.curp
        };

        return this.http.put<Teacher>(TEACHER_URLS.UPDATE(teacher.id), data, { headers }).pipe(
            map(response => {
                console.log(response);
                return this.handleCreateResponse(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleCreateError(error);
            })
        );
    }
}
