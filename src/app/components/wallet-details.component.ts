import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';
import { WalletDetails, Transaction, StorageContract } from '../models/interface';
import { TransactionDetailsComponent } from './transaction-details.component';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatTableModule,
    MatDialogModule,
    RouterLink
  ],
  providers: [DatePipe],
  selector: 'app-wallet-details',
  template: `
    <mat-card class="wallet-details-card">
      <mat-card-header class="header">
        <mat-card-title>Detalhes da carteira - Informações dos últimos 1000 blocos</mat-card-title>
        <mat-card-subtitle>Endereço: {{ walletDetails?.address || 'Loading...' }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="content">
        <ng-container *ngIf="walletDetails; else loadingTemplate">
          <div class="details-container">
            <!-- Wallet Overview -->
            <div class="detail-group">
              <div class="detail-item">
                <span class="label">Address</span>
                <span class="value scrollable">{{ walletDetails.address }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Chave pública</span>
                <span class="value scrollable">{{ walletDetails.publicKey }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Saldo</span>
                <span class="value">{{ walletDetails.balance }} Coins</span>
              </div>
              <div class="detail-item">
                <span class="label">Armazenamento Utilizado</span>
                <span class="value">{{ formatStorage(totalStorage) }}</span>
              </div>
            </div>

            <!-- Storage Contracts -->
            <mat-divider class="divider"></mat-divider>
            <h3 class="section-title">Contratos de armazenamento ({{ walletDetails.storageContracts.length }}) </h3>
            <div class="contracts-container" *ngIf="walletDetails.storageContracts.length > 0; else noContracts">
              <mat-table [dataSource]="walletDetails.storageContracts">
                <ng-container matColumnDef="fileUrl">
                  <mat-header-cell *matHeaderCellDef>Ficheiro</mat-header-cell>
                  <mat-cell *matCellDef="let contract" class="clickable" (click)="navigateToFileViewer(contract.fileUrl)">
                    {{ extractFilename(contract.fileUrl) }}
                  </mat-cell>
                </ng-container>
                <ng-container matColumnDef="storerAddress">
                  <mat-header-cell *matHeaderCellDef>Participante</mat-header-cell>
                  <mat-cell *matCellDef="let contract">{{ contract.storerAddress }}</mat-cell>
                </ng-container>
                <ng-container matColumnDef="value">
                  <mat-header-cell *matHeaderCellDef>Valor</mat-header-cell>
                  <mat-cell *matCellDef="let contract">{{ contract.value }} Coins</mat-cell>
                </ng-container>
                <ng-container matColumnDef="timestamp">
                  <mat-header-cell *matHeaderCellDef>Data de arquivo</mat-header-cell>
                  <mat-cell *matCellDef="let contract">{{ contract.timestamp | date:'MMM d, yyyy, h:mm:ss a' }}</mat-cell>
                </ng-container>
                <mat-header-row *matHeaderRowDef="contractColumns"></mat-header-row>
                <mat-row *matRowDef="let row; columns: contractColumns;" (click)="navigateToContract(row)"></mat-row>
              </mat-table>
            </div>
            <ng-template #noContracts>
              <div class="no-data">
                <mat-icon>info</mat-icon>
                <p>No storage contracts found for this wallet.</p>
              </div>
            </ng-template>

            <!-- Won Blocks -->
            <mat-divider class="divider"></mat-divider>
            <h3 class="section-title">Blocos vencidos ({{ walletDetails.wonBlocks.length }})</h3>
            <div class="won-blocks-container">
              <div *ngIf="walletDetails.wonBlocks.length > 0; else noBlocks" class="blocks-grid">
                <div *ngFor="let block of walletDetails.wonBlocks" class="block-item clickable" (click)="navigateToBlock(block)">
                  <mat-icon class="block-icon">cube</mat-icon>
                  <span>{{ block }}</span>
                </div>
              </div>
              <ng-template #noBlocks>
                <div class="no-data">
                  <mat-icon>info</mat-icon>
                  <p>No blocks won by this wallet.</p>
                </div>
              </ng-template>
            </div>

            <!-- Transactions -->
            <mat-divider class="divider"></mat-divider>
            <h3 class="section-title">Transações ({{ walletDetails.transactions.length }})</h3>
            <div class="transactions-container" *ngIf="walletDetails.transactions.length > 0; else noTransactions">
              <mat-table [dataSource]="walletDetails.transactions">
                <ng-container matColumnDef="type">
                  <mat-header-cell *matHeaderCellDef>Tipo</mat-header-cell>
                  <mat-cell *matCellDef="let tx">{{ tx.type }}</mat-cell>
                </ng-container>
                <ng-container matColumnDef="transactionId">
                  <mat-header-cell *matHeaderCellDef>Hash</mat-header-cell>
                  <mat-cell *matCellDef="let tx" class="clickable" (click)="openTransactionDialog(tx)">
                    {{ tx.transactionId ? (tx.transactionId | slice:0:10) + '...' : 'N/A' }}
                  </mat-cell>
                </ng-container>
                <ng-container matColumnDef="details">
                  <mat-header-cell *matHeaderCellDef>Detalhes</mat-header-cell>
                  <mat-cell *matCellDef="let tx">
                    <ng-container [ngSwitch]="tx.type">
                      <ng-container *ngSwitchCase="'CURRENCY_TRANSACTION'">
                        {{ tx.amount || 'N/A' }} Coins
                      </ng-container>
                      <ng-container *ngSwitchCase="'STORAGE_CONTRACT_SUBMISSION'">
                        {{ extractFilename(tx.contract?.fileUrl || 'N/A') }}
                      </ng-container>
                      <ng-container *ngSwitchCase="'FILE_PROOF'">
                        {{ extractFilename(tx.fileProof?.fileUrl || 'N/A') }}
                      </ng-container>
                      <ng-container *ngSwitchDefault>N/A</ng-container>
                    </ng-container>
                  </mat-cell>
                </ng-container>
                <mat-header-row *matHeaderRowDef="transactionColumns"></mat-header-row>
                <mat-row *matRowDef="let row; columns: transactionColumns;" (click)="openTransactionDialog(row)"></mat-row>
              </mat-table>
            </div>
            <ng-template #noTransactions>
              <div class="no-data">
                <mat-icon>info</mat-icon>
                <p>No transactions found for this wallet.</p>
              </div>
            </ng-template>
          </div>
        </ng-container>
        <ng-template #loadingTemplate>
          <div class="loading">
            <mat-icon>hourglass_empty</mat-icon>
            <p>Loading wallet details...</p>
          </div>
        </ng-template>
      </mat-card-content>

      <mat-card-actions class="actions">
        <button mat-raised-button class="back-btn" [routerLink]="['/wallet-balances']">
          <mat-icon>arrow_back</mat-icon> Back to Wallet Balances
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
      padding: 0.75rem;
      background: #F7FAFC;
    }

    .wallet-details-card {
      max-width: 90%;
      margin: 1rem auto;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      overflow: hidden;
    }

    .header {
      padding: 0.75rem;
      background: #F7FAFC;
      border-bottom: 1px solid #E2E8F0;
      color: #4A4A4A;
    }

    mat-card-title {
      font-size: clamp(1.25rem, 4vw, 1.5rem);
      font-weight: 500;
      margin-bottom: 0.25rem;
      color: #4A4A4A;
    }

    mat-card-subtitle {
      font-size: clamp(0.8rem, 2.5vw, 0.9rem);
      color: #6B7280;
      font-weight: 400;
    }

    .content {
      padding: 0.75rem;
    }

    .details-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      padding: 0.5rem;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .detail-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background: #EDF2F7;
    }

    .label {
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      font-weight: 500;
      color: #2F855A;
      margin-bottom: 0.25rem;
    }

    .value {
      font-size: clamp(0.8rem, 2vw, 0.9rem);
      color: #4A4A4A;
      word-break: break-word;
    }

    .scrollable {
      overflow-x: auto;
      white-space: nowrap;
      max-width: 100%;
      scrollbar-width: thin;
      scrollbar-color: #2F855A #F7FAFC;
    }

    .scrollable::-webkit-scrollbar {
      height: 6px;
    }

    .scrollable::-webkit-scrollbar-track {
      background: #F7FAFC;
      border-radius: 3px;
    }

    .scrollable::-webkit-scrollbar-thumb {
      background: #2F855A;
      border-radius: 3px;
    }

    .divider {
      margin: 1rem 0;
      background-color: #E2E8F0;
    }

    .section-title {
      font-size: clamp(1rem, 3.5vw, 1.25rem);
      font-weight: 500;
      color: #2F855A;
      margin: 0 0 0.5rem 0;
    }

    .won-blocks-container,
    .transactions-container,
    .contracts-container {
      max-height: 400px;
      overflow-y: auto;
      padding: 0.5rem;
      background: #F7FAFC;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
      scrollbar-width: thin;
      scrollbar-color: #2F855A #F7FAFC;
    }

    .won-blocks-container::-webkit-scrollbar,
    .transactions-container::-webkit-scrollbar,
    .contracts-container::-webkit-scrollbar {
      width: 6px;
    }

    .won-blocks-container::-webkit-scrollbar-track,
    .transactions-container::-webkit-scrollbar-track,
    .contracts-container::-webkit-scrollbar-track {
      background: #F7FAFC;
      border-radius: 3px;
    }

    .won-blocks-container::-webkit-scrollbar-thumb,
    .transactions-container::-webkit-scrollbar-thumb,
    .contracts-container::-webkit-scrollbar-thumb {
      background: #2F855A;
      border-radius: 3px;
    }

    .blocks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); /* Reduced from 100px */
      gap: 0.5rem;
    }

    .block-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.5rem; /* Reduced from 0.75rem */
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      transition: all 0.3s ease;
      text-align: center;
      min-height: 60px; /* Reduced from 80px */
    }

    .block-item:hover {
      background: #EDF2F7;
      transform: scale(1.05);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .block-icon {
      color: #2F855A;
      font-size: 1.25rem; /* Reduced from 1.5rem */
      height: 1.25rem;
      width: 1.25rem;
      margin-bottom: 0.25rem;
      transition: transform 0.3s ease;
    }

    .block-item:hover .block-icon {
      transform: rotate(90deg);
    }

    .block-item span {
      font-size: clamp(0.65rem, 2vw, 0.75rem); /* Reduced from 0.75rem-0.85rem */
      color: #4A4A4A;
    }

    mat-table {
      width: 100%;
      background: transparent;
    }

    mat-header-cell, mat-cell {
      color: #4A4A4A;
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #E2E8F0;
    }

    mat-header-cell {
      font-weight: 600;
      color: #2F855A;
      background: #F7FAFC;
      white-space: nowrap;
    }

    mat-row:hover {
      background: #EDF2F7;
      cursor: pointer;
    }

    .clickable {
      cursor: pointer;
      color: #2F855A;
      text-decoration: underline;
      transition: color 0.3s ease;
    }

    .clickable:hover {
      color: #38A169;
    }

    .no-data, .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0.75rem;
      background: #F7FAFC;
      border-radius: 6px;
      color: #6B7280;
    }

    .no-data mat-icon, .loading mat-icon {
      color: #F6AD55;
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .no-data p, .loading p {
      margin: 0;
      font-size: clamp(0.85rem, 2.5vw, 0.95rem);
      color: #6B7280;
    }

    .actions {
      padding: 0.75rem;
      background: #F7FAFC;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: flex-end;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.3rem 0.5rem;
      font-size: clamp(0.75rem, 2vw, 0.85rem);
      background: #2F855A;
      color: #FFFFFF;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: #38A169;
      transform: scale(1.05);
    }

    .back-btn mat-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #FFFFFF;
    }

    @media (max-width: 768px) {
      :host { padding: 0.5rem; }
      .wallet-details-card { margin: 0.75rem auto; }
      .header, .content, .actions { padding: 0.5rem; }
      .detail-group { grid-template-columns: 1fr; }
      mat-header-cell, mat-cell { font-size: clamp(0.7rem, 2vw, 0.8rem); }
      .blocks-grid { grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); } /* Reduced from 80px */
    }

    @media (max-width: 480px) {
      :host { padding: 0.25rem; }
      .wallet-details-card { margin: 0.5rem auto; }
      .section-title { font-size: clamp(0.9rem, 3vw, 1rem); }
      .back-btn { font-size: clamp(0.65rem, 2vw, 0.75rem); }
      .back-btn mat-icon { font-size: 0.9rem; height: 0.9rem; width: 0.9rem; }
      .block-item { padding: 0.4rem; min-height: 50px; } /* Reduced further */
      .block-icon { font-size: 1rem; height: 1rem; width: 1rem; } /* Reduced from 1.25rem */
      .block-item span { font-size: clamp(0.6rem, 2vw, 0.7rem); } /* Reduced further */
    }
  `]
})
export class WalletDetailsComponent implements OnInit {
  walletDetails: WalletDetails | null = null;
  transactionColumns = ['type', 'transactionId', 'details'];
  contractColumns = ['fileUrl', 'storerAddress', 'value', 'timestamp'];
  totalStorage: number = 0;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blockchainService = inject(MockBlockchainService);
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe);

  async ngOnInit() {
    const address = this.route.snapshot.paramMap.get('address');
    if (address) {
      await this.fetchWalletDetails(address);
    }
  }

  async fetchWalletDetails(address: string) {
    try {
      this.walletDetails = await this.blockchainService.getWalletDetails(address);
      if (this.walletDetails) {
        this.walletDetails.transactions.sort((a, b) => (b.transactionId || '').localeCompare(a.transactionId || ''));
        this.walletDetails.storageContracts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        this.totalStorage = this.walletDetails.storageContracts.reduce((sum, contract) => sum + contract.fileLength, 0);
      }
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      this.walletDetails = null;
    }
  }

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

  openTransactionDialog(tx: Transaction): void {
    this.dialog.open(TransactionDetailsComponent, {
      width: '600px',
      data: { transaction: tx, block: null }
    });
  }

  navigateToBlock(height: number) {
    this.router.navigate(['/blocks', height]);
  }

  navigateToFileViewer(fileUrl: string) {
    const filename = this.extractFilename(fileUrl);
    this.router.navigate(['/file-viewer'], {
      queryParams: { filename },
      state: { returnUrl: this.router.url }
    });
    
  }

  navigateToContract(contract: StorageContract) {
    const hexHash = this.convertBase64ToHex(contract.hash);
    this.router.navigate(['/storageContractDetails'], {
      queryParams: { contractHash: hexHash, fileUrl: contract.fileUrl }
    });
  }

  extractFilename(fileUrl: string): string {
    return fileUrl
  }

  private convertBase64ToHex(base64Str: string): string {
    try {
      const bytes = atob(base64Str);
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += ('0' + bytes.charCodeAt(i).toString(16)).slice(-2);
      }
      return hex.toLowerCase();
    } catch (error) {
      console.warn('Invalid Base64 string, returning as-is:', base64Str, error);
      return base64Str;
    }
  }
}