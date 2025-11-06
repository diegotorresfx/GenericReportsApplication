import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, from, switchMap } from 'rxjs';
import { ReportDefinition } from '@app/shared/models/report.model';
import { AuthService } from '@app/core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ReportsListService {
  private base = `${environment.apiBaseUrl}/Reports`;
  constructor(private http: HttpClient, private auth: AuthService) {}

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
