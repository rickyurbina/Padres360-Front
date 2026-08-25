import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { STUDENT_URLS } from '../constants/api-urls.constants';
import { User } from '@models/user.model';
import { Student, StudentResponse } from '@models/student.model';

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    /**
     * Obtener incidencias
     */
    getStudentList(): Observable<Student[]> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<StudentResponse>(STUDENT_URLS.STUDENT_LIST, { headers }).pipe(
            map(response => {
                return this.handleResponse(response.students);
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

    /**
     * Manejar la respuesta del response
     */
    private handleResponse(response: any[]): Student[] {
        const students = response.map(item => ({
            id: item.id,
            group: item.group,
            firstName: item.first_name,
            firstSurname: item.first_surname,
            secondSurname: item.second_surname,
            controlNumber: item.control_number,
            curp: item.curp,
            uuid: item.uuid,
            parent: item.parent
        } as Student));
        return students;
    }

    createStudent(student: any): Observable<Student> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        const data = {
            first_name: student.firstName,
            first_surname: student.firstSurname,
            second_surname: student.secondSurname,
            control_number: student.controlNumber,
            curp: student.curp,
            group_id: student.group_id,
            active: student.active,
            school_id: student.school_id,

            parents_data: [
                {
                    user: {
                        username: student.parent.username,
                        first_name: student.parent.first_name,
                        last_name: student.parent.last_name,
                        email: student.parent.email,
                        password: student.parent.password,
                        school_id: student.parent.school_id
                    },

                    cell_phone: student.parent.cell_phone
                }
            ]
        };

        return this.http.post<StudentResponse>(STUDENT_URLS.CREATE, data, { headers }).pipe(
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
                            errorMessage = this.parseErrorMessage(serverError.message);
                        } else {
                            errorMessage = 'Error en el servidor';
                        }
                    } else if (serverError.message) {
                        errorMessage = this.parseErrorMessage(serverError.message);
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

    // Método auxiliar para parsear el mensaje de error del servidor
    private parseErrorMessage(message: string): string {
        try {
            // Intentar parsear el string JSON que viene en message
            if (message.includes('{') && message.includes('}')) {
                const cleanMessage = message.replace(/'/g, '"');
                const errorObj = JSON.parse(cleanMessage);

                const errorMessages: string[] = [];

                // Recorrer todas las propiedades del objeto de error
                for (const [field, errors] of Object.entries(errorObj)) {
                    if (Array.isArray(errors) && errors.length > 0) {
                        const fieldName = this.getFieldDisplayName(field);
                        errorMessages.push(`${fieldName}: ${errors[0]}`);
                    }
                }

                return errorMessages.join(', ');
            }

            return message;
        } catch (e) {
            // Si falla el parsing, devolver el mensaje original
            return message;
        }
    }

    // Método para convertir nombres de campo a nombres legibles
    private getFieldDisplayName(field: string): string {
        const fieldNames: { [key: string]: string } = {
            'control_number': 'Número de control',
            'curp': 'CURP',
            'first_name': 'Nombre',
            'first_surname': 'Apellido paterno',
            'second_surname': 'Apellido materno',
            'group': 'Grupo',
            'grade': 'Grado'
        };

        return fieldNames[field] || field;
    }

    private handleCreateResponse(response: any): Student {
        if (response && response.success && response.student) {
            const studentData = response.student;

            return Student.fromJson({
                id: studentData.id,
                group: studentData.group ?? 0,
                parent: studentData.parent || [],
                first_name: studentData.first_name,
                first_surname: studentData.first_surname,
                second_surname: studentData.second_surname,
                control_number: studentData.control_number,
                curp: studentData.curp,
                uuid: studentData.uuid,
                grade: 0 // El backend no lo manda, lo dejamos en 0 por defecto
            });
        }
        return Student.empty();
    }

    updateStudent(student: any): Observable<Student> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        const data = {
            first_name: student.firstName,
            first_surname: student.firstSurname,
            second_surname: student.secondSurname,
            control_number: student.controlNumber,
            curp: student.curp,
            group_id: student.group_id,
            active: student.active,
            school_id: student.school_id,

            parents_data: [
                {
                    user: {
                        username: student.parent.username,
                        first_name: student.parent.first_name,
                        last_name: student.parent.last_name,
                        email: student.parent.email,
                        password: student.parent.password,
                        school_id: student.parent.school_id
                    },

                    cell_phone: student.parent.cell_phone
                }
            ]
        };

        return this.http.put<StudentResponse>(STUDENT_URLS.UPDATE(student.id), data, { headers }).pipe(
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
