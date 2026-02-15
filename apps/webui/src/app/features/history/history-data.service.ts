import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import {
  HistoryRow,
  HistoryStatus,
  HistoryWindowRequest,
  HistoryWindowResponse,
} from './history-table.models';

@Injectable({ providedIn: 'root' })
export class HistoryDataService {
  private static readonly BASE_TOTAL = 1_000_000;

  fetchWindow(request: HistoryWindowRequest): Observable<HistoryWindowResponse> {
    const query = request.query.trim().toLowerCase();
    const total = this.computeTotalForQuery(query);
    const start = Math.min(request.offset, total);
    const end = Math.min(start + request.limit, total);

    return of({ start, end, total, query }).pipe(
      delay(240),
      map(({ start: from, end: to, total: totalRows, query: q }) => ({
        total: totalRows,
        rows: Array.from({ length: to - from }, (_, i) => this.buildRow(from + i, q)),
      }))
    );
  }

  private computeTotalForQuery(query: string): number {
    if (!query) {
      return HistoryDataService.BASE_TOTAL;
    }

    const reduction = Math.min(query.length, 12) * 0.03;
    const ratio = Math.max(0.02, 0.35 - reduction);
    return Math.floor(HistoryDataService.BASE_TOTAL * ratio);
  }

  private buildRow(index: number, query: string): HistoryRow {
    const statuses: HistoryStatus[] = ['Success', 'Pending', 'Failed'];
    const actors = ['system', 'billing-job', 'admin-user', 'api-gateway'];
    const eventPrefix = query ? `${query}.event` : 'event';
    const id = index + 1;

    return {
      id,
      eventType: `${eventPrefix}.${(id % 19) + 1}`,
      actor: actors[index % actors.length],
      status: statuses[index % statuses.length],
      createdAt: new Date(Date.now() - index * 45_000),
    };
  }
}
