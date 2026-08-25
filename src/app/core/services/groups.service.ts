import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GROUP_URLS } from '../constants/api-urls.constants';
import { User } from '@models/user.model';
import { Group } from '@models/groups.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GroupService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    /**
     * Obtener incidencias
     */
    getGroupList(): Observable<Group[]> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<Group[]>(GROUP_URLS.GROUPS_LIST, { headers }).pipe(
            tap(response => {
                this.handleResponse(response);
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
        // console.error('Login error:', {
        //     status: error.status,
        //     message: error.message,
        //     url: error.url,
        //     error: error.error
        // });

        return throwError(() => new Error(errorMessage));
    }

    /**
     * Manejar la respuesta del response
     */
    private handleResponse(response: any[]): Group[] {
        return response.map(item => ({
            id: item.id,
            grade: item.grade,
            shift: item.shift,
            group: item.group,
            subject: item.subject,
            teacher: item.teacher,
            specialty: item.specialty,
            selected: item.selected ?? false // por si viene indefinido
        } as Group));
    }

    getGroupFilters(): Observable<{
        grados: number[];
        grupos: string[];
        especialidades: string[];
        turnos: string[];
        gruposFull: Group[]
    }> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };

        return this.http.get<{ success: boolean; groups: Group[] }>(GROUP_URLS.GROUPS_LIST, { headers }).pipe(
            map(response => {
                if (!response.success || !response.groups) {
                    throw new Error('Respuesta inválida del servidor');
                }

                const grupos = response.groups;

                const grados = Array.from(new Set(grupos.map(g => g.grade))).sort((a, b) => a - b);
                const groupNames = Array.from(new Set(grupos.map(g => g.name))).sort();
                const especialidades = Array.from(new Set(grupos.map(g => g.specialty))).sort();
                const turnos = Array.from(new Set(grupos.map(g => g.shift))).sort();

                return {
                    grados,
                    grupos: groupNames,
                    especialidades,
                    turnos,
                    gruposFull: grupos
                };
            }),
            catchError((error: HttpErrorResponse) => this.handleError(error))
        );
    }

    create(group: any) {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        const data = {
            name: group.group,
            grade: group.grade,
            specialty: group.specialty,
            shift: group.shift.toUpperCase()
        };
        return this.http.post<Group>(GROUP_URLS.CREATE, data, { headers }).pipe(
            tap(response => {
                this.handleCreate(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        );
    }

    private handleCreate(response: any) {

    }

    update(group: any) {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        const data = {
            grade: group.grade,
            name: group.group,
            shift: group.shift,
            specialty: group.specialty
        };
        return this.http.put<Group>(GROUP_URLS.UPDATE(group.id), data, { headers }).pipe(
            tap(response => {
                this.handleUpdate(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        );
    }

    private handleUpdate(response: any) {

    }

    delete(group: any) {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        const data = {};
        return this.http.delete<Group>(GROUP_URLS.DELETE(group.id), { headers }).pipe(
            tap(response => {
                this.handleDelete(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        );
    }

    private handleDelete(response: any) {

    }

    getGroupsBySchool(schoolId: number): Observable<Group[]> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        const url = `${GROUP_URLS.GROUPS_BY_SCHOOL}?school_id=${schoolId}`;

        return this.http.get<any>(url, { headers }).pipe(
            map(response => {

                if (!environment.production) {
                    console.log('Respuesta completa:', response);
                }

                let rawGroups: any[] = [];

                if (response && response.success && response.groups) {
                    rawGroups = response.groups;
                } else if (Array.isArray(response)) {
                    rawGroups = response;
                } else if (response && response.groups) {
                    rawGroups = response.groups;
                } else {
                    if (!environment.production) {
                        console.warn('Estructura de respuesta inesperada:', response);
                    }
                    return [];
                }

                // Adaptar la forma del backend (group_id) a la interfaz Group (id)
                return rawGroups.map(g => this.mapToGroup(g));
            }),
            catchError((error: HttpErrorResponse) => {
                if (!environment.production) {
                    console.error('Error al cargar grupos:', error);
                }
                return this.handleError(error);
            })
        );
    }

    private mapToGroup(raw: any): Group {
        return {
            id: raw.group_id ?? raw.id ?? 0,
            grade: raw.grade ?? 0,
            shift: raw.shift ?? '',
            group: raw.group ?? '',
            subject: raw.subject ?? '',
            teacher: raw.teacher ?? '',
            specialty: raw.specialty ?? '',
            selected: raw.selected ?? false,
            name: raw.name ?? ''
        };
    }

}

