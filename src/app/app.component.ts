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
      background: #F7F8FA;
      min-height: 100vh;
      font-family: 'Inter', sans-serif; /* Modern typography */
    }

    .toolbar {
      background: #FFFFFF;
      padding: 0.75rem 2rem; /* Thinner height */
      height: 64px; /* Fixed height for consistency */
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .title-link {
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.3s ease-out;
    }

    .title {
      font-size: 1.375rem; /* Slightly smaller for thinner look */
      font-weight: 600;
      color: #1A1A1A;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      letter-spacing: 0.2px;
      transition: all 0.3s ease-out;
    }

    .title-link:hover .title {
      color: #66BB6A;
      background: rgba(102, 187, 106, 0.05);
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(102, 187, 106, 0.15);
    }

    .nav-buttons {
      display: flex;
      gap: 0.5rem; /* Tighter spacing for modern compactness */
    }

    .nav-btn {
      background: #66BB6A;
      color: #FFFFFF;
      border-radius: 8px;
      padding: 0.5rem 1rem; /* Smaller padding for thinner buttons */
      font-weight: 500;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease-out;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .nav-btn:hover {
      background: #AED581;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 187, 106, 0.25);
    }

    .nav-btn:active {
      transform: translateY(1px);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .content {
      padding: 2rem;
      max-width: 1440px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .toolbar {
        padding: 0.5rem 1rem;
        height: 56px;
      }

      .title {
        font-size: 1.25rem;
        padding: 0.2rem 0.5rem;
      }

      .nav-btn {
        padding: 0.4rem 0.75rem;
        font-size: 0.85rem;
      }

      .nav-buttons {
        gap: 0.3rem;
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
        font-size: 1.125rem;
      }
    }
  `]
})
export class AppComponent {}