// src/app/core/components/language-switcher/language-switcher.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';

// i18n
import { TranslateModule } from '@ngx-translate/core';

// Servicio de idioma
import { LanguageService, LanguageOption } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent implements OnInit {

  // Lo que te marcaba error:
  languages: LanguageOption[] = [];
  current = '';

  constructor(private langSvc: LanguageService) { }

  ngOnInit(): void {
    this.languages = this.langSvc.getSupported();
    this.current = this.langSvc.getCurrent();
  }

  onChange(code: string) {
    this.langSvc.setLanguage(code);
    this.current = code;
  }
}
