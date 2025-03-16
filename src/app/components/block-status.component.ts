// block-status.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  selector: 'app-block-status',
  template: `
    <mat-card class="status-bar">
      <div class="status-item">
        <mat-icon>height</mat-icon>
        <span>Latest Block: <strong>{{ latestBlockHeight || 'N/A' }}</strong></span>
      </div>
      <div class="status-item">
        <mat-icon>storage</mat-icon>
        <span>Archived Storage: <strong>{{ formatStorage(archivedStorage) }}</strong></span>
      </div>
      <div class="status-item">
        <mat-icon>assignment</mat-icon>
        <span>Total Contracts: <strong>{{ totalContracts }}</strong></span>
      </div>
      <div class="status-item">
        <mat-icon>monetization_on</mat-icon>
        <span>Total Coins: <strong>{{ totalCoins }}</strong></span>
      </div>
    </mat-card>
  `,
  styles: [`
    .status-bar {
      background: #FFFFFF;
      border-radius: 6px;
      padding: 0.75rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
      border: 1px solid #E0E0E0;
      width: 100%;
      box-sizing: border-box;
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #424242;
      font-size: 0.85rem;
      flex: 1 1 100%;
      min-width: 0;
    }
    .status-item mat-icon {
      color: #66BB6A;
      font-size: 1.1rem;
      height: 1.1rem;
      width: 1.1rem;
      flex-shrink: 0;
    }
    .status-item span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .status-item strong {
      color: #333333;
      font-weight: 600;
    }
    @media (min-width: 768px) {
      .status-bar { padding: 1rem; flex-wrap: nowrap; gap: 1rem; }
      .status-item { font-size: 0.9rem; flex: 1 1 25%; }
      .status-item mat-icon { font-size: 1.25rem; height: 1.25rem; width: 1.25rem; }
    }
    @media (max-width: 767px) {
      .status-bar { justify-content: space-around; }
    }
    @media (max-width: 480px) {
      .status-item { font-size: 0.8rem; }
      .status-item mat-icon { font-size: 1rem; height: 1rem; width: 1rem; }
    }
  `]
})
export class BlockStatusComponent {
  @Input() latestBlockHeight: number | undefined;
  @Input() archivedStorage: number = 0;
  @Input() totalContracts: string = '0';
  @Input() totalCoins: string = '0';

  formatStorage(bytes: number): string {
    if (bytes <= 0) return '0 MB';
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1000 && unitIndex < units.length - 1) {
      value /= 1000;
      unitIndex++;
    }
    return unitIndex === 0 ? `${Math.round(value)} ${units[unitIndex]}` : `${value.toFixed(2)} ${units[unitIndex]}`;
  }
}