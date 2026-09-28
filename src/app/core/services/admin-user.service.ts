import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import {
  Observable,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';

import { API_BASE } from '../constants/api-urls.constants';
import {
  AdminUserListResponse,
  AdminUserPayload,
  AdminUserResponse
} from '@models/admin-user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private readonly baseUrl =
    `${API_BASE.V1}/api/accounts/admin-users/`;

  constructor(
    private readonly http: HttpClient
  ) {}

  getUsers(): Observable<AdminUserListResponse> {
    return this.http.get<AdminUserListResponse>(
      this.baseUrl,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getUser(
    userId: number
  ): Observable<AdminUserResponse> {
    return this.http.get<AdminUserResponse>(
      `${this.baseUrl}${userId}/`,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  createUser(
    payload: AdminUserPayload
  ): Observable<AdminUserResponse> {
    return this.http.post<AdminUserResponse>(
      this.baseUrl,
      payload,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  updateUser(
    userId: number,
    payload: AdminUserPayload
  ): Observable<AdminUserResponse> {
    return this.http.put<AdminUserResponse>(
      `${this.baseUrl}${userId}/`,
      payload,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private getHeaders(): {
    Authorization: string;
  } {
    const token = localStorage.getItem('auth_token');

    return {
      Authorization: `Bearer ${token}`
    };
  }

  private handleError(
    error: HttpErrorResponse
  ): Observable<never> {
    const detailMessage =
      this.extractValidationMessage(
        error.error?.details
      );

    const message =
      detailMessage ||
      error.error?.message ||
      'No fue posible procesar la solicitud.';

    return throwError(() => new Error(message));
  }

  private extractValidationMessage(
    value: unknown
  ): string | null {
    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const message =
          this.extractValidationMessage(item);

        if (message) {
          return message;
        }
      }

      return null;
    }

    if (
      value !== null &&
      typeof value === 'object'
    ) {
      for (const item of Object.values(value)) {
        const message =
          this.extractValidationMessage(item);

        if (message) {
          return message;
        }
      }
    }

    return null;
  }
}