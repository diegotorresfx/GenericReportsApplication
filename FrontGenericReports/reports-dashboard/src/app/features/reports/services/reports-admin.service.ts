import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, from, switchMap } from 'rxjs';
import { ReportDefinition, ReportCreateDto, ReportUpdateDto } from '@app/shared/models/report.model';
import { AuthService } from '@app/core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ReportsAdminService {
  private base = `${environment.apiBaseUrl}/Reports`;
  constructor(private http: HttpClient, private auth: AuthService) {}

  create(payload: ReportCreateDto): Observable<any> {
    return from(this.auth.ensureLogin()).pipe(
      switchMap(() => this.http.post(this.base, payload))
    );
  }

  update(id: number, payload: ReportUpdateDto): Observable<any> {
    return from(this.auth.ensureLogin()).pipe(
      switchMap(() => this.http.put(`${this.base}/${id}`, payload))
    );
  }

  delete(id: number): Observable<any> {
    return from(this.auth.ensureLogin()).pipe(
      switchMap(() => this.http.delete(`${this.base}/${id}`))
    );
  }

  getAll(): Observable<ReportDefinition[]> {
    return from(this.auth.ensureLogin()).pipe(
      switchMap(() => this.http.get<ReportDefinition[]>(this.base))
    );
  }

  getById(id: number): Observable<ReportDefinition> {
    return from(this.auth.ensureLogin()).pipe(
      switchMap(() => this.http.get<ReportDefinition>(`${this.base}/${id}`))
    );
  }
}
