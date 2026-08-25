import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { INCIDENCE_URLS } from '../constants/api-urls.constants';
import { User } from '@models/user.model';
import { IncidenceTeacherList, IncidenceRecordsResponse } from '@models/teacher-incidence-list.model'
import { IncidenceModel } from '@models/catalog-incidence.model';

@Injectable({
    providedIn: 'root'
})
export class IncidencesService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    /**
     * Obtener incidencias
     */
    getIncidence(): Observable<IncidenceTeacherList[]> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<IncidenceTeacherList[]>(INCIDENCE_URLS.ALL_TEACHER_LIST, { headers }).pipe(
            tap(response => {
                this.handleResponse(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        );
    }

    getStudentIncidence(): Observable<IncidenceTeacherList[]> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<IncidenceTeacherList[]>(INCIDENCE_URLS.ALL_STUDENT_LIST, { headers }).pipe(
            tap(response => {
                this.handleResponse(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        );
    }

    getIncidenceRecords(filters?: {
        schoolId?: number,
        type?: 'ESTUDIANTE' | 'DOCENTE',
        createdBy?: number,
        startDate?: string,
        endDate?: string
    }): Observable<IncidenceTeacherList[]> {

        const token = localStorage.getItem('auth_token');

        const headers = {
            Authorization: `Bearer ${token}`
        };

        let params = new HttpParams();

        if (filters?.schoolId != null) {
            params = params.set('school_id', filters.schoolId.toString());
        }

        if (filters?.type) {
            params = params.set('type', filters.type);
        }

        if (filters?.createdBy != null) {
            params = params.set('created_by', filters.createdBy.toString());
        }

        if (filters?.startDate) {
            params = params.set('start_date', filters.startDate);
        }

        if (filters?.endDate) {
            params = params.set('end_date', filters.endDate);
        }

        return this.http.get<IncidenceRecordsResponse>(
            INCIDENCE_URLS.RECORDS,
            {
                headers,
                params
            }
        ).pipe(
            map(response => this.handleIncidenceRecordsResponse(response)),
            catchError((error: HttpErrorResponse) => this.handleError(error))
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
    private handleResponse(response: any[]): void {
        response.map(item => ({
            id: item.id,
            incidence_name: item.incidence_name,
            teacher_name: item.teacher_name,
            observation: item.observation,
            type: item.type,
            created_at: new Date(item.created_at),
            read: item.read,
            created_by_name: item.created_by_name,
            student_name: item.student_name
        } as IncidenceTeacherList))
    }

    private handleIncidenceRecordsResponse(
        response: IncidenceRecordsResponse
    ): IncidenceTeacherList[] {

        if (!response.success) {
            throw new Error('La consulta de incidencias no fue exitosa.');
        }

        return response.incidences;
    }

    getIncidenceListByTeacherId(teacherId: number): Observable<IncidenceTeacherList[]> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<IncidenceTeacherList[]>(INCIDENCE_URLS.TEACHER_LIST(teacherId), { headers }).pipe(
            tap(response => {
                this.handleResponse(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        );
    }

    getIncidenceCatalog(): Observable<IncidenceModel[]> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };

        return this.http.get<{ incidences: any[] }>(INCIDENCE_URLS.INCIDENCE_LIST, { headers }).pipe(
            map(response => this.handleResponseIncidenceModel(response)),
            catchError(error => this.handleError(error))
        );
    }

    private handleResponseIncidenceModel(response: any): IncidenceModel[] {
        const data = response?.incidences ?? [];

        return data
            .map((item: any): IncidenceModel => ({
                id: item.id,
                name: item.name,
                type: item.type,
                selected: item.selected,
                isRead: item.isRead
            }));
    }

    sendIncidences(incidences: any): Observable<void> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };

        return this.http.post<any>(INCIDENCE_URLS.CREATE, incidences, { headers }).pipe(
            map(response => {
                if (response?.status === 200 || response?.status === 201) {
                    // No se regresan datos, solo un void
                    return;
                }
            }),
            catchError(error => this.handleError(error))
        );
    }

    getIncidencesByParent(parentId: number): Observable<IncidenceTeacherList[]> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };

        return this.http.get<IncidenceTeacherList[]>(INCIDENCE_URLS.READ_BY_PARENT(parentId), { headers }).pipe(
            map((response: any) => {
                if (Array.isArray(response)) {
                    return response;
                }

                return [];
            }),
            catchError(error => this.handleError(error))
        );
    }


}

