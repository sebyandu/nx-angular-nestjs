import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  SummaryRow,
  SummaryWindowRequest,
  SummaryWindowResponse,
} from './summary-cards-grid.models';

@Injectable({ providedIn: 'root' })
export class SummaryDataService {
  private readonly baseUrl = '/api/summary';

  constructor(private readonly http: HttpClient) {}

  fetchWindow(request: SummaryWindowRequest): Observable<SummaryWindowResponse> {
    const params = new HttpParams()
      .set('skip', String(request.skip))
      .set('take', String(request.take))
      .set('query', request.query.trim());

    return this.http
      .get<{
        total: number;
        rows: Array<Omit<SummaryRow, 'updatedAt'> & { updatedAt: string }>;
      }>(this.baseUrl, { params })
      .pipe(
        map((response) => ({
          total: response.total,
          rows: response.rows.map((row) => ({
            ...row,
            updatedAt: new Date(row.updatedAt),
          })),
        }))
      );
  }
}
