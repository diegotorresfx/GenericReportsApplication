import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-count-by-column-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './count-by-column-chart.component.html',
  styleUrls: ['./count-by-column-chart.component.scss']
})
export class CountByColumnChartComponent implements OnChanges, AfterViewInit, OnDestroy {

  @Input() rows: any[] = [];
  @Input() columnToCount: string | null = null;

  // 👇 IMPORTANTE: sin { static: true } para que funcione con *ngIf
  @ViewChild('canvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private viewInitialized = false;

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.renderChart();
  }

  ngOnChanges(): void {
    // Esperar a que la vista (y el canvas) exista
    if (this.viewInitialized) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  private renderChart() {
    // Validaciones básicas
    if (!this.canvasRef?.nativeElement || !this.columnToCount || !this.rows?.length) {
      this.destroyChart();
      return;
    }

    // Agrupar por la columna seleccionada
    const counts = new Map<string, number>();

    for (const row of this.rows) {
      const raw = row?.[this.columnToCount];
      const key =
        raw === null || raw === undefined || raw === ''
          ? '(N/A)'
          : String(raw);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const labels = Array.from(counts.keys());
    const data = Array.from(counts.values());

    if (!labels.length) {
      this.destroyChart();
      return;
    }

    this.destroyChart();

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: `Conteo por ${this.columnToCount}`,
            data,
            backgroundColor: 'rgba(25, 118, 210, 0.7)',
            borderColor: 'rgba(25, 118, 210, 1)',
            borderWidth: 1,
            borderRadius: 8,
            hoverBackgroundColor: 'rgba(30, 136, 229, 0.9)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          },
          title: {
            display: true,
            text: `Distribución por ${this.columnToCount}`
          },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.formattedValue}`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
}
