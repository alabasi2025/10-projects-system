import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">نظام التخطيط والمشاريع</h1>
          <nav class="app-nav">
            <a routerLink="/projects" routerLinkActive="active">المشاريع</a>
          </nav>
        </div>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      <footer class="app-footer">
        <p>© 2025 نظام التخطيط والمشاريع - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      direction: rtl;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      color: white;
      padding: 0 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }

    .app-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }

    .app-nav {
      display: flex;
      gap: 24px;

      a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover,
        &.active {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    .app-main {
      flex: 1;
      background: #f3f4f6;
    }

    .app-footer {
      background: #1f2937;
      color: #9ca3af;
      text-align: center;
      padding: 16px;
      font-size: 14px;

      p {
        margin: 0;
      }
    }
  `],
})
export class App {
  protected title = 'نظام التخطيط والمشاريع';
}
