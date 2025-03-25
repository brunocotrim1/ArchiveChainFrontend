import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../models/interface';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-transaction-preview',
  template: `
    <div class="transaction-preview">
      <p><span class="label">Type:</span> <span class="value">{{ transaction?.type ?? 'N/A' }}</span></p>
      <p><span class="label">Transaction ID:</span> <span class="value">{{ transaction?.transactionId ?? 'tx-' + index }}</span></p>
      <div *ngIf="transaction?.type === 'CURRENCY_TRANSACTION'">
        <p><span class="label">Amount:</span> <span class="value">{{ transaction?.amount ?? 'N/A' }}</span></p>
      </div>
      <div *ngIf="transaction?.type === 'FILE_PROOF'">
        <p><span class="label">File URL:</span> <span class="value">{{ transaction?.fileProof?.fileUrl ?? 'N/A' }}</span></p>
      </div>
      <div *ngIf="transaction?.type === 'STORAGE_CONTRACT_SUBMISSION'">
        <p><span class="label">Value:</span> <span class="value">{{ transaction?.contract?.value ?? 'N/A' }}</span></p>
      </div>
    </div>
  `,
  styles: [`
    .transaction-preview {
      display: flex;
      flex-direction: column;
      padding: 0.25rem;
    }

    p {
      margin: 0.25rem 0;
      font-size: clamp(0.85rem, 2.5vw, 0.95rem);
    }

    .label {
      font-weight: 500;
      color: #2F855A; /* Green for labels */
      margin-right: 0.5rem;
    }

    .value {
      color: #4A4A4A; /* Dark grey for values */
    }
  `]
})
export class TransactionPreviewComponent {
  @Input() transaction: Transaction | null = null;
  @Input() index: number = 0;
}