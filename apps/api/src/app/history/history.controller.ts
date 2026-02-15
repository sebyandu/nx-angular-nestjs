import { Controller, Get, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import type { HistoryWindowResponseDto } from './history.types';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getHistoryWindow(
    @Query('skip') skipRaw?: string,
    @Query('take') takeRaw?: string,
    @Query('query') queryRaw?: string
  ): HistoryWindowResponseDto {
    const skip = Number.isFinite(Number(skipRaw)) ? Number(skipRaw) : 0;
    const take = Number.isFinite(Number(takeRaw)) ? Number(takeRaw) : 200;
    const query = queryRaw ?? '';

    return this.historyService.getWindow(skip, take, query);
  }
}
