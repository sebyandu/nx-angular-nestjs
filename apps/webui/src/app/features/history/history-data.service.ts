import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  HistoryRow,
  HistoryWindowRequest,
  HistoryWindowResponse,
} from './history-table.models';

@Injectable({ providedIn: 'root' })
export class HistoryDataService {
  private readonly baseUrl = '/api/history';
  private readonly http = inject(HttpClient);

  fetchWindow(request: HistoryWindowRequest): Observable<HistoryWindowResponse> {
    const params = new HttpParams()
      .set('skip', String(request.skip))
      .set('take', String(request.take))
      .set('query', request.query.trim());

    return this.http
      .get<{
        total: number;
        rows: Array<Omit<HistoryRow, 'createdAt'> & { createdAt: string }>;
      }>(this.baseUrl, { params })
      .pipe(
        map((response) => ({
          total: response.total,
          rows: response.rows.map((row) => ({
            ...row,
            createdAt: new Date(row.createdAt),
          })),
        }))
      );
  }
}
