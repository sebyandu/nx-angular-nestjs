import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryCardsGrid } from './summary-cards-grid';

describe('SummaryCardsGrid', () => {
  let component: SummaryCardsGrid;
  let fixture: ComponentFixture<SummaryCardsGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryCardsGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryCardsGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
