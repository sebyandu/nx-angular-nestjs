export type HistoryStatus = 'Success' | 'Pending' | 'Failed';

export interface HistoryRow {
  id: number;
  eventType: string;
  actor: string;
  status: HistoryStatus;
  createdAt: Date;
  isPlaceholder?: boolean;
}

export interface HistoryWindowRequest {
  skip: number;
  take: number;
  query: string;
}

export interface HistoryWindowResponse {
  total: number;
  rows: HistoryRow[];
}
