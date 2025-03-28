import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="logo">MedDialogue</div>
        <nav class="main-nav">
          <a routerLink="/dashboard" routerLinkActive="active">Patienten</a>
          <a routerLink="/statistics" routerLinkActive="active" class="nav-link">Statistik</a>
          <a routerLink="/help" routerLinkActive="active" class="nav-link">Hilfe</a>
        </nav>
      </header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="app-footer">
        <p>© 2025 MedDialogue - Medizinische Gesprächssimulation</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: 'Arial', sans-serif;
    }
    
    .app-header {
      background-color: #2c3e50;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .main-nav {
      display: flex;
      gap: 1.5rem;
    }
    
    .main-nav a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 0;
      position: relative;
    }
    
    .main-nav a:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: #3498db;
      transition: width 0.3s;
    }
    
    .main-nav a:hover:after, .main-nav a.active:after {
      width: 100%;
    }
    
    .main-content {
      flex: 1;
      padding: 2rem;
      background-color: #f5f7fa;
    }
    
    .app-footer {
      background-color: #2c3e50;
      color: #ecf0f1;
      text-align: center;
      padding: 1rem;
      font-size: 0.9rem;
    }
  `]
})
export class AppComponent {
  title = 'med-dialogue';
}