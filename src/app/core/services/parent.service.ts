import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PARENT_URLS } from '../constants/api-urls.constants';
import { User } from '@models/user.model';
import { Parent, ParentResponse, ParentResponseCreate } from '@models/parent.model';

@Injectable({
    providedIn: 'root'
})
export class ParentService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    /**
     * Obtener incidencias
     */
    getParentList(): Observable<Parent[]> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };

        return this.http.get<ParentResponse>(PARENT_URLS.PARENT_LIST, { headers }).pipe(
            map(response => {
                if (!response.success || !response.parents) {
                    throw new Error('Respuesta inválida del servidor');
                }
                return this.handleResponse(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        );
    }

    private handleResponse(response: ParentResponse): Parent[] {
        // Validar y mapear respuesta
        return (response.parents || []).map(parent => ({
            id: parent.id,
            user: {
                id: parent.user?.id ?? 0,
                username: parent.user?.username ?? '',
                first_name: parent.user?.first_name ?? '',
                last_name: parent.user?.last_name ?? '',
                email: parent.user?.email ?? '',
                is_staff: parent.user?.is_staff ?? false,
                profile: parent.user?.profile ?? '',
                students: parent.user?.students ?? [],
                parent_id: parent.user?.parent_id ?? 0,
                role: parent.user?.role ?? '',
                fullName: parent.user?.fullName ?? `${parent.user?.first_name ?? ''} ${parent.user?.last_name ?? ''}`.trim(),
                teacher_id: parent.user?.teacher_id ?? 0,
                school_id: parent.user?.school_id ?? 0
            },
            full_name: parent.full_name ?? `${parent.user?.first_name ?? ''} ${parent.user?.last_name ?? ''}`.trim(),
            cell_phone: parent.cell_phone ?? '',
        }));
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

    createParent(data: any): Observable<Parent> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        const parent = {
            user: {
                username: data.username,
                first_name: data.first_name,
                last_name: data.lastname,
                email: data.email,
                password: data.password,
            },
            cell_phone: data.cellphone,
        };
        return this.http.post<ParentResponseCreate>(PARENT_URLS.CREATE, parent, { headers }).pipe(
            map(response => {
                if (!response.success || !response.parent) {
                    throw new Error('Respuesta inválida del servidor');
                }
                return response.parent;
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        );
    }

    updateParent(data: any, beforeUserName: string): Observable<Parent> {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        const changeUsername = beforeUserName !== data.username;

        const parent: any = {
            user: {
                first_name: data.first_name,
                last_name: data.lastname,
                email: data.email,
                password: data.password,
            },
            cell_phone: data.cellphone,
        };

        // Solo incluir username si cambió
        if (changeUsername) {
            parent.user.username = data.username;
        }
        return this.http.put<ParentResponseCreate>(PARENT_URLS.UPDATE(data.id), parent, { headers }).pipe(
            map(response => {
                if (!response.success || !response.parent) {
                    throw new Error('Respuesta inválida del servidor');
                }
                return response.parent;
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        );
    }
}