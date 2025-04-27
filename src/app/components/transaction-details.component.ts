import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { RouterLink, Router } from '@angular/router';
import { Transaction, Block } from '../models/interface';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    RouterLink
  ],
  selector: 'app-transaction-details',
  template: `
    <mat-card class="transaction-details-card">
      <mat-card-header class="header">
        <mat-card-title>Transaction Details</mat-card-title>
        <mat-card-subtitle>ID: {{ transaction?.transactionId | slice:0:10 }}...</mat-card-subtitle>
        <div class="header-actions">
          <button mat-raised-button class="block-btn" *ngIf="block" (click)="navigateToBlock()" [disabled]="!block?.height">
            <mat-icon class="nav-icon">navigation</mat-icon>
            <mat-icon class="spin-icon">cube</mat-icon>
            <span class="btn-text">Block {{ block?.height }}</span>
          </button>
          <button mat-icon-button class="close-icon" (click)="closeDialog()" aria-label="Close dialog">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </mat-card-header>

      <mat-card-content class="content">
        <div class="scrollable-content">
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
                      <span class="value clickable" (click)="navigateToFileViewer(transaction.fileProof?.fileUrl)">
                        {{ transaction.fileProof?.fileUrl || 'N/A' }}
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Storage Contract Hash</span>
                      <span class="value clickable" (click)="navigateToStorageContract(transaction.fileProof?.storageContractHash, transaction.fileProof?.fileUrl)">
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
                      <span class="value clickable" (click)="navigateToFileViewer(transaction.contract?.fileUrl)">
                        {{ transaction.contract?.fileUrl || 'N/A' }}
                      </span>
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
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
      padding: 0;
      background: transparent;
    }

    .transaction-details-card {
      width: 100%;
      max-width: 500px;
      margin: 0;
      border-radius: 8px;
      box-shadow: none;
      overflow: hidden;
      background: #FFFFFF;
    }

    .header {
      padding: 0.75rem;
      background: #F7FAFC;
      border-bottom: 1px solid #E2E8F0;
      color: #4A4A4A;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    mat-card-title {
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    mat-card-subtitle {
      font-size: 0.85rem;
      color: #6B7280;
      font-weight: 400;
    }

    .header-actions {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .close-icon {
      color: #6B7280;
      transition: color 0.3s ease;
    }

    .close-icon:hover {
      color: #E53E3E;
    }

    .block-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
      font-weight: 600;
      background: linear-gradient(135deg, #68D391 0%, #9AE6B4 100%);
      color: #1A3C34;
      border-radius: 12px;
      border: none;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 3px 6px rgba(104, 211, 145, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3);
      min-width: 0;
      justify-content: center; /* Center content to remove extra space */
    }

    .block-btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 150%;
      height: 150%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.25), transparent);
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
      transition: opacity 0.3s ease, transform 0.5s ease;
    }

    .block-btn:hover::before {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .block-btn:hover {
      background: linear-gradient(135deg, #9AE6B4 0%, #B2F5EA 100%);
      transform: translateY(-2px);
      box-shadow: 0 5px 12px rgba(104, 211, 145, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4);
    }

    .block-btn[disabled] {
      background: #E2E8F0;
      color: #A0AEC0;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .block-btn[disabled]::before {
      display: none;
    }

    .nav-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #2C7A7B;
      margin-right: 0.25rem; /* Small spacing between icons */
    }

    .spin-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #2C7A7B;
      transition: transform 0.3s ease;
    }

    .block-btn:hover .spin-icon {
      transform: rotate(360deg);
    }

    .btn-text {
      position: relative;
      z-index: 1;
      white-space: nowrap;
    }

    .content {
      padding: 0.75rem;
    }

    .scrollable-content {
      max-height: 60vh;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #2F855A #F7FAFC;
    }

    .scrollable-content::-webkit-scrollbar {
      width: 6px;
    }

    .scrollable-content::-webkit-scrollbar-track {
      background: #F7FAFC;
      border-radius: 3px;
    }

    .scrollable-content::-webkit-scrollbar-thumb {
      background: #2F855A;
      border-radius: 3px;
    }

    .details-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-group {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
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
      background: #EDF2F7;
      transform: translateY(-2px);
    }

    .label {
      font-size: 0.8rem;
      font-weight: 500;
      color: #2F855A;
      margin-bottom: 0.25rem;
    }

    .value {
      font-size: 0.85rem;
      color: #4A4A4A;
      word-break: break-word;
      line-height: 1.4;
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

    .scrollable-value {
      max-height: 100px;
      overflow-y: auto;
      padding: 0.25rem;
      font-size: 0.8rem;
      color: #4A4A4A;
      scrollbar-width: thin;
      scrollbar-color: #2F855A #F7FAFC;
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
      gap: 8px;
      padding: 0.75rem;
      background: #F7FAFC;
      border-radius: 6px;
      color: #6B7280;
    }

    .not-found mat-icon {
      color: #F6AD55;
      font-size: 1.25rem;
      height: 1.25rem;
      width: 1.25rem;
    }

    .not-found p {
      margin: 0;
      font-size: 0.9rem;
    }

    .actions {
      padding: 0.75rem;
      background: #F7FAFC;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .close-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.3rem 0.5rem;
      font-size: 0.8rem;
      font-weight: 500;
      border-radius: 4px;
      background: #E53E3E;
      color: #FFFFFF;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: #F56565;
      transform: scale(1.05);
    }

    .close-btn mat-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #FFFFFF;
    }

    @media (max-width: 480px) {
      .transaction-details-card {
        max-width: 100%;
      }
      mat-card-title { font-size: 1.1rem; }
      mat-card-subtitle { font-size: 0.75rem; }
      .label { font-size: 0.75rem; }
      .value { font-size: 0.8rem; }
      .close-btn { font-size: 0.75rem; }
      .close-btn mat-icon { font-size: 0.9rem; height: 0.9rem; width: 0.9rem; }
      .close-icon { top: 0.25rem; right: 0.25rem; }
      .block-btn { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
      .nav-icon, .spin-icon { font-size: 0.9rem; height: 0.9rem; width: 0.9rem; }
      .header-actions { flex-wrap: wrap; gap: 0.25rem; }
    }
  `]
})
export class TransactionDetailsComponent implements OnInit {
  transaction: Transaction | null = null;
  block: Block | null = null;

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<TransactionDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { transaction: Transaction, block: Block | null }
  ) {
    this.transaction = data.transaction;
    this.block = data.block;
  }

  ngOnInit() {}

  navigateToStorageContract(contractHash: string | undefined, fileUrl: string | undefined) {
    if (contractHash && fileUrl) {
      this.router.navigate(['/storageContractDetails'], {
        queryParams: {
          contractHash: encodeURIComponent(contractHash),
          fileUrl: encodeURIComponent(fileUrl)
        }
      });
      this.closeDialog();
    } else {
      console.warn('Cannot navigate: Missing contractHash or fileUrl', { contractHash, fileUrl });
    }
  }

  navigateToFileViewer(fileUrl: string | undefined) {
    if (fileUrl && this.transaction?.transactionId) {
      const filename = this.extractFilename(fileUrl);
      this.router.navigate(['/file-viewer'], {
        queryParams: { filename },
        state: { returnUrl: `/blocks/${this.block?.height}` }
      });
      this.closeDialog();
    } else {
      console.warn('Cannot navigate to file viewer: Missing fileUrl or transactionId', { fileUrl, transactionId: this.transaction?.transactionId });
    }
  }

  navigateToBlock() {
    if (this.block?.height !== undefined) {
      this.router.navigate(['/blocks', this.block.height]);
      this.closeDialog();
    } else {
      console.warn('Cannot navigate: Block height is missing', this.block);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  private extractFilename(fileUrl: string): string {
    return fileUrl
  }
}