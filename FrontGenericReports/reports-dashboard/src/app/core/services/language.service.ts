// src/app/core/services/language.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const KEY = 'repdash.lang';
const FALLBACK = 'es';
const SUPPORTED = ['es','en','pt'];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  constructor(private i18n: TranslateService) {
    const saved = localStorage.getItem(KEY);
    const browser = this.i18n.getBrowserLang();

    const lang = saved && SUPPORTED.includes(saved)
      ? saved
      : (browser && SUPPORTED.includes(browser) ? browser : FALLBACK);

    this.setLang(lang);
  }

  get current(): string {
    return this.i18n.currentLang || FALLBACK;
  }

  setLang(lang: string) {
    if (!SUPPORTED.includes(lang)) lang = FALLBACK;
    this.i18n.use(lang);
    localStorage.setItem(KEY, lang);
  }

  getSupported() {
    return SUPPORTED.slice();
  }
}
