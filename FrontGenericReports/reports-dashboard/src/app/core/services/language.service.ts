// src/app/core/services/language.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface LanguageOption {
  code: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'app_lang';

  private readonly _supported: LanguageOption[] = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'fr', label: 'Français' }
    // puedes añadir más de los que ya generamos JSON
  ];

  private current = 'es';

  constructor(private translate: TranslateService) {
    const codes = this._supported.map(l => l.code);
    this.translate.addLangs(codes);

    const saved = localStorage.getItem(this.STORAGE_KEY);
    const browser = (this.translate.getBrowserLang() || 'es').split('-')[0];

    const initial =
      (saved && codes.includes(saved)) ? saved :
      (codes.includes(browser) ? browser : 'es');

    this.current = initial;

    // configuramos idioma y fallback
    this.translate.setDefaultLang('es'); // fallbackLang efectivo
    this.translate.use(initial);
  }

  getSupported(): LanguageOption[] {
    return this._supported;
  }

  getCurrent(): string {
    return this.current;
  }

  setLanguage(code: string) {
    if (!this._supported.find(l => l.code === code)) return;
    this.current = code;
    this.translate.use(code);
    localStorage.setItem(this.STORAGE_KEY, code);
  }
}
