export type SummaryStatus = 'Healthy' | 'Warning' | 'Critical';

export interface SummaryRowDto {
  id: number;
  service: string;
  status: SummaryStatus;
  owner: string;
  updatedAt: string;
}

export interface SummaryWindowResponseDto {
  total: number;
  rows: SummaryRowDto[];
}
