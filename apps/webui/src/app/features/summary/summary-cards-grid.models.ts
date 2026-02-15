export type SummaryStatus = 'Healthy' | 'Warning' | 'Critical';

export interface SummaryRow {
  id: number;
  service: string;
  status: SummaryStatus;
  owner: string;
  updatedAt: Date;
}

export interface SummaryWindowRequest {
  skip: number;
  take: number;
  query: string;
}

export interface SummaryWindowResponse {
  total: number;
  rows: SummaryRow[];
}
