import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountByColumnChartComponent } from './count-by-column-chart.component';

describe('CountByColumnChartComponent', () => {
  let component: CountByColumnChartComponent;
  let fixture: ComponentFixture<CountByColumnChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountByColumnChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountByColumnChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
