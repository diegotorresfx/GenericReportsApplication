import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, from, switchMap } from 'rxjs';
import { ReportRunRequest, ReportRunResponse } from '@app/shared/models/report-run.model';
import { AuthService } from '@app/core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ReportRunService {
  private base = `${environment.apiBaseUrl}/ReportRun`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  execute(payload: ReportRunRequest): Observable<ReportRunResponse> {
    return from(this.auth.ensureLogin()).pipe(
      switchMap(() => this.http.post<ReportRunResponse>(`${this.base}/execute`, payload))
    );
  }
}
