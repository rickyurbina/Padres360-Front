import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { EMERGENCY_DATA } from '../constants/api-urls.constants';
import { User } from '@models/user.model';
import { EmergencyData } from '@models/emergency-data-model';

@Injectable({
    providedIn: 'root'
})
export class EmergencyDataService {

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    getEmergencyData(
        type: string,
        id: number
    ): Observable<EmergencyData> {

        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };

        let paramName: string;

        switch (type) {
            case 'student':
                paramName = 'student_id';
                break;
            case 'teacher':
                paramName = 'teacher_id';
                break;
            default:
                return throwError(() => ({
                    status: 400,
                    error: {
                        message: `Tipo no soportado para información médica: ${type}`
                    }
                }));
        }

        return this.http
            .get<any>(
                EMERGENCY_DATA.GET_DATA_STUDENT,
                { headers, params: { [paramName]: id } }
            )
            .pipe(
                map(response => {
                    if (response?.success === true && response?.data) {
                        return new EmergencyData(response.data);
                    }
                    if (response?.success === false) {
                        console.warn('No existe información médica, se inicializa vacío');
                        return new EmergencyData();
                    }
                    throw new Error('Respuesta inválida del servidor');
                }),

                catchError((error: HttpErrorResponse | Error) => {
                    if (error instanceof HttpErrorResponse && error.status === 404) {
                        console.warn('No existe información médica, se inicializa vacío');
                        return of(new EmergencyData());
                    }
                    return this.handleError(error as HttpErrorResponse);
                })
            );

    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('Error en EmergencyDataService:', error);

        let errorMessage = 'Error desconocido';

        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
        } else {
            errorMessage = `Error ${error.status}: ${error.message}`;
        }

        return throwError(() => new Error(errorMessage));
    }

    saveEmergencyData(
        type: string,
        id: number,
        data: EmergencyData
    ): Observable<EmergencyData> {

        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };

        let paramName: string;

        switch (type) {
            case 'student':
                paramName = 'student';
                break;
            case 'teacher':
                paramName = 'teacher';
                break;
            default:
                return throwError(() => ({
                    status: 400,
                    error: {
                        message: `Tipo no soportado para información médica: ${type}`
                    }
                }));
        }

        const body = {
            ...data.toJson(),
            [paramName]: id
        };

        return this.http
            .post<any>(
                EMERGENCY_DATA.UPDATE_DATA,
                body,
                { headers }
            )
            .pipe(
                map(response => new EmergencyData(response)),
                catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }
}
