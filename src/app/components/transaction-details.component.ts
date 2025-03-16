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
          <div class="details-container">
            <div class="detail-group">
              <div class="detail-item">
                <span class="label">Type</span>
                <span class="value">{{ transaction.type }}</span>
              </div>
            </div>

            <ng-container [ngSwitch]="transaction.type">
              <!-- Currency Transaction Fields -->
              <ng-container *ngSwitchCase="'CURRENCY_TRANSACTION'">
                <div class="detail-group">
                  <div class="detail-item">
                    <span class="label">Sender Address</span>
                    <span class="value">{{ transaction.senderAddress || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Receiver Address</span>
                    <span class="value">{{ transaction.receiverAddress || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Amount</span>
                    <span class="value">{{ transaction.amount || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Signature</span>
                    <span class="value">{{ transaction.signature || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Sender Public Key</span>
                    <span class="value">{{ transaction.senderPk || 'N/A' }}</span>
                  </div>
                </div>
              </ng-container>

              <!-- File Proof Fields -->
              <ng-container *ngSwitchCase="'FILE_PROOF'">
                <div class="detail-group">
                  <div class="detail-item">
                    <span class="label">File URL</span>
                    <span class="value">{{ transaction.fileProof?.fileUrl || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Storage Contract Hash</span>
                    <span
                      class="value clickable"
                      (click)="navigateToStorageContract(transaction.fileProof?.storageContractHash, transaction.fileProof?.fileUrl)"
                    >
                      {{ transaction.fileProof?.storageContractHash || 'N/A' }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="label">PoDP Challenge</span>
                    <span class="value">{{ transaction.fileProof?.poDpChallenge || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Start Block Index</span>
                    <span class="value">{{ transaction.fileProof?.startBlockIndex ?? 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">End Block Index</span>
                    <span class="value">{{ transaction.fileProof?.endBlockIndex ?? 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Storer Public Key</span>
                    <span class="value">{{ transaction.storerPublicKey || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Storer Signature</span>
                    <span class="value">{{ transaction.storerSignature || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Merkle Proof</span>
                    <div class="scrollable-value">
                      {{ transaction.fileProof && transaction.fileProof.merkleProof.length ? transaction.fileProof.merkleProof.join(', ') : 'N/A' }}
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- Storage Contract Submission Fields -->
              <ng-container *ngSwitchCase="'STORAGE_CONTRACT_SUBMISSION'">
                <div class="detail-group">
                  <div class="detail-item">
                    <span class="label">File URL</span>
                    <span class="value">{{ transaction.contract?.fileUrl || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Value</span>
                    <span class="value">{{ transaction.contract?.value || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Storer Address</span>
                    <span class="value">{{ transaction.contract?.storerAddress || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Storer Public Key</span>
                    <span class="value">{{ transaction.storerPublicKey || 'N/A' }}</span>
                  </div>
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
          class="back-btn"
          [routerLink]="['/blocks', block.height]"
        >
          <mat-icon>arrow_back</mat-icon>
          Back to Block {{ block.height }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
      padding: 0.75rem; /* Reduced padding for cleaner look */
      background: #F7FAFC; /* Softer gray background */
    }

    .transaction-details-card {
      max-width: 900px; /* Slightly reduced for balance */
      margin: 1rem auto; /* Adjusted for more whitespace */
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); /* Subtle shadow */
      border-radius: 8px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0; /* Softer gray border */
      overflow: hidden;
    }

    .header {
      padding: 0.75rem; /* Reduced padding */
      background: #F7FAFC; /* Softer gray, no gradient */
      border-bottom: 1px solid #E2E8F0;
      color: #4A4A4A; /* Dark gray */
    }

    mat-card-title {
      font-size: clamp(1.25rem, 4vw, 1.5rem); /* Slightly reduced for balance */
      font-weight: 500;
      margin-bottom: 0.25rem;
      color: #4A4A4A;
    }

    mat-card-subtitle {
      font-size: clamp(0.8rem, 2.5vw, 0.9rem); /* Adjusted for consistency */
      color: #6B7280; /* Lighter gray */
      font-weight: 400;
    }

    .content {
      padding: 0.75rem; /* Reduced padding */
    }

    .details-container {
      display: flex;
      flex-direction: column;
      gap: 1rem; /* More whitespace between groups */
    }

    .detail-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Adjusted for balance */
      gap: 0.75rem; /* Reduced gap */
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
      background: #EDF2F7; /* Softer gray hover */
    }

    .label {
      font-size: clamp(0.75rem, 2vw, 0.85rem); /* Smaller, cleaner label */
      font-weight: 500;
      color: #2F855A; /* Darker green */
      margin-bottom: 0.25rem;
    }

    .value {
      font-size: clamp(0.8rem, 2vw, 0.9rem); /* Slightly reduced for balance */
      color: #4A4A4A; /* Dark gray */
      word-break: break-word;
      line-height: 1.4;
    }

    /* Style for clickable Storage Contract Hash */
    .clickable {
      cursor: pointer;
      color: #2F855A; /* Match the label color for consistency */
      text-decoration: underline;
      transition: color 0.3s ease;
    }

    .clickable:hover {
      color: #38A169; /* Lighter green on hover */
    }

    .scrollable-value {
      max-height: 100px; /* Fixed height for scrollable content */
      overflow-y: auto;
      padding: 0.25rem;
      font-size: clamp(0.7rem, 1.5vw, 0.8rem); /* Smaller text for long content */
      color: #4A4A4A;
      scrollbar-width: thin; /* Firefox */
      scrollbar-color: #2F855A #F7FAFC; /* Darker green track */
    }

    .scrollable-value::-webkit-scrollbar {
      width: 6px;
    }

    .scrollable-value::-webkit-scrollbar-track {
      background: #F7FAFC;
      border-radius: 3px;
    }

    .scrollable-value::-webkit-scrollbar-thumb {
      background: #2F855A;
      border-radius: 3px;
    }

    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px; /* Reduced gap */
      padding: 0.75rem; /* Reduced padding */
      background: #F7FAFC;
      border-radius: 6px;
      color: #6B7280;
    }

    .not-found mat-icon {
      color: #F6AD55; /* Softer orange */
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .not-found p {
      margin: 0;
      font-size: clamp(0.85rem, 2.5vw, 0.95rem); /* Adjusted for consistency */
      color: #6B7280;
    }

    .actions {
      padding: 0.75rem; /* Reduced padding */
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
      font-weight: 500;
      background: #2F855A; /* Darker green */
      color: #FFFFFF;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: #38A169; /* Lighter darker green */
      transform: scale(1.05);
    }

    .back-btn mat-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #FFFFFF;
    }

    @media (max-width: 768px) {
      :host {
        padding: 0.5rem;
      }

      .transaction-details-card {
        margin: 0.75rem auto;
      }

      .header, .content, .actions {
        padding: 0.5rem;
      }

      .detail-group {
        grid-template-columns: 1fr;
      }

      mat-card-title {
        font-size: clamp(1rem, 3.5vw, 1.25rem);
      }

      .label {
        font-size: clamp(0.7rem, 2vw, 0.8rem);
      }

      .value, .not-found p {
        font-size: clamp(0.75rem, 2vw, 0.85rem);
      }
    }

    @media (max-width: 480px) {
      :host {
        padding: 0.25rem;
      }

      .transaction-details-card {
        margin: 0.5rem auto;
      }

      .back-btn {
        font-size: clamp(0.65rem, 2vw, 0.75rem);
      }

      .back-btn mat-icon {
        font-size: 0.9rem;
        height: 0.9rem;
        width: 0.9rem;
      }
    }
  `]
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

  }

  // Navigate to StorageContractDetailsComponent with contractHash and fileUrl as query parameters
  navigateToStorageContract(contractHash: string | undefined, fileUrl: string | undefined) {
    if (contractHash && fileUrl) {
      this.router.navigate(['/storageContractDetails'], {
        queryParams: {
          contractHash: encodeURIComponent(contractHash),
          fileUrl: encodeURIComponent(fileUrl)
        }
      });
    } else {
      console.warn('Cannot navigate: Missing contractHash or fileUrl', { contractHash, fileUrl });
    }
  }
}