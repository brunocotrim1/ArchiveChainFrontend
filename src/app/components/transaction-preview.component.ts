import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../models/interface';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-transaction-preview',
  template: `
    <div style="display: flex; flex-direction: column;">
      <p><strong>Type:</strong> {{ transaction?.type ?? 'N/A' }}</p>
      <p><strong>Transaction ID:</strong> {{ transaction?.transactionId ?? 'tx-' + index }}</p>
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