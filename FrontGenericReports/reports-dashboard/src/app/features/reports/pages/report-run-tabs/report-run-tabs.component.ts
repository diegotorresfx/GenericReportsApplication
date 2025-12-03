import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder, Validators, ReactiveFormsModule, FormsModule,
  FormGroup, FormArray
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor, JsonPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ReportsListService } from '../../services/reports-list.service';
import { ReportDefinition } from '@app/shared/models/report.model';
import { ReportRunTableComponent } from '../report-run-table/report-run-table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CountByColumnChartComponent } from '../../charts/count-by-column-chart/count-by-column-chart.component';

type ParamType = 'string' | 'int' | 'decimal' | 'date';

@Component({
  selector: 'app-report-run-tabs',
  standalone: true,
  imports: [
    NgIf, NgFor, FormsModule, ReactiveFormsModule, JsonPipe,
    MatCardModule, MatTabsModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatSnackBarModule, MatSelectModule,
    ReportRunTableComponent, TranslateModule, CountByColumnChartComponent
  ],
  templateUrl: './report-run-tabs.component.html',
  styleUrls: ['./report-run-tabs.component.scss']
})
export class ReportRunTabsComponent implements OnInit {
  report: ReportDefinition | null = null;

  // Form para parámetros dinámicos
  paramsForm!: FormGroup;

  @ViewChild(ReportRunTableComponent) table!: ReportRunTableComponent;

  // Columna seleccionada para el gráfico
  selectedColumn: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private svc: ReportsListService,
    private snack: MatSnackBar
  ) {
    this.paramsForm = this.fb.group({
      timeoutSeconds: [600, [Validators.required, Validators.min(1)]],
      params: this.fb.array([]) // FormArray de parámetros dinámicos
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));
    if (!id) {
      this.snack.open('No se recibió el id del reporte', 'Cerrar', { duration: 3000 });
      return;
    }
    this.svc.getById(id).subscribe({
      next: rep => this.report = rep,
      error: _ => this.snack.open('No fue posible cargar el reporte', 'Cerrar', { duration: 2500 })
    });
  }

  // --- Helpers del FormArray ---

  get paramsFA(): FormArray {
    return this.paramsForm.get('params') as FormArray;
  }

  newParamRow(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      type: ['string' as ParamType, Validators.required],
      // El control value lo manejamos según tipo (string/number/date)
      value: ['']
    });
  }

  addParam() {
    this.paramsFA.push(this.newParamRow());
  }

  removeParam(i: number) {
    this.paramsFA.removeAt(i);
  }

  // --- Construye el objeto de parámetros con el tipo correcto ---
  buildParamsObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const group of this.paramsFA.controls as FormGroup[]) {
      const name = String(group.get('name')!.value || '').trim();
      const type = group.get('type')!.value as ParamType;
      const raw  = group.get('value')!.value;

      if (!name) continue; // ignora sin nombre

      if (raw === null || raw === undefined || raw === '') {
        // si no hay valor, no lo incluimos
        continue;
      }

      switch (type) {
        case 'int': {
          const n = parseInt(String(raw).replace(/\s+/g, ''), 10);
          if (!Number.isNaN(n)) obj[name] = n;
          break;
        }
        case 'decimal': {
          // Permite coma o punto como separador
          const s = String(raw).replace(',', '.');
          const f = parseFloat(s);
          if (!Number.isNaN(f)) obj[name] = f;
          break;
        }
        case 'date': {
          // normalizamos a yyyy-MM-dd
          const d = new Date(raw);
          if (!isNaN(d.getTime())) {
            const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            obj[name] = iso;
          }
          break;
        }
        default: // 'string'
          obj[name] = String(raw);
          break;
      }
    }
    return obj;
  }

  get paramsJson(): string {
    const obj = this.buildParamsObject();
    return JSON.stringify(obj, null, 2);
  }

  generateParamsJson() {
    if (!this.report) {
      this.snack.open('No hay reporte cargado', 'Cerrar', { duration: 2500 });
      return;
    }

    const paramsObj = this.buildParamsObject(); // { ... } o {}
    // Actualiza el JSON del hijo (solo lectura) y su timeout
    this.table.paramsJson = JSON.stringify(paramsObj, null, 2);
    this.table.timeoutSeconds = Number(this.paramsForm.get('timeoutSeconds')?.value ?? 600) || 600;

    this.snack.open('Parámetros generados. Revisa el JSON y luego ejecuta el reporte.', 'OK', { duration: 2500 });
  }
}
