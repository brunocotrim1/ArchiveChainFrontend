import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes, Router, RouterLink, RouterOutlet } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { Component, OnInit, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material Imports (standalone imports)
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';

// Define interfaces based on OpenAPI schema
interface Transaction {
  type: 'CURRENCY_TRANSACTION' | 'FILE_PROOF' | 'STORAGE_CONTRACT_SUBMISSION';
  id?: string;
  amount?: number;
  senderAddress?: string;
  receiverAddress?: string;
  signature?: string;
  senderPk?: string;
  fileProof?: {
    storageContractHash: string;
    fileUrl: string;
    hash: string;
  };
  storerPublicKey?: string;
  storerSignature?: string;
  contract?: {
    fileUrl: string;
    value: number;
    storerAddress: string;
    hash: string;
  };
}

interface Block {
  height: number;
  hash: string;
  previousHash: string | null;
  timeStamp: string;
  transactions: Transaction[]; // Removed optional chaining, always an array
}

interface WalletBalance {
  walletAddress: string;
  balance: number;
}

interface StorageContract {
  fileUrl: string;
  value: number;
  storerAddress: string;
  timestamp: string;
}

// Service Abstraction and Implementations
abstract class BlockchainService {
  abstract getBlocks(limit?: number): Promise<Block[]>;
  abstract getWalletBalances(): Promise<WalletBalance[]>;
  abstract getStoredFiles(): Promise<string[]>;
  abstract getStorageContracts(fileName: string): Promise<StorageContract[]>;
  abstract sendTransaction(transaction: Transaction): Promise<string>;
  abstract sendBlock(block: Block): Promise<string>;
  abstract archiveFile(file: any, data: any): Promise<string>;
}

class MockBlockchainService implements BlockchainService {
  private mockBlocks: Block[] = [
    {
      height: 100,
      hash: 'abc123',
      previousHash: 'def456',
      timeStamp: '2025-01-01T12:00:00Z',
      transactions: [
        { type: 'CURRENCY_TRANSACTION', amount: 100, senderAddress: "0xSender1", receiverAddress: "0xReceiver1", signature: "sig1", senderPk: "pk1", id: 'tx1' },
        { type: 'FILE_PROOF', fileProof: { storageContractHash: "hash1", fileUrl: "url1", hash: "fileHash1" }, storerPublicKey: "storerPk1", storerSignature: "storerSig1", id: 'tx2' },
        { type: 'STORAGE_CONTRACT_SUBMISSION', contract: { fileUrl: "url2", value: 500, storerAddress: "0xStorer1", hash: "contractHash1" }, storerPublicKey: "storerPk2", id: 'tx3' }
      ]
    },
    {
      height: 99,
      hash: 'def456',
      previousHash: 'ghi789',
      timeStamp: '2025-01-01T11:55:00Z',
      transactions: [
        { type: 'CURRENCY_TRANSACTION', amount: 50, senderAddress: "0xSender2", receiverAddress: "0xReceiver2", signature: "sig2", senderPk: "pk2", id: 'tx4' }
      ]
    },
    {
      height: 98,
      hash: 'ghi789',
      previousHash: null,
      timeStamp: '2025-01-01T11:50:00Z',
      transactions: [] // Explicitly an empty array
    }
  ];

  private mockBalances: WalletBalance[] = [
    { walletAddress: '0xABC', balance: 1000 },
    { walletAddress: '0xDEF', balance: 500 }
  ];

  private mockFiles: string[] = ['file1.txt', 'file2.jpg', 'document.pdf'];

  private mockContracts: StorageContract[] = [
    { fileUrl: 'file1.txt', value: 500, storerAddress: '0xAAA', timestamp: '2025-01-01T12:00:00Z' },
    { fileUrl: 'file2.jpg', value: 250, storerAddress: '0xBBB', timestamp: '2025-01-02T08:00:00Z' }
  ];

  async getBlocks(limit?: number): Promise<Block[]> {
    return limit ? this.mockBlocks.slice(0, limit) : this.mockBlocks;
  }

  async getWalletBalances(): Promise<WalletBalance[]> {
    return this.mockBalances;
  }

  async getStoredFiles(): Promise<string[]> {
    return this.mockFiles;
  }

  async getStorageContracts(fileName: string): Promise<StorageContract[]> {
    return this.mockContracts.filter(contract => contract.fileUrl.includes(fileName));
  }

  async sendTransaction(transaction: Transaction): Promise<string> {
    console.log('Mock send transaction', transaction);
    return `Transaction ${transaction.type} accepted (mock)`;
  }

  async sendBlock(block: Block): Promise<string> {
    console.log('Mock send block', block);
    return 'Block accepted (mock)';
  }

  async archiveFile(file: any, data: any): Promise<string> {
    console.log('Mock archive file', { file, data });
    return 'File archived (mock)';
  }
}

// Root Component
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
      <span>Blockchain Explorer</span>
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

// Transaction Preview Component
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-transaction-preview',
  template: `
    <div style="display: flex; flex-direction: column;">
      <p><strong>Type:</strong> {{ transaction?.type ?? 'N/A' }}</p>
      <p><strong>Transaction ID:</strong> {{ transaction?.id ?? 'tx-' + index }}</p>
      <div *ngIf="transaction?.type === 'CURRENCY_TRANSACTION'">
        <p>Amount: {{ transaction?.amount ?? 'N/A' }}</p>
      </div>
      <div *ngIf="transaction?.type === 'FILE_PROOF'">
        <p>File URL: {{ transaction?.fileProof?.fileUrl ?? 'N/A' }}</p>
      </div>
      <div *ngIf="transaction?.type === 'STORAGE_CONTRACT_SUBMISSION'">
        <p>Value: {{ transaction?.contract?.value ?? 'N/A' }}</p>
      </div>
    </div>
  `
})
export class TransactionPreviewComponent {
  @Input() transaction: Transaction | null = null;
  @Input() index: number = 0;
}

