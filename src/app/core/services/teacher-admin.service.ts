import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import {
  Observable,
  catchError,
  throwError
} from 'rxjs';

import { API_BASE } from '../constants/api-urls.constants';
import {
  TeacherAdminPayload,
  TeacherCreateOptionsResponse,
  TeacherEditResponse,
  TeacherSaveResponse
} from '@models/teacher-admin.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherAdminService {
  private readonly baseUrl =
    `${API_BASE.V1}/api/teachers`;

  constructor(
    private readonly http: HttpClient
  ) {}

  getCreateOptions():
    Observable<TeacherCreateOptionsResponse> {
    return this.http.get<TeacherCreateOptionsResponse>(
      `${this.baseUrl}/admin-create/`,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getForEdit(
    teacherId: number
  ): Observable<TeacherEditResponse> {
    return this.http.get<TeacherEditResponse>(
      `${this.baseUrl}/${teacherId}/edit/`,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  create(
    payload: TeacherAdminPayload
  ): Observable<TeacherSaveResponse> {
    return this.http.post<TeacherSaveResponse>(
      `${this.baseUrl}/admin-create/`,
      payload,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  update(
    teacherId: number,
    payload: TeacherAdminPayload
  ): Observable<TeacherSaveResponse> {
    return this.http.put<TeacherSaveResponse>(
      `${this.baseUrl}/${teacherId}/edit/`,
      payload,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private getHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('auth_token') ?? '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private handleError(
    error: HttpErrorResponse
  ): Observable<never> {
    const serverError = error.error;

    if (serverError?.details) {
      return throwError(
        () => new Error(
          this.extractMessages(serverError.details)
        )
      );
    }

    if (
      serverError &&
      typeof serverError === 'object' &&
      !serverError.message
    ) {
      return throwError(
        () => new Error(
          this.extractMessages(serverError)
        )
      );
    }

    const message =
      serverError?.message ||
      serverError?.detail ||
      this.getDefaultMessage(error.status);

    return throwError(() => new Error(message));
  }

  private extractMessages(value: unknown): string {
    const messages: string[] = [];

    const visit = (
      current: unknown,
      field?: string
    ): void => {
      if (typeof current === 'string') {
        messages.push(
          field ? `${field}: ${current}` : current
        );
        return;
      }

      if (Array.isArray(current)) {
        current.forEach(item => visit(item, field));
        return;
      }

      if (
        current &&
        typeof current === 'object'
      ) {
        Object.entries(
          current as Record<string, unknown>
        ).forEach(([key, item]) => {
          visit(item, this.getFieldLabel(key));
        });
      }
    };

    visit(value);

    return messages.join(' ') ||
      'Verifica los datos enviados.';
  }

  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      first_name: 'Nombre',
      first_surname: 'Apellido paterno',
      second_surname: 'Apellido materno',
      phone: 'Teléfono',
      email: 'Correo',
      password: 'Contraseña',
      assignments: 'Asignaciones',
      subject_id: 'Materia',
      group_id: 'Grupo',
      school_id: 'Escuela',
      non_field_errors: 'Datos'
    };

    return labels[field] ?? field;
  }

  private getDefaultMessage(status: number): string {
    switch (status) {
      case 0:
        return 'Error de conexión. Verifica tu internet.';
      case 400:
        return 'Verifica los datos enviados.';
      case 401:
        return 'La sesión ha expirado.';
      case 403:
        return 'No tienes permisos para administrar docentes.';
      case 404:
        return 'Docente no encontrado.';
      default:
        return 'No fue posible completar la operación.';
    }
  }
}