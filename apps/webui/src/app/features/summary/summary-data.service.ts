import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import {
  SummaryRow,
  SummaryStatus,
  SummaryWindowRequest,
  SummaryWindowResponse,
} from './summary-cards-grid.models';

@Injectable({ providedIn: 'root' })
export class SummaryDataService {
  private static readonly BASE_TOTAL = 1_000_000;

  fetchWindow(request: SummaryWindowRequest): Observable<SummaryWindowResponse> {
    const query = request.query.trim().toLowerCase();
    const total = this.computeTotalForQuery(query);
    const start = Math.min(request.offset, total);
    const end = Math.min(start + request.limit, total);

    return of({ start, end, total, query }).pipe(
      delay(220),
      map(({ start: from, end: to, total: totalRows, query: q }) => ({
        total: totalRows,
        rows: Array.from({ length: to - from }, (_, i) => this.buildRow(from + i, q)),
      }))
    );
  }

  private computeTotalForQuery(query: string): number {
    if (!query) {
      return SummaryDataService.BASE_TOTAL;
    }

    const reduction = Math.min(query.length, 12) * 0.03;
    const ratio = Math.max(0.02, 0.38 - reduction);
    return Math.floor(SummaryDataService.BASE_TOTAL * ratio);
  }

  private buildRow(index: number, query: string): SummaryRow {
    const statuses: SummaryStatus[] = ['Healthy', 'Warning', 'Critical'];
    const owners = ['Platform', 'Security', 'Billing', 'Growth'];
    const id = index + 1;
    const servicePrefix = query ? `${query}-svc` : 'service';

    return {
      id,
      service: `${servicePrefix}-${String(id).padStart(7, '0')}`,
      status: statuses[index % statuses.length],
      owner: owners[index % owners.length],
      updatedAt: new Date(Date.now() - index * 30_000),
    };
  }
}
