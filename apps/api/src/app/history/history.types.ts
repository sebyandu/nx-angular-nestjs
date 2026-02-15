export type HistoryStatus = 'Success' | 'Pending' | 'Failed';

export interface HistoryRowDto {
  id: number;
  eventType: string;
  actor: string;
  status: HistoryStatus;
  createdAt: string;
}

export interface HistoryWindowResponseDto {
  total: number;
  rows: HistoryRowDto[];
}
