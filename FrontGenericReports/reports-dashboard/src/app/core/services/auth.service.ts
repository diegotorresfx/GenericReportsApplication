import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { TokenStorageService } from './token-storage.service';

const SKEW_SECONDS = 60; // margen para renovar antes de que caduque

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private store: TokenStorageService) {}

  /** Devuelve el token almacenado (sin 'Bearer ') */
  getToken(): string | null {
    return this.store.get();
  }

  /** Hace login y guarda el token (sin 'Bearer ') */
  private async login(): Promise<string> {
    const body = { username: environment.apiAuth.username, password: environment.apiAuth.password };
    const resp = await firstValueFrom(
      this.http.post<any>(`${this.base}/Auth/login`, body, { observe: 'response' })
    );

    let token: string | null =
      resp.body?.token ??
      resp.body?.accessToken ??
      resp.body?.jwt ??
      resp.body?.value ??
      null;

    if (!token) {
      const authHeader = resp.headers?.get('Authorization') ?? resp.headers?.get('authorization');
      if (authHeader) token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    }

    if (!token || typeof token !== 'string' || token.length < 10) {
      console.error('Login sin token utilizable. Body:', resp.body, 'Headers:', resp.headers);
      throw new Error('No token from login response');
    }

    // guardar sin 'Bearer '
    token = token.startsWith('Bearer ') ? token.substring(7) : token;
    this.store.set(token);
    return token;
  }

  /** true si no hay token o ya expiró (o expira en <= SKEW_SECONDS) */
  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      const expSec = Number(payload?.exp);
      if (!expSec) return true;
      const nowSec = Math.floor(Date.now() / 1000);
      return expSec <= (nowSec + SKEW_SECONDS);
    } catch {
      return true;
    }
  }

  /**
   * Garantiza un token válido.
   * - Si falta o está por expirar, hace login.
   * - Si `force` es true, fuerza login aunque exista token.
   */
  async ensureLogin(force = false): Promise<void> {
    const current = this.getToken();
    if (!force && !this.isTokenExpired(current)) return;
    await this.login();
  }

  /** Alias conveniente: forzar re-login */
  async relogin(): Promise<void> {
    await this.ensureLogin(true);
  }

  logout() { this.store.clear(); }
}
