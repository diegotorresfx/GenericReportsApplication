import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportsAdminService } from '../../services/reports-admin.service';
import { ReportDefinition, ReportCreateDto, ReportUpdateDto } from '@app/shared/models/report.model';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { NgIf, DatePipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-reports-admin',
  standalone: true,
  imports: [
    NgIf, DatePipe, NgClass, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatSnackBarModule, MatDialogModule, TranslateModule
  ],
  templateUrl: './reports-admin.component.html',
  styleUrls: ['./reports-admin.component.scss']
})
export class ReportsAdminComponent implements OnInit {
  displayedColumns = ['id','name','storedProcedure','enabled','createdAtUtc','actions'];
  dataSource = new MatTableDataSource<ReportDefinition>([]);
  loading = false;
  selected: ReportDefinition | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private svc: ReportsAdminService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      connectionString: ['', Validators.required],
      storedProcedure: ['', Validators.required],
      enabled: [true],
      // ❌ NO incluir createdAtUtc/updatedAtUtc en el form (para no enviarlos)
    });
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void { this.load(); }

  private load() {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: data => {
        this.dataSource = new MatTableDataSource<ReportDefinition>(data ?? []);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: _ => this.dataSource = new MatTableDataSource<ReportDefinition>([]),
      complete: () => this.loading = false
    });
  }

  edit(r: ReportDefinition) {
    this.selected = r;
    this.form.patchValue({
      id: r.id,
      name: r.name,
      connectionString: r.connectionString,
      storedProcedure: r.storedProcedure,
      enabled: r.enabled
    });
  }

  clear() {
    this.selected = null;
    this.form.reset({
      id: 0,
      name: '',
      connectionString: '',
      storedProcedure: '',
      enabled: true
    });
  }

  private buildCreateDto(): ReportCreateDto {
    const v = this.form.value;
    return {
      name: String(v.name ?? '').trim(),
      connectionString: String(v.connectionString ?? '').trim(),
      storedProcedure: String(v.storedProcedure ?? '').trim(),
      enabled: !!v.enabled
    };
  }

  save() {
    if (this.form.invalid) {
      this.snack.open('Completa los campos obligatorios', 'Cerrar', { duration: 2500 });
      return;
    }

    const id = Number(this.form.value.id ?? 0);
    const dto = this.buildCreateDto();

    if (id > 0) {
      // PUT /api/Reports/{id} con DTO sin fechas/ids
      this.svc.update(id, dto as ReportUpdateDto).subscribe({
        next: _ => { this.snack.open('Actualizado', 'OK', { duration: 2000 }); this.clear(); this.load(); },
        error: err => this.handleValidation(err)
      });
    } else {
      // POST /api/Reports con DTO sin fechas/ids
      this.svc.create(dto).subscribe({
        next: _ => { this.snack.open('Creado', 'OK', { duration: 2000 }); this.clear(); this.load(); },
        error: err => this.handleValidation(err)
      });
    }
  }

  remove(r: ReportDefinition) {
    if (!confirm(`¿Eliminar "${r.name}"?`)) return;
    this.svc.delete(r.id).subscribe({
      next: _ => { this.snack.open('Eliminado', 'OK', { duration: 2000 }); this.load(); },
      error: _ => this.snack.open('Error al eliminar', 'Cerrar', { duration: 2500 })
    });
  }

  private handleValidation(err: any) {
    // Muestra errores de validación del backend si vienen en el formato que pegaste
    const errors = err?.error?.errors;
    if (errors && typeof errors === 'object') {
      const msgs: string[] = [];
      for (const k of Object.keys(errors)) {
        const arr = errors[k];
        if (Array.isArray(arr)) arr.forEach((m: string) => msgs.push(`${k}: ${m}`));
      }
      this.snack.open(msgs.join(' | ') || 'Validación fallida', 'Cerrar', { duration: 4000 });
    } else {
      this.snack.open('Error al guardar', 'Cerrar', { duration: 2500 });
    }
  }
}
