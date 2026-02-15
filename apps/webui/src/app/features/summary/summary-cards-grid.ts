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
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BehaviorSubject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { SummaryDataService } from './summary-data.service';
import { SummaryRow } from './summary-cards-grid.models';

@Component({
  standalone: true,
  selector: 'app-summary-cards-grid',
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './summary-cards-grid.html',
  styleUrl: './summary-cards-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCardsGrid implements AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  private readonly dataService = inject(SummaryDataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pageSize = 120;
  private readonly prefetchPageRadius = 1;

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly rows$ = new BehaviorSubject<(SummaryRow | undefined)[]>([]);
  readonly total$ = new BehaviorSubject<number>(0);

  private activeQuery = '';
  private rows: (SummaryRow | undefined)[] = [];
  private loadedPages = new Set<number>();
  private inflightPages = new Set<number>();
  private activeRequests = 0;

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
      .subscribe((range) => this.loadPagesForRange(range));
  }

  onScrollIndex(index: number): void {
    this.loadPagesForRange({
      start: index,
      end: index + this.pageSize,
    });
  }

  reload(): void {
    this.resetAndLoad(this.searchControl.value);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private resetAndLoad(query: string): void {
    this.activeQuery = query.trim().toLowerCase();
    this.loadedPages.clear();
    this.inflightPages.clear();
    this.rows = [];
    this.rows$.next(this.rows);
    this.total$.next(0);

    this.loadPage(0);
    this.loadPage(1);
    this.loadPage(2);
  }

  private loadPagesForRange(range: { start: number; end: number }): void {
    const total = this.total$.value || Number.MAX_SAFE_INTEGER;
    const maxPage = Math.floor(Math.max(total - 1, 0) / this.pageSize);
    const startPage = Math.max(
      0,
      Math.floor(range.start / this.pageSize) - this.prefetchPageRadius
    );
    const endPage = Math.min(
      maxPage,
      Math.floor(Math.max(range.end - 1, range.start) / this.pageSize) +
        this.prefetchPageRadius
    );

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

        let nextRows = this.rows;
        if (nextRows.length !== response.total) {
          nextRows = new Array(response.total);
          this.total$.next(response.total);
        } else {
          // Use immutable updates to ensure virtual scroll views refresh reliably.
          nextRows = [...nextRows];
        }

        for (let i = 0; i < response.rows.length; i += 1) {
          nextRows[offset + i] = response.rows[i];
        }

        this.loadedPages.add(page);
        this.rows = nextRows;
        this.rows$.next(nextRows);
      });
  }

  private updateLoading(delta: number): void {
    this.activeRequests += delta;
    this.loading$.next(this.activeRequests > 0);
  }
}
