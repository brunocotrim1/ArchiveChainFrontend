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
    <mat-toolbar color="primary">
      <span>ArchiveMint Explorer</span>
    </mat-toolbar>

    <div style="padding: 1rem;">
      <nav style="margin-bottom: 1rem;">
        <button mat-raised-button color="accent" [routerLink]="['/blocks']">Blocks</button>
        <button mat-raised-button color="accent" [routerLink]="['/wallets']">Wallet Balances</button>
        <button mat-raised-button color="accent" [routerLink]="['/storedFiles']">Stored Files</button>
        <button mat-raised-button color="accent" [routerLink]="['/storageContracts']">Storage Contracts</button>
        <button mat-raised-button color="accent" [routerLink]="['/sendTransaction']">Send Transaction</button>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    mat-toolbar {
      margin-bottom: 1rem;
    }
    button {
      margin-right: 0.5rem;
    }
  `]
})
export class AppComponent {}