import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MockBlockchainService } from '../services/blockchain.service';
import { WalletBalance } from '../models/interface';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule
  ],
  selector: 'app-wallet-balances',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Wallet Balances</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="mockBalances.length > 0; else noWalletsFound">
          <mat-table [dataSource]="mockBalances">
            <ng-container matColumnDef="walletAddress">
              <mat-header-cell *matHeaderCellDef>Wallet Address</mat-header-cell>
              <mat-cell *matCellDef="let wallet">{{ wallet.walletAddress }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="balance">
              <mat-header-cell *matHeaderCellDef>Balance</mat-header-cell>
              <mat-cell *matCellDef="let wallet">{{ wallet.balance }}</mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="walletColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: walletColumns;"></mat-row>
          </mat-table>
        </div>
        <ng-template #noWalletsFound>
          <p>No wallet balances found.</p>
        </ng-template>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin-bottom: 1rem;
    }
    mat-table {
      width: 100%;
    }
  `]
})
export class WalletBalancesComponent implements OnInit {
  mockBalances: WalletBalance[] = [];
  walletColumns = ['walletAddress', 'balance'];
  private blockchainService = inject(MockBlockchainService);

  async ngOnInit() {
    this.mockBalances = await this.blockchainService.getWalletBalances() ?? [];
  }
}