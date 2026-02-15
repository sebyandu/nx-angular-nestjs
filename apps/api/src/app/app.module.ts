import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HistoryController } from './history/history.controller';
import { HistoryService } from './history/history.service';
import { SummaryController } from './summary/summary.controller';
import { SummaryService } from './summary/summary.service';

@Module({
  imports: [],
  controllers: [AppController, HistoryController, SummaryController],
  providers: [AppService, HistoryService, SummaryService],
})
export class AppModule {}
