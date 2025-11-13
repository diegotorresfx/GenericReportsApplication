// src/app/core/components/language-switcher/language-switcher.component.ts
import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [NgFor, MatSelectModule, MatIconModule],
  template: `
    <div class="lang-box">
      <mat-icon class="me-1">language</mat-icon>
      <mat-select [value]="langSvc.current" (selectionChange)="onChange($any($event.value))">
        <mat-option *ngFor="let l of langs" [value]="l">
          {{ l.toUpperCase() }}
        </mat-option>
      </mat-select>
    </div>
  `,
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent {
  // Getter: evita usar langSvc antes de inyectarse
  get langs(): string[] { return this.langSvc.getSupported(); }

  constructor(public langSvc: LanguageService) {}

  onChange(l: string) { this.langSvc.setLang(l); }
}
