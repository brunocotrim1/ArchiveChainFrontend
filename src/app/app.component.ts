import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    RouterOutlet,
    RouterLink
  ],
  template: `
    <mat-toolbar class="toolbar">
      <a [routerLink]="['/blocks']" class="title-link">
        <span class="title">ArchiveMint Explorer</span>
      </a>
      <div class="nav-buttons">
        <button mat-flat-button class="nav-btn" [routerLink]="['/blocks']">Main Menu</button>
        <button mat-flat-button class="nav-btn" [routerLink]="['/wallets']">Wallet Balances</button>
        <button mat-flat-button class="nav-btn" [routerLink]="['/storedFiles']">Stored Files</button>
        <button mat-flat-button class="nav-btn" [routerLink]="['/storageContracts']">Storage Contracts</button>
        <button mat-flat-button class="nav-btn" [routerLink]="['/sendTransaction']">Send Transaction</button>
      </div>
    </mat-toolbar>

    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: #F7FAFC; /* Softer gray background, consistent with BlockDetailsComponent */
      min-height: 100vh;
      /* font-family removed, handled globally with Inter */
    }

    .toolbar {
      background: #FAFAFA !important; /* Forcefully set light gray to override blue */
      padding: 1rem;
      height: 64px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid #E2E8F0; /* Softer gray border */
    }

    .title-link {
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.3s ease;
    }

    .title {
      font-size: clamp(1.25rem, 4vw, 1.75rem);
      font-weight: 500;
      color: #4A4A4A; /* Dark gray for text */
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .title-link:hover .title {
      color: #2F855A; /* Darker green for hover */
      background: rgba(47, 133, 90, 0.1); /* Subtle darker green hover background */
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(47, 133, 90, 0.15);
    }

    .nav-buttons {
      display: flex;
      gap: 1rem;
    }

    .nav-btn {
      background: #2F855A; /* Darker green for buttons */
      color: #FFFFFF;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-weight: 500;
      font-size: clamp(0.85rem, 2.5vw, 0.95rem);
      text-transform: none;
      transition: all 0.3s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .nav-btn:hover {
      background: #38A169; /* Lighter darker green for hover */
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(47, 133, 90, 0.2);
    }

    .nav-btn:active {
      transform: translateY(1px);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .content {
      padding: 1rem;
      max-width: 1400px;
      margin: 1.5rem auto;
      background: #FFFFFF;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    @media (max-width: 768px) {
      .toolbar {
        padding: 0.75rem;
        height: 56px;
      }

      .title {
        font-size: clamp(1rem, 3.5vw, 1.25rem);
        padding: 0.25rem 0.75rem;
      }

      .nav-btn {
        padding: 0.375rem 0.75rem;
        font-size: clamp(0.75rem, 2vw, 0.85rem);
      }

      .nav-buttons {
        gap: 0.75rem;
      }

      .content {
        padding: 0.75rem;
        margin: 1rem auto;
      }
    }

    @media (max-width: 480px) {
      .toolbar {
        flex-wrap: wrap;
        padding: 0.5rem;
        height: auto;
        min-height: 56px;
      }

      .nav-buttons {
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .title {
        font-size: clamp(0.9rem, 3vw, 1.125rem);
      }

      .content {
        padding: 0.5rem;
        margin: 0.5rem auto;
      }
    }
  `]
})
export class AppComponent {}