// Blocks Component
@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    FormsModule,
    RouterLink
  ],
  selector: 'app-blocks',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Latest Blocks</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>Search by Hash</mat-label>
          <input matInput [(ngModel)]="searchHash" (ngModelChange)="filterBlocks()" placeholder="Enter hash">
        </mat-form-field>

        <div *ngIf="filteredBlocks.length > 0; else noBlocksFound" style="margin-top: 1rem;">
          <mat-table [dataSource]="filteredBlocks">
            <ng-container matColumnDef="height">
              <mat-header-cell *matHeaderCellDef>Height</mat-header-cell>
              <mat-cell *matCellDef="let block">{{ block.height }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="hash">
              <mat-header-cell *matHeaderCellDef>Hash</mat-header-cell>
              <mat-cell *matCellDef="let block">{{ block.hash }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="transactions">
              <mat-header-cell *matHeaderCellDef>Transactions</mat-header-cell>
              <mat-cell *matCellDef="let block">{{ block.transactions.length }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="actions">
              <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
              <mat-cell *matCellDef="let block">
                <button mat-raised-button color="primary" [routerLink]="['/blocks', block.height]">View Details</button>
              </mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="blockColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: blockColumns;"></mat-row>
          </mat-table>
        </div>
        <ng-template #noBlocksFound>
          <p>No blocks found.</p>
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
export class BlocksComponent implements OnInit {
  filteredBlocks: Block[] = [];
  blockColumns = ['height', 'hash', 'transactions', 'actions'];
  searchHash = '';
  private blockchainService = inject(MockBlockchainService);
  private router = inject(Router);

  async ngOnInit() {
    this.filteredBlocks = await this.blockchainService.getBlocks() ?? [];
  }

  filterBlocks(): void {
    const searchTerm = this.searchHash.trim().toLowerCase();
    this.filteredBlocks = searchTerm === '' ? this.filteredBlocks : this.filteredBlocks.filter(block => block.hash.toLowerCase().includes(searchTerm));
  }
}

// Block Details Component
@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    RouterLink,
    TransactionPreviewComponent
  ],
  selector: 'app-block-details',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Block Details</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          <mat-list-item><strong>Height:</strong> {{ block?.height }}</mat-list-item>
          <mat-list-item><strong>Hash:</strong> {{ block?.hash }}</mat-list-item>
          <mat-list-item><strong>Previous Hash:</strong> {{ block?.previousHash || 'None' }}</mat-list-item>
          <mat-list-item><strong>Timestamp:</strong> {{ block?.timeStamp }}</mat-list-item>
        </mat-list>
        <mat-divider></mat-divider>
        <h3 style="margin-top: 1rem;">Transactions</h3>
        <div *ngIf="block && block.transactions.length > 0; else noTransactions">
          <mat-list>
            <mat-list-item *ngFor="let tx of block.transactions; let i = index" class="clickable" (click)="navigateToTransaction(tx)">
              <app-transaction-preview [transaction]="tx" [index]="i"></app-transaction-preview>
            </mat-list-item>
          </mat-list>
        </div>
        <ng-template #noTransactions>
          <p>No transactions in this block.</p>
        </ng-template>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="warn" [routerLink]="['/blocks']">Back to Blocks</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin-bottom: 1rem;
    }
    .clickable {
      cursor: pointer;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    .clickable:hover {
      background-color: #f5f5f5;
    }
  `]
})
export class BlockDetailsComponent {
  @Input() block: Block | null = null;
  private router = inject(Router);

  navigateToTransaction(tx: Transaction) {
    const txId = tx.id || `tx-${this.block!.transactions.indexOf(tx)}`;
    this.router.navigate(['/transactions', txId]);
  }
}

// Transaction Details Component
@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    RouterLink
  ],
  selector: 'app-transaction-details',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Transaction Details</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          <mat-list-item><strong>Transaction ID:</strong> {{ getTransactionId() }}</mat-list-item>
          <mat-list-item><strong>Type:</strong> {{ transaction?.type ?? 'N/A' }}</mat-list-item>
          <div *ngIf="transaction?.type === 'CURRENCY_TRANSACTION'">
            <mat-list-item><strong>Sender Address:</strong> {{ transaction?.senderAddress ?? 'N/A' }}</mat-list-item>
            <mat-list-item><strong>Receiver Address:</strong> {{ transaction?.receiverAddress ?? 'N/A' }}</mat-list-item>
            <mat-list-item><strong>Amount:</strong> {{ transaction?.amount ?? 'N/A' }}</mat-list-item>
            <mat-list-item><strong>Signature:</strong> {{ transaction?.signature ?? 'N/A' }}</mat-list-item>
            <mat-list-item><strong>Sender Public Key:</strong> {{ transaction?.senderPk ?? 'N/A' }}</mat-list-item>
          </div>
          <div *ngIf="transaction?.type === 'FILE_PROOF'">
            <mat-list-item><strong>File URL:</strong> {{ transaction?.fileProof?.fileUrl ?? 'N/A' }}</mat-list-item>
            <mat-list-item><strong>Storage Contract Hash:</strong> {{ transaction?.fileProof?.storageContractHash ?? 'N/A' }}</mat-list-item>
            <mat-list-item><strong>Storer Public Key:</strong> {{ transaction?.storerPublicKey ?? 'N/A' }}</mat-list-item>
            <mat-list-item><strong>Storer Signature:</strong> {{ transaction?.storerSignature ?? 'N/A' }}</mat-list-item>
          </div>
          <div *ng