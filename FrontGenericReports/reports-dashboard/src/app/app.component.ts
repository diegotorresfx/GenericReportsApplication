import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { LanguageSwitcherComponent } from './core/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, LanguageSwitcherComponent],
  template: `
    <mat-toolbar color="primary" class="px-3">
      <span>Generic Reports</span>
      <span class="spacer"></span>
      <app-language-switcher></app-language-switcher>
    </mat-toolbar>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
  `]
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService) {}
  async ngOnInit() { await this.auth.ensureLogin(); }
}
