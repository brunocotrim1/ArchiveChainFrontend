import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer.component';
import { PersonalPhotoComponent } from './components/personal-photo.component'; // Adjust path if needed
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    FooterComponent,
    PersonalPhotoComponent // Add the new component
  ],
  template: `
    <div class="app-container">
      <header class="toolbar">
        <a [routerLink]="['/landing']" class="title-link">
          <img src="/assets/images/logo.png" alt="ArchiveChain Explorer" class="title-image">
        </a>
        <nav class="nav-buttons">
          <a [routerLink]="['/landing']" class="nav-btn">Main Page</a>
          <a [routerLink]="['/blocks']" class="nav-btn">Blockchain State</a>
          <a [routerLink]="['/wallets']" class="nav-btn">Wallet Balances</a>
          <a [routerLink]="['/storedFiles']" class="nav-btn">Stored Files</a>
          <a [routerLink]="['/storageContracts']" class="nav-btn">Storage Contracts</a>
        </nav>
      </header>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
    <app-personal-photo></app-personal-photo> <!-- Add photo component here -->
    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: block;
      background: #F5F6F5;
      min-height: 100vh;
    }

    .toolbar {
      background: #FAFAFA;
      padding: 1rem 2rem;
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid #E5E7EB;
    }

    .title-link {
      text-decoration: none;
      display: flex;
      align-items: center;
    }

    .title-image {
      height: 36px;
      width: auto;
      transition: transform 0.2s ease;
    }

    .title-link:hover .title-image {
      transform: scale(1.05);
    }

    .nav-buttons {
      display: flex;
      gap: 1.25rem;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #4B5E54;
      color: #FFFFFF;
      text-decoration: none;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.9rem;
      font-family: 'Roboto', sans-serif;
      transition: background 0.2s ease, transform 0.1s ease;
    }

    .nav-btn:hover {
      background: #647D71;
      transform: translateY(-1px);
    }

    .nav-btn:active {
      background: #3A4A43;
      transform: translateY(0);
    }

    .content {
      padding: 1.5rem;
      max-width: 90%;
      margin: 2rem auto;
      background: #FFFFFF;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    @media (max-width: 768px) {
      .toolbar {
        padding: 0.75rem 1.5rem;
        height: 56px;
      }

      .title-image {
        height: 32px;
      }

      .nav-btn {
        padding: 0.45rem 1rem;
        font-size: 0.85rem;
      }

      .nav-buttons {
        gap: 1rem;
      }

      .content {
        padding: 1rem;
        margin: 1.5rem auto;
      }
    }

    @media (max-width: 480px) {
      .toolbar {
        flex-direction: column;
        padding: 0.75rem 1rem;
        height: auto;
        align-items: flex-start;
      }

      .nav-buttons {
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 0.75rem;
      }

      .title-image {
        height: 28px;
      }

      .content {
        padding: 0.75rem;
        margin: 1rem auto;
      }
    }

    .app-container {
      /* No min-height needed */
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Subscribe to Router events to listen for navigation end
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd) // Only listen for NavigationEnd events
    ).subscribe(() => {
      // Scroll to the top of the page after navigation
      window.scrollTo(0, 0);
    });
  }
}