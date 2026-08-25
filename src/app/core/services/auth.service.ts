import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AUTH_URLS } from '../constants/api-urls.constants';
import { User } from '@models/user.model';
import { LoginResponse } from '@models/login-response.model'
import { Student } from '@models/student.model';
import { toUserRole } from '../helpers/role.helpers';
import { UserRole } from '@enums/user-role.enum';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private tokenKey = 'auth_token';
    private refreshTokenKey = 'refresh_token';
    private userKey = 'current_user';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.initializeAuthState();
    }

    /**
     * Inicializar el estado de autenticación desde el localStorage
     */
    private initializeAuthState(): void {
        const token = this.getToken();
        const user = this.getStoredUser();

        if (token && user) {
            this.currentUserSubject.next(user);
        }
    }

    /**
     * Iniciar sesión
     */
    login(user: string, pass: string): Observable<LoginResponse> {
        const credentials = {
            "identifier": user,
            "password": pass
        };
        return this.http.post<LoginResponse>(AUTH_URLS.LOGIN, credentials).pipe(
            tap(response => {
                this.handleLoginResponse(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleLoginError(error);
            })
        );
    }

    changePassword(userId: number, newPass: string): Observable<boolean> {
        const data = {
            "password": newPass
        };
        const token = this.getToken();
        const headers = { Authorization: `Bearer ${token}` };

        return this.http.put<boolean>(AUTH_URLS.CHANGE_PASSWORD(userId), data, { headers }).pipe(
            tap(response => {
                return this.handleChangePassResponse(response);
            }),
            catchError((error: HttpErrorResponse) => {
                return this.handleChangePassError(error);
            })
        );
    }

    private handleChangePassResponse(response: any): boolean {
        if (response && response.status === 200) {
            return true;
        }
        return false;
    }

    private handleChangePassError(error: HttpErrorResponse): Observable<never> {
        let errorMessage: string;

        if (error.status === 404) {
            errorMessage = 'No encontrado';
        } else if (error.status >= 400 && error.status < 500) {
            errorMessage = 'Ocurrió un error al procesar tu solicitud.';
        } else if (error.status >= 500) {
            errorMessage = 'Error del servidor. Intenta más tarde.';
        } else {
            errorMessage = 'Error desconocido al cambiar la contraseña.';
        }

        return throwError(() => new Error(errorMessage));
    }

    private handleLoginError(error: HttpErrorResponse): Observable<never> {
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
     * Manejar la respuesta del login
     */
    private handleLoginResponse(response: LoginResponse): void {
        // Almacenar token
        this.setToken(response.tokens.access);
        this.setRefreshToken(response.tokens.refresh);

        // Transformar y almacenar usuario
        const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            first_name: response.first_name,
            last_name: response.last_name,
            role: response.role,
            fullName: `${response.first_name} ${response.last_name}`,
            is_staff: response.is_staff,
            profile: response.profile,
            parent_id: response.parent_id,
            teacher_id: response.teacher_id,
            school_id: response.school_id,

            // 🔥 Aquí está la solución
            students: response.students
                ? response.students.map(s => Student.fromJson(s))
                : []
        };

        this.setStoredUser(user);
        this.currentUserSubject.next(user);
    }


    /**
     * Cerrar sesión
     */
    logout(): void {
        this.clearAuthData();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        const token = this.getToken();
        return !!token && !this.isTokenExpired();
    }

    /**
     * Verificar si el token ha expirado
     */
    private isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiration = payload.exp * 1000; // Convertir a milisegundos
            return Date.now() >= expiration;
        } catch (error) {
            return true;
        }
    }

    /**
     * Obtener el usuario actual
     */
    getCurrentUser(): User | null {
        let user = this.currentUserSubject.value;

        if (user) {
            return user;
        }

        const stored = localStorage.getItem(this.userKey);
        if (!stored) {
            return null;
        }

        try {
            const parsed = JSON.parse(stored);
            user = this.mapUserFromJson(parsed);
            this.currentUserSubject.next(user);
            return user;
        } catch (error) {
            console.error('Error parsing user from localStorage', error);
            return null;
        }
    }

    getUserRole(): string | null {
        let user = this.getCurrentUser();
        return user ? user.role : null;
    }

    getUserRoleLabel(): string {
        let user = this.getCurrentUser();
        if (!user) return '';
        switch (toUserRole(user.role ?? '')) {
            case UserRole.Direccion: return 'Director';
            case UserRole.ServiciosDocentes: return 'Servicios Docentes';
            case UserRole.ServiciosEscolares: return 'Servicios Escolares';
            case UserRole.OrientacionEducativa: return 'Orientación educativa';
            case UserRole.Prefectura: return 'Prefectura';
            case UserRole.Enfermeria: return 'Enefermería';
            case UserRole.Docentes: return 'Docente';
            case UserRole.Papas: return 'Padre/Tutor';
            case UserRole.None: return '';
            default: return '';
        }
    }

    mapUserFromJson(json: any): User {
        return {
            id: json.id,
            username: json.username,
            first_name: json.first_name,
            last_name: json.last_name,
            email: json.email,
            is_staff: json.is_staff,
            profile: json.profile,
            parent_id: json.parent_id,
            teacher_id: json.teacher_id,
            role: json.role,
            fullName: json.fullName,
            school_id: json.school_id ?? 0,
            students: json.students
                ? json.students.map((s: any) => Student.fromJson(s))
                : []
        };
    }


    /**
     * Obtener el token JWT
     */
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Obtener refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(this.refreshTokenKey);
    }

    /**
     * Verificar si el usuario es de un tipo específico
     */
    hasUserType(userType: string): boolean {
        const user = this.getCurrentUser();
        return user?.role === userType;
    }

    /**
     * Verificar si es profesor
     */
    isTeacher(): boolean {
        return this.hasUserType('teacher');
    }

    /**
     * Verificar si es padre
     */
    isParent(): boolean {
        return this.hasUserType('parent');
    }

    /**
     * Verificar si es admin
     */
    isAdmin(): boolean {
        return this.hasUserType('admin');
    }

    /**
     * Almacenar token en localStorage
     */
    private setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    /**
     * Almacenar refresh token en localStorage
     */
    private setRefreshToken(refreshToken: string): void {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    /**
     * Almacenar usuario en localStorage
     */
    private setStoredUser(user: User): void {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    /**
     * Obtener usuario almacenado en localStorage
     */
    private getStoredUser(): User | null {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Limpiar todos los datos de autenticación
     */
    private clearAuthData(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * Refrescar el token (opcional - si tu API lo soporta)
     */
    refreshToken(): Observable<any> {
        const refreshToken = this.getRefreshToken();
        return this.http.post(AUTH_URLS.REFRESH_TOKEN, { refresh_token: refreshToken }).pipe(
            tap((response: any) => {
                this.setToken(response.token);
                if (response.refresh_token) {
                    this.setRefreshToken(response.refresh_token);
                }
            })
        );
    }
}

