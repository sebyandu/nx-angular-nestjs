import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { BehaviorSubject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { HistoryDataService } from './history-data.service';
import { HistoryRow } from './history-table.models';

@Component({
  standalone: true,
  selector: 'app-history-table',
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    ScrollingModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './history-table.html',
  styleUrl: './history-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryTable implements AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  private readonly dataService = inject(HistoryDataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly rowHeight = 64;
  private readonly pageSize = 200;
  private readonly viewportWindowSize = 80;
  private readonly preloadPadding = 240;

  readonly displayedColumns = ['id', 'eventType', 'actor', 'createdAt', 'status'];
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly total$ = new BehaviorSubject<number>(0);
  readonly visibleRows$ = new BehaviorSubject<HistoryRow[]>([]);
  readonly visibleOffsetPx$ = new BehaviorSubject<number>(0);

  private activeQuery = '';
  private activeRequests = 0;
  private loadedPages = new Set<number>();
  private inflightPages = new Set<number>();
  private cache = new Map<number, HistoryRow>();
  private visibleStart = 0;
  private visibleEnd = 0;

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => this.resetAndLoad(value));

    this.resetAndLoad(this.searchControl.value);
  }

  ngAfterViewInit(): void {
    this.viewport?.renderedRangeStream
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((range) => this.setWindow(range.start));
  }

  onScrollIndex(index: number): void {
    this.setWindow(index);
  }

  reload(): void {
    this.resetAndLoad(this.searchControl.value);
  }

  private resetAndLoad(query: string): void {
    this.activeQuery = query.trim().toLowerCase();
    this.activeRequests = 0;
    this.loadedPages.clear();
    this.inflightPages.clear();
    this.cache.clear();
    this.total$.next(0);
    this.visibleRows$.next([]);
    this.visibleOffsetPx$.next(0);
    this.loading$.next(false);

    this.loadPage(0);
    this.loadPage(1);
  }

  private setWindow(index: number): void {
    const total = this.total$.value || Number.MAX_SAFE_INTEGER;
    const windowStart = Math.max(0, index - 20);
    const windowEnd = Math.min(total, windowStart + this.viewportWindowSize);
    this.visibleStart = windowStart;
    this.visibleEnd = windowEnd;
    this.visibleOffsetPx$.next(windowStart * this.rowHeight);

    this.renderVisibleRows();
    this.requestRange(windowStart, windowEnd);
  }

  private requestRange(start: number, end: number): void {
    const total = this.total$.value || Number.MAX_SAFE_INTEGER;
    const prefetchStart = Math.max(0, start - this.preloadPadding);
    const prefetchEnd = Math.min(total, end + this.preloadPadding);

    const startPage = Math.floor(prefetchStart / this.pageSize);
    const endPage = Math.floor(Math.max(prefetchEnd - 1, prefetchStart) / this.pageSize);
    for (let page = startPage; page <= endPage; page += 1) {
      this.loadPage(page);
    }
  }

  private loadPage(page: number): void {
    if (this.loadedPages.has(page) || this.inflightPages.has(page)) {
      return;
    }

    this.inflightPages.add(page);
    this.updateLoading(1);
    const queryAtRequest = this.activeQuery;
    const offset = page * this.pageSize;

    this.dataService
      .fetchWindow({
        offset,
        limit: this.pageSize,
        query: queryAtRequest,
      })
      .pipe(
        finalize(() => {
          this.inflightPages.delete(page);
          this.updateLoading(-1);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (queryAtRequest !== this.activeQuery) {
          return;
        }

        this.total$.next(response.total);
        for (let i = 0; i < response.rows.length; i += 1) {
          this.cache.set(offset + i, response.rows[i]);
        }

        this.loadedPages.add(page);
        this.renderVisibleRows();
      });
  }

  private renderVisibleRows(): void {
    const rows: HistoryRow[] = [];
    for (let index = this.visibleStart; index < this.visibleEnd; index += 1) {
      const row = this.cache.get(index);
      if (row) {
        rows.push(row);
      } else {
        rows.push({
          id: index + 1,
          eventType: 'Loading...',
          actor: '-',
          status: 'Pending',
          createdAt: new Date(0),
          isPlaceholder: true,
        });
      }
    }

    this.visibleRows$.next(rows);
  }

  private updateLoading(delta: number): void {
    this.activeRequests += delta;
    this.loading$.next(this.activeRequests > 0);
  }
}
