import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { STUDENT_VALIDATION } from '../constants/api-urls.constants';
import { StudentValidationResponse, StudentValidation, ParentValidation } from '@models/student-validation.model';

@Injectable({
    providedIn: 'root'
})
export class StudentValidationService {

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    /**
     * Obtener datos del alumno por CURP
     * GET /api/students/by-curp/{CURP}/
     * Retorna: StudentValidationResponse (objeto completo con student y parents)
     */
    getStudentByCurp(curp: string): Observable<StudentValidationResponse> {
    const curpUpper = curp.toUpperCase().trim();
    if (!environment.production) {
        console.log(`Consultando datos del alumno con CURP: ${curpUpper}`);
    }
    return this.http.get<any>(
        `${STUDENT_VALIDATION.GET_DATA_STUDENT}`.replace('{CURP}', curpUpper)
    ).pipe(
        map(response => {
            if (!environment.production) {
                console.log('Respuesta del API:', response);
            }
            
            // Mapear la respuesta a tu interfaz esperada
            const mappedResponse: StudentValidationResponse = {
                student: {
                    id: response.student.id,
                    name: response.student.first_name,
                    lastName: response.student.first_surname,
                    motherLastName: response.student.second_surname,
                    controlNumber: response.student.control_number,
                    curp: response.student.curp,
                    group: response.student.group,
                    groupId: response.student.group_id,
                    schoolName: `Grupo ${response.student.group}` // o algún valor por defecto
                },
                parents: response.parents.map((parent: any) => ({
                    id: parent.id,
                    fullName: parent.first_name + ' ' + parent.last_name,
                    firstName: parent.first_name,
                    surnames: parent.last_name,
                    email: parent.email,
                    phone: parent.cell_phone,
                    username: parent.email || '', // o algún valor por defecto
                    relationship: '' // valor por defecto si no viene
                })),
                message: response.message
            };
            
            if (!environment.production) {
                console.log('Datos mapeados:', mappedResponse);
            }
            return mappedResponse;
        }),
        catchError(this.handleError)
    );
}

    /**
     * Actualizar datos del alumno y padres
     * PUT /api/students/by-curp/{CURP}/
     * Retorna: { success: boolean, message: string, data?: any }
     */
    updateStudentByCurp(curp: string, data: any): Observable<{ success: boolean; message: string; data?: any }> {
        const curpUpper = curp.toUpperCase().trim();
        
        if (!environment.production) {
            console.log(`Actualizando datos del alumno con CURP: ${curpUpper}`);
            console.log('Datos a actualizar:', data);
        }
        
        return this.http.put<{ success: boolean; message: string; data?: any }>(
            `${STUDENT_VALIDATION.UPDATE_DATA}`.replace('{CURP}', curpUpper), 
            data
        ).pipe(
            tap(response => {
                if (!environment.production) {
                    console.log('Actualización exitosa:', response);
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Obtener solo el estudiante (sin padres)
     * Retorna: StudentValidation
     */
    getStudentOnly(curp: string): Observable<StudentValidation> {
        const curpUpper = curp.toUpperCase().trim();
        return this.http.get<StudentValidationResponse>(
            `${STUDENT_VALIDATION.GET_DATA_STUDENT}`.replace('{CURP}', curpUpper)
        ).pipe(
            map(response => response.student),
            catchError(this.handleError)
        );
    }

    /**
     * Obtener solo los padres del estudiante
     * Retorna: ParentValidation[]
     */
    getParentsOnly(curp: string): Observable<ParentValidation[]> {
        const curpLower = curp.toUpperCase().trim();
        return this.http.get<StudentValidationResponse>(
            `${STUDENT_VALIDATION.GET_DATA_STUDENT}`.replace('{CURP}', curpLower)
        ).pipe(
            map(response => response.parents),
            catchError(this.handleError)
        );
    }

    /**
     * Actualizar solo los datos del estudiante
     * Retorna: { success: boolean, message: string, data?: StudentValidation }
     */
    updateStudentOnly(curp: string, studentData: StudentValidation): Observable<{ success: boolean; message: string; data?: StudentValidation }> {
        const curpUpper = curp.toUpperCase().trim();
        const payload = {
            student: studentData,
            parents: []
        };
        
        return this.http.put<{ success: boolean; message: string; data?: StudentValidation }>(
            `${STUDENT_VALIDATION.UPDATE_DATA}`.replace('{CURP}', curpUpper), 
            payload
        ).pipe(
            tap(response => {
                if (response.success) {
                   if (!environment.production) {
                    console.log('Estudiante actualizado exitosamente:', response);
                   }
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Actualizar solo los padres del estudiante
     * Retorna: { success: boolean, message: string, data?: ParentValidation[] }
     */
    updateParentsOnly(curp: string, parentsData: ParentValidation[]): Observable<{ success: boolean; message: string; data?: ParentValidation[] }> {
        const curpUpper = curp.toUpperCase().trim();
        const payload = {
            student: {},
            parents: parentsData
        };
        
        return this.http.put<{ success: boolean; message: string; data?: ParentValidation[] }>(
            `${STUDENT_VALIDATION.UPDATE_DATA}`.replace('{CURP}', curpUpper), 
            payload
        ).pipe(
            tap(response => {
                if (response.success) {
                    if (!environment.production) {
                        console.log('Padres actualizados exitosamente:', response);
                    }
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Verificar si un CURP existe
     * Retorna: boolean
     */
    checkCurpExists(curp: string): Observable<boolean> {
        const curpLower = curp.toLowerCase().trim();
        return this.http.get<StudentValidationResponse>(
            `${STUDENT_VALIDATION.GET_DATA_STUDENT}`.replace('{CURP}', curpLower)
        ).pipe(
            map(response => !!response && !!response.student),
            catchError((error) => {
                if (error.status === 404) {
                    return [false];
                }
                return throwError(() => error);
            })
        );
    }

    /**
     * Manejador de errores unificado
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Error desconocido al procesar la solicitud';

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
                    errorMessage = error.error?.message || 'Datos inválidos. Verifica la información.';
                    break;
                case 401:
                    errorMessage = error.error?.message || 'No autorizado. Sesión expirada.';
                    break;
                case 403:
                    errorMessage = error.error?.message || 'Acceso denegado. No tienes permisos.';
                    break;
                case 404:
                    errorMessage = error.error?.message || 'No se encontró ningún alumno con el CURP proporcionado.';
                    break;
                case 409:
                    errorMessage = error.error?.message || 'Conflicto: El CURP ya está registrado.';
                    break;
                case 422:
                    errorMessage = error.error?.message || 'Datos de entrada inválidos. Verifica el formato.';
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

        // Log para debugging
        // console.error('StudentValidationService Error:', {
        //     status: error.status,
        //     message: error.message,
        //     url: error.url,
        //     error: error.error
        // });

        return throwError(() => new Error(errorMessage));
    }
}