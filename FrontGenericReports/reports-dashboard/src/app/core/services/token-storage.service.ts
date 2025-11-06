import { Injectable } from '@angular/core';

const KEY = 'repdash.token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  get(): string | null { return localStorage.getItem(KEY); }
  set(token: string)   { localStorage.setItem(KEY, token); }
  clear()              { localStorage.removeItem(KEY); }
}
