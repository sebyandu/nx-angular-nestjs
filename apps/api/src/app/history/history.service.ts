import { Injectable } from '@nestjs/common';
import {
  HistoryRowDto,
  HistoryStatus,
  HistoryWindowResponseDto,
} from './history.types';

@Injectable()
export class HistoryService {
  private static readonly BASE_TOTAL = 1_000_000;

  getWindow(skip: number, take: number, query: string): HistoryWindowResponseDto {
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
      return HistoryService.BASE_TOTAL;
    }

    const reduction = Math.min(query.length, 12) * 0.03;
    const ratio = Math.max(0.02, 0.35 - reduction);
    return Math.floor(HistoryService.BASE_TOTAL * ratio);
  }

  private buildRow(index: number, query: string): HistoryRowDto {
    const statuses: HistoryStatus[] = ['Success', 'Pending', 'Failed'];
    const actors = ['system', 'billing-job', 'admin-user', 'api-gateway'];
    const eventPrefix = query ? `${query}.event` : 'event';
    const id = index + 1;

    return {
      id,
      eventType: `${eventPrefix}.${(id % 19) + 1}`,
      actor: actors[index % actors.length],
      status: statuses[index % statuses.length],
      createdAt: new Date(Date.now() - index * 45_000).toISOString(),
    };
  }
}
