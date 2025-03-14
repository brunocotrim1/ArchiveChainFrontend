import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MockBlockchainService } from '../services/blockchain.service';
import { Transaction, Block } from '../models/interface';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  selector: 'app-transaction-details',
  template: `
    <mat-card class="transaction-details-card">
      <mat-card-header class="header">
        <mat-card-title>Transaction Details</mat-card-title>
        <mat-card-subtitle>ID: {{ transaction?.transactionId || 'N/A' }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="content">
        <ng-container *ngIf="transaction; else notFoundTemplate">
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Type:</span>
              <span class="value">{{ transaction.type }}</span>
            </div>

            <ng-container [ngSwitch]="transaction.type">
              <!-- Currency Transaction Fields -->
              <ng-container *ngSwitchCase="'CURRENCY_TRANSACTION'">
                <div class="detail-item">
                  <span class="label">Sender Address:</span>
                  <span class="value">{{ transaction.senderAddress || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Receiver Address:</span>
                  <span class="value">{{ transaction.receiverAddress || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Amount:</span>
                  <span class="value">{{ transaction.amount || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Signature:</span>
                  <span class="value">{{ transaction.signature || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Sender Public Key:</span>
                  <span class="value">{{ transaction.senderPk || 'N/A' }}</span>
                </div>
              </ng-container>

              <!-- File Proof Fields -->
              <ng-container *ngSwitchCase="'FILE_PROOF'">
                <div class="detail-item">
                  <span class="label">File URL:</span>
                  <span class="value">{{ transaction.fileProof?.fileUrl || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Storage Contract Hash:</span>
                  <span class="value">{{ transaction.fileProof?.storageContractHash || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">PoDP Challenge:</span>
                  <span class="value">{{ transaction.fileProof?.poDpChallenge || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Start Block Index:</span>
                  <span class="value">{{ transaction.fileProof?.startBlockIndex ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">End Block Index:</span>
                  <span class="value">{{ transaction.fileProof?.endBlockIndex ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Storer Public Key:</span>
                  <span class="value">{{ transaction.storerPublicKey || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Storer Signature:</span>
                  <span class="value">{{ transaction.storerSignature || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Merkle Proof:</span>
                  <span class="value">
                    {{ transaction.fileProof && transaction.fileProof.merkleProof.length ? transaction.fileProof.merkleProof.join(', ') : 'N/A' }}
                  </span>
                </div>
              </ng-container>

              <!-- Storage Contract Submission Fields -->
              <ng-container *ngSwitchCase="'STORAGE_CONTRACT_SUBMISSION'">
                <div class="detail-item">
                  <span class="label">File URL:</span>
                  <span class="value">{{ transaction.contract?.fileUrl || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Value:</span>
                  <span class="value">{{ transaction.contract?.value || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Storer Address:</span>
                  <span class="value">{{ transaction.contract?.storerAddress || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Storer Public Key:</span>
                  <span class="value">{{ transaction.storerPublicKey || 'N/A' }}</span>
                </div>
              </ng-container>
            </ng-container>
          </div>
        </ng-container>

        <ng-template #notFoundTemplate>
          <div class="not-found">
            <mat-icon>error_outline</mat-icon>
            <p>Transaction not found</p>
          </div>
        </ng-template>
      </mat-card-content>

      <mat-card-actions class="actions" *ngIf="block">
        <button
          mat-raised-button
          color="warn"
          class="back-btn"
          [routerLink]="['/blocks', block.height]"
        >
          <mat-icon>arrow_back</mat-icon>
          Back to Block {{ block.height }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
      padding: 24px;
    }

    .transaction-details-card {
      max-width: 900px;
      margin: 0 auto 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      background: #fff;
    }

    .header {
      padding: 20px;
      background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%);
      color: #fff;
    }

    mat-card-title {
      font-size: 28px;
      font-weight: 500;
      line-height: 1.2;
    }

    mat-card-subtitle {
      font-size: 14px;
      opacity: 0.85;
      margin-top: 4px;
    }

    .content {
      padding: 24px;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .detail-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background: #e9ecef;
    }

    .label {
      font-size: 14px;
      font-weight: 600;
      color: #3f51b5;
      margin-bottom: 4px;
    }

    .value {
      font-size: 16px;
      color: #212529;
      word-break: break-word;
      line-height: 1.4;
    }

    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 32px;
      background: #f1f3f5;
      border-radius: 8px;
      color: #6c757d;
    }

    .not-found mat-icon {
      color: #dc3545;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .not-found p {
      margin: 0;
      font-size: 18px;
      font-weight: 400;
    }

    .actions {
      padding: 16px 24px;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      display: flex;
      justify-content: flex-end;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .back-btn:hover {
      transform: translateY(-1px);
      background-color: #c82333;
    }
  `
})
export class TransactionDetailsComponent implements OnInit {
  transaction: Transaction | null = null;
  block: Block | null = null;

  private blockchainService = inject(MockBlockchainService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['block']) {
      this.block = navigation.extras.state['block'] as Block;
    }
  }

  async ngOnInit() {
    const txId = this.route.snapshot.paramMap.get('id');

    if (this.block) {
      this.transaction = this.block.transactions.find(tx => tx.transactionId === txId) || null;
      console.log('Transaction found in block:', this.transaction);
    } else {
      console.log('Navigation state unavailable. History state:', history.state);
      if (history.state?.block) {
        this.block = history.state.block as Block;
        this.transaction = this.block.transactions.find(tx => tx.transactionId === txId) || null;
      }
    }

    console.log('Block:', this.block);
    console.log('Transaction:', this.transaction);
  }
}