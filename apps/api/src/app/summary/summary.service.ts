import { Injectable } from '@nestjs/common';
import {
  SummaryRowDto,
  SummaryStatus,
  SummaryWindowResponseDto,
} from './summary.types';

@Injectable()
export class SummaryService {
  private static readonly BASE_TOTAL = 1_000_000;

  getWindow(skip: number, take: number, query: string): SummaryWindowResponseDto {
    const normalizedQuery = query.trim().toLowerCase();
    const total = this.computeTotalForQuery(normalizedQuery);
    const safeSkip = Math.max(0, Math.min(skip, total));
    const safeTake = Math.max(1, Math.min(take, 500));
    const end = Math.min(total, safeSkip + safeTake);

    return {
      total,
      rows: Array.from({ length: end - safeSkip }, (_, i) =>
        this.buildRow(safeSkip + i, normalizedQuery)
      ),
    };
  }

  private computeTotalForQuery(query: string): number {
    if (!query) {
      return SummaryService.BASE_TOTAL;
    }

    const reduction = Math.min(query.length, 12) * 0.03;
    const ratio = Math.max(0.02, 0.38 - reduction);
    return Math.floor(SummaryService.BASE_TOTAL * ratio);
  }

  private buildRow(index: number, query: string): SummaryRowDto {
    const statuses: SummaryStatus[] = ['Healthy', 'Warning', 'Critical'];
    const owners = ['Platform', 'Security', 'Billing', 'Growth'];
    const id = index + 1;
    const servicePrefix = query ? `${query}-svc` : 'service';

    return {
      id,
      service: `${servicePrefix}-${String(id).padStart(7, '0')}`,
      status: statuses[index % statuses.length],
      owner: owners[index % owners.length],
      updatedAt: new Date(Date.now() - index * 30_000).toISOString(),
    };
  }
}
