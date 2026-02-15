import { Controller, Get, Query } from '@nestjs/common';
import { SummaryService } from './summary.service';
import type { SummaryWindowResponseDto } from './summary.types';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  getSummaryWindow(
    @Query('skip') skipRaw?: string,
    @Query('take') takeRaw?: string,
    @Query('query') queryRaw?: string
  ): SummaryWindowResponseDto {
    const skip = Number.isFinite(Number(skipRaw)) ? Number(skipRaw) : 0;
    const take = Number.isFinite(Number(takeRaw)) ? Number(takeRaw) : 120;
    const query = queryRaw ?? '';

    return this.summaryService.getWindow(skip, take, query);
  }
}